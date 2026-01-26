"""
API views for the scheduling app.
"""
from rest_framework import viewsets, status, mixins
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone

from .models import ScheduleGroup, ScheduleItem, ScheduleConflict, SchoolYear
from .serializers import (
    ScheduleGroupSerializer, 
    ScheduleItemSerializer,
    ScheduleConflictSerializer,
    SchoolYearSerializer,
    BulkScheduleCreateSerializer,
    ConflictCheckSerializer
)
from .services.conflict_detector import ConflictDetector
from .permissions import IsCollegeAdmin, IsSuperAdmin, CanViewScheduleGroup
from activity_logs.models import ActivityLog


class SchoolYearViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing school years.
    """
    queryset = SchoolYear.objects.all()
    serializer_class = SchoolYearSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    
    def perform_create(self, serializer):
        school_year = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user.profile if hasattr(self.request.user, 'profile') else None,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created school year: {school_year.name}',
            affected_models=['SchoolYear'],
            model_ids={'SchoolYear': [str(school_year.id)]}
        )
    
    def perform_update(self, serializer):
        school_year = serializer.save()
        ActivityLog.objects.create(
            user=self.request.user.profile if hasattr(self.request.user, 'profile') else None,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated school year: {school_year.name}',
            affected_models=['SchoolYear'],
            model_ids={'SchoolYear': [str(school_year.id)]}
        )


class ScheduleGroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing schedule groups (block schedules).
    """
    serializer_class = ScheduleGroupSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin]
    
    def get_queryset(self):
        user_profile = self.request.user.profile
        
        if user_profile.role == 'SUPER_ADMIN':
            return ScheduleGroup.objects.all().select_related(
                'college', 'program', 'school_year', 'created_by'
            )
        elif user_profile.role == 'COLLEGE_ADMIN':
            # Get user's college through staff profile
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return ScheduleGroup.objects.filter(college=college).select_related(
                    'college', 'program', 'school_year', 'created_by'
                )
        elif user_profile.role == 'INSTRUCTOR':
            # Instructors can see schedules they're assigned to
            schedule_item_ids = ScheduleItem.objects.filter(
                instructor__user=user_profile
            ).values_list('schedule_group_id', flat=True)
            return ScheduleGroup.objects.filter(
                id__in=schedule_item_ids
            ).select_related('college', 'program', 'school_year')
        elif user_profile.role == 'STUDENT':
            # Students can see schedules for their program/year
            if hasattr(user_profile, 'student_profile'):
                student = user_profile.student_profile
                return ScheduleGroup.objects.filter(
                    program=student.program,
                    year_level=student.year_level,
                    semester=student.program.courses.filter(
                        year_level=student.year_level
                    ).values_list('semester', flat=True).distinct()
                ).select_related('college', 'program', 'school_year')
        
        return ScheduleGroup.objects.none()
    
    def perform_create(self, serializer):
        schedule_group = serializer.save(created_by=self.request.user.profile)
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created schedule group: {schedule_group.program.code} {schedule_group.year_level} {schedule_group.section}',
            affected_models=['ScheduleGroup'],
            model_ids={'ScheduleGroup': [str(schedule_group.id)]}
        )
    
    def perform_update(self, serializer):
        schedule_group = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated schedule group: {schedule_group.program.code} {schedule_group.year_level} {schedule_group.section}',
            affected_models=['ScheduleGroup'],
            model_ids={'ScheduleGroup': [str(schedule_group.id)]}
        )
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a schedule group (change status from draft/pending to approved).
        """
        schedule_group = self.get_object()
        
        if schedule_group.status not in ['draft', 'pending']:
            return Response(
                {'error': 'Only draft or pending schedules can be approved.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        schedule_group.status = 'approved'
        schedule_group.approved_by = request.user.profile
        schedule_group.approval_date = timezone.now()
        schedule_group.save()
        
        ActivityLog.objects.create(
            user=request.user.profile,
            action_type=ActivityLog.ActionType.APPROVE,
            description=f'Approved schedule group: {schedule_group.program.code} {schedule_group.year_level} {schedule_group.section}',
            affected_models=['ScheduleGroup'],
            model_ids={'ScheduleGroup': [str(schedule_group.id)]}
        )
        
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def check_conflicts(self, request, pk=None):
        """
        Check for conflicts in a schedule group.
        """
        schedule_group = self.get_object()
        conflicts = ConflictDetector.check_all_conflicts(schedule_group)
        
        ActivityLog.objects.create(
            user=request.user.profile,
            action_type=ActivityLog.ActionType.CONFLICT_DETECTED,
            description=f'Checked conflicts for schedule group: {schedule_group.id}',
            affected_models=['ScheduleGroup', 'ScheduleConflict'],
            model_ids={'ScheduleGroup': [str(schedule_group.id)]}
        )
        
        conflict_serializer = ScheduleConflictSerializer(
            ScheduleConflict.objects.filter(
                schedule_item_1__schedule_group=schedule_group,
                resolved=False
            ), many=True
        )
        
        return Response({
            'conflicts_found': len(conflicts),
            'conflicts': conflict_serializer.data
        })
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create schedule groups with conflict checking.
        """
        serializer = BulkScheduleCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        schedule_data = serializer.validated_data['schedules']
        force_create = serializer.validated_data.get('force', False)
        
        # First, check for conflicts
        all_conflicts = []
        for data in schedule_data:
            conflicts = ConflictDetector.bulk_check_conflicts(data.get('items', []))
            all_conflicts.extend(conflicts)
        
        if all_conflicts and not force_create:
            return Response({
                'status': 'conflicts_detected',
                'conflicts': all_conflicts,
                'conflict_count': len(all_conflicts),
                'message': 'Conflicts detected. Use force=true to override.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create schedules
        created_schedules = []
        with transaction.atomic():
            for data in schedule_data:
                schedule_group = ScheduleGroup.objects.create(
                    college_id=data['college_id'],
                    program_id=data['program_id'],
                    year_level=data['year_level'],
                    section=data['section'],
                    semester=data['semester'],
                    school_year_id=data['school_year_id'],
                    created_by=request.user.profile,
                    status=data.get('status', 'draft')
                )
                
                # Create schedule items
                for item_data in data.get('items', []):
                    ScheduleItem.objects.create(
                        schedule_group=schedule_group,
                        course_id=item_data['course_id'],
                        day=item_data['day'],
                        start_time=item_data['start_time'],
                        end_time=item_data['end_time'],
                        room=item_data['room'],
                        instructor_id=item_data.get('instructor_id'),
                        max_students=item_data.get('max_students', 40)
                    )
                
                created_schedules.append(str(schedule_group.id))
        
        ActivityLog.objects.create(
            user=request.user.profile,
            action_type=ActivityLog.ActionType.SCHEDULE_GENERATE,
            description=f'Bulk created {len(created_schedules)} schedule groups',
            affected_models=['ScheduleGroup', 'ScheduleItem'],
            model_ids={'ScheduleGroup': created_schedules}
        )
        
        return Response({
            'status': 'success',
            'created': len(created_schedules),
            'schedule_ids': created_schedules
        }, status=status.HTTP_201_CREATED)


class ScheduleItemViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing individual schedule items.
    """
    serializer_class = ScheduleItemSerializer
    permission_classes = [IsAuthenticated, CanViewScheduleGroup]
    
    def get_queryset(self):
        user_profile = self.request.user.profile
        
        if user_profile.role == 'SUPER_ADMIN':
            return ScheduleItem.objects.all().select_related(
                'schedule_group', 'course', 'instructor', 'instructor__user'
            )
        elif user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return ScheduleItem.objects.filter(
                    schedule_group__college=college
                ).select_related('schedule_group', 'course', 'instructor')
        elif user_profile.role == 'INSTRUCTOR':
            return ScheduleItem.objects.filter(
                instructor__user=user_profile
            ).select_related('schedule_group', 'course')
        
        return ScheduleItem.objects.none()
    
    def perform_create(self, serializer):
        schedule_item = serializer.save()
        
        # Check for conflicts after creation
        ConflictDetector.check_all_conflicts(schedule_item.schedule_group)
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created schedule item: {schedule_item.course.course_code}',
            affected_models=['ScheduleItem'],
            model_ids={'ScheduleItem': [str(schedule_item.id)]}
        )
    
    def perform_update(self, serializer):
        schedule_item = serializer.save()
        
        # Check for conflicts after update
        ConflictDetector.check_all_conflicts(schedule_item.schedule_group)
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated schedule item: {schedule_item.course.course_code}',
            affected_models=['ScheduleItem'],
            model_ids={'ScheduleItem': [str(schedule_item.id)]}
        )


class ScheduleConflictViewSet(
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    viewsets.GenericViewSet
):
    """
    API endpoint for viewing and resolving schedule conflicts.
    """
    serializer_class = ScheduleConflictSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin]
    
    def get_queryset(self):
        user_profile = self.request.user.profile
        
        if user_profile.role == 'SUPER_ADMIN':
            return ScheduleConflict.objects.filter(resolved=False).select_related(
                'schedule_item_1', 'schedule_item_2',
                'schedule_item_1__schedule_group', 'schedule_item_2__schedule_group'
            )
        elif user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return ScheduleConflict.objects.filter(
                    schedule_item_1__schedule_group__college=college,
                    resolved=False
                ).select_related(
                    'schedule_item_1', 'schedule_item_2',
                    'schedule_item_1__schedule_group', 'schedule_item_2__schedule_group'
                )
        
        return ScheduleConflict.objects.none()
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """
        Mark a conflict as resolved.
        """
        conflict = self.get_object()
        
        conflict.resolved = True
        conflict.resolved_by = request.user.profile
        conflict.resolved_at = timezone.now()
        conflict.resolution_notes = request.data.get('resolution_notes', '')
        conflict.save()
        
        ActivityLog.objects.create(
            user=request.user.profile,
            action_type=ActivityLog.ActionType.CONFLICT_RESOLVED,
            description=f'Resolved conflict: {conflict.conflict_type}',
            affected_models=['ScheduleConflict'],
            model_ids={'ScheduleConflict': [str(conflict.id)]}
        )
        
        return Response({'status': 'resolved'})


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsCollegeAdmin])
def check_schedule_conflicts(request):
    """
    Check for conflicts in a proposed schedule without saving it.
    """
    serializer = ConflictCheckSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    schedule_items = serializer.validated_data['schedule_items']
    conflicts = ConflictDetector.bulk_check_conflicts(schedule_items)
    
    return Response({
        'conflicts_found': len(conflicts),
        'conflicts': conflicts,
        'has_conflicts': len(conflicts) > 0
    })