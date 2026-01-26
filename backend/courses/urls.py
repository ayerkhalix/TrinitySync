"""
URL configuration for courses app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'prerequisites', views.CoursePrerequisiteViewSet, basename='prerequisite')

urlpatterns = [
    path('', include(router.urls)),
]