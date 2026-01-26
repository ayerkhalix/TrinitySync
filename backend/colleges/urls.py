"""
URL configuration for colleges app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'colleges', views.CollegeViewSet, basename='college')
router.register(r'programs', views.ProgramViewSet, basename='program')

urlpatterns = [
    path('', include(router.urls)),
]