"""
Serializers for the colleges app.
"""
from rest_framework import serializers
from .models import College, Program


class CollegeSerializer(serializers.ModelSerializer):
    program_count = serializers.IntegerField(source='programs.count', read_only=True)
    
    class Meta:
        model = College
        fields = [
            'id', 'code', 'name', 'description',
            'is_active', 'program_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ProgramSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    college_code = serializers.CharField(source='college.code', read_only=True)
    course_count = serializers.IntegerField(source='courses.count', read_only=True)
    
    class Meta:
        model = Program
        fields = [
            'id', 'college', 'college_name', 'college_code',
            'code', 'name', 'degree_type', 'duration_years',
            'total_units', 'is_active', 'metadata', 'course_count'
        ]
        read_only_fields = ['id']