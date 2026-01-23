# schedules/serializers.py
from rest_framework import serializers
from .models import Room, Instructor, ScheduleEntry
from core.serializers import CourseSerializer, ProgramSerializer

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'code', 'name', 'capacity', 'room_type', 'building', 'is_active']

class InstructorSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = Instructor
        fields = ['id', 'employee_id', 'first_name', 'last_name', 'full_name', 
                  'email', 'phone', 'department', 'is_active']

class ScheduleEntrySerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    instructor_details = InstructorSerializer(source='instructor', read_only=True)
    room_details = RoomSerializer(source='room', read_only=True)
    program_details = ProgramSerializer(source='program', read_only=True)
    created_by_name = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = ScheduleEntry
        fields = [
            'id', 'time_slot', 'days', 'course', 'course_details',
            'instructor', 'instructor_details', 'room', 'room_details',
            'program', 'program_details', 'year_level', 'semester',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def validate(self, data):
        """Custom validation for schedule conflicts"""
        from .services.conflict_detector import ConflictDetector
        
        # Get instance ID if updating
        instance_id = self.instance.id if self.instance else None
        
        # Check for conflicts
        conflicts = ConflictDetector.check_schedule_conflicts(data, exclude_id=instance_id)
        
        if conflicts:
            raise serializers.ValidationError({
                'conflicts': conflicts,
                'message': 'Schedule conflicts detected'
            })
        
        return data
    
    def create(self, validated_data):
        # Add current user as creator
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class BulkScheduleSerializer(serializers.Serializer):
    schedules = ScheduleEntrySerializer(many=True)
    year_level = serializers.CharField()
    semester = serializers.CharField()
    program = serializers.CharField()
    
    def validate(self, data):
        # Validate all schedules in bulk
        for schedule in data['schedules']:
            serializer = ScheduleEntrySerializer(data=schedule)
            if not serializer.is_valid():
                raise serializers.ValidationError(serializer.errors)
        return data