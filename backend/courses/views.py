"""
API views for the courses app.
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django_filters.rest_framework import DjangoFilterBackend

from .models import Course, CoursePrerequisite
from .serializers import CourseSerializer, CoursePrerequisiteSerializer
from .filters import CourseFilter
from accounts.permissions import IsCollegeAdmin, IsSuperAdmin
from activity_logs.models import ActivityLog


class CourseViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing courses.
    """
    queryset = Course.objects.all().select_related('program', 'program__college')
    serializer_class = CourseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = CourseFilter
    search_fields = ['course_code', 'course_title', 'course_description']
    ordering_fields = ['course_code', 'course_title', 'year_level', 'semester']
    ordering = ['course_code']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter courses based on user role and college.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all courses
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see courses from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return queryset.filter(program__college=college)
        
        # Instructors can see courses from their college
        if user_profile.role == 'INSTRUCTOR':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return queryset.filter(program__college=college)
        
        # Students can see courses from their program
        if user_profile.role == 'STUDENT':
            if hasattr(user_profile, 'student_profile'):
                student = user_profile.student_profile
                return queryset.filter(program=student.program)
        
        return queryset.none()
    
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
    
    @action(detail=True, methods=['get'])
    def prerequisites(self, request, pk=None):
        """
        Get prerequisites for a course.
        """
        course = self.get_object()
        prerequisites = CoursePrerequisite.objects.filter(course=course)
        serializer = CoursePrerequisiteSerializer(prerequisites, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_program(self, request):
        """
        Get courses filtered by program.
        """
        program_id = request.query_params.get('program_id')
        year_level = request.query_params.get('year_level')
        semester = request.query_params.get('semester')
        
        queryset = self.get_queryset()
        
        if program_id:
            queryset = queryset.filter(program_id=program_id)
        
        if year_level:
            queryset = queryset.filter(year_level=year_level)
        
        if semester:
            queryset = queryset.filter(semester=semester)
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def bulk_create(self, request):
        """
        Bulk create courses.
        """
        if not request.user.profile.role in ['COLLEGE_ADMIN', 'SUPER_ADMIN']:
            return Response(
                {'error': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        courses_data = request.data.get('courses', [])
        created_courses = []
        errors = []
        
        for index, course_data in enumerate(courses_data):
            try:
                serializer = self.get_serializer(data=course_data)
                if serializer.is_valid():
                    course = serializer.save()
                    created_courses.append(course.id)
                else:
                    errors.append({
                        'index': index,
                        'errors': serializer.errors,
                        'data': course_data
                    })
            except Exception as e:
                errors.append({
                    'index': index,
                    'error': str(e),
                    'data': course_data
                })
        
        if created_courses:
            ActivityLog.objects.create(
                user=request.user.profile,
                action_type=ActivityLog.ActionType.CREATE,
                description=f'Bulk created {len(created_courses)} courses',
                affected_models=['Course'],
                model_ids={'Course': [str(cid) for cid in created_courses]}
            )
        
        response_data = {
            'created': len(created_courses),
            'errors': len(errors),
            'course_ids': created_courses
        }
        
        if errors:
            response_data['error_details'] = errors[:10]  # Limit to first 10 errors
        
        return Response(response_data, status=status.HTTP_201_CREATED if created_courses else status.HTTP_400_BAD_REQUEST)


class CoursePrerequisiteViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing course prerequisites.
    """
    queryset = CoursePrerequisite.objects.all().select_related('course', 'prerequisite')
    serializer_class = CoursePrerequisiteSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
    
    def get_queryset(self):
        """
        Filter prerequisites based on user permissions.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see prerequisites from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                return queryset.filter(course__program__college=college)
        
        return queryset.none()