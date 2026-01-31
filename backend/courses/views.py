"""
API views for the courses app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser

from .models import Course, CoursePrerequisite
from .serializers import CourseSerializer, SimpleCourseSerializer, CoursePrerequisiteSerializer
from accounts.permissions import IsCollegeAdmin, IsSuperAdmin
from activity_logs.models import ActivityLog


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing courses.
    """
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Base queryset - only active courses
        qs = Course.objects.select_related(
            "program",
            "program__college"
        ).filter(is_active=True)
        
        # Apply filters from query parameters
        program = self.request.query_params.get("program")
        semester = self.request.query_params.get("semester")
        year_level = self.request.query_params.get("year_level")
        
        if program:
            qs = qs.filter(program_id=program)
        
        if semester:
            qs = qs.filter(semester=semester)
        
        if year_level:
            qs = qs.filter(year_level=year_level)
        
        return qs
    
    def perform_create(self, serializer):
        """
        Create course with audit logging.
        """
        course = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created course: {course.course_code} - {course.course_title}',
            affected_models=['Course'],
            model_ids={'Course': [str(course.id)]}
        )
    
    def perform_update(self, serializer):
        """
        Update course with audit logging.
        """
        course = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated course: {course.course_code} - {course.course_title}',
            affected_models=['Course'],
            model_ids={'Course': [str(course.id)]}
        )
    
    def perform_destroy(self, instance):
        """
        Delete course with audit logging.
        """
        course_info = f'{instance.course_code} - {instance.course_title}'
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.DELETE,
            description=f'Deleted course: {course_info}',
            affected_models=['Course'],
            model_ids={'Course': [str(instance.id)]}
        )
        
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def filter_courses(self, request):
        """
        Get filtered courses for scheduling.
        """
        program = request.query_params.get('program')
        semester = request.query_params.get('semester')
        
        if not program or not semester:
            return Response(
                {'error': 'Both program and semester parameters are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        queryset = self.get_queryset()
        
        # Apply filters
        queryset = queryset.filter(
            program_id=program,
            semester=semester,
            is_active=True
        )
        
        # Use simple serializer for dropdown
        serializer = SimpleCourseSerializer(queryset, many=True)
        return Response(serializer.data)


class CoursePrerequisiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course prerequisites.
    """
    queryset = CoursePrerequisite.objects.all().select_related('course', 'prerequisite')
    serializer_class = CoursePrerequisiteSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]