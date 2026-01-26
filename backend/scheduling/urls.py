"""
URL configuration for scheduling app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'school-years', views.SchoolYearViewSet, basename='school-year')
router.register(r'schedule-groups', views.ScheduleGroupViewSet, basename='schedule-group')
router.register(r'schedule-items', views.ScheduleItemViewSet, basename='schedule-item')
router.register(r'schedule-conflicts', views.ScheduleConflictViewSet, basename='schedule-conflict')

urlpatterns = [
    path('', include(router.urls)),
    path('check-conflicts/', views.check_schedule_conflicts, name='check-conflicts'),
]