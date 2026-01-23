# activity_logs/models.py
from django.db import models
from accounts.models import User

class ActivityLog(models.Model):
    ACTIVITY_CHOICES = [
        ('login', 'User Login'),
        ('logout', 'User Logout'),
        ('schedule_create', 'Schedule Created'),
        ('schedule_update', 'Schedule Updated'),
        ('schedule_delete', 'Schedule Deleted'),
        ('user_register', 'User Registration'),
        ('bulk_schedule', 'Bulk Schedule Operation'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='activities')
    user_name = models.CharField(max_length=100)
    user_role = models.CharField(max_length=50)
    activity_type = models.CharField(max_length=50, choices=ACTIVITY_CHOICES)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    details = models.JSONField(default=dict)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['activity_type']),
        ]
    
    def __str__(self):
        return f"{self.user_name} - {self.get_activity_type_display()} at {self.timestamp}"