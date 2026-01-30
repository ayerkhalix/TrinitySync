"""
API views for the colleges app.
"""
from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from django_filters.rest_framework import DjangoFilterBackend

from .models import College, Program
from .serializers import CollegeSerializer, ProgramSerializer
from accounts.permissions import IsCollegeAdmin, IsSuperAdmin
from activity_logs.models import ActivityLog


class CollegeViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing colleges.
    """
    authentication_classes = []
    queryset = College.objects.all()
    serializer_class = CollegeSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['code']
    
    def get_permissions(self):
        # PUBLIC endpoints (registration use)
        if self.action in ['list', 'retrieve', 'programs']:
            permission_classes = [AllowAny]
        # Admin-only actions
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            permission_classes = [IsAuthenticated]

        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter colleges based on user role.
        Public users (registration) can see all colleges.
        """
        queryset = super().get_queryset()

        # 🔥 IMPORTANT: allow public access
        if not self.request.user.is_authenticated:
            return queryset.filter(is_active=True)

        # From here on, user IS authenticated
        user_profile = getattr(self.request.user, 'profile', None)

        if not user_profile:
            return queryset.filter(is_active=True)

        if user_profile.role == 'SUPER_ADMIN':
            return queryset

        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(id=college.id, is_active=True)

        if user_profile.role == 'INSTRUCTOR':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(id=college.id, is_active=True)

        if user_profile.role == 'STUDENT':
            if hasattr(user_profile, 'student_profile') and user_profile.student_profile:
                college = user_profile.student_profile.college
                if college:
                    return queryset.filter(id=college.id, is_active=True)

        return queryset.filter(is_active=True)
    
    def perform_create(self, serializer):
        """
        Create college with audit logging.
        """
        college = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created college: {college.code} - {college.name}',
            affected_models=['College'],
            model_ids={'College': [str(college.id)]}
        )
    
    def perform_update(self, serializer):
        """
        Update college with audit logging.
        """
        college = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated college: {college.code} - {college.name}',
            affected_models=['College'],
            model_ids={'College': [str(college.id)]}
        )
    
    def perform_destroy(self, instance):
        """
        Delete college with audit logging.
        """
        college_info = f'{instance.code} - {instance.name}'
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.DELETE,
            description=f'Deleted college: {college_info}',
            affected_models=['College'],
            model_ids={'College': [str(instance.id)]}
        )
        
        instance.delete()
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def programs(self, request, pk=None):
        """
        Get all programs for a college.
        PUBLIC endpoint for registration.
        """
        try:
            college = College.objects.get(pk=pk, is_active=True)
            programs = Program.objects.filter(college=college, is_active=True)
            
            page = self.paginate_queryset(programs)
            if page is not None:
                serializer = ProgramSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = ProgramSerializer(programs, many=True)
            return Response(serializer.data)
        except College.DoesNotExist:
            return Response(
                {"detail": "College not found or inactive."},
                status=status.HTTP_404_NOT_FOUND
            )


class ProgramViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing programs.
    """
    queryset = Program.objects.all().select_related('college')
    serializer_class = ProgramSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['college', 'degree_type', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['code', 'name', 'college__code']
    ordering = ['college__code', 'code']
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        """
        # PUBLIC endpoints for registration
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter programs based on user role and college.
        """
        queryset = super().get_queryset()

        # 🔥 IMPORTANT: allow public access (for registration)
        if not self.request.user.is_authenticated:
            return queryset.filter(is_active=True)

        # From here on, user IS authenticated
        user_profile = getattr(self.request.user, 'profile', None)

        if not user_profile:
            return queryset.filter(is_active=True)

        # Super admins can see all programs
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see programs from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(college=college, is_active=True)
        
        # Instructors can only see programs from their college
        if user_profile.role == 'INSTRUCTOR':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(college=college, is_active=True)
        
        # Students can only see programs from their college
        if user_profile.role == 'STUDENT':
            if hasattr(user_profile, 'student_profile'):
                college = user_profile.student_profile.college
                if college:
                    return queryset.filter(college=college, is_active=True)
        
        # Default: return only active programs
        return queryset.filter(is_active=True)
    
    def perform_create(self, serializer):
        """
        Create program with audit logging.
        """
        program = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.CREATE,
            description=f'Created program: {program.code} - {program.name}',
            affected_models=['Program'],
            model_ids={'Program': [str(program.id)]}
        )
    
    def perform_update(self, serializer):
        """
        Update program with audit logging.
        """
        program = serializer.save()
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Updated program: {program.code} - {program.name}',
            affected_models=['Program'],
            model_ids={'Program': [str(program.id)]}
        )
    
    def perform_destroy(self, instance):
        """
        Delete program with audit logging.
        """
        program_info = f'{instance.code} - {instance.name}'
        
        ActivityLog.objects.create(
            user=self.request.user.profile,
            action_type=ActivityLog.ActionType.DELETE,
            description=f'Deleted program: {program_info}',
            affected_models=['Program'],
            model_ids={'Program': [str(instance.id)]}
        )
        
        instance.delete()
    
    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def courses(self, request, pk=None):
        """
        Get all courses for a program.
        """
        try:
            program = Program.objects.get(pk=pk, is_active=True)
            courses = program.courses.filter(is_active=True)
            
            # Optional filtering
            year_level = request.query_params.get('year_level')
            semester = request.query_params.get('semester')
            
            if year_level:
                courses = courses.filter(year_level=year_level)
            
            if semester:
                courses = courses.filter(semester=semester)
            
            from courses.serializers import CourseSerializer
            page = self.paginate_queryset(courses)
            if page is not None:
                serializer = CourseSerializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = CourseSerializer(courses, many=True)
            return Response(serializer.data)
        except Program.DoesNotExist:
            return Response(
                {"detail": "Program not found or inactive."},
                status=status.HTTP_404_NOT_FOUND
            )