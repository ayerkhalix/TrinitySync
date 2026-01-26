# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/scheduling/', include('scheduling.urls')),
    path('api/activity-logs/', include('activity_logs.urls')),
    
    path('api/colleges/', include('colleges.urls')),
    path('api/courses/', include('courses.urls')),
    
    
    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]