# activity_logs/views.py
from rest_framework import generics, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import ActivityLog
from .serializers import ActivityLogSerializer

class ActivityLogListView(generics.ListAPIView):
    """View activity logs (admin only)"""
    queryset = ActivityLog.objects.all()
    serializer_class = ActivityLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['user_role', 'activity_type', 'user']
    search_fields = ['user_name', 'details']
    ordering_fields = ['timestamp', 'user_name']
    ordering = ['-timestamp']
    
    def get_queryset(self):
        # Only super admins can see all logs
        if self.request.user.role != 'super_admin':
            # Department admins can see logs from their department
            return ActivityLog.objects.filter(
                user_role__in=['department_admin', 'student']
            )
        return ActivityLog.objects.all()