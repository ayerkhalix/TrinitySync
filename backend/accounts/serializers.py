# accounts/serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'role', 
                  'student_id', 'department', 'year_level', 'program', 
                  'phone', 'address']
        read_only_fields = ['id']

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = ['email', 'password', 'first_name', 'last_name', 
                  'role', 'student_id', 'department', 'year_level', 
                  'program', 'phone', 'address']
    
    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            role=validated_data.get('role', 'student'),
            student_id=validated_data.get('student_id'),
            department=validated_data.get('department'),
            year_level=validated_data.get('year_level'),
            program=validated_data.get('program'),
            phone=validated_data.get('phone'),
            address=validated_data.get('address')
        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials')
        return user