from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Count, Q
from django.utils import timezone
from .models import (
    Exam, Test, TestSection, TestAttempt, Organization, 
    ExamMetadata, Syllabus, Subject, SyllabusNode,
    StudentSyllabusProgress, LearningContent
)
from .serializers import (
    ExamSerializer, TestSerializer, TestSectionSerializer,
    TestAttemptSerializer, TestDetailSerializer
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class ExamViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving exams.
    Students can view available exams to purchase.
    """
    queryset = Exam.objects.filter(is_active=True).annotate(
        tests_count=Count('tests', filter=Q(tests__is_published=True))
    ).select_related('created_by', 'organization')
    serializer_class = ExamSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # For admin users accessing requirements or specific actions, include inactive exams
        if (self.request.user.is_staff or self.request.user.is_superuser) and self.action in ['requirements', 'retrieve']:
            queryset = Exam.objects.annotate(
                tests_count=Count('tests')
            ).select_related('created_by', 'organization')
        else:
            queryset = super().get_queryset()
        
        # Filter by category if provided
        category = self.request.query_params.get('category', None)
        if category:
            queryset = queryset.filter(category=category)
            
        # Search functionality
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
            
        return queryset.order_by('-created_at')
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available exam categories"""
        categories = Exam.objects.filter(is_active=True).values_list(
            'category', flat=True
        ).distinct()
        return Response({'categories': list(categories)})
    
    @action(detail=True, methods=['get'])
    def tests(self, request, pk=None):
        """Get all published tests for an exam"""
        exam = self.get_object()
        tests = Test.objects.filter(
            exam=exam, 
            is_published=True
        ).select_related('created_by').annotate(
            questions_count=Count('test_questions'),
            attempts_count=Count('attempts')
        )
        
        serializer = TestSerializer(tests, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Check question requirements for an exam"""
        exam = self.get_object()
        requirements = exam.check_question_requirements()
        return Response(requirements)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update exam status (for activation/deactivation)"""
        exam = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in ['draft', 'ready', 'active', 'inactive']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate requirements before activation
        if new_status == 'active':
            requirements = exam.check_question_requirements()
            if not requirements['is_ready']:
                return Response({
                    'error': 'Cannot activate exam: Requirements not met',
                    'requirements': requirements
                }, status=status.HTTP_400_BAD_REQUEST)
        
        exam.status = new_status
        exam.save(update_fields=['status'])
        
        # Re-check status to return updated requirements
        updated_requirements = exam.check_question_requirements()
        
        return Response({
            'message': f'Exam status updated to {new_status}',
            'status': new_status,
            'requirements': updated_requirements
        })


class TestViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for listing and retrieving tests.
    Students can view test details before purchasing.
    """
    queryset = Test.objects.filter(is_published=True).select_related(
        'exam', 'created_by'
    ).prefetch_related('sections').annotate(
        questions_count=Count('test_questions'),
        attempts_count=Count('attempts')
    )
    serializer_class = TestSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # For admin users accessing requirements or specific actions, include unpublished tests
        if (self.request.user.is_staff or self.request.user.is_superuser) and self.action in ['requirements', 'retrieve']:
            queryset = Test.objects.select_related(
                'exam', 'created_by'
            ).prefetch_related('sections').annotate(
                questions_count=Count('test_questions'),
                attempts_count=Count('attempts')
            )
        else:
            queryset = super().get_queryset()
        
        # Filter by exam if provided
        exam_id = self.request.query_params.get('exam', None)
        if exam_id:
            queryset = queryset.filter(exam_id=exam_id)
            
        # Filter by active/scheduled tests
        now = timezone.now()
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            queryset = queryset.filter(
                Q(start_time__isnull=True) | Q(start_time__lte=now),
                Q(end_time__isnull=True) | Q(end_time__gte=now)
            )
            
        return queryset.order_by('-created_at')
    
    def retrieve(self, request, *args, **kwargs):
        """Get detailed test information including questions"""
        test = self.get_object()
        
        # Check if user has access to this test (subscription check would go here)
        # For now, we'll show basic details to all authenticated users
        
        serializer = TestDetailSerializer(test)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Check question requirements for a test"""
        test = self.get_object()
        requirements = test.check_question_requirements()
        return Response(requirements)
    
    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        """Update test status (for activation/deactivation)"""
        test = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        if new_status not in ['draft', 'ready', 'active', 'inactive']:
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate requirements before activation
        if new_status == 'active':
            requirements = test.check_question_requirements()
            if not requirements['is_ready']:
                return Response({
                    'error': 'Cannot activate test: Requirements not met',
                    'requirements': requirements
                }, status=status.HTTP_400_BAD_REQUEST)
        
        test.status = new_status
        test.save(update_fields=['status'])
        
        # Re-check status to return updated requirements
        updated_requirements = test.check_question_requirements()
        
        return Response({
            'message': f'Test status updated to {new_status}',
            'status': new_status,
            'requirements': updated_requirements
        })
    
    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        """Start a new test attempt"""
        print(f"DEBUG: start_attempt called for test {pk} by user {request.user}")
        test = self.get_object()
        user = request.user
        print(f"DEBUG: Found test: {test.title}, user: {user.username if hasattr(user, 'username') else user}")
        
        # Check if user has reached max attempts
        if test.max_attempts:
            existing_attempts = TestAttempt.objects.filter(
                test=test, user=user
            ).count()
            print(f"DEBUG: User {user.username} has {existing_attempts} existing attempts, max allowed: {test.max_attempts}")
            if existing_attempts >= test.max_attempts:
                error_msg = f'Maximum attempts reached ({existing_attempts}/{test.max_attempts})'
                print(f"DEBUG: {error_msg}")
                return Response({
                    'error': error_msg
                }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if test is currently available
        now = timezone.now()
        if test.start_time and now < test.start_time:
            return Response({
                'error': 'Test has not started yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if test.end_time and now > test.end_time:
            return Response({
                'error': 'Test has ended'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Calculate attempt number
        attempt_number = TestAttempt.objects.filter(test=test, user=user).count() + 1
        
        # Calculate total questions using the test_questions relationship
        total_questions_count = test.test_questions.count()
        
        # Create new attempt
        attempt = TestAttempt.objects.create(
            test=test,
            user=user,
            attempt_number=attempt_number,
            status='in_progress',
            total_questions=total_questions_count
        )
        
        serializer = TestAttemptSerializer(attempt)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class TestAttemptViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for test attempts.
    Students can view their test attempts and results.
    """
    serializer_class = TestAttemptSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Users can only see their own attempts
        return TestAttempt.objects.filter(
            user=self.request.user
        ).select_related('test', 'test__exam').order_by('-start_time')
    
    @action(detail=True, methods=['get'])
    def results(self, request, pk=None):
        """Get detailed results for a completed test attempt"""
        attempt = self.get_object()
        
        if attempt.status not in ['completed', 'submitted']:
            return Response({
                'error': 'Test attempt not completed yet'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Return detailed results
        data = TestAttemptSerializer(attempt).data
        
        # Add additional result details if test allows review
        if attempt.test.allow_review:
            # This would include question-wise results
            # For now, just return basic attempt data
            pass
        
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def auto_save(self, request, pk=None):
        """Auto-save answers for a test attempt"""
        attempt = self.get_object()
        
        # Verify the attempt belongs to the current user and is in progress
        if attempt.user != request.user:
            return Response({
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if attempt.status != 'in_progress':
            return Response({
                'error': 'Test attempt is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Server-side time validation for auto-save
        current_time = timezone.now()
        test_duration = timezone.timedelta(minutes=attempt.test.duration_minutes)
        allowed_end_time = attempt.start_time + test_duration
        
        # Check if test time has expired (allow 30 seconds grace period)
        grace_period = timezone.timedelta(seconds=30)
        if current_time > allowed_end_time + grace_period:
            return Response({
                'error': 'Test time has expired',
                'status': 'time_expired',
                'message': 'Cannot save answers after test time has expired'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get answers from request
        answers = request.data.get('answers', {})
        
        if not isinstance(answers, dict):
            return Response({
                'error': 'Invalid answers format'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Import here to avoid circular imports
            from questions.models import UserAnswer, Question
            
            # Update or create user answers
            saved_count = 0
            for question_id, answer_data in answers.items():
                try:
                    # Validate question exists
                    question = Question.objects.get(id=question_id)
                    
                    # Get or create user answer
                    user_answer, created = UserAnswer.objects.get_or_create(
                        test_attempt=attempt,
                        question=question,
                        defaults={
                            'text_answer': '',
                            'boolean_answer': None,
                        }
                    )
                    
                    # Update answer based on question type
                    if question.question_type == 'true_false':
                        user_answer.boolean_answer = bool(answer_data) if answer_data is not None else None
                        user_answer.text_answer = ''
                    elif question.question_type in ['mcq', 'multi_select']:
                        # For MCQ/Multi-select, answer_data could be string or list
                        if isinstance(answer_data, list):
                            user_answer.text_answer = ','.join(str(a) for a in answer_data)
                        else:
                            user_answer.text_answer = str(answer_data) if answer_data else ''
                        user_answer.boolean_answer = None
                    else:
                        # For text-based questions
                        user_answer.text_answer = str(answer_data) if answer_data else ''
                        user_answer.boolean_answer = None
                    
                    user_answer.save()
                    saved_count += 1
                    
                except Question.DoesNotExist:
                    # Skip invalid question IDs
                    continue
                except Exception as e:
                    # Log error but continue with other answers
                    print(f"Error saving answer for question {question_id}: {e}")
                    continue
            
            # Update attempt's last activity time
            attempt.save()
            
            return Response({
                'success': True,
                'saved_answers': saved_count,
                'timestamp': timezone.now().isoformat()
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            import traceback
            print(f"Auto-save error: {e}")
            print(f"Traceback: {traceback.format_exc()}")
            return Response({
                'error': f'Failed to save answers: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        """Submit test attempt"""
        attempt = self.get_object()
        
        # Verify the attempt belongs to the current user and is in progress
        if attempt.user != request.user:
            return Response({
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if attempt.status != 'in_progress':
            return Response({
                'error': 'Test attempt is not in progress'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Server-side time validation
        current_time = timezone.now()
        test_duration = timezone.timedelta(minutes=attempt.test.duration_minutes)
        allowed_end_time = attempt.start_time + test_duration
        
        # Check if test time has expired (allow 30 seconds grace period for network delays)
        grace_period = timezone.timedelta(seconds=30)
        if current_time > allowed_end_time + grace_period:
            # Auto-submit as time expired
            attempt.status = 'submitted'
            attempt.end_time = allowed_end_time  # Use the actual end time, not current time
            time_spent = (attempt.end_time - attempt.start_time).total_seconds()
            attempt.time_spent_seconds = int(time_spent)
            attempt.save()
            
            return Response({
                'error': 'Test time has expired',
                'status': 'auto_submitted',
                'message': 'Test was automatically submitted due to time expiry'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Mark as submitted
            attempt.status = 'submitted'
            attempt.end_time = timezone.now()
            
            # Calculate time spent
            time_spent = (attempt.end_time - attempt.start_time).total_seconds()
            attempt.time_spent_seconds = int(time_spent)
            
            # Calculate score and evaluation
            from questions.models import UserAnswer
            user_answers = UserAnswer.objects.filter(test_attempt=attempt)
            
            total_questions = attempt.total_questions
            attempted_count = 0
            correct_count = 0
            total_marks = 0
            
            for answer in user_answers:
                question = answer.question
                
                # Count as attempted if any answer is provided
                if (answer.text_answer or 
                    answer.boolean_answer is not None or 
                    answer.selected_options.exists()):
                    attempted_count += 1
                    
                    # Check if answer is correct
                    is_correct = False
                    
                    if question.question_type == 'true_false':
                        # For true/false questions, check if boolean_answer matches correct answer
                        correct_option = question.options.filter(is_correct=True).first()
                        if correct_option and answer.boolean_answer is not None:
                            # Convert option text to boolean for comparison
                            correct_bool = correct_option.option_text.lower() == 'true'
                            is_correct = answer.boolean_answer == correct_bool
                    
                    elif question.question_type == 'mcq':
                        # For single choice questions
                        selected_options = answer.selected_options.all()
                        if selected_options.count() == 1:
                            correct_options = question.options.filter(is_correct=True)
                            is_correct = selected_options.first() in correct_options
                    
                    elif question.question_type == 'multi_select':
                        # For multiple choice questions
                        selected_options = set(answer.selected_options.all())
                        correct_options = set(question.options.filter(is_correct=True))
                        is_correct = selected_options == correct_options
                    
                    # For text-based questions (fill_blank, essay), manual evaluation needed
                    # For now, mark as incorrect unless manually evaluated
                    
                    if is_correct:
                        correct_count += 1
                        # Get marks from TestQuestion relationship
                        test_question = attempt.test.test_questions.filter(question=question).first()
                        question_marks = test_question.marks if test_question else 1
                        total_marks += question_marks
                    
                    # Update answer record
                    answer.is_correct = is_correct
                    test_question = attempt.test.test_questions.filter(question=question).first()
                    answer.marks_obtained = test_question.marks if (is_correct and test_question) else 0
                    answer.save()
            
            # Update attempt with calculated values
            attempt.attempted_questions = attempted_count
            attempt.correct_answers = correct_count
            attempt.marks_obtained = total_marks
            
            # Calculate percentage
            max_marks = attempt.test.total_marks
            if max_marks > 0:
                attempt.percentage = (total_marks / max_marks) * 100
            else:
                attempt.percentage = 0
            
            attempt.save()
            
            serializer = TestAttemptSerializer(attempt)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to submit test: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def questions(self, request, pk=None):
        """Get questions for a test attempt"""
        attempt = self.get_object()
        
        # Verify the attempt belongs to the current user
        if attempt.user != request.user:
            return Response({
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Import here to avoid circular imports
            from questions.serializers import QuestionSerializer
            
            # Get test questions in order
            test_questions = attempt.test.test_questions.select_related('question').order_by('order')
            questions_data = []
            
            for test_question in test_questions:
                question_serializer = QuestionSerializer(test_question.question)
                # Create nested structure matching frontend expectations
                test_question_data = {
                    'id': str(test_question.id),
                    'question': question_serializer.data,  # Nested question object
                    'order': test_question.order,
                    'marks': test_question.marks
                }
                questions_data.append(test_question_data)
            
            return Response(questions_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get questions: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'])
    def answers(self, request, pk=None):
        """Get user answers for a test attempt"""
        attempt = self.get_object()
        
        # Verify the attempt belongs to the current user
        if attempt.user != request.user:
            return Response({
                'error': 'Access denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Import here to avoid circular imports
            from questions.models import UserAnswer
            
            # Get user answers for this attempt
            user_answers = UserAnswer.objects.filter(test_attempt=attempt).select_related('question')
            answers_data = []
            
            for answer in user_answers:
                answer_data = {
                    'question_id': str(answer.question.id),
                    'text_answer': answer.text_answer,
                    'boolean_answer': answer.boolean_answer,
                    'marked_for_review': answer.is_marked_for_review,
                    'time_spent_seconds': answer.time_spent_seconds,
                }
                
                # Get selected options for MCQ/multi-select
                if answer.question.question_type in ['mcq', 'multi_select']:
                    selected_options = answer.selected_options.all()
                    answer_data['selected_options'] = [str(opt.id) for opt in selected_options]
                
                answers_data.append(answer_data)
            
            return Response(answers_data, status=status.HTTP_200_OK)
            
        except Exception as e:
            return Response({
                'error': f'Failed to get answers: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class OrganizationViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for organizations offering exams.
    """
    queryset = Organization.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        organizations = self.get_queryset()
        data = []
        for org in organizations:
            data.append({
                'id': str(org.id),
                'name': org.name,
                'description': org.description,
                'website': org.website,
                'logo_url': org.logo.url if org.logo else None,
                'exams_count': org.exams.filter(is_active=True).count()
            })
        return Response(data)


class SyllabusViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for syllabus and learning content.
    """
    queryset = Syllabus.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    
    def list(self, request):
        syllabi = self.get_queryset().select_related('exam', 'created_by')
        data = []
        for syllabus in syllabi:
            data.append({
                'id': str(syllabus.id),
                'name': syllabus.name,
                'exam': syllabus.exam.name if syllabus.exam else None,
                'description': syllabus.description,
                'total_hours': syllabus.estimated_hours,
                'created_at': syllabus.created_at
            })
        return Response(data)
    
    @action(detail=True, methods=['get'])
    def structure(self, request, pk=None):
        """Get hierarchical syllabus structure"""
        syllabus = self.get_object()
        
        def build_tree(nodes, parent=None):
            tree = []
            for node in nodes.filter(parent=parent):
                node_data = {
                    'id': str(node.id),
                    'name': node.name,
                    'description': node.description,
                    'node_type': node.node_type,
                    'estimated_hours': node.estimated_hours,
                    'children': build_tree(nodes, node)
                }
                tree.append(node_data)
            return tree
        
        nodes = syllabus.nodes.all()
        structure = build_tree(nodes)
        
        return Response({
            'syllabus': {
                'id': str(syllabus.id),
                'name': syllabus.name,
                'description': syllabus.description
            },
            'structure': structure
        })