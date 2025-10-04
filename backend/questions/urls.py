from django.urls import path
from . import views

urlpatterns = [
    # Frontend Admin API endpoints
    path('admin/content-upload/', views.api_content_upload, name='api_content_upload'),
    path('admin/content-list/', views.api_content_list, name='api_content_list'),
    path('admin/content-status/<uuid:upload_id>/', views.api_content_status, name='api_content_status'),
    path('admin/content-delete/<uuid:upload_id>/', views.api_content_delete, name='api_content_delete'),
    path('admin/content-process/<uuid:upload_id>/', views.api_content_process, name='api_content_process'),
    path('admin/all-content/', views.api_all_content, name='api_all_content'),
    path('admin/existing-banks/', views.api_existing_banks, name='api_existing_banks'),
    path('admin/dashboard-stats/', views.api_dashboard_stats, name='api_dashboard_stats'),
    # Content deletion endpoints
    path('admin/delete-question-bank/<uuid:bank_id>/', views.api_delete_question_bank, name='api_delete_question_bank'),
    path('admin/delete-exam/<int:exam_id>/', views.api_delete_exam, name='api_delete_exam'),
    path('admin/delete-test/<int:test_id>/', views.api_delete_test, name='api_delete_test'),
    # Content update endpoints
    path('admin/update-question-bank/<uuid:bank_id>/', views.api_update_question_bank, name='api_update_question_bank'),
    path('admin/update-exam/<int:exam_id>/', views.api_update_exam, name='api_update_exam'),
    path('admin/update-test/<int:test_id>/', views.api_update_test, name='api_update_test'),
]