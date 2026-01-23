# core/urls.py
from django.urls import path
from .views import (
    DepartmentListCreateView, DepartmentDetailView,
    ProgramListCreateView,
    CourseListCreateView, CourseDetailView,
    FilterCoursesView
)

urlpatterns = [
    # Departments
    path('departments/', DepartmentListCreateView.as_view(), name='department-list'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(), name='department-detail'),
    
    # Programs
    path('programs/', ProgramListCreateView.as_view(), name='program-list'),
    
    # Courses
    path('courses/', CourseListCreateView.as_view(), name='course-list'),
    path('courses/<int:pk>/', CourseDetailView.as_view(), name='course-detail'),
    path('courses/filter/', FilterCoursesView.as_view(), name='course-filter'),
]