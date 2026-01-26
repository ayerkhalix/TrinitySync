# accounts/serializers.py (ADD these at the end)
"""
Serializers for the accounts app.
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from django.contrib.auth import authenticate
from .models import UserProfile, StudentProfile, StaffProfile, UserRole
from colleges.models import College, Program

User = get_user_model()

# ... [keep all your existing serializers above] ...

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
            
            # Authenticate using Django's authenticate
            auth_user = authenticate(username=user.username, password=password)
            
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
                
                auth_user = authenticate(username=user.username, password=password)
                
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
            'id': user_profile.id,
            'email': user_profile.email,
            'role': user_profile.role,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }
        
        # Add student profile if exists
        if hasattr(user_profile, 'student_profile'):
            student = user_profile.student_profile
            user_data['student_profile'] = {
                'student_id': student.student_id,
                'college': student.college.name if student.college else None,
                'program': student.program.name if student.program else None,
                'year_level': student.year_level,
                'section': student.section,
            }
        
        # Add staff profile if exists
        if hasattr(user_profile, 'staff_profile'):
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
        token = super().get_token(user)
        
        # Add custom claims
        if hasattr(user, 'profile'):
            token['email'] = user.profile.email
            token['role'] = user.profile.role
        
        return token