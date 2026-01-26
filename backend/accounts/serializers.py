"""
Serializers for the accounts app.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import UserProfile, StudentProfile, StaffProfile, UserRole
from colleges.models import College, Program

User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'supabase_uid', 'email', 'role', 'full_name',
            'is_active', 'email_verified', 'phone_number',
            'avatar_url', 'metadata', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'supabase_uid', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        # In a real implementation, you might store first/last name
        # For now, use email prefix
        return obj.email.split('@')[0].replace('.', ' ').title()


class StudentProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'user_email', 'user_role',
            'student_id', 'college', 'college_name',
            'program', 'program_name', 'year_level',
            'section', 'admission_year', 'expected_graduation',
            'is_graduated'
        ]
        read_only_fields = ['id']


class StaffProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True)
    user_role = serializers.CharField(source='user.role', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True, allow_null=True)
    
    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'user_email', 'user_role',
            'employee_id', 'college', 'college_name',
            'position', 'department', 'is_college_admin',
            'is_super_admin', 'office_location', 'office_hours',
            'expertise'
        ]
        read_only_fields = ['id']


class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for user registration.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.STUDENT)
    
    def validate_email(self, value):
        if UserProfile.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value
    
    def create(self, validated_data):
        # Create Django user
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        
        # Create user profile
        user_profile = UserProfile.objects.create(
            email=validated_data['email'],
            role=validated_data['role'],
            is_active=True,
            email_verified=False
        )
        
        return user_profile


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change.
    """
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, min_length=8)
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        return data