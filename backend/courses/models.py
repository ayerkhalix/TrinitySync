# courses/models.py
import uuid
from django.db import models
from django.utils.translation import gettext_lazy as _

# Only for choices (safe import)
from accounts.models import StudentProfile


class Course(models.Model):

    class SemesterType(models.TextChoices):
        FIRST_SEM = 'first_sem', _('First Semester/Trimester')
        SECOND_SEM = 'second_sem', _('Second Semester/Trimester')
        THIRD_SEM = 'third_sem', _('Third Semester/Trimester')
        SUMMER = 'summer', _('Summer Term')
        SPECIAL = 'special', _('Special Term')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # ✅ string reference avoids circular import
    program = models.ForeignKey(
        "colleges.Program",
        on_delete=models.CASCADE,
        related_name="courses"
    )

    course_code = models.CharField(max_length=20, db_index=True)
    course_title = models.CharField(max_length=200)
    course_description = models.TextField(blank=True)

    year_level = models.CharField(
        max_length=20,
        choices=StudentProfile.YearLevel.choices
    )

    semester = models.CharField(
        max_length=20,
        choices=SemesterType.choices
    )

    units = models.DecimalField(max_digits=3, decimal_places=1, default=3.0)
    lecture_hours = models.PositiveIntegerField(default=0)
    laboratory_hours = models.PositiveIntegerField(default=0)

    prerequisites = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        through="CoursePrerequisite"
    )

    is_active = models.BooleanField(default=True)
    is_core = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "courses"
        unique_together = ["program", "course_code"]
        ordering = ["course_code"]
        indexes = [
            models.Index(fields=["program", "year_level", "semester"]),
        ]

    def __str__(self):
        return f"{self.course_code} - {self.course_title}"


class CoursePrerequisite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    course = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="required_for"
    )

    prerequisite = models.ForeignKey(
        "courses.Course",
        on_delete=models.CASCADE,
        related_name="prerequisite_for"
    )

    is_strict = models.BooleanField(default=True)
    minimum_grade = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "course_prerequisites"
        unique_together = ["course", "prerequisite"]

    def __str__(self):
        return f"{self.prerequisite.course_code} → {self.course.course_code}"