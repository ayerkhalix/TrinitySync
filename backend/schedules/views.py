# schedules/views.py
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db import transaction
from activity_logs.models import ActivityLog

from .models import Room, Instructor, ScheduleEntry
from .serializers import (
    RoomSerializer, InstructorSerializer, 
    ScheduleEntrySerializer, BulkScheduleSerializer
)
from .services.conflict_detector import ConflictDetector

class RoomListCreateView(generics.ListCreateAPIView):
    queryset = Room.objects.filter(is_active=True)
    serializer_class = RoomSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['room_type', 'building']

class InstructorListCreateView(generics.ListCreateAPIView):
    queryset = Instructor.objects.filter(is_active=True)
    serializer_class = InstructorSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['department']

class ScheduleListCreateView(generics.ListCreateAPIView):
    serializer_class = ScheduleEntrySerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['program', 'year_level', 'semester', 'course', 'instructor', 'room']
    
    def get_queryset(self):
        user = self.request.user
        
        # Students can only view schedules
        if user.role == 'student':
            return ScheduleEntry.objects.filter(
                program__code=user.program,
                year_level=user.year_level
            ).order_by('time_slot', 'days')
        
        # Admins can view all schedules
        return ScheduleEntry.objects.all().order_by('time_slot', 'days')
    
    def perform_create(self, serializer):
        # Only department admins and super admins can create schedules
        if self.request.user.role == 'student':
            raise PermissionError('Students cannot create schedules')
        
        serializer.save(created_by=self.request.user)
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            user_name=f"{self.request.user.first_name} {self.request.user.last_name}",
            user_role=self.request.user.role,
            activity_type="Schedule Created",
            ip_address=self.request.META.get('REMOTE_ADDR', ''),
            details={
                "action": "create_schedule",
                "schedule_id": serializer.instance.id
            }
        )

class ScheduleDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = ScheduleEntry.objects.all()
    serializer_class = ScheduleEntrySerializer
    permission_classes = [IsAuthenticated]
    
    def perform_update(self, serializer):
        # Only admins can update schedules
        if self.request.user.role == 'student':
            raise PermissionError('Students cannot update schedules')
        
        serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=self.request.user,
            user_name=f"{self.request.user.first_name} {self.request.user.last_name}",
            user_role=self.request.user.role,
            activity_type="Schedule Updated",
            ip_address=self.request.META.get('REMOTE_ADDR', ''),
            details={
                "action": "update_schedule",
                "schedule_id": serializer.instance.id
            }
        )
    
    def perform_destroy(self, instance):
        # Only admins can delete schedules
        if self.request.user.role == 'student':
            raise PermissionError('Students cannot delete schedules')
        
        # Log activity before deletion
        ActivityLog.objects.create(
            user=self.request.user,
            user_name=f"{self.request.user.first_name} {self.request.user.last_name}",
            user_role=self.request.user.role,
            activity_type="Schedule Deleted",
            ip_address=self.request.META.get('REMOTE_ADDR', ''),
            details={
                "action": "delete_schedule",
                "schedule_id": instance.id,
                "course_code": instance.course.code
            }
        )
        
        instance.delete()

class BulkScheduleCreateView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.role == 'student':
            return Response(
                {'error': 'Students cannot create schedules'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = BulkScheduleSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        schedules_data = serializer.validated_data['schedules']
        created_schedules = []
        errors = []
        
        with transaction.atomic():
            for schedule_data in schedules_data:
                try:
                    # Add creator and program info
                    schedule_data['created_by'] = request.user.id
                    schedule_data['program'] = serializer.validated_data['program']
                    schedule_data['year_level'] = serializer.validated_data['year_level']
                    schedule_data['semester'] = serializer.validated_data['semester']
                    
                    schedule_serializer = ScheduleEntrySerializer(
                        data=schedule_data,
                        context={'request': request}
                    )
                    
                    if schedule_serializer.is_valid():
                        schedule = schedule_serializer.save()
                        created_schedules.append(schedule_serializer.data)
                    else:
                        errors.append({
                            'schedule': schedule_data,
                            'errors': schedule_serializer.errors
                        })
                
                except Exception as e:
                    errors.append({
                        'schedule': schedule_data,
                        'error': str(e)
                    })
            
            if errors and not created_schedules:
                return Response({
                    'status': 'error',
                    'message': 'All schedules failed to create',
                    'errors': errors
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Log bulk creation
        ActivityLog.objects.create(
            user=request.user,
            user_name=f"{request.user.first_name} {request.user.last_name}",
            user_role=request.user.role,
            activity_type="Bulk Schedule Creation",
            ip_address=request.META.get('REMOTE_ADDR', ''),
            details={
                "action": "bulk_create_schedules",
                "count": len(created_schedules),
                "errors": len(errors)
            }
        )
        
        return Response({
            'status': 'partial_success' if errors else 'success',
            'created': len(created_schedules),
            'failed': len(errors),
            'schedules': created_schedules,
            'errors': errors if errors else None
        })

class CheckConflictView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Check for conflicts without saving"""
        data = request.data
        
        conflicts = ConflictDetector.check_schedule_conflicts(data)
        
        return Response({
            'has_conflicts': len(conflicts) > 0,
            'conflicts': conflicts,
            'count': len(conflicts)
        })

class FilterSchedulesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Filter schedules exactly like your PHP system"""
        filters = {}
        
        # Get filter parameters (matching your old system)
        year_level = request.data.get('year_level')
        semester = request.data.get('semester')
        program = request.data.get('program')
        
        if year_level:
            filters['year_level'] = year_level
        if semester:
            filters['semester'] = semester
        if program:
            filters['program__code'] = program
        
        schedules = ScheduleEntry.objects.filter(**filters).order_by('time_slot', 'days')
        
        # Transform to match your old table format
        formatted_schedules = []
        for schedule in schedules:
            formatted_schedules.append({
                'id': schedule.id,
                'time': schedule.time_slot,
                'day': schedule.days,
                'course_code': schedule.course.code,
                'course_description': schedule.course.name,
                'instructor': schedule.instructor.full_name,
                'room': schedule.room.code,
                'year_level': schedule.get_year_level_display(),
                'semester': schedule.get_semester_display(),
                'program': schedule.program.name
            })
        
        return Response(formatted_schedules)