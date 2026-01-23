# schedules/models.py
from django.db import models
from accounts.models import User
from core.models import Course, Program

class Room(models.Model):
    ROOM_TYPE_CHOICES = [
        ('classroom', 'Classroom'),
        ('laboratory', 'Laboratory'),
        ('computer_lab', 'Computer Lab'),
        ('blended', 'Blended'),
        ('online', 'Online'),
    ]
    
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=100)
    capacity = models.IntegerField(default=30)
    room_type = models.CharField(max_length=20, choices=ROOM_TYPE_CHOICES, default='classroom')
    building = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Instructor(models.Model):
    employee_id = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    is_active = models.BooleanField(default=True)
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def __str__(self):
        return f"{self.employee_id} - {self.full_name}"

class ScheduleEntry(models.Model):
    DAY_CHOICES = [
        ('Monday', 'Monday'),
        ('Tuesday', 'Tuesday'),
        ('Wednesday', 'Wednesday'),
        ('Thursday', 'Thursday'),
        ('Friday', 'Friday'),
        ('Saturday', 'Saturday'),
        ('Monday/Tuesday', 'Monday/Tuesday'),
        ('Thursday/Friday', 'Thursday/Friday'),
        ('Monday/Wednesday/Friday', 'Monday/Wednesday/Friday'),
        ('Tuesday/Thursday/Saturday', 'Tuesday/Thursday/Saturday'),
    ]
    
    # Time slot (e.g., "8:00 AM - 11:00 AM", "1:00 PM - 3:00 PM")
    time_slot = models.CharField(max_length=50)
    days = models.CharField(max_length=50, choices=DAY_CHOICES)
    
    # Relationships
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='schedules')
    instructor = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='schedules')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='schedules')
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='schedules')
    
    # Filters (same as your PHP system)
    year_level = models.CharField(max_length=20, choices=Course.YEAR_LEVEL_CHOICES)
    semester = models.CharField(max_length=20, choices=Course.SEMESTER_CHOICES)
    
    # Metadata
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_schedules')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['time_slot', 'days']
        unique_together = [
            ('time_slot', 'days', 'room', 'semester', 'year_level'),
            ('time_slot', 'days', 'instructor', 'semester', 'year_level')
        ]
    
    def __str__(self):
        return f"{self.course.code} - {self.days} {self.time_slot}"