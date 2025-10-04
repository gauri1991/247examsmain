from django.contrib import admin
from django.urls import path, reverse
from django.utils.html import format_html
from django.http import HttpResponseRedirect
from .models import QuestionBank, Question, ContentUpload
from .views import ContentUploadView, ContentProcessingView, content_upload_status, content_upload_delete


@admin.register(QuestionBank)
class QuestionBankAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'exam_type', 'question_count', 'imported_from_json', 'created_at']
    list_filter = ['category', 'exam_type', 'imported_from_json', 'created_at']
    search_fields = ['name', 'description', 'category', 'exam_type']
    readonly_fields = ['created_at', 'updated_at', 'imported_from_json', 'json_import_batch']
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = 'Questions'


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['text_preview', 'question_bank', 'question_type', 'difficulty', 'marks', 'imported_from_json']
    list_filter = ['question_type', 'difficulty', 'question_bank__category', 'imported_from_json', 'created_at']
    search_fields = ['text', 'question_bank__name']
    readonly_fields = ['created_at', 'updated_at', 'imported_from_json', 'json_import_batch']
    
    def text_preview(self, obj):
        return obj.text[:100] + '...' if len(obj.text) > 100 else obj.text
    text_preview.short_description = 'Question Text'


@admin.register(ContentUpload)
class ContentUploadAdmin(admin.ModelAdmin):
    list_display = ['file_name', 'content_type', 'status', 'items_imported', 'uploaded_by', 'uploaded_at', 'action_buttons']
    list_filter = ['content_type', 'status', 'uploaded_at']
    search_fields = ['file_name']
    readonly_fields = [
        'uploaded_by', 'uploaded_at', 'file_size', 'file_hash',
        'validation_results', 'processing_logs', 'items_imported', 'items_failed'
    ]
    
    def action_buttons(self, obj):
        buttons = []
        
        if obj.status == 'valid':
            process_url = reverse('admin:questions_content_process', args=[obj.id])
            buttons.append(f'<a class="button" href="{process_url}">Process Content</a>')
        
        if obj.status in ['uploaded', 'invalid', 'failed']:
            delete_url = reverse('admin:questions_content_delete', args=[obj.id])
            buttons.append(f'<a class="button" href="{delete_url}" onclick="return confirm(\'Are you sure?\')">Delete</a>')
        
        status_url = reverse('admin:questions_content_status', args=[obj.id])
        buttons.append(f'<a class="button" href="{status_url}" target="_blank">Check Status</a>')
        
        return format_html(' '.join(buttons))
    action_buttons.short_description = 'Actions'
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('content-upload/', ContentUploadView.as_view(), name='questions_content_upload'),
            path('content-process/<int:upload_id>/', ContentProcessingView.as_view(), name='questions_content_process'),
            path('content-status/<int:upload_id>/', content_upload_status, name='questions_content_status'),
            path('content-delete/<int:upload_id>/', content_upload_delete, name='questions_content_delete'),
        ]
        return custom_urls + urls
    
    def changelist_view(self, request, extra_context=None):
        # Redirect to custom upload view
        return HttpResponseRedirect(reverse('admin:questions_content_upload'))


# Custom admin site configuration
admin.site.site_header = "247Exams Admin"
admin.site.site_title = "247Exams Admin Portal"
admin.site.index_title = "Welcome to 247Exams Administration"
