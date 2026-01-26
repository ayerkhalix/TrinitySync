# accounts/serializers.py
from rest_framework import serializers
from .models import UserProfile


# -------------------
# USER PROFILE
# -------------------
class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "id",
            "email",
            "role",
            "is_active",
            "email_verified",
            "phone_number",
            "avatar_url",
            "metadata",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# -------------------
# REGISTER
# -------------------
class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "email",
            "role",
            "phone_number",
            "avatar_url",
        ]

    def create(self, validated_data):
        user = UserProfile.objects.create(**validated_data)
        return user


# -------------------
# LOGIN
# -------------------
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, data):
        try:
            user = UserProfile.objects.get(email=data["email"])
        except UserProfile.DoesNotExist:
            raise serializers.ValidationError("User not found")

        return {"user": user}