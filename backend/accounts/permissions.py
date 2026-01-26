"""
Custom permissions for the accounts app.
"""
from rest_framework import permissions


class IsCollegeAdmin(permissions.BasePermission):
    """
    Permission check for college administrators.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has a profile
        if not hasattr(request.user, 'profile'):
            return False
        
        user_profile = request.user.profile
        
        # Super admins have all permissions
        if user_profile.role == 'SUPER_ADMIN':
            return True
        
        # College admins have permission
        if user_profile.role == 'COLLEGE_ADMIN':
            return True
        
        return False


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission check for super administrators only.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.role == 'SUPER_ADMIN'


class IsProfileOwner(permissions.BasePermission):
    """
    Permission check for profile owners.
    Allows users to access their own profile.
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        # Check if the object is a UserProfile
        from accounts.models import UserProfile
        if isinstance(obj, UserProfile):
            return obj == request.user.profile
        
        # Check if the object has a user attribute (like StudentProfile or StaffProfile)
        if hasattr(obj, 'user'):
            return obj.user == request.user.profile
        
        return False


class IsStudent(permissions.BasePermission):
    """
    Permission check for students.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.role == 'STUDENT'


class IsInstructor(permissions.BasePermission):
    """
    Permission check for instructors.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.role == 'INSTRUCTOR'


class CanViewOwnCollegeData(permissions.BasePermission):
    """
    Permission to view data only from user's own college.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        return request.user.profile.role in ['COLLEGE_ADMIN', 'INSTRUCTOR', 'STUDENT']
    
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user_profile = request.user.profile
        
        # Super admins can access everything
        if user_profile.role == 'SUPER_ADMIN':
            return True
        
        # Get user's college
        user_college = None
        if user_profile.role == 'COLLEGE_ADMIN' or user_profile.role == 'INSTRUCTOR':
            if hasattr(user_profile, 'staff_profile'):
                user_college = user_profile.staff_profile.college
        elif user_profile.role == 'STUDENT':
            if hasattr(user_profile, 'student_profile'):
                user_college = user_profile.student_profile.college
        
        if not user_college:
            return False
        
        # Check if object belongs to user's college
        if hasattr(obj, 'college'):
            return obj.college == user_college
        elif hasattr(obj, 'program'):
            return obj.program.college == user_college
        elif hasattr(obj, 'schedule_group'):
            return obj.schedule_group.college == user_college
        
        return False