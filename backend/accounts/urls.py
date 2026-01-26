"""
URL configuration for accounts app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'profiles', views.UserProfileViewSet, basename='profile')
router.register(r'students', views.StudentProfileViewSet, basename='student')
router.register(r'staff', views.StaffProfileViewSet, basename='staff')

urlpatterns = [
    path('', include(router.urls)),
    path('me/', views.CurrentUserView.as_view(), name='current-user'),
]