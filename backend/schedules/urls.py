# schedules/urls.py
from django.urls import path
from .views import (
    RoomListCreateView, InstructorListCreateView,
    ScheduleListCreateView, ScheduleDetailView,
    BulkScheduleCreateView, CheckConflictView,
    FilterSchedulesView
)

urlpatterns = [
    # Rooms
    path('rooms/', RoomListCreateView.as_view(), name='room-list'),
    
    # Instructors
    path('instructors/', InstructorListCreateView.as_view(), name='instructor-list'),
    
    # Schedules
    path('schedules/', ScheduleListCreateView.as_view(), name='schedule-list'),
    path('schedules/<int:pk>/', ScheduleDetailView.as_view(), name='schedule-detail'),
    path('schedules/bulk/', BulkScheduleCreateView.as_view(), name='bulk-schedule-create'),
    path('schedules/check-conflict/', CheckConflictView.as_view(), name='check-conflict'),
    path('schedules/filter/', FilterSchedulesView.as_view(), name='filter-schedules'),
]