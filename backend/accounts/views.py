# accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile
from .serializers import UserProfileSerializer, RegisterSerializer, LoginSerializer
from activity_logs.models import ActivityLog


# -------------------
# REGISTER
# -------------------
class RegisterView(generics.CreateAPIView):
    queryset = UserProfile.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        ActivityLog.objects.create(
            user=user,
            action_type=ActivityLog.ActionType.CREATE,
            description="User registered",
            ip_address=request.META.get("REMOTE_ADDR"),
            metadata={"email": user.email}
        )

        return Response({
            "user": UserProfileSerializer(user).data,
            "message": "User registered successfully"
        }, status=status.HTTP_201_CREATED)


# -------------------
# LOGIN (profile-based, not Django User)
# -------------------
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]

        ActivityLog.objects.create(
            user=user,
            action_type=ActivityLog.ActionType.LOGIN,
            description="User logged in",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        return Response({
            "status": "success",
            "user": UserProfileSerializer(user).data,
        })


# -------------------
# LOGOUT
# -------------------
class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        ActivityLog.objects.create(
            user=request.user,
            action_type=ActivityLog.ActionType.LOGOUT,
            description="User logged out",
            ip_address=request.META.get("REMOTE_ADDR"),
        )

        return Response({"message": "Logged out successfully"})


# -------------------
# PROFILE
# -------------------
class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user