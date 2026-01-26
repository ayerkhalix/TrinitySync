# activity_logs/models.py

import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _


class ActivityLog(models.Model):
    class ActionType(models.TextChoices):
        LOGIN = 'login', _('User Login')
        LOGOUT = 'logout', _('User Logout')
        CREATE = 'create', _('Create Record')
        UPDATE = 'update', _('Update Record')
        DELETE = 'delete', _('Delete Record')
        APPROVE = 'approve', _('Approve Action')
        REJECT = 'reject', _('Reject Action')
        SCHEDULE_GENERATE = 'schedule_generate', _('Generate Schedule')
        CONFLICT_DETECTED = 'conflict_detected', _('Conflict Detected')
        CONFLICT_RESOLVED = 'conflict_resolved', _('Conflict Resolved')
        SYSTEM = 'system', _('System Action')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ✅ DO NOT import User directly (prevents circular + startup errors)
    user = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs"
    )

    action_type = models.CharField(max_length=50, choices=ActionType.choices, default=ActionType.SYSTEM)
    description = models.TextField()

    # Request metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)

    # Affected system info
    affected_models = ArrayField(
        models.CharField(max_length=100),
        default=list,
        blank=True
    )

    model_ids = models.JSONField(
        default=dict,
        blank=True,
        help_text="Example: { 'schedule_items': ['uuid1', 'uuid2'] }"
    )

    metadata = models.JSONField(default=dict, blank=True)

    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action_type', 'timestamp']),
        ]

    def __str__(self):
        if self.user:
            return f"{self.user.email} → {self.action_type}"
        return f"System → {self.action_type}"