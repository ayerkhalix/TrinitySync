"""
API views for the activity logs app.
"""
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import ActivityLog
from .serializers import ActivityLogSerializer
from accounts.permissions import IsCollegeAdmin, IsSuperAdmin


class ActivityLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for viewing activity logs.
    """
    queryset = ActivityLog.objects.all().select_related('user').order_by('-timestamp')
    serializer_class = ActivityLogSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['action_type', 'user']
    search_fields = ['description', 'user__email']
    ordering_fields = ['timestamp', 'action_type']
    ordering = ['-timestamp']
    
    def get_permissions(self):
        """
        Only super admins and college admins can view activity logs.
        """
        permission_classes = [IsAuthenticated, IsCollegeAdmin | IsSuperAdmin]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        """
        Filter activity logs based on user role.
        """
        user_profile = self.request.user.profile
        
        queryset = super().get_queryset()
        
        # Super admins can see all logs
        if user_profile.role == 'SUPER_ADMIN':
            return queryset
        
        # College admins can only see logs from their college
        if user_profile.role == 'COLLEGE_ADMIN':
            if hasattr(user_profile, 'staff_profile'):
                college = user_profile.staff_profile.college
                if college:
                    # Get user IDs from the college
                    from accounts.models import StudentProfile, StaffProfile
                    
                    student_user_ids = StudentProfile.objects.filter(
                        college=college
                    ).values_list('user_id', flat=True)
                    
                    staff_user_ids = StaffProfile.objects.filter(
                        college=college
                    ).values_list('user_id', flat=True)
                    
                    user_ids = list(student_user_ids) + list(staff_user_ids)
                    
                    # Also include logs by the admin themselves
                    user_ids.append(user_profile.id)
                    
                    return queryset.filter(user_id__in=user_ids)
        
        return queryset.none()