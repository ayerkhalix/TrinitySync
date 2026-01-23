# activity_logs/serializers.py
from rest_framework import serializers
from .models import ActivityLog

class ActivityLogSerializer(serializers.ModelSerializer):
    activity_type_display = serializers.CharField(source='get_activity_type_display', read_only=True)
    
    class Meta:
        model = ActivityLog
        fields = [
            'id', 'user', 'user_name', 'user_role', 
            'activity_type', 'activity_type_display',
            'ip_address', 'details', 'timestamp'
        ]
        read_only_fields = fields