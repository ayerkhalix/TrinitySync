# core/views.py
from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Department, Program, Course
from .serializers import (
    DepartmentSerializer, ProgramSerializer, 
    CourseSerializer, CourseFilterSerializer
)

class DepartmentListCreateView(generics.ListCreateAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['code', 'name']

class DepartmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

class ProgramListCreateView(generics.ListCreateAPIView):
    queryset = Program.objects.all()
    serializer_class = ProgramSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']
    search_fields = ['code', 'name']

class CourseListCreateView(generics.ListCreateAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['program', 'year_level', 'semester']
    search_fields = ['code', 'name']

class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]

class FilterCoursesView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        serializer = CourseFilterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        filters = {}
        if 'program' in serializer.validated_data:
            filters['program__code'] = serializer.validated_data['program']
        if 'year_level' in serializer.validated_data:
            filters['year_level'] = serializer.validated_data['year_level']
        if 'semester' in serializer.validated_data:
            filters['semester'] = serializer.validated_data['semester']
        
        courses = Course.objects.filter(**filters)
        return Response(CourseSerializer(courses, many=True).data)