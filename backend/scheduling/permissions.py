"""
Custom permissions for the scheduling app.
"""
from rest_framework import permissions
from .models import ScheduleGroup


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


class CanViewScheduleGroup(permissions.BasePermission):
    """
    Permission to view schedule groups based on user role.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        user_profile = request.user.profile
        
        # All authenticated users with profiles can view (with filters in get_queryset)
        return user_profile.role in ['SUPER_ADMIN', 'COLLEGE_ADMIN', 'INSTRUCTOR', 'STUDENT']
    
    def has_object_permission(self, request, view, obj):
        user_profile = request.user.profile
        
        if user_profile.role == 'SUPER_ADMIN':
            return True
        
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                return obj.schedule_group.college == user_profile.staff_profile.college
        
        if user_profile.role == 'INSTRUCTOR':
            # Instructors can view items they're assigned to
            return obj.instructor and obj.instructor.user == user_profile
        
        return False