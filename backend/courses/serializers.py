"""
Serializers for the courses app.
"""
from rest_framework import serializers
from .models import Course, CoursePrerequisite
from colleges.models import Program
from colleges.serializers import ProgramSerializer


class CourseSerializer(serializers.ModelSerializer):
    program_details = ProgramSerializer(source='program', read_only=True)
    college_name = serializers.CharField(source='program.college.name', read_only=True)
    college_code = serializers.CharField(source='program.college.code', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'program', 'program_details', 'college_name', 'college_code',
            'course_code', 'course_title', 'course_description',
            'year_level', 'semester', 'units', 'lecture_hours', 'laboratory_hours',
            'is_active', 'is_core', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, data):
        # Ensure course code is unique within the program
        program = data.get('program', self.instance.program if self.instance else None)
        course_code = data.get('course_code', self.instance.course_code if self.instance else None)
        
        if program and course_code:
            existing = Course.objects.filter(
                program=program,
                course_code=course_code
            )
            
            if self.instance:
                existing = existing.exclude(id=self.instance.id)
            
            if existing.exists():
                raise serializers.ValidationError({
                    'course_code': f'A course with code {course_code} already exists in this program.'
                })
        
        return data


class SimpleCourseSerializer(serializers.ModelSerializer):
    """Simplified serializer for dropdown selection"""
    class Meta:
        model = Course
        fields = ['id', 'course_code', 'course_title', 'year_level', 'semester', 'units']
        read_only_fields = ['id', 'course_code', 'course_title', 'year_level', 'semester', 'units']


class CourseFilterSerializer(serializers.Serializer):
    """Serializer for course filtering"""
    program = serializers.UUIDField(required=True)
    semester = serializers.ChoiceField(choices=Course.SemesterType.choices, required=True)


class CoursePrerequisiteSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.course_code', read_only=True)
    course_title = serializers.CharField(source='course.course_title', read_only=True)
    prerequisite_code = serializers.CharField(source='prerequisite.course_code', read_only=True)
    prerequisite_title = serializers.CharField(source='prerequisite.course_title', read_only=True)
    
    class Meta:
        model = CoursePrerequisite
        fields = [
            'id', 'course', 'course_code', 'course_title',
            'prerequisite', 'prerequisite_code', 'prerequisite_title',
            'is_strict', 'minimum_grade'
        ]
        read_only_fields = ['id']
    
    def validate(self, data):
        # Prevent circular dependencies
        course = data.get('course', self.instance.course if self.instance else None)
        prerequisite = data.get('prerequisite')
        
        if course and prerequisite:
            # Check if prerequisite is the same as course
            if course.id == prerequisite.id:
                raise serializers.ValidationError({
                    'prerequisite': 'A course cannot be a prerequisite of itself.'
                })
            
            # Check for circular dependency
            if CoursePrerequisite.objects.filter(course=prerequisite, prerequisite=course).exists():
                raise serializers.ValidationError({
                    'prerequisite': 'Circular dependency detected.'
                })
        
        return data