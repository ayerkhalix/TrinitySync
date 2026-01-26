"""
Serializers for the scheduling app.
"""
from rest_framework import serializers
from .models import ScheduleGroup, ScheduleItem, ScheduleConflict, SchoolYear
from accounts.models import UserProfile
from colleges.models import College, Program
from courses.models import Course


class SchoolYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = SchoolYear
        fields = ['id', 'name', 'code', 'start_date', 'end_date', 'is_active', 'metadata']
        read_only_fields = ['id']


class ScheduleItemSerializer(serializers.ModelSerializer):
    course_code = serializers.CharField(source='course.course_code', read_only=True)
    course_title = serializers.CharField(source='course.course_title', read_only=True)
    instructor_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduleItem
        fields = [
            'id', 'schedule_group', 'course', 'course_code', 'course_title',
            'day', 'start_time', 'end_time', 'room', 'instructor', 'instructor_name',
            'instructor_override', 'max_students', 'current_enrollment',
            'is_lab', 'is_online', 'online_link', 'metadata'
        ]
        read_only_fields = ['id', 'current_enrollment']
    
    def get_instructor_name(self, obj):
        if obj.instructor:
            return obj.instructor.user.email
        return obj.instructor_override or ''


class ScheduleGroupSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    school_year_name = serializers.CharField(source='school_year.name', read_only=True)
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    items = ScheduleItemSerializer(many=True, read_only=True)
    item_count = serializers.IntegerField(source='items.count', read_only=True)
    conflict_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ScheduleGroup
        fields = [
            'id', 'college', 'college_name', 'program', 'program_name',
            'year_level', 'section', 'semester', 'school_year', 'school_year_name',
            'status', 'created_by', 'created_by_email', 'approved_by', 'approval_date',
            'notes', 'created_at', 'updated_at', 'items', 'item_count', 'conflict_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by']
    
    def get_conflict_count(self, obj):
        return ScheduleConflict.objects.filter(
            schedule_item_1__schedule_group=obj,
            resolved=False
        ).count()
    
    def validate(self, data):
        # Ensure section is unique for program/year_level/semester/school_year
        if self.instance:  # Update
            existing = ScheduleGroup.objects.filter(
                program=data.get('program', self.instance.program),
                year_level=data.get('year_level', self.instance.year_level),
                section=data.get('section', self.instance.section),
                semester=data.get('semester', self.instance.semester),
                school_year=data.get('school_year', self.instance.school_year)
            ).exclude(id=self.instance.id)
        else:  # Create
            existing = ScheduleGroup.objects.filter(
                program=data.get('program'),
                year_level=data.get('year_level'),
                section=data.get('section'),
                semester=data.get('semester'),
                school_year=data.get('school_year')
            )
        
        if existing.exists():
            raise serializers.ValidationError(
                'A schedule group with these details already exists.'
            )
        
        return data
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user.profile
        return super().create(validated_data)


class ScheduleConflictSerializer(serializers.ModelSerializer):
    schedule_item_1_details = serializers.SerializerMethodField()
    schedule_item_2_details = serializers.SerializerMethodField()
    resolved_by_email = serializers.CharField(source='resolved_by.email', read_only=True, allow_null=True)
    
    class Meta:
        model = ScheduleConflict
        fields = [
            'id', 'conflict_type', 'schedule_item_1', 'schedule_item_2',
            'schedule_item_1_details', 'schedule_item_2_details',
            'severity', 'description', 'resolved', 'resolved_by', 'resolved_by_email',
            'resolved_at', 'resolution_notes', 'detected_at'
        ]
        read_only_fields = ['id', 'detected_at']
    
    def get_schedule_item_1_details(self, obj):
        return {
            'course_code': obj.schedule_item_1.course.course_code,
            'day': obj.schedule_item_1.day,
            'start_time': obj.schedule_item_1.start_time,
            'end_time': obj.schedule_item_1.end_time,
            'room': obj.schedule_item_1.room,
            'schedule_group': str(obj.schedule_item_1.schedule_group.id)
        }
    
    def get_schedule_item_2_details(self, obj):
        return {
            'course_code': obj.schedule_item_2.course.course_code,
            'day': obj.schedule_item_2.day,
            'start_time': obj.schedule_item_2.start_time,
            'end_time': obj.schedule_item_2.end_time,
            'room': obj.schedule_item_2.room,
            'schedule_group': str(obj.schedule_item_2.schedule_group.id)
        }


class BulkScheduleItemSerializer(serializers.Serializer):
    """Serializer for bulk schedule item creation."""
    course_id = serializers.UUIDField()
    day = serializers.CharField(max_length=3)
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    room = serializers.CharField(max_length=50)
    instructor_id = serializers.UUIDField(required=False, allow_null=True)
    max_students = serializers.IntegerField(default=40, min_value=1, max_value=200)


class BulkScheduleCreateSerializer(serializers.Serializer):
    """Serializer for bulk schedule group creation."""
    schedules = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
        max_length=50
    )
    force = serializers.BooleanField(default=False)
    
    def validate_schedules(self, value):
        validated_schedules = []
        for schedule in value:
            # Validate required fields
            required_fields = ['college_id', 'program_id', 'year_level', 
                             'section', 'semester', 'school_year_id']
            for field in required_fields:
                if field not in schedule:
                    raise serializers.ValidationError(f'Missing field: {field}')
            
            # Validate foreign keys exist
            try:
                College.objects.get(id=schedule['college_id'])
            except College.DoesNotExist:
                raise serializers.ValidationError(f'College not found: {schedule["college_id"]}')
            
            try:
                Program.objects.get(id=schedule['program_id'])
            except Program.DoesNotExist:
                raise serializers.ValidationError(f'Program not found: {schedule["program_id"]}')
            
            # Validate items if provided
            items = schedule.get('items', [])
            for item in items:
                item_serializer = BulkScheduleItemSerializer(data=item)
                if not item_serializer.is_valid():
                    raise serializers.ValidationError(item_serializer.errors)
            
            validated_schedules.append(schedule)
        
        return validated_schedules


class ConflictCheckSerializer(serializers.Serializer):
    """Serializer for conflict checking."""
    schedule_items = serializers.ListField(
        child=BulkScheduleItemSerializer(),
        min_length=1,
        max_length=100
    )