# core/models.py
from django.db import models

class Department(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)
    dean_name = models.CharField(max_length=100, blank=True)
    
    def __str__(self):
        return f"{self.code} - {self.name}"

class Program(models.Model):
    PROGRAM_CHOICES = [
        ('BSIT', 'BS Information Technology'),
        ('BSCE', 'BS Computer Engineering'),
        ('BSGE', 'BS Geodetic Engineering'),
        ('BSCpE', 'BS Computer Engineering'),
    ]
    
    code = models.CharField(max_length=10, choices=PROGRAM_CHOICES)
    name = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='programs')
    
    class Meta:
        unique_together = ['code', 'department']
    
    def __str__(self):
        return self.name

class Course(models.Model):
    YEAR_LEVEL_CHOICES = [
        ('first_year', 'First Year'),
        ('second_year', 'Second Year'),
        ('third_year', 'Third Year'),
        ('fourth_year', 'Fourth Year'),
    ]
    
    SEMESTER_CHOICES = [
        ('first_sem', 'First Semester'),
        ('second_sem', 'Second Semester'),
        ('third_sem', 'Third Semester'),
    ]
    
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    units = models.IntegerField(default=3)
    program = models.ForeignKey(Program, on_delete=models.CASCADE, related_name='courses')
    year_level = models.CharField(max_length=20, choices=YEAR_LEVEL_CHOICES)
    semester = models.CharField(max_length=20, choices=SEMESTER_CHOICES)
    
    class Meta:
        unique_together = ['code', 'program', 'year_level', 'semester']
        ordering = ['year_level', 'semester', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"