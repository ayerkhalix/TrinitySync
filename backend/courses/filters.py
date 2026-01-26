"""
Filters for the courses app.
"""
import django_filters
from .models import Course


class CourseFilter(django_filters.FilterSet):
    program = django_filters.UUIDFilter(field_name='program__id')
    college = django_filters.UUIDFilter(field_name='program__college__id')
    year_level = django_filters.CharFilter(field_name='year_level')
    semester = django_filters.CharFilter(field_name='semester')
    is_active = django_filters.BooleanFilter(field_name='is_active')
    is_core = django_filters.BooleanFilter(field_name='is_core')
    course_code = django_filters.CharFilter(field_name='course_code', lookup_expr='icontains')
    course_title = django_filters.CharFilter(field_name='course_title', lookup_expr='icontains')
    
    class Meta:
        model = Course
        fields = ['program', 'college', 'year_level', 'semester', 'is_active', 'is_core']