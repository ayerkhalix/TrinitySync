# scheduling/models.py
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _

# Only import these for CHOICES (not ForeignKeys)
from accounts.models import StudentProfile
from courses.models import Course


class SchoolYear(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50, unique=True)
    code = models.CharField(max_length=20, unique=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'school_years'
        ordering = ['-start_date']

    def __str__(self):
        return self.name


class ScheduleGroup(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', _('Draft')
        PENDING = 'pending', _('Pending Approval')
        APPROVED = 'approved', _('Approved')
        ACTIVE = 'active', _('Active')
        ARCHIVED = 'archived', _('Archived')
        CANCELLED = 'cancelled', _('Cancelled')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ✅ always use string references for cross-app ForeignKeys
    college = models.ForeignKey("colleges.College", on_delete=models.CASCADE)
    program = models.ForeignKey("colleges.Program", on_delete=models.CASCADE)

    year_level = models.CharField(
        max_length=20,
        choices=StudentProfile.YearLevel.choices
    )

    section = models.CharField(max_length=10)

    semester = models.CharField(
        max_length=20,
        choices=Course.SemesterType.choices
    )

    school_year = models.ForeignKey(SchoolYear, on_delete=models.CASCADE)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)

    created_by = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.CASCADE,
        related_name='created_schedule_groups'
    )

    approved_by = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='approved_schedule_groups'
    )

    approval_date = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schedule_groups'
        unique_together = ['program', 'year_level', 'section', 'semester', 'school_year']
        ordering = ['school_year', 'semester', 'program', 'year_level', 'section']

    def __str__(self):
        return f"{self.program.code} {self.year_level}-{self.section} ({self.semester})"


class ScheduleItem(models.Model):
    class DayOfWeek(models.TextChoices):
        MONDAY = 'MON', _('Monday')
        TUESDAY = 'TUE', _('Tuesday')
        WEDNESDAY = 'WED', _('Wednesday')
        THURSDAY = 'THU', _('Thursday')
        FRIDAY = 'FRI', _('Friday')
        SATURDAY = 'SAT', _('Saturday')
        SUNDAY = 'SUN', _('Sunday')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    schedule_group = models.ForeignKey(
        ScheduleGroup,
        on_delete=models.CASCADE,
        related_name='items'
    )

    course = models.ForeignKey("courses.Course", on_delete=models.CASCADE)

    day = models.CharField(max_length=3, choices=DayOfWeek.choices)
    start_time = models.TimeField()
    end_time = models.TimeField()

    room = models.CharField(max_length=50)

    instructor = models.ForeignKey(
        "colleges.Instructor",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="schedule_items"
    )


    instructor_override = models.CharField(max_length=100, blank=True)
    max_students = models.PositiveIntegerField(default=40)
    current_enrollment = models.PositiveIntegerField(default=0)
    is_lab = models.BooleanField(default=False)
    is_online = models.BooleanField(default=False)
    online_link = models.URLField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        db_table = 'schedule_items'
        ordering = ['day', 'start_time']
        indexes = [
            models.Index(fields=['schedule_group', 'day', 'start_time']),
            models.Index(fields=['room', 'day', 'start_time']),
            models.Index(fields=['instructor', 'day', 'start_time']),
        ]

    def __str__(self):
        return f"{self.course.course_code} - {self.day} {self.start_time}"


class ScheduleConflict(models.Model):
    class ConflictType(models.TextChoices):
        ROOM = 'room', _('Room Conflict')
        INSTRUCTOR = 'instructor', _('Instructor Conflict')
        SECTION = 'section', _('Section Conflict')
        STUDENT = 'student', _('Student Conflict')
        TIME_OVERLAP = 'time_overlap', _('Time Overlap')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    conflict_type = models.CharField(max_length=20, choices=ConflictType.choices)

    schedule_item_1 = models.ForeignKey(
        ScheduleItem,
        on_delete=models.CASCADE,
        related_name='conflicts_as_first'
    )

    schedule_item_2 = models.ForeignKey(
        ScheduleItem,
        on_delete=models.CASCADE,
        related_name='conflicts_as_second'
    )

    severity = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=5
    )

    description = models.TextField()
    resolved = models.BooleanField(default=False)

    resolved_by = models.ForeignKey(
        "accounts.UserProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'schedule_conflicts'
        unique_together = ['schedule_item_1', 'schedule_item_2', 'conflict_type']