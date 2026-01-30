# accounts/views.py
"""
API views for the accounts app.
"""
from rest_framework import viewsets, status, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import UserProfile, StudentProfile, StaffProfile, UserRole
from .serializers import (
    UserProfileSerializer, UserProfileDetailSerializer, StudentProfileSerializer, 
    StaffProfileSerializer, UserRegistrationSerializer,
    ChangePasswordSerializer, EmailTokenObtainPairSerializer
)
from .permissions import IsCollegeAdmin, IsSuperAdmin, IsProfileOwner, IsStudent, IsInstructor
from activity_logs.models import ActivityLog

User = get_user_model()


class UserProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing user profiles.
    """
    queryset = UserProfile.objects.select_related('user').all().order_by('email')
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated, IsSuperAdmin]
    search_fields = ['email', 'phone_number']
    ordering_fields = ['email', 'role', 'created_at']
    ordering = ['email']
    
    def get_serializer_class(self):
        """Use detail serializer for super admins to see metadata."""
        if self.action == 'retrieve' and self.request.user.profile.role == 'SUPER_ADMIN':
            return UserProfileDetailSerializer
        return UserProfileSerializer
    
    def get_permissions(self):
        """
        Customize permissions based on action.
        """
        if self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsProfileOwner | IsSuperAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, IsSuperAdmin]
        elif self.action in ['me', 'update_me']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter user profiles based on user role.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all profiles
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can see profiles from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    # Get student profiles in the college
                    student_user_ids = StudentProfile.objects.filter(
                        college=college
                    ).values_list('user_id', flat=True)
                    
                    # Get staff profiles in the college
                    staff_user_ids = StaffProfile.objects.filter(
                        college=college
                    ).values_list('user_id', flat=True)
                    
                    # Combine both
                    user_ids = list(student_user_ids) + list(staff_user_ids)
                    
                    return queryset.filter(id__in=user_ids)
        
        # Instructors can only see their own profile
        if user_profile.role == 'INSTRUCTOR':
            return queryset.filter(id=user_profile.id)
        
        # Students can only see their own profile
        if user_profile.role == 'STUDENT':
            return queryset.filter(id=user_profile.id)
        
        return queryset.none()
    
    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Get the current user's profile.
        """
        serializer = self.get_serializer(request.user.profile)
        return Response(serializer.data)
    
    @action(detail=False, methods=['put', 'patch'], url_path='me/update')
    def update_me(self, request):
        """
        Update the current user's profile.
        """
        serializer = self.get_serializer(
            request.user.profile, 
            data=request.data, 
            partial=True
        )
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def change_role(self, request, pk=None):
        """
        Change a user's role (super admin only).
        """
        if not request.user.profile.role == 'SUPER_ADMIN':
            return Response(
                {'error': 'Only super admins can change user roles.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_profile = self.get_object()
        new_role = request.data.get('role')
        
        if not new_role:
            return Response(
                {'error': 'Role is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_role not in [role[0] for role in UserRole.choices]:
            return Response(
                {'error': 'Invalid role.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user_profile.role = new_role
        user_profile.save()
        
        # Update staff profile flags if applicable
        if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
            staff_profile = user_profile.staff_profile
            staff_profile.is_college_admin = (new_role == 'COLLEGE_ADMIN')
            staff_profile.is_super_admin = (new_role == 'SUPER_ADMIN')
            staff_profile.save()
        
        # Log the action - ensure ActivityLog.user is not None
        ActivityLog.objects.create(
            user=request.user.profile,
            action_type=ActivityLog.ActionType.UPDATE,
            description=f'Changed role for {user_profile.email} to {new_role}',
            affected_models=['UserProfile'],
            model_ids={'UserProfile': [str(user_profile.id)]}
        )
        
        return Response({'status': 'Role updated successfully.'})


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing student profiles.
    """
    queryset = StudentProfile.objects.select_related(
        'user', 'user__user', 'college', 'program'
    ).all().order_by('student_id')
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
    search_fields = ['student_id', 'user__email', 'section']
    ordering_fields = ['student_id', 'year_level', 'admission_year']
    ordering = ['student_id']
    
    def get_permissions(self):
        """
        Customize permissions based on action.
        """
        if self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsProfileOwner | IsCollegeAdmin | IsSuperAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter student profiles based on user role.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all student profiles
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see student profiles from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(college=college)
        
        # Instructors can only see student profiles from their college
        if user_profile.role == 'INSTRUCTOR':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(college=college)
        
        # Students can only see their own profile
        if user_profile.role == 'STUDENT':
            return queryset.filter(user=user_profile)
        
        return queryset.none()


class StaffProfileViewSet(viewsets.ModelViewSet):
    """
    API endpoint for managing staff profiles.
    """
    queryset = StaffProfile.objects.select_related(
        'user', 'user__user', 'college'
    ).all().order_by('employee_id')
    serializer_class = StaffProfileSerializer
    permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
    search_fields = ['employee_id', 'user__email', 'position', 'department']
    ordering_fields = ['employee_id', 'position', 'is_super_admin']
    ordering = ['employee_id']
    
    def get_permissions(self):
        """
        Customize permissions based on action.
        """
        if self.action in ['retrieve', 'update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsProfileOwner | IsCollegeAdmin | IsSuperAdmin]
        elif self.action == 'destroy':
            permission_classes = [IsAuthenticated, IsSuperAdmin]
        else:
            permission_classes = self.permission_classes
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter staff profiles based on user role.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all staff profiles
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see staff profiles from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
                college = user_profile.staff_profile.college
                if college:
                    return queryset.filter(college=college)
        
        # Staff can only see their own profile
        if user_profile.role in ['INSTRUCTOR', 'COLLEGE_ADMIN']:
            return queryset.filter(user=user_profile)
        
        return queryset.none()


class CurrentUserView(APIView):
    """
    View to get current user information.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Get current user's profile with related data.
        """
        user_profile = request.user.profile
        
        # Get base profile data
        serializer = UserProfileSerializer(user_profile)
        profile_data = serializer.data
        
        # Add student profile data if exists
        if hasattr(user_profile, 'student_profile') and user_profile.student_profile:
            student_data = StudentProfileSerializer(user_profile.student_profile).data
            profile_data['student_profile'] = student_data
        
        # Add staff profile data if exists
        if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
            staff_data = StaffProfileSerializer(user_profile.staff_profile).data
            profile_data['staff_profile'] = staff_data
        
        return Response(profile_data)


@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Register a new user (for testing/development).
    In production, this would integrate with Supabase Auth.
    """
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user_profile = serializer.save()
        
        # Log the action - ensure we have a user for the log
        ActivityLog.objects.create(
            user=user_profile,  # Use the created user profile
            action_type=ActivityLog.ActionType.CREATE,
            description=f'User registered: {user_profile.email}',
            affected_models=['UserProfile'],
            model_ids={'UserProfile': [str(user_profile.id)]}
        )
        
        return Response(
            {'message': 'User registered successfully.'},
            status=status.HTTP_201_CREATED
        )
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    View for changing user password.
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """
        Change user password.
        Note: In production with Supabase, this would call Supabase Auth API.
        """
        serializer = ChangePasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            user = request.user
            
            # Check old password
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Old password is incorrect.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Set new password
            user.set_password(serializer.validated_data['new_password'])
            user.save()
            
            ActivityLog.objects.create(
                user=request.user.profile,
                action_type=ActivityLog.ActionType.UPDATE,
                description='Password changed',
                affected_models=['User'],
                model_ids={'User': [str(user.id)]}
            )
            
            return Response({'message': 'Password updated successfully.'})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# CORRECT JWT VIEW - Use SimpleJWT's built-in view
from rest_framework_simplejwt.views import TokenObtainPairView

class EmailTokenObtainPairView(TokenObtainPairView):
    """
    Custom view for email-based JWT token obtain.
    Using SimpleJWT's built-in view ensures proper token generation.
    """
    serializer_class = EmailTokenObtainPairSerializer