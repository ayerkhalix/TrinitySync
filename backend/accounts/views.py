# accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer
from activity_logs.models import ActivityLog

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Log activity
        ActivityLog.objects.create(
            user=user,
            user_name=f"{user.first_name} {user.last_name}",
            user_role=user.role,
            activity_type="User Registration",
            ip_address=request.META.get('REMOTE_ADDR', ''),
            details={"action": "register", "email": user.email}
        )
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = authenticate(
            email=request.data['email'], 
            password=request.data['password']
        )
        
        if user:
            refresh = RefreshToken.for_user(user)
            
            # Log activity
            ActivityLog.objects.create(
                user=user,
                user_name=f"{user.first_name} {user.last_name}",
                user_role=user.role,
                activity_type="Successfully login",
                ip_address=request.META.get('REMOTE_ADDR', ''),
                details={"action": "login"}
            )
            
            return Response({
                'status': 'success',
                'user': UserSerializer(user).data,
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            })
        
        return Response({
            'status': 'error',
            'message': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh')
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            # Log activity
            ActivityLog.objects.create(
                user=request.user,
                user_name=f"{request.user.first_name} {request.user.last_name}",
                user_role=request.user.role,
                activity_type="Successfully logout",
                ip_address=request.META.get('REMOTE_ADDR', ''),
                details={"action": "logout"}
            )
            
            return Response({'message': 'Logged out successfully'})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user