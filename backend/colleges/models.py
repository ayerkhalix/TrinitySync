# colleges/models.py
import uuid
from django.db import models
from django.contrib.postgres.fields import ArrayField
from django.utils.translation import gettext_lazy as _

class College(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'colleges'
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"


class Program(models.Model):
    class DegreeType(models.TextChoices):
        BACHELORS = 'BS', _('Bachelor of Science')
        BACHELOR = 'BA', _('Bachelor of Arts')
        ASSOCIATE = 'AS', _('Associate')
        MASTERS = 'MS', _('Master of Science')
        DOCTORATE = 'PHD', _('Doctor of Philosophy')

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    college = models.ForeignKey(College, on_delete=models.CASCADE, related_name='programs')
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    degree_type = models.CharField(max_length=10, choices=DegreeType.choices, default=DegreeType.BACHELORS)
    duration_years = models.PositiveIntegerField(default=4)
    total_units = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)  # Flexible field for future expansion

    class Meta:
        db_table = 'programs'
        unique_together = ['college', 'code']
        ordering = ['code']

    def __str__(self):
        return f"{self.code} - {self.name}"
    
class Instructor(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    full_name = models.CharField(max_length=150)

    # Department = College
    college = models.ForeignKey(
        "colleges.College",
        on_delete=models.PROTECT,
        related_name="instructors"
    )

    email = models.EmailField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    # Optional future link to an actual account
    user_profile = models.OneToOneField(
        "accounts.UserProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "instructors"
        ordering = ["full_name"]
        unique_together = ["full_name", "college"]

    def __str__(self):
        return self.full_name