from django.shortcuts import render, redirect, get_object_or_404
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.admin.views.decorators import staff_member_required
from django.utils.decorators import method_decorator
from django.views import View
from django.db import transaction
from django.views.decorators.http import require_http_methods
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from .models import ContentUpload, QuestionBank, Question
from exams.models import Exam, Test
from .forms import JSONContentUploadForm, ContentProcessingForm
import json
import uuid
import hashlib
from datetime import datetime
from django.utils import timezone


@method_decorator(staff_member_required, name='dispatch')
class ContentUploadView(View):
    """Admin view for uploading JSON content"""
    
    def get(self, request):
        form = JSONContentUploadForm()
        uploads = ContentUpload.objects.all().order_by('-created_at')[:20]
        
        context = {
            'form': form,
            'uploads': uploads,
            'title': 'JSON Content Upload'
        }
        return render(request, 'admin/questions/content_upload.html', context)
    
    def post(self, request):
        form = JSONContentUploadForm(request.POST, request.FILES)
        
        if form.is_valid():
            upload = form.save(commit=False)
            upload.uploaded_by = request.user
            upload.status = 'uploaded'
            upload.save()
            
            # Process the JSON file immediately
            self._validate_and_process_json(upload)
            
            messages.success(request, f'Content uploaded successfully! Upload ID: {upload.id}')
            return redirect('admin:questions_content_upload')
        else:
            uploads = ContentUpload.objects.all().order_by('-created_at')[:20]
            context = {
                'form': form,
                'uploads': uploads,
                'title': 'JSON Content Upload'
            }
            return render(request, 'admin/questions/content_upload.html', context)
    
    def _validate_and_process_json(self, upload):
        """Validate and process uploaded JSON content"""
        try:
            upload.status = 'validating'
            upload.save()
            
            # Read JSON content
            upload.json_file.seek(0)
            content = upload.json_file.read().decode('utf-8')
            data = json.loads(content)
            
            # Store JSON data for processing
            upload.json_data = data
            
            # Validate structure and collect metadata
            validation_results = self._validate_content_structure(data, upload.content_type)
            upload.validation_results = validation_results
            
            if validation_results['valid']:
                upload.status = 'valid'
                upload.items_count = validation_results['items_count']
                messages.info(
                    None, 
                    f"Validation successful! Found {validation_results['items_count']} items ready for import."
                )
            else:
                upload.status = 'invalid'
                upload.error_message = validation_results['error']
                
            upload.save()
            
        except Exception as e:
            upload.status = 'invalid'
            upload.error_message = str(e)
            upload.save()
    
    def _validate_content_structure(self, data, content_type):
        """Validate JSON content structure and return metadata"""
        try:
            items_count = 0
            
            if content_type == 'question_bank':
                if 'questions' in data and isinstance(data['questions'], list):
                    items_count = len(data['questions'])
                else:
                    return {'valid': False, 'error': 'Question bank must contain questions array'}
                    
            elif content_type == 'exam':
                items_count = 1
                if 'tests' in data and isinstance(data['tests'], list):
                    for test in data['tests']:
                        if 'questions' in test and isinstance(test['questions'], list):
                            items_count += len(test['questions'])
                            
            elif content_type == 'test':
                items_count = 1
                if 'questions' in data and isinstance(data['questions'], list):
                    items_count += len(data['questions'])
                    
            elif content_type == 'mixed':
                if 'content' in data and isinstance(data['content'], list):
                    items_count = len(data['content'])
                    for item in data['content']:
                        if item.get('type') == 'question_bank' and 'questions' in item:
                            items_count += len(item['questions'])
                else:
                    return {'valid': False, 'error': 'Mixed content must contain content array'}
            
            return {
                'valid': True,
                'items_count': items_count,
                'summary': f"Content validated successfully. {items_count} items found."
            }
            
        except Exception as e:
            return {'valid': False, 'error': str(e)}


@method_decorator(staff_member_required, name='dispatch')
class ContentProcessingView(View):
    """Admin view for processing validated JSON content"""
    
    def get(self, request, upload_id):
        upload = get_object_or_404(ContentUpload, id=upload_id)
        
        if upload.status != 'valid':
            messages.error(request, 'Content must be validated before processing')
            return redirect('admin:questions_content_upload')
        
        form = ContentProcessingForm(initial={
            'upload_id': upload.id,
            'import_batch_name': f"{upload.title}_{datetime.now().strftime('%Y%m%d_%H%M')}"
        })
        
        context = {
            'form': form,
            'upload': upload,
            'title': f'Process Content: {upload.title}'
        }
        return render(request, 'admin/questions/content_processing.html', context)
    
    def post(self, request, upload_id):
        upload = get_object_or_404(ContentUpload, id=upload_id)
        form = ContentProcessingForm(request.POST)
        
        if form.is_valid():
            try:
                upload.status = 'processing'
                upload.save()
                
                # Process the content
                self._process_content(upload, form.cleaned_data)
                
                upload.status = 'completed'
                upload.processed_at = datetime.now()
                upload.save()
                
                messages.success(request, 'Content processed successfully!')
                return redirect('admin:questions_content_upload')
                
            except Exception as e:
                upload.status = 'failed'
                upload.error_message = str(e)
                upload.save()
                
                messages.error(request, f'Processing failed: {str(e)}')
        
        context = {
            'form': form,
            'upload': upload,
            'title': f'Process Content: {upload.title}'
        }
        return render(request, 'admin/questions/content_processing.html', context)
    
    @transaction.atomic
    def _process_content(self, upload, options):
        """Process JSON content and create database objects"""
        data = upload.json_data
        batch_name = options['import_batch_name']
        
        processing_log = []
        
        if upload.content_type == 'question_bank':
            self._process_question_bank(data, batch_name, processing_log, options)
        elif upload.content_type == 'exam':
            self._process_exam(data, batch_name, processing_log, options)
        elif upload.content_type == 'test':
            self._process_test(data, batch_name, processing_log, options)
        elif upload.content_type == 'mixed':
            self._process_mixed_content(data, batch_name, processing_log, options)
        
        upload.processing_log = processing_log
        upload.save()
    
    def _process_question_bank(self, data, batch_name, log, options):
        """Process question bank JSON data"""
        if not options.get('create_question_banks', True):
            log.append("Skipped question bank creation (disabled in options)")
            return
        
        # Check if question bank exists
        existing = None
        if not options.get('overwrite_existing', False):
            existing = QuestionBank.objects.filter(name=data['name']).first()
        
        if existing and not options.get('overwrite_existing', False):
            log.append(f"Question bank '{data['name']}' already exists, skipping")
            return
        
        # Create or update question bank
        question_bank = QuestionBank.objects.create(
            name=data['name'],
            description=data['description'],
            category=data.get('category', 'general'),
            subcategory=data.get('subcategory', ''),
            level=data.get('level', 'intermediate'),
            imported_from_json=True,
            json_import_batch=batch_name
        )
        
        log.append(f"Created question bank: {question_bank.name}")
        
        # Process questions
        questions_created = 0
        for q_data in data['questions']:
            question = Question.objects.create(
                question_bank=question_bank,
                text=q_data['text'],
                question_type=q_data['question_type'],
                options=q_data['options'],
                correct_answer=q_data['correct_answer'],
                explanation=q_data.get('explanation', ''),
                difficulty=q_data.get('difficulty', 'medium'),
                marks=q_data.get('marks', 1),
                negative_marks=q_data.get('negative_marks', 0),
                imported_from_json=True,
                json_import_batch=batch_name
            )
            questions_created += 1
        
        log.append(f"Created {questions_created} questions in {question_bank.name}")
    
    def _process_exam(self, data, batch_name, log, options):
        """Process exam JSON data"""
        if not options.get('create_exams', True):
            log.append("Skipped exam creation (disabled in options)")
            return
        
        # Create exam (assuming Exam model exists)
        log.append(f"Exam processing not fully implemented yet")
    
    def _process_test(self, data, batch_name, log, options):
        """Process test JSON data"""
        if not options.get('create_tests', True):
            log.append("Skipped test creation (disabled in options)")
            return
        
        # Create test (assuming Test model exists)
        log.append(f"Test processing not fully implemented yet")
    
    def _process_mixed_content(self, data, batch_name, log, options):
        """Process mixed content JSON data"""
        for item in data['content']:
            item_type = item['type']
            
            if item_type == 'question_bank':
                self._process_question_bank(item, batch_name, log, options)
            elif item_type == 'exam':
                self._process_exam(item, batch_name, log, options)
            elif item_type == 'test':
                self._process_test(item, batch_name, log, options)


@staff_member_required
def content_upload_status(request, upload_id):
    """AJAX endpoint for checking upload status"""
    upload = get_object_or_404(ContentUpload, id=upload_id)
    
    return JsonResponse({
        'status': upload.status,
        'items_count': upload.items_count,
        'error_message': upload.error_message,
        'validation_results': upload.validation_results,
        'processing_log': upload.processing_log,
    })


@staff_member_required
def content_upload_delete(request, upload_id):
    """Delete content upload"""
    if request.method == 'POST':
        upload = get_object_or_404(ContentUpload, id=upload_id)
        upload.delete()
        messages.success(request, 'Content upload deleted successfully')
    
    return redirect('admin:questions_content_upload')


# API Endpoints for Frontend Admin Interface

@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_content_upload(request):
    """API endpoint for uploading JSON content files"""
    try:
        if 'json_file' not in request.FILES:
            return Response({
                'success': False,
                'message': 'No file provided'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        json_file = request.FILES['json_file']
        file_name = request.data.get('file_name', '')
        content_type = request.data.get('content_type', 'question_bank')
        import_mode = request.data.get('import_mode', 'create_new')
        target_bank_id = request.data.get('target_bank_id', '')
        
        if not file_name:
            return Response({
                'success': False,
                'message': 'File name is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate target bank for non-create modes
        target_bank = None
        if import_mode != 'create_new' and content_type == 'question_bank':
            if not target_bank_id:
                return Response({
                    'success': False,
                    'message': 'Target question bank is required for this import mode'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                target_bank = QuestionBank.objects.get(id=target_bank_id)
            except QuestionBank.DoesNotExist:
                return Response({
                    'success': False,
                    'message': 'Selected question bank not found'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Read and validate JSON
        try:
            file_content = json_file.read()
            json_data = json.loads(file_content.decode('utf-8'))
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            return Response({
                'success': False,
                'message': f'Invalid JSON file: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Extract file name from JSON data if not provided or use JSON name as priority
        extracted_file_name = json_data.get('name', '').strip()
        if extracted_file_name:
            file_name = extracted_file_name
        elif not file_name:
            return Response({
                'success': False,
                'message': 'File name not found in JSON data and not provided manually'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate file hash
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        # Create ContentUpload record
        upload = ContentUpload.objects.create(
            file_name=file_name,
            content_type=content_type,
            file_size=len(file_content),
            file_hash=file_hash,
            uploaded_by=request.user,
            status='validating',
            json_data=json_data  # Store the JSON data
        )
        
        # Store import mode and target info in validation_results for later use
        upload.validation_results = upload.validation_results or {}
        upload.validation_results['import_mode'] = import_mode
        if target_bank:
            upload.validation_results['target_bank_id'] = str(target_bank.id)
            upload.validation_results['target_bank_name'] = target_bank.name
        
        # Basic validation
        validation_results = validate_json_structure(json_data, content_type)
        
        # For merge modes, detect duplicates if validation passed
        if validation_results['valid'] and import_mode in ['append_existing', 'merge_update'] and target_bank:
            duplicate_info = detect_duplicates(json_data, target_bank, import_mode)
            validation_results['duplicates'] = duplicate_info
            validation_results['import_mode'] = import_mode
            validation_results['target_bank_name'] = target_bank.name
        
        # Merge the import mode info into validation results
        validation_results.update(upload.validation_results)
        
        if validation_results['valid']:
            upload.status = 'completed'
            upload.validation_results = validation_results
            items_count = validation_results.get('items_count', 0)
        else:
            upload.status = 'failed'
            upload.validation_results = validation_results
            items_count = 0
        
        upload.save()
        
        return Response({
            'success': validation_results['valid'],
            'message': 'File uploaded and validated successfully' if validation_results['valid'] else 'Validation failed',
            'uploadId': str(upload.id),
            'itemsCount': items_count,
            'summary': validation_results.get('summary', ''),
            'errors': validation_results.get('errors', []) if not validation_results['valid'] else None
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Upload failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_content_list(request):
    """API endpoint to get list of uploaded content"""
    try:
        uploads = ContentUpload.objects.all().order_by('-uploaded_at')
        
        data = []
        for upload in uploads:
            data.append({
                'id': str(upload.id),
                'fileName': upload.file_name,
                'contentType': upload.content_type,
                'status': upload.status,
                'itemsImported': upload.items_imported,
                'uploadedAt': upload.uploaded_at.isoformat(),
                'uploadedBy': upload.uploaded_by.username
            })
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch content list: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_content_status(request, upload_id):
    """API endpoint to get upload status"""
    try:
        upload = get_object_or_404(ContentUpload, id=upload_id)
        
        return Response({
            'success': True,
            'data': {
                'id': str(upload.id),
                'fileName': upload.file_name,
                'contentType': upload.content_type,
                'status': upload.status,
                'itemsImported': upload.items_imported,
                'itemsFailed': upload.items_failed,
                'validationResults': upload.validation_results,
                'processingLogs': upload.processing_logs,
                'jsonData': upload.json_data,  # Include the JSON content
                'uploadedAt': upload.uploaded_at.isoformat(),
                'uploadedBy': upload.uploaded_by.username,
                'processingStartedAt': upload.processing_started_at.isoformat() if upload.processing_started_at else None,
                'processingCompletedAt': upload.processing_completed_at.isoformat() if upload.processing_completed_at else None,
                'isProcessed': upload.is_processed,
                'processingLog': upload.processing_log
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to get upload status: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_content_delete(request, upload_id):
    """API endpoint to delete uploaded content"""
    try:
        upload = get_object_or_404(ContentUpload, id=upload_id)
        upload.delete()
        
        return Response({
            'success': True,
            'message': 'Content deleted successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete content: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_content_process(request, upload_id):
    """API endpoint to process uploaded content and create database entries"""
    try:
        upload = get_object_or_404(ContentUpload, id=upload_id)
        
        if upload.status != 'completed':
            return Response({
                'success': False,
                'message': 'Upload must be completed before processing'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if upload.is_processed:
            return Response({
                'success': False,
                'message': 'Content has already been processed'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Load the JSON data that was stored during upload
        data = upload.json_data
        if not data:
            return Response({
                'success': False,
                'message': 'No JSON data found for this upload'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Process the content
        processor = ContentProcessor()
        batch_name = f"{upload.file_name}_{upload.uploaded_at.strftime('%Y%m%d_%H%M%S')}"
        
        # Default processing options
        options = {
            'create_question_banks': True,
            'create_exams': True,
            'create_tests': True,
            'overwrite_existing': False
        }
        
        try:
            processor.process_content(upload, data, batch_name, options)
            
            # Mark as processed
            upload.is_processed = True
            upload.save()
            
            # Count created items
            created_questions = Question.objects.filter(json_import_batch=batch_name).count()
            created_banks = QuestionBank.objects.filter(json_import_batch=batch_name).count()
            total_created = created_questions + created_banks
            
            # Check if nothing was created and provide helpful message
            if total_created == 0 and upload.processing_log:
                last_log = upload.processing_log[-1] if upload.processing_log else ""
                if "already exists, skipping" in last_log:
                    message = f"Content not processed: {last_log}. Try using 'Append to Existing' or 'Replace Existing' mode, or rename the content in your JSON file."
                else:
                    message = f"No items were created. {last_log}"
            else:
                message = 'Content processed successfully'
            
            return Response({
                'success': True,
                'message': message,
                'created_count': total_created,
                'questions_created': created_questions,
                'question_banks_created': created_banks,
                'processing_log': upload.processing_log
            })
            
        except Exception as process_error:
            upload.processing_log.append(f"Processing failed: {str(process_error)}")
            upload.save()
            raise process_error
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to process content: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_all_content(request):
    """API endpoint to get all content (question banks, exams, tests) for content management"""
    try:
        from exams.models import Exam, Test
        
        # Get question banks
        question_banks = QuestionBank.objects.all().order_by('-updated_at')
        banks_data = []
        for bank in question_banks:
            banks_data.append({
                'id': str(bank.id),
                'name': bank.name,
                'description': bank.description,
                'category': bank.category,
                'subject': bank.subject,
                'topic': bank.topic,
                'difficulty': bank.difficulty_level,
                'questionCount': bank.questions.count(),
                'createdBy': bank.created_by.username,
                'createdAt': bank.created_at.isoformat(),
                'updatedAt': bank.updated_at.isoformat(),
                'isPublic': bank.is_public,
                'isFeatured': bank.is_featured,
                'importedFromJson': bank.imported_from_json,
                'jsonImportBatch': bank.json_import_batch,
                'totalQuestions': bank.total_questions,
                'usageCount': bank.usage_count,
                'jsonData': bank.original_json_data if hasattr(bank, 'original_json_data') else None
            })
        
        # Get exams
        exams = Exam.objects.all().order_by('-updated_at')
        exams_data = []
        for exam in exams:
            # Count tests for this exam
            tests_count = Test.objects.filter(exam=exam).count()
            
            exams_data.append({
                'id': str(exam.id),
                'name': exam.name,
                'description': exam.description,
                'category': exam.category,
                'examType': exam.exam_type,
                'organization': exam.organization or '',
                'difficulty': exam.difficulty_level,
                'duration': 0,  # Exams don't have duration, tests do
                'totalMarks': 0,  # Will be calculated from tests
                'passingMarks': 0,  # Will be calculated from tests
                'testsCount': tests_count,
                'status': exam.status,  # Add status field
                'createdBy': exam.created_by.username if hasattr(exam.created_by, 'username') else str(exam.created_by),
                'createdAt': exam.created_at.isoformat(),
                'updatedAt': exam.updated_at.isoformat(),
                'isActive': exam.is_active,
                'isPublic': False,  # Exams don't have is_public field
                'importedFromJson': exam.imported_from_json,
                'jsonData': exam.original_json_data if hasattr(exam, 'original_json_data') else None
            })
        
        # Get tests
        tests = Test.objects.all().order_by('-updated_at')
        tests_data = []
        for test in tests:
            # Calculate passing marks from percentage
            passing_marks = int((test.pass_percentage * test.total_marks) / 100) if test.pass_percentage else 0
            
            tests_data.append({
                'id': str(test.id),
                'name': test.title,  # Tests use 'title' not 'name'
                'description': test.description,
                'category': test.exam.category if test.exam else '',  # Get category from exam
                'subject': '',  # Tests don't have subject field
                'topic': '',  # Tests don't have topic field
                'difficulty': 'intermediate',  # Tests don't have difficulty field
                'duration': test.duration_minutes,
                'totalMarks': test.total_marks,
                'passingMarks': passing_marks,
                'questionsCount': sum(
                    min(test_question_bank.question_count, test_question_bank.question_bank.questions.count())
                    for test_question_bank in test.test_question_banks.all()
                ),
                'status': test.status,  # Add status field
                'createdBy': test.created_by.username if hasattr(test.created_by, 'username') else str(test.created_by),
                'createdAt': test.created_at.isoformat(),
                'updatedAt': test.updated_at.isoformat(),
                'isActive': test.is_published,  # Tests use 'is_published' not 'is_active'
                'isPublic': False,  # Tests don't have is_public field
                'importedFromJson': test.imported_from_json,
                'jsonData': test.original_json_data if hasattr(test, 'original_json_data') else None
            })
        
        return Response({
            'success': True,
            'data': {
                'questionBanks': banks_data,
                'exams': exams_data,
                'tests': tests_data,
                'summary': {
                    'totalQuestionBanks': len(banks_data),
                    'totalExams': len(exams_data),
                    'totalTests': len(tests_data),
                    'totalQuestions': sum(bank['questionCount'] for bank in banks_data)
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch content: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_existing_banks(request):
    """API endpoint to get list of existing question banks for merging"""
    try:
        banks = QuestionBank.objects.all().order_by('-updated_at')
        
        data = []
        for bank in banks:
            data.append({
                'id': str(bank.id),
                'name': bank.name,
                'description': bank.description,
                'category': bank.category,
                'questionCount': bank.questions.count(),
                'difficulty': bank.difficulty_level,
                'createdBy': bank.created_by.username,
                'createdAt': bank.created_at.isoformat(),
                'updatedAt': bank.updated_at.isoformat(),
                'isPublic': bank.is_public,
                'totalQuestions': bank.total_questions
            })
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to fetch existing banks: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_dashboard_stats(request):
    """API endpoint to get dashboard statistics"""
    try:
        # Get upload statistics
        total_uploads = ContentUpload.objects.count()
        successful_uploads = ContentUpload.objects.filter(status='completed').count()
        failed_uploads = ContentUpload.objects.filter(status='failed').count()
        
        # Get content statistics
        total_questions = Question.objects.count()
        total_question_banks = QuestionBank.objects.count()
        
        # Get user statistics (if users app is available)
        from django.contrib.auth import get_user_model
        User = get_user_model()
        total_users = User.objects.count()
        
        # Get recent uploads
        recent_uploads = ContentUpload.objects.order_by('-uploaded_at')[:10]
        recent_uploads_data = []
        
        for upload in recent_uploads:
            recent_uploads_data.append({
                'id': str(upload.id),
                'fileName': upload.file_name,
                'status': upload.status,
                'uploadedAt': upload.uploaded_at.isoformat(),
                'itemsImported': upload.items_imported
            })
        
        return Response({
            'success': True,
            'data': {
                'totalUploads': total_uploads,
                'successfulUploads': successful_uploads,
                'failedUploads': failed_uploads,
                'totalQuestions': total_questions,
                'totalQuestionBanks': total_question_banks,
                'totalUsers': total_users,
                'recentUploads': recent_uploads_data
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to get dashboard stats: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ContentProcessor:
    """Class to handle processing of JSON content into database objects"""
    
    def process_content(self, upload, data, batch_name, options):
        """Main method to process JSON content based on content type"""
        upload.processing_log = []
        upload.processing_started_at = timezone.now()
        upload.save()
        
        try:
            if upload.content_type == 'question_bank':
                self._process_question_bank(upload, data, batch_name, options)
            elif upload.content_type == 'exam':
                self._process_exam(upload, data, batch_name, options)
            elif upload.content_type == 'test':
                self._process_test(upload, data, batch_name, options)
            elif upload.content_type == 'mixed':
                self._process_mixed_content(upload, data, batch_name, options)
            
            upload.processing_completed_at = timezone.now()
            upload.save()
            
        except Exception as e:
            upload.processing_log.append(f"Processing failed: {str(e)}")
            upload.save()
            raise e
    
    def _process_question_bank(self, upload, data, batch_name, options):
        """Process question bank JSON data with support for different import modes"""
        if not options.get('create_question_banks', True):
            upload.processing_log.append("Skipped question bank creation (disabled in options)")
            return
        
        # Get import mode from validation results
        import_mode = upload.validation_results.get('import_mode', 'create_new')
        target_bank_id = upload.validation_results.get('target_bank_id')
        
        if import_mode == 'create_new':
            # Original logic for creating new question bank
            existing = None
            if not options.get('overwrite_existing', False):
                existing = QuestionBank.objects.filter(name=data.get('name', '')).first()
            
            if existing and not options.get('overwrite_existing', False):
                upload.processing_log.append(f"Question bank '{data.get('name', '')}' already exists, skipping")
                upload.items_imported = 0
                upload.items_failed = 0
                upload.save()
                return
            
            question_bank = self._create_new_question_bank(upload, data, batch_name)
            
        elif import_mode in ['append_existing', 'merge_update', 'replace_existing']:
            # Use existing question bank
            try:
                question_bank = QuestionBank.objects.get(id=target_bank_id)
                upload.processing_log.append(f"Using existing question bank: {question_bank.name}")
                
                if import_mode == 'replace_existing':
                    # Delete existing questions first
                    deleted_count = question_bank.questions.count()
                    question_bank.questions.all().delete()
                    upload.processing_log.append(f"Deleted {deleted_count} existing questions")
                    
            except QuestionBank.DoesNotExist:
                upload.processing_log.append(f"Target question bank not found, creating new one")
                question_bank = self._create_new_question_bank(upload, data, batch_name)
        else:
            upload.processing_log.append(f"Unknown import mode: {import_mode}")
            return
        
        # Process questions with duplicate handling for merge modes
        questions_created = 0
        questions_skipped = 0
        
        if 'questions' in data and isinstance(data['questions'], list):
            duplicates_info = upload.validation_results.get('duplicates', {})
            duplicate_indices = [dup['new_question_index'] for dup in duplicates_info.get('details', [])]
            
            for i, q_data in enumerate(data['questions']):
                try:
                    # Handle duplicates based on import mode
                    if import_mode == 'merge_update' and i in duplicate_indices:
                        # For merge_update mode, skip duplicates (user can manually handle conflicts)
                        upload.processing_log.append(f"Skipped potential duplicate question {i+1}")
                        questions_skipped += 1
                        continue
                    
                    question = Question.objects.create(
                        question_bank=question_bank,
                        question_text=q_data.get('text', q_data.get('question_text', '')),
                        question_type=q_data.get('question_type', 'mcq'),
                        difficulty=q_data.get('difficulty', 'intermediate'),
                        marks=q_data.get('marks', 1),
                        negative_marks=q_data.get('negative_marks', 0),
                        explanation=q_data.get('explanation', ''),
                        topic=q_data.get('topic', ''),
                        subtopic=q_data.get('subtopic', ''),
                        tags=q_data.get('tags', []),
                        imported_from_json=True,
                        json_import_batch=batch_name,
                        created_by=upload.uploaded_by
                    )
                    
                    # Create options for MCQ questions
                    if q_data.get('options'):
                        from .models import QuestionOption
                        for j, option in enumerate(q_data['options']):
                            is_correct = False
                            if isinstance(q_data.get('correct_answer'), list):
                                is_correct = j in q_data['correct_answer']
                            else:
                                is_correct = (j == q_data.get('correct_answer'))
                            
                            QuestionOption.objects.create(
                                question=question,
                                option_text=option,
                                is_correct=is_correct,
                                order=j
                            )
                    
                    questions_created += 1
                    
                except Exception as e:
                    upload.processing_log.append(f"Failed to create question {i+1}: {str(e)}")
        
        # Update question bank total count
        question_bank.total_questions = question_bank.questions.count()
        question_bank.save()
        
        upload.processing_log.append(f"Created {questions_created} questions in {question_bank.name}")
        if questions_skipped > 0:
            upload.processing_log.append(f"Skipped {questions_skipped} potential duplicate questions")
        
        upload.items_imported += questions_created
        if import_mode == 'create_new':
            upload.items_imported += 1  # +1 for the question bank itself
    
    def _process_exam(self, upload, data, batch_name, options):
        """Process exam JSON data"""
        if not options.get('create_exams', True):
            upload.processing_log.append("Skipped exam creation (disabled in options)")
            return
        
        from exams.models import Exam
        
        # Check if exam exists
        existing = None
        if not options.get('overwrite_existing', False):
            existing = Exam.objects.filter(name=data.get('name', '')).first()
        
        if existing and not options.get('overwrite_existing', False):
            upload.processing_log.append(f"Exam '{data.get('name', '')}' already exists, skipping")
            upload.items_imported = 0
            upload.items_failed = 0
            upload.save()
            return
        
        # Create exam
        exam = Exam.objects.create(
            name=data.get('name', f'Exam {batch_name}'),
            description=data.get('description', ''),
            category=data.get('category', 'other'),
            exam_type=data.get('exam_type', 'other'),
            subject=data.get('subject', ''),
            topic=data.get('topic', ''),
            difficulty_level=data.get('difficulty_level', 'intermediate'),
            target_audience=data.get('target_audience', 'general'),
            language=data.get('language', 'english'),
            year=data.get('year'),
            imported_from_json=True,
            json_import_batch=batch_name,
            original_json_data=data,  # Store the original JSON data
            created_by=upload.uploaded_by
        )
        
        upload.processing_log.append(f"Created exam: {exam.name}")
        
        # Process linked tests if they exist
        tests_created = 0
        if 'tests' in data and isinstance(data['tests'], list):
            for test_data in data['tests']:
                test = self._create_test_for_exam(exam, test_data, batch_name, upload)
                if test:
                    tests_created += 1
        
        upload.processing_log.append(f"Created {tests_created} tests for exam {exam.name}")
        
        # Validate question requirements and set status
        requirements = exam.check_question_requirements()
        if requirements['is_ready']:
            exam.status = 'ready'
            exam.save(update_fields=['status'])
            upload.processing_log.append(f"✅ Exam '{exam.name}' is ready - all question requirements met")
        else:
            exam.status = 'draft'
            exam.save(update_fields=['status'])
            upload.processing_log.append(f"⚠️ Exam '{exam.name}' set to draft - missing {requirements['missing_questions']} questions")
            upload.processing_log.append(f"   Ready tests: {requirements['ready_tests']}/{requirements['total_tests']}")
        
        upload.items_imported += 1  # +1 for the exam itself
        upload.items_imported += tests_created  # +tests created
    
    def _process_test(self, upload, data, batch_name, options):
        """Process test JSON data"""
        if not options.get('create_tests', True):
            upload.processing_log.append("Skipped test creation (disabled in options)")
            return
        
        from exams.models import Exam, Test
        
        # Check if test exists
        existing = None
        test_name = data.get('title', data.get('name', ''))
        if not options.get('overwrite_existing', False):
            existing = Test.objects.filter(title=test_name).first()
        
        if existing and not options.get('overwrite_existing', False):
            upload.processing_log.append(f"Test '{test_name}' already exists, skipping")
            upload.items_imported = 0
            upload.items_failed = 0
            upload.save()
            return
        
        # For standalone tests, we need to create or get a default exam
        # since Test model requires an exam field
        default_exam_name = "Standalone Tests Container"
        default_exam, created = Exam.objects.get_or_create(
            name=default_exam_name,
            defaults={
                'description': 'Container for standalone tests imported from JSON',
                'category': 'other',
                'exam_type': 'other',
                'difficulty_level': 'intermediate',
                'created_by': upload.uploaded_by,
                'imported_from_json': True,
                'json_import_batch': 'auto_created_for_tests'
            }
        )
        
        if created:
            upload.processing_log.append(f"Created default exam container: {default_exam.name}")
        
        # Create test
        test = Test.objects.create(
            exam=default_exam,
            title=test_name,
            description=data.get('description', ''),
            duration_minutes=data.get('duration_minutes', data.get('duration', 180)),
            total_marks=data.get('total_marks', 100),
            pass_percentage=data.get('pass_percentage', 40.0),
            is_published=data.get('is_published', False),
            randomize_questions=data.get('randomize_questions', False),
            show_result_immediately=data.get('show_result_immediately', True),
            allow_review=data.get('allow_review', True),
            max_attempts=data.get('max_attempts', 1),
            imported_from_json=True,
            json_import_batch=batch_name,
            original_json_data=data,  # Store the original JSON data
            created_by=upload.uploaded_by
        )
        
        upload.processing_log.append(f"Created standalone test: {test.title}")
        
        # Process question bank references if they exist
        question_banks_linked = 0
        if 'question_bank_references' in data and isinstance(data['question_bank_references'], list):
            from questions.models import TestQuestionBank, QuestionBank
            
            for bank_ref in data['question_bank_references']:
                bank_name = bank_ref.get('bank_name', '')
                question_count = bank_ref.get('question_count', 10)
                selection_criteria = bank_ref.get('selection_criteria', {})
                
                # Find the question bank by name
                try:
                    question_bank = QuestionBank.objects.filter(name=bank_name).first()
                    if question_bank:
                        # Create the test-question bank relationship
                        test_question_bank = TestQuestionBank.objects.create(
                            test=test,
                            question_bank=question_bank,
                            question_count=question_count,
                            difficulty_filter=','.join(selection_criteria.get('difficulty', [])),
                            topic_filter=','.join(selection_criteria.get('topics', [])),
                            selection_method='random'  # default to random
                        )
                        question_banks_linked += 1
                        upload.processing_log.append(f"Linked to question bank: {bank_name} ({question_count} questions)")
                    else:
                        upload.processing_log.append(f"Warning: Question bank '{bank_name}' not found")
                except Exception as e:
                    upload.processing_log.append(f"Error linking to question bank '{bank_name}': {str(e)}")
        
        upload.processing_log.append(f"Test created with {question_banks_linked} question bank links")
        
        # Validate question requirements and set status
        requirements = test.check_question_requirements()
        if requirements['is_ready']:
            test.status = 'ready'
            test.save(update_fields=['status'])
            upload.processing_log.append(f"✅ Test '{test.title}' is ready - all question requirements met")
        else:
            test.status = 'draft'
            test.save(update_fields=['status'])
            upload.processing_log.append(f"⚠️ Test '{test.title}' set to draft - missing {requirements['missing_questions']} questions")
            for bank in requirements['question_banks']:
                if bank['missing'] > 0:
                    upload.processing_log.append(f"   - {bank['bank_name']}: needs {bank['missing']} more questions ({bank['available']}/{bank['requested']})")
        
        upload.items_imported += 1  # +1 for the test
    
    def _process_mixed_content(self, upload, data, batch_name, options):
        """Process mixed content JSON data"""
        if 'content' in data and isinstance(data['content'], list):
            for item in data['content']:
                item_type = item.get('type', '')
                
                if item_type == 'question_bank':
                    self._process_question_bank(upload, item, batch_name, options)
                elif item_type == 'exam':
                    self._process_exam(upload, item, batch_name, options)
                elif item_type == 'test':
                    self._process_test(upload, item, batch_name, options)
    
    def _create_new_question_bank(self, upload, data, batch_name):
        """Helper method to create a new question bank"""
        question_bank = QuestionBank.objects.create(
            name=data.get('name', f'Question Bank {batch_name}'),
            description=data.get('description', ''),
            category=data.get('category', 'general'),
            subject=data.get('subject', ''),
            topic=data.get('topic', ''),
            difficulty_level=data.get('difficulty_level', 'intermediate'),
            imported_from_json=True,
            json_import_batch=batch_name,
            original_json_data=data,  # Store the original JSON data
            created_by=upload.uploaded_by
        )
        upload.processing_log.append(f"Created question bank: {question_bank.name}")
        return question_bank
    
    def _create_test_for_exam(self, exam, test_data, batch_name, upload):
        """Helper method to create a test for an exam"""
        try:
            from exams.models import Test
            
            test = Test.objects.create(
                exam=exam,
                title=test_data.get('title', test_data.get('name', f'Test for {exam.name}')),
                description=test_data.get('description', ''),
                duration_minutes=test_data.get('duration_minutes', test_data.get('duration', 180)),
                total_marks=test_data.get('total_marks', 100),
                pass_percentage=test_data.get('pass_percentage', 40.0),
                is_published=test_data.get('is_published', False),
                randomize_questions=test_data.get('randomize_questions', False),
                show_result_immediately=test_data.get('show_result_immediately', True),
                allow_review=test_data.get('allow_review', True),
                max_attempts=test_data.get('max_attempts', 1),
                imported_from_json=True,
                json_import_batch=batch_name,
                original_json_data=test_data,  # Store the original JSON data
                created_by=upload.uploaded_by
            )
            
            upload.processing_log.append(f"Created test: {test.title} for exam {exam.name}")
            
            # Process question bank references if they exist in test_data
            question_banks_linked = 0
            if 'question_bank_references' in test_data and isinstance(test_data['question_bank_references'], list):
                from questions.models import TestQuestionBank, QuestionBank
                
                for bank_ref in test_data['question_bank_references']:
                    bank_name = bank_ref.get('bank_name', '')
                    question_count = bank_ref.get('question_count', 10)
                    selection_criteria = bank_ref.get('selection_criteria', {})
                    
                    # Find the question bank by name
                    try:
                        question_bank = QuestionBank.objects.filter(name=bank_name).first()
                        if question_bank:
                            # Create the test-question bank relationship
                            test_question_bank = TestQuestionBank.objects.create(
                                test=test,
                                question_bank=question_bank,
                                question_count=question_count,
                                difficulty_filter=','.join(selection_criteria.get('difficulty', [])),
                                topic_filter=','.join(selection_criteria.get('topics', [])),
                                selection_method='random'
                            )
                            question_banks_linked += 1
                            upload.processing_log.append(f"Linked question bank '{bank_name}' to test '{test.title}' ({question_count} questions)")
                        else:
                            upload.processing_log.append(f"Warning: Question bank '{bank_name}' not found for test '{test.title}'")
                    except Exception as e:
                        upload.processing_log.append(f"Error linking question bank '{bank_name}' to test '{test.title}': {str(e)}")
            
            if question_banks_linked > 0:
                upload.processing_log.append(f"Successfully linked {question_banks_linked} question banks to test '{test.title}'")
            
            # Validate question requirements and set status for the test
            requirements = test.check_question_requirements()
            if requirements['is_ready']:
                test.status = 'ready'
                test.save(update_fields=['status'])
                upload.processing_log.append(f"✅ Test '{test.title}' is ready - all question requirements met")
            else:
                test.status = 'draft'
                test.save(update_fields=['status'])
                upload.processing_log.append(f"⚠️ Test '{test.title}' set to draft - missing {requirements['missing_questions']} questions")
            
            return test
            
        except Exception as e:
            upload.processing_log.append(f"Failed to create test: {str(e)}")
            return None


def detect_duplicates(json_data, target_bank, import_mode):
    """Detect potential duplicate questions when merging with existing content"""
    try:
        from difflib import SequenceMatcher
        
        duplicates = []
        new_questions = []
        
        if 'questions' in json_data:
            new_questions = json_data['questions']
        
        # Get existing questions from target bank
        existing_questions = target_bank.questions.all()
        
        for i, new_q in enumerate(new_questions):
            new_text = new_q.get('text', '').strip().lower()
            potential_duplicates = []
            
            for existing_q in existing_questions:
                existing_text = existing_q.question_text.strip().lower()
                
                # Calculate similarity ratio
                similarity = SequenceMatcher(None, new_text, existing_text).ratio()
                
                if similarity > 0.8:  # 80% similarity threshold
                    potential_duplicates.append({
                        'existing_id': str(existing_q.id),
                        'existing_text': existing_q.question_text[:100] + '...',
                        'similarity': round(similarity * 100, 1),
                        'existing_type': existing_q.question_type,
                        'existing_difficulty': existing_q.difficulty
                    })
            
            if potential_duplicates:
                duplicates.append({
                    'new_question_index': i,
                    'new_text': new_q.get('text', '')[:100] + '...',
                    'new_type': new_q.get('question_type', 'mcq'),
                    'potential_matches': potential_duplicates
                })
        
        return {
            'found': len(duplicates),
            'total_new_questions': len(new_questions),
            'details': duplicates,
            'summary': f"Found {len(duplicates)} potential duplicates out of {len(new_questions)} new questions"
        }
        
    except Exception as e:
        return {
            'found': 0,
            'total_new_questions': 0,
            'details': [],
            'error': str(e),
            'summary': f"Error detecting duplicates: {str(e)}"
        }


def validate_json_structure(data, content_type):
    """Validate JSON structure based on content type"""
    try:
        items_count = 0
        
        if content_type == 'question_bank':
            if 'questions' not in data or not isinstance(data['questions'], list):
                return {
                    'valid': False, 
                    'error': 'Question bank must contain a questions array',
                    'items_count': 0
                }
            items_count = len(data['questions'])
            
        elif content_type == 'exam':
            items_count = 1
            if 'tests' in data and isinstance(data['tests'], list):
                for test in data['tests']:
                    if 'questions' in test and isinstance(test['questions'], list):
                        items_count += len(test['questions'])
                        
        elif content_type == 'test':
            items_count = 1
            if 'questions' in data and isinstance(data['questions'], list):
                items_count += len(data['questions'])
                
        elif content_type == 'mixed':
            if 'content' not in data or not isinstance(data['content'], list):
                return {
                    'valid': False,
                    'error': 'Mixed content must contain a content array',
                    'items_count': 0
                }
            items_count = len(data['content'])
        
        return {
            'valid': True,
            'items_count': items_count,
            'summary': f'Content validated successfully. {items_count} items found.'
        }
        
    except Exception as e:
        return {
            'valid': False,
            'error': str(e),
            'items_count': 0
        }


class ReferenceResolver:
    """Class to handle resolution of content references in JSON uploads"""
    
    def __init__(self, upload_instance):
        self.upload = upload_instance
        self.resolution_log = []
    
    def resolve_references(self, json_data):
        """
        Resolve all references in the JSON data
        Returns: (resolved_data, resolution_summary)
        """
        try:
            resolved_data = json_data.copy()
            
            # Handle different content types
            if resolved_data.get('category') == 'exam':
                resolved_data = self._resolve_exam_references(resolved_data)
            elif resolved_data.get('category') == 'test':
                resolved_data = self._resolve_test_references(resolved_data)
            elif resolved_data.get('category') == 'mixed':
                resolved_data = self._resolve_mixed_references(resolved_data)
            
            summary = {
                'success': True,
                'resolved_count': len([log for log in self.resolution_log if log['status'] == 'resolved']),
                'failed_count': len([log for log in self.resolution_log if log['status'] == 'failed']),
                'resolution_log': self.resolution_log
            }
            
            return resolved_data, summary
            
        except Exception as e:
            return json_data, {
                'success': False,
                'error': str(e),
                'resolution_log': self.resolution_log
            }
    
    def _resolve_exam_references(self, exam_data):
        """Resolve references in exam JSON"""
        
        # Resolve linked tests
        if 'linked_tests' in exam_data:
            resolved_tests = []
            
            for test_ref in exam_data['linked_tests']:
                if isinstance(test_ref, str):
                    # Simple string reference
                    test_id = self._resolve_test_reference(test_ref, 'name')
                    if test_id:
                        resolved_tests.append({'test_id': test_id, 'reference_value': test_ref})
                    else:
                        self._log_failed_reference('test', test_ref, 'name')
                
                elif isinstance(test_ref, dict):
                    # Structured reference
                    ref_type = test_ref.get('reference_type', 'name')
                    ref_value = test_ref.get('reference_value')
                    test_id = self._resolve_test_reference(ref_value, ref_type)
                    
                    if test_id:
                        resolved_tests.append({'test_id': test_id, 'reference_value': ref_value})
                        self._log_successful_reference('test', ref_value, ref_type, test_id)
                    else:
                        self._log_failed_reference('test', ref_value, ref_type)
            
            exam_data['resolved_tests'] = resolved_tests
        
        return exam_data
    
    def _resolve_test_references(self, test_data):
        """Resolve references in test JSON"""
        
        # Resolve linked question banks
        if 'linked_question_banks' in test_data:
            resolved_banks = []
            
            for bank_ref in test_data['linked_question_banks']:
                if isinstance(bank_ref, str):
                    # Simple string reference
                    bank_id = self._resolve_question_bank_reference(bank_ref, 'name')
                    if bank_id:
                        resolved_banks.append({
                            'question_bank_id': bank_id, 
                            'reference_value': bank_ref,
                            'question_count': test_data.get('question_selection', {}).get(bank_ref, {}).get('count', 10)
                        })
                    else:
                        self._log_failed_reference('question_bank', bank_ref, 'name')
                
                elif isinstance(bank_ref, dict):
                    # Structured reference
                    ref_type = bank_ref.get('reference_type', 'name')
                    ref_value = bank_ref.get('reference_value')
                    bank_id = self._resolve_question_bank_reference(ref_value, ref_type)
                    
                    if bank_id:
                        resolved_banks.append({
                            'question_bank_id': bank_id,
                            'reference_value': ref_value,
                            'question_count': bank_ref.get('question_count', 10)
                        })
                        self._log_successful_reference('question_bank', ref_value, ref_type, bank_id)
                    else:
                        self._log_failed_reference('question_bank', ref_value, ref_type)
            
            test_data['resolved_question_banks'] = resolved_banks
        
        return test_data
    
    def _resolve_mixed_references(self, mixed_data):
        """Resolve references in mixed content JSON"""
        # Handle mixed content - can contain multiple items with references
        # This would iterate through the content and resolve each item
        return mixed_data
    
    def _resolve_test_reference(self, reference_value, reference_type):
        """Resolve a single test reference"""
        try:
            if reference_type == 'name':
                test = Test.objects.filter(title=reference_value).first()
            elif reference_type == 'id':
                test = Test.objects.filter(id=reference_value).first()
            elif reference_type == 'batch':
                test = Test.objects.filter(json_import_batch=reference_value).first()
            else:
                return None
            
            return str(test.id) if test else None
            
        except Exception:
            return None
    
    def _resolve_question_bank_reference(self, reference_value, reference_type):
        """Resolve a single question bank reference"""
        try:
            if reference_type == 'name':
                bank = QuestionBank.objects.filter(name=reference_value).first()
            elif reference_type == 'id':
                bank = QuestionBank.objects.filter(id=reference_value).first()
            elif reference_type == 'batch':
                bank = QuestionBank.objects.filter(json_import_batch=reference_value).first()
            else:
                return None
            
            return str(bank.id) if bank else None
            
        except Exception:
            return None
    
    def _log_successful_reference(self, content_type, reference_value, reference_type, resolved_id):
        """Log a successful reference resolution"""
        self.resolution_log.append({
            'status': 'resolved',
            'content_type': content_type,
            'reference_value': reference_value,
            'reference_type': reference_type,
            'resolved_id': resolved_id
        })
    
    def _log_failed_reference(self, content_type, reference_value, reference_type):
        """Log a failed reference resolution"""
        self.resolution_log.append({
            'status': 'failed',
            'content_type': content_type,
            'reference_value': reference_value,
            'reference_type': reference_type,
            'error': f'{content_type} not found: {reference_value}'
        })


class EnhancedContentProcessor:
    """Enhanced content processor that handles references and linking"""
    
    def __init__(self, upload_instance):
        self.upload = upload_instance
        self.resolver = ReferenceResolver(upload_instance)
    
    def process_with_references(self):
        """Process content with reference resolution"""
        try:
            # Get JSON data
            json_data = self.upload.json_data
            
            # Resolve references
            resolved_data, resolution_summary = self.resolver.resolve_references(json_data)
            
            # Update upload with resolution info
            self.upload.processing_log.append({
                'step': 'reference_resolution',
                'timestamp': timezone.now().isoformat(),
                'summary': resolution_summary
            })
            
            # Process content based on type
            if resolved_data.get('category') == 'exam':
                result = self._process_exam_with_links(resolved_data)
            elif resolved_data.get('category') == 'test':
                result = self._process_test_with_links(resolved_data)
            elif resolved_data.get('category') == 'question_bank':
                result = self._process_question_bank(resolved_data)
            else:
                result = {'success': False, 'error': 'Unknown content type'}
            
            # Update upload status
            if result['success']:
                self.upload.status = 'completed'
                self.upload.is_processed = True
                self.upload.items_imported = result.get('items_created', 0)
            else:
                self.upload.status = 'failed'
                self.upload.items_failed = 1
            
            self.upload.processing_completed_at = timezone.now()
            self.upload.save()
            
            return result
            
        except Exception as e:
            self.upload.status = 'failed'
            self.upload.processing_log.append({
                'step': 'processing_error',
                'timestamp': timezone.now().isoformat(),
                'error': str(e)
            })
            self.upload.save()
            return {'success': False, 'error': str(e)}
    
    def _process_exam_with_links(self, exam_data):
        """Process exam with linked tests"""
        try:
            # Create exam instance
            exam = Exam.objects.create(
                name=exam_data['name'],
                description=exam_data.get('description', ''),
                difficulty_level=exam_data.get('difficulty_level', 'intermediate'),
                total_duration_minutes=exam_data.get('total_duration_minutes', 180),
                total_marks=exam_data.get('total_marks', 300),
                imported_from_json=True,
                json_import_batch=self.upload.file_name.replace('.json', ''),
                created_by=self.upload.uploaded_by
            )
            
            # Link resolved tests
            if 'resolved_tests' in exam_data:
                from .models import ExamTest
                for i, test_info in enumerate(exam_data['resolved_tests']):
                    test = Test.objects.get(id=test_info['test_id'])
                    ExamTest.objects.create(
                        exam=exam,
                        test=test,
                        order=i
                    )
            
            return {'success': True, 'items_created': 1, 'exam_id': str(exam.id)}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _process_test_with_links(self, test_data):
        """Process test with linked question banks"""
        try:
            # Create test instance - note: existing Test model requires exam field
            # For standalone tests, we might need to create a placeholder exam or modify the model
            # For now, let's assume tests are always linked to exams in the current model
            
            # This is a simplified version - in reality, you might need to handle
            # standalone tests differently or modify the Test model
            return {'success': False, 'error': 'Standalone test processing not yet implemented - tests must be linked through exams'}
            
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def _process_question_bank(self, bank_data):
        """Process standalone question bank (existing logic)"""
        # Use existing question bank processing logic
        # This would be similar to the existing ContentProcessor logic
        return {'success': True, 'items_created': 1}


# Content Management API endpoints for deleting content

@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_delete_question_bank(request, bank_id):
    """API endpoint to delete a question bank"""
    try:
        bank = get_object_or_404(QuestionBank, id=bank_id)
        bank_name = bank.name
        bank.delete()
        
        return Response({
            'success': True,
            'message': f'Question bank "{bank_name}" deleted successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete question bank: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_delete_exam(request, exam_id):
    """API endpoint to delete an exam"""
    try:
        exam = get_object_or_404(Exam, id=exam_id)
        exam_name = exam.name
        
        # Allow deletion of draft exams - admin can clean up drafts
        
        # Prevent deletion of active exams - they should be deactivated first
        if exam.status == 'active':
            return Response({
                'success': False,
                'message': f'Cannot delete exam "{exam_name}" because it\'s currently active. Please deactivate it first before deleting.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        exam.delete()
        
        return Response({
            'success': True,
            'message': f'Exam "{exam_name}" deleted successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete exam: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_delete_test(request, test_id):
    """API endpoint to delete a test"""
    try:
        test = get_object_or_404(Test, id=test_id)
        test_name = test.title  # Note: Test model uses 'title' field
        
        # Prevent deletion of draft tests - they should be completed instead
        if test.status == 'draft':
            return Response({
                'success': False,
                'message': f'Cannot delete test "{test_name}" because it\'s in draft status. Please complete the requirements first.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent deletion of active tests - they should be deactivated first
        if test.status == 'active':
            return Response({
                'success': False,
                'message': f'Cannot delete test "{test_name}" because it\'s currently active. Please deactivate it first before deleting.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        test.delete()
        
        return Response({
            'success': True,
            'message': f'Test "{test_name}" deleted successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to delete test: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_update_question_bank(request, bank_id):
    try:
        bank = get_object_or_404(QuestionBank, id=bank_id)
        
        # Update fields
        bank.name = request.data.get('name', bank.name)
        bank.description = request.data.get('description', bank.description)
        bank.category = request.data.get('category', bank.category)
        bank.subject = request.data.get('subject', bank.subject)
        bank.difficulty = request.data.get('difficulty', bank.difficulty)
        bank.is_public = request.data.get('isPublic', bank.is_public)
        bank.is_featured = request.data.get('isFeatured', bank.is_featured)
        
        # Handle original JSON data update
        if 'originalJsonData' in request.data:
            bank.original_json_data = request.data['originalJsonData']
        
        bank.save()
        
        return Response({
            'success': True,
            'message': f'Question bank "{bank.name}" updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to update question bank: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_update_exam(request, exam_id):
    try:
        from exams.models import Exam
        exam = get_object_or_404(Exam, id=exam_id)
        
        # Update fields (using correct Exam model field names)
        exam.name = request.data.get('name', exam.name)
        exam.description = request.data.get('description', exam.description)
        exam.category = request.data.get('category', exam.category)
        exam.exam_type = request.data.get('examType', exam.exam_type)
        exam.subject = request.data.get('subject', exam.subject)
        exam.topic = request.data.get('topic', exam.topic)
        exam.difficulty_level = request.data.get('difficulty', exam.difficulty_level)  # difficulty_level, not difficulty
        exam.target_audience = request.data.get('targetAudience', exam.target_audience)
        exam.language = request.data.get('language', exam.language)
        exam.year = request.data.get('year', exam.year)
        exam.is_active = request.data.get('isActive', exam.is_active)
        exam.is_featured = request.data.get('isFeatured', exam.is_featured)
        
        # Handle original JSON data update
        if 'originalJsonData' in request.data:
            exam.original_json_data = request.data['originalJsonData']
        
        exam.save()
        
        return Response({
            'success': True,
            'message': f'Exam "{exam.name}" updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to update exam: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_update_test(request, test_id):
    try:
        from exams.models import Test
        test = get_object_or_404(Test, id=test_id)
        
        # Update fields (using correct Test model field names)
        test.title = request.data.get('name', test.title)  # Test model uses 'title', not 'name'
        test.description = request.data.get('description', test.description)
        test.duration_minutes = request.data.get('duration', test.duration_minutes)
        test.total_marks = request.data.get('totalMarks', test.total_marks)
        test.is_published = request.data.get('isActive', test.is_published)  # Test model uses 'is_published'
        test.pass_percentage = request.data.get('passPercentage', test.pass_percentage)
        test.randomize_questions = request.data.get('randomizeQuestions', test.randomize_questions)
        test.show_result_immediately = request.data.get('showResultImmediately', test.show_result_immediately)
        test.allow_review = request.data.get('allowReview', test.allow_review)
        test.max_attempts = request.data.get('maxAttempts', test.max_attempts)
        
        # Handle original JSON data update
        if 'originalJsonData' in request.data:
            # Update the entire original JSON data
            test.original_json_data = request.data['originalJsonData']
        elif 'questionBankReferences' in request.data:
            # Update just the question bank references
            if not test.original_json_data:
                test.original_json_data = {}
            test.original_json_data['question_bank_references'] = request.data['questionBankReferences']
        
        test.save()
        
        # If question bank references were updated (either directly or via JSON), re-link test to question banks
        question_bank_refs = None
        if 'originalJsonData' in request.data and 'question_bank_references' in request.data['originalJsonData']:
            question_bank_refs = request.data['originalJsonData']['question_bank_references']
        elif 'questionBankReferences' in request.data:
            question_bank_refs = request.data['questionBankReferences']
            
        if question_bank_refs:
            from questions.models import TestQuestionBank, QuestionBank
            
            # Clear existing links for this test
            TestQuestionBank.objects.filter(test=test).delete()
            
            # Create new links based on updated references
            for ref in question_bank_refs:
                bank_name = ref.get('bank_name', '').strip()
                question_count = ref.get('question_count', 10)
                
                if bank_name:
                    # Try to find matching question bank
                    try:
                        question_bank = QuestionBank.objects.get(name__iexact=bank_name)
                        TestQuestionBank.objects.create(
                            test=test,
                            question_bank=question_bank,
                            question_count=question_count
                        )
                    except QuestionBank.DoesNotExist:
                        # Bank doesn't exist yet, will be linked when bank is uploaded
                        pass
        
        return Response({
            'success': True,
            'message': f'Test "{test.title}" updated successfully'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to update test: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def api_relink_tests(request):
    """API endpoint to re-link tests to question banks based on their original JSON references"""
    try:
        from exams.models import Test
        from questions.models import TestQuestionBank, QuestionBank
        
        tests_processed = 0
        links_created = 0
        links_skipped = 0
        warnings = []
        
        # Get all tests or specific test IDs if provided
        test_ids = request.data.get('test_ids', [])
        if test_ids:
            tests = Test.objects.filter(id__in=test_ids)
        else:
            tests = Test.objects.all()
        
        for test in tests:
            tests_processed += 1
            
            # Check if test has original JSON data with question_bank_references
            if not test.original_json_data:
                continue
                
            json_data = test.original_json_data
            if 'question_bank_references' not in json_data:
                continue
            
            # Clear existing links if requested
            if request.data.get('clear_existing', False):
                deleted_count = test.test_question_banks.all().delete()[0]
                if deleted_count > 0:
                    warnings.append(f"Cleared {deleted_count} existing links for test '{test.title}'")
            
            # Process question bank references
            for bank_ref in json_data['question_bank_references']:
                bank_name = bank_ref.get('bank_name', '')
                question_count = bank_ref.get('question_count', 10)
                selection_criteria = bank_ref.get('selection_criteria', {})
                
                # Check if link already exists
                existing_link = TestQuestionBank.objects.filter(
                    test=test,
                    question_bank__name=bank_name
                ).first()
                
                if existing_link:
                    links_skipped += 1
                    continue
                
                # Find the question bank by name
                question_bank = QuestionBank.objects.filter(name=bank_name).first()
                if question_bank:
                    # Create the test-question bank relationship
                    TestQuestionBank.objects.create(
                        test=test,
                        question_bank=question_bank,
                        question_count=question_count,
                        difficulty_filter=','.join(selection_criteria.get('difficulty', [])),
                        topic_filter=','.join(selection_criteria.get('topics', [])),
                        selection_method='random'
                    )
                    links_created += 1
                else:
                    warnings.append(f"Question bank '{bank_name}' not found for test '{test.title}'")
        
        return Response({
            'success': True,
            'message': f'Re-linking completed successfully',
            'stats': {
                'tests_processed': tests_processed,
                'links_created': links_created,
                'links_skipped': links_skipped,
            },
            'warnings': warnings
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Failed to re-link tests: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
