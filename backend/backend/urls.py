# config/urls.py
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/auth/', include('accounts.urls')),
    path('api/core/', include('core.urls')),
    path('api/schedules/', include('schedules.urls')),
    path('api/activity-logs/', include('activity_logs.urls')),
    
    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]