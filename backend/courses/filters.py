"""
Filters for the courses app.
"""
import django_filters
from .models import Course
from django.db.models import Q


class CourseFilter(django_filters.FilterSet):
    program = django_filters.UUIDFilter(field_name='program_id')
    semester = django_filters.ChoiceFilter(choices=Course.SemesterType.choices)
    year_level = django_filters.CharFilter()
    is_active = django_filters.BooleanFilter(field_name='is_active', default=True)
    
    class Meta:
        model = Course
        fields = ['program', 'semester', 'year_level', 'is_active']
    
    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        
        # Only show active courses by default
        if 'is_active' not in self.data:
            queryset = queryset.filter(is_active=True)
        
        return queryset