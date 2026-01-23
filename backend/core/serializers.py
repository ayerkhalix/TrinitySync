# core/serializers.py
from rest_framework import serializers
from .models import Department, Program, Course

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'code', 'name', 'dean_name']

class ProgramSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    
    class Meta:
        model = Program
        fields = ['id', 'code', 'name', 'department', 'department_name']

class CourseSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'code', 'name', 'description', 'units', 
                  'program', 'program_name', 'year_level', 'semester']
    
    def get_year_level_display(self, obj):
        return obj.get_year_level_display()
    
    def get_semester_display(self, obj):
        return obj.get_semester_display()

class CourseFilterSerializer(serializers.Serializer):
    program = serializers.CharField(required=False)
    year_level = serializers.CharField(required=False)
    semester = serializers.CharField(required=False)