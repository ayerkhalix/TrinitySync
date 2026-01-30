# accounts/models.py
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth.models import User


class UserRole(models.TextChoices):
    STUDENT = 'STUDENT', _('Student')
    COLLEGE_ADMIN = 'COLLEGE_ADMIN', _('College Administrator')
    SUPER_ADMIN = 'SUPER_ADMIN', _('Super Administrator')


class UserProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    supabase_uid = models.CharField(max_length=255, unique=True, db_index=True)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.choices, default=UserRole.STUDENT)
    is_active = models.BooleanField(default=True)
    email_verified = models.BooleanField(default=False)
    phone_number = models.CharField(max_length=20, blank=True)
    avatar_url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profiles'
        ordering = ['email']

    def __str__(self):
        return f"{self.email} ({self.role})"


class StudentProfile(models.Model):
    class YearLevel(models.TextChoices):
        FIRST_YEAR = 'first_year', _('First Year')
        SECOND_YEAR = 'second_year', _('Second Year')
        THIRD_YEAR = 'third_year', _('Third Year')
        FOURTH_YEAR = 'fourth_year', _('Fourth Year')
        FIFTH_YEAR = 'fifth_year', _('Fifth Year')

    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='student_profile')
    student_id = models.CharField(max_length=50, unique=True)
    college = models.ForeignKey("colleges.College", on_delete=models.CASCADE)
    program = models.ForeignKey("colleges.Program", on_delete=models.CASCADE)
    year_level = models.CharField(max_length=20, choices=YearLevel.choices)
    section = models.CharField(max_length=10, blank=True)
    admission_year = models.PositiveIntegerField()
    expected_graduation = models.DateField(null=True, blank=True)
    is_graduated = models.BooleanField(default=False)

    class Meta:
        db_table = 'student_profiles'
        ordering = ['student_id']

    def __str__(self):
        return f"{self.student_id} - {self.user.email}"


class StaffProfile(models.Model):
    user = models.OneToOneField(UserProfile, on_delete=models.CASCADE, related_name='staff_profile')
    employee_id = models.CharField(max_length=50, unique=True, blank=True, null=True)
    college = models.ForeignKey("colleges.College", on_delete=models.SET_NULL, null=True, blank=True)
    position = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)
    is_college_admin = models.BooleanField(default=False)
    is_super_admin = models.BooleanField(default=False)
    office_location = models.CharField(max_length=100, blank=True)
    office_hours = models.JSONField(default=dict, blank=True)
    expertise = ArrayField(models.CharField(max_length=100), default=list, blank=True)

    class Meta:
        db_table = 'staff_profiles'
        ordering = ['employee_id']

    def __str__(self):
        return f"{self.employee_id or 'No ID'} - {self.user.email}"