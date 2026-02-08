"""
Serializers for the accounts app.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password

from .models import UserProfile, StudentProfile, StaffProfile, UserRole
from colleges.models import College, Program, Instructor


User = get_user_model()


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for UserProfile model."""
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'id', 'email', 'role', 'is_active', 'email_verified',
            'phone_number', 'avatar_url', 'created_at',
            'updated_at', 'first_name', 'last_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'metadata': {'write_only': True}
        }


class UserProfileDetailSerializer(UserProfileSerializer):
    """Serializer for UserProfile with metadata (admin only)."""
    class Meta(UserProfileSerializer.Meta):
        fields = UserProfileSerializer.Meta.fields + ['metadata']
        read_only_fields = UserProfileSerializer.Meta.read_only_fields


class StudentProfileSerializer(serializers.ModelSerializer):
    """Serializer for StudentProfile model."""
    user = UserProfileSerializer(read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)
    program_name = serializers.CharField(source='program.name', read_only=True)
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'student_id', 'college', 'program', 'year_level',
            'section', 'admission_year', 'expected_graduation', 'is_graduated',
            'college_name', 'program_name'
        ]
        read_only_fields = ['id', 'user']


class StaffProfileSerializer(serializers.ModelSerializer):
    """Serializer for StaffProfile model."""
    user = UserProfileSerializer(read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True, allow_null=True)
    
    class Meta:
        model = StaffProfile
        fields = [
            'id', 'user', 'employee_id', 'college', 'position', 'department',
            'is_college_admin', 'is_super_admin', 'office_location',
            'office_hours', 'expertise', 'college_name'
        ]
        read_only_fields = ['id', 'user']


class InstructorSerializer(serializers.ModelSerializer):
    """Read-only serializer for instructors (used in scheduling)."""
    college_id = serializers.UUIDField(source='college.id', read_only=True)
    college_code = serializers.CharField(source='college.code', read_only=True)
    college_name = serializers.CharField(source='college.name', read_only=True)

    class Meta:
        model = Instructor
        fields = [
            'id',
            'full_name',
            'college_id',
            'college_code',
            'college_name',
            'is_active',
        ]


class UserRegistrationSerializer(serializers.Serializer):
    """Serializer for user registration."""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    first_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=30, required=False, allow_blank=True)
    phone_number = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserRole.choices, default=UserRole.STUDENT)
    
    # Student-specific fields (optional in serializer, required for students)
    student_id = serializers.CharField(max_length=50, required=False, allow_blank=True)
    college_id = serializers.PrimaryKeyRelatedField(
        queryset=College.objects.all(), 
        required=False, 
        allow_null=True,
        source='college'
    )
    program_id = serializers.PrimaryKeyRelatedField(
        queryset=Program.objects.all(), 
        required=False, 
        allow_null=True,
        source='program'
    )
    year_level = serializers.ChoiceField(
        choices=StudentProfile.YearLevel.choices,
        required=False
    )
    admission_year = serializers.IntegerField(min_value=2000, max_value=2100, required=False, allow_null=True)
    section = serializers.CharField(max_length=10, required=False, allow_blank=True)
    
    def validate_email(self, value):
        """Check if email is already registered."""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate_role(self, value):
        """Only allow student registration through this endpoint."""
        if value != UserRole.STUDENT:
            raise serializers.ValidationError("Only students can self-register")
        return value
    
    def validate(self, data):
        """Validate password match and student-specific requirements."""
        # Check password match
        if data['password'] != data.get('confirm_password'):
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        
        # If role is STUDENT, validate student-specific fields
        if data.get('role') == UserRole.STUDENT:
            if not data.get('student_id'):
                raise serializers.ValidationError({"student_id": "This field is required for students."})
            if not data.get('college'):
                raise serializers.ValidationError({"college_id": "This field is required for students."})
            if not data.get('program'):
                raise serializers.ValidationError({"program_id": "This field is required for students."})
            if not data.get('year_level'):
                raise serializers.ValidationError({"year_level": "This field is required for students."})
            if not data.get('admission_year'):
                raise serializers.ValidationError({"admission_year": "This field is required for students."})
        
        return data
    
    def create(self, validated_data):
        # Extract student-specific data
        student_id = validated_data.pop('student_id', '')
        college = validated_data.pop('college', None)
        program = validated_data.pop('program', None)
        phone_number = validated_data.pop('phone_number', '')
        year_level = validated_data.pop('year_level', '')
        admission_year = validated_data.pop('admission_year', None)
        section = validated_data.pop('section', '')
        validated_data.pop('confirm_password', None)
        
        # Create Django User
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        
        # Create UserProfile
        user_profile = UserProfile.objects.create(
            user=user,
            email=validated_data['email'],
            role=validated_data['role'],
            phone_number=phone_number,
            supabase_uid=f"local_{user.id}"
        )
        
        # Create StudentProfile if role is STUDENT
        if validated_data['role'] == UserRole.STUDENT:
            StudentProfile.objects.create(
                user=user_profile,
                student_id=student_id,
                college=college,
                program=program,
                year_level=year_level,
                admission_year=admission_year,
                section=section
            )
        
        return user_profile
    
    def to_representation(self, instance):
        """Return safe representation without sensitive data."""
        return UserProfileSerializer(instance).data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for password change."""
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        return data


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer that accepts email instead of username.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields.pop('username', None)
        self.fields['email'] = serializers.EmailField(required=True)
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        # Try to find user profile by email
        try:
            user_profile = UserProfile.objects.get(email=email)
            user = user_profile.user
            
            # Authenticate using Django's authenticate with request context
            auth_user = authenticate(
                request=self.context.get('request'),
                username=user.username,
                password=password
            )
            
            if auth_user is None:
                raise serializers.ValidationError({
                    'password': 'Invalid password'
                })
            
            # Add username to attrs for token generation
            attrs['username'] = user.username
            
        except UserProfile.DoesNotExist:
            # If not found by email, try as username
            try:
                user = User.objects.get(username=email)
                user_profile = user.profile
                
                auth_user = authenticate(
                    request=self.context.get('request'),
                    username=user.username,
                    password=password
                )
                
                if auth_user is None:
                    raise serializers.ValidationError({
                        'password': 'Invalid password'
                    })
                
                attrs['username'] = user.username
                
            except (User.DoesNotExist, AttributeError):
                raise serializers.ValidationError({
                    'email': 'No user found with this email or username'
                })
        
        # Call parent validate to generate token
        data = super().validate(attrs)
        
        # Add user data to response
        refresh = self.get_token(auth_user)
        
        user_data = {
            'id': str(user_profile.id),
            'email': user_profile.email,
            'role': user_profile.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        # Add student profile if exists
        if hasattr(user_profile, 'student_profile') and user_profile.student_profile:
            student = user_profile.student_profile
            user_data['student_profile'] = {
                'student_id': student.student_id,
                'college': student.college.name if student.college else None,
                'program': student.program.name if student.program else None,
                'year_level': student.year_level,
                'section': student.section,
            }
        
        # Add staff profile if exists
        if hasattr(user_profile, 'staff_profile') and user_profile.staff_profile:
            staff = user_profile.staff_profile
            user_data['staff_profile'] = {
                'employee_id': staff.employee_id,
                'position': staff.position,
                'department': staff.department,
                'is_college_admin': staff.is_college_admin,
                'is_super_admin': staff.is_super_admin,
            }
        
        data['user'] = user_data
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        
        return data
    
    @classmethod
    def get_token(cls, user):
        """Add custom claims to JWT token."""
        token = super().get_token(user)
        
        # Add custom claims - safely handle profile access
        try:
            if hasattr(user, 'profile'):
                token['email'] = user.profile.email
                token['role'] = user.profile.role
        except AttributeError:
            # User doesn't have a profile, which shouldn't happen in normal flow
            pass
        
        return token