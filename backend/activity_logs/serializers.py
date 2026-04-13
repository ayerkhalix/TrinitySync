# activity_logs/serializers.py
from rest_framework import serializers
from .models import ActivityLog


class ActivityLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True, allow_null=True)
    user_email = serializers.CharField(source='user.email', read_only=True, allow_null=True)
    action_type_display = serializers.CharField(source='get_action_type_display', read_only=True)
    details = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = ActivityLog
        fields = [
            'id',
            'user',
            'user_name',
            'user_email',
            'user_role',
            'action_type',
            'action_type_display',
            'description',
            'ip_address',
            'affected_models',
            'model_ids',
            'metadata',
            'details',
            'status',
            'timestamp',
        ]
        read_only_fields = fields

    def get_user_name(self, obj):
        if not obj.user:
            return 'System'

        django_user = getattr(obj.user, 'user', None)
        if django_user:
            full_name = f'{django_user.first_name} {django_user.last_name}'.strip()
            if full_name:
                return full_name

        return obj.user.email

    def get_details(self, obj):
        details = {}
        if obj.metadata:
            details.update(obj.metadata)
        if obj.model_ids:
            details['model_ids'] = obj.model_ids
        if obj.affected_models:
            details['affected_models'] = obj.affected_models
        return details

    def get_status(self, obj):
        if obj.action_type in {ActivityLog.ActionType.CONFLICT_DETECTED, ActivityLog.ActionType.REJECT}:
            return 'warning'
        if obj.action_type in {ActivityLog.ActionType.DELETE}:
            return 'error'
        return 'success'
