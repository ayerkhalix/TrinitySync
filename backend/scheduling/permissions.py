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
                return obj.college == user_profile.staff_profile.college
        
        if user_profile.role == 'INSTRUCTOR':
            # Instructors can view schedule groups from their college
            if hasattr(user_profile, 'staff_profile'):
                return obj.college == user_profile.staff_profile.college
        
        if user_profile.role == 'STUDENT':
            # Students can view schedule groups from their program/year
            if hasattr(user_profile, 'student_profile'):
                student = user_profile.student_profile
                return (obj.program == student.program and 
                        obj.year_level == student.year_level)
        
        return False


class CanCreateSchedule(permissions.BasePermission):
    """
    Permission to create schedules.
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        if not hasattr(request.user, 'profile'):
            return False
        
        user_profile = request.user.profile
        
        # Only college admins and super admins can create schedules
        return user_profile.role in ['COLLEGE_ADMIN', 'SUPER_ADMIN']