# accounts/urls.py
"""
URL configuration for accounts app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView
from . import views
from .views import EmailTokenObtainPairView

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'students', views.StudentProfileViewSet, basename='student')
router.register(r'staff', views.StaffProfileViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
    path('register/', views.register_user, name='register-user'),
    path('change-password/', views.ChangePasswordView.as_view(), name='change-password'),
    # JWT Authentication endpoints
    path('auth/login/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/verify/', TokenVerifyView.as_view(), name='token_verify'),
]