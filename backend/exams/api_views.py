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
    ).select_related('created_by')
    serializer_class = ExamSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
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
    
    @action(detail=True, methods=['post'])
    def start_attempt(self, request, pk=None):
        """Start a new test attempt"""
        test = self.get_object()
        user = request.user
        
        # Check if user has reached max attempts
        if test.max_attempts:
            existing_attempts = TestAttempt.objects.filter(
                test=test, user=user
            ).count()
            if existing_attempts >= test.max_attempts:
                return Response({
                    'error': 'Maximum attempts reached'
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
        
        # Create new attempt
        attempt = TestAttempt.objects.create(
            test=test,
            user=user,
            status='in_progress',
            total_questions=0  # Default value since questions model not yet implemented
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
        
        if attempt.status != 'completed':
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
            attempt.save(update_fields=['updated_at'])
            
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