"""
URL configuration for courses app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'', views.CourseViewSet, basename='course')
router.register(r'course-prerequisites', views.CoursePrerequisiteViewSet, basename='course-prerequisite')

urlpatterns = [
    path('', include(router.urls)),
]