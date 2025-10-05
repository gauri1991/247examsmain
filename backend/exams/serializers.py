from rest_framework import serializers
from .models import (
    Exam, Test, TestSection, TestAttempt, Organization, 
    ExamMetadata, Syllabus, Subject, SyllabusNode,
    StudentSyllabusProgress, LearningContent, InteractiveElement,
    Assessment, StudentLearningProgress, AssessmentAttempt, LearningAnalytics
)
# Note: TestQuestionSerializer import may need to be handled carefully


class ExamSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    tests_count = serializers.IntegerField(read_only=True)  # This will be annotated in the viewset
    organization_id = serializers.CharField(source='organization.id', read_only=True)
    
    class Meta:
        model = Exam
        fields = ('id', 'name', 'description', 'category', 'exam_type', 'difficulty_level',
                 'organization_id', 'is_active', 'created_by', 'created_by_name', 
                 'tests_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')


class TestSectionSerializer(serializers.ModelSerializer):
    questions_count = serializers.IntegerField(source='questions.count', read_only=True)
    
    class Meta:
        model = TestSection
        fields = ('id', 'name', 'description', 'order', 'questions_count')


class TestSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    sections = TestSectionSerializer(many=True, read_only=True)
    questions_count = serializers.IntegerField(source='test_questions.count', read_only=True)
    attempts_count = serializers.IntegerField(source='attempts.count', read_only=True)
    
    class Meta:
        model = Test
        fields = ('id', 'exam', 'exam_name', 'title', 'description', 'duration_minutes',
                 'total_marks', 'pass_percentage', 'status', 'is_published', 'randomize_questions',
                 'show_result_immediately', 'allow_review', 'max_attempts',
                 'start_time', 'end_time', 'created_by', 'created_by_name',
                 'sections', 'questions_count', 'attempts_count', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')


class TestAttemptSerializer(serializers.ModelSerializer):
    test = serializers.SerializerMethodField()
    test_name = serializers.CharField(source='test.title', read_only=True)
    exam_name = serializers.CharField(source='test.exam.name', read_only=True)
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    score = serializers.DecimalField(source='marks_obtained', max_digits=10, decimal_places=2, read_only=True)
    total_marks = serializers.IntegerField(source='test.total_marks', read_only=True)
    wrong_answers = serializers.SerializerMethodField()
    unanswered = serializers.SerializerMethodField()
    start_time = serializers.DateTimeField(read_only=True)
    started_at = serializers.DateTimeField(source='start_time', read_only=True)
    completed_at = serializers.DateTimeField(source='end_time', read_only=True)
    questions_count = serializers.IntegerField(source='total_questions', read_only=True)
    
    class Meta:
        model = TestAttempt
        fields = ('id', 'test', 'test_name', 'exam_name', 'user_name', 'score', 'total_marks', 'percentage',
                 'status', 'start_time', 'started_at', 'completed_at', 'duration_minutes', 
                 'questions_count', 'correct_answers', 'wrong_answers', 'unanswered')
        read_only_fields = ('id', 'user', 'start_time')
    
    def get_test(self, obj):
        """Return test details needed by frontend"""
        return {
            'id': str(obj.test.id),
            'title': obj.test.title,
            'duration_minutes': obj.test.duration_minutes,
            'total_marks': obj.test.total_marks,
            'randomize_questions': obj.test.randomize_questions,
        }
    
    def get_duration_minutes(self, obj):
        """Calculate duration in minutes from time_spent_seconds"""
        if obj.time_spent_seconds:
            return round(obj.time_spent_seconds / 60)
        return 0
    
    def get_wrong_answers(self, obj):
        """Calculate wrong answers"""
        return obj.attempted_questions - obj.correct_answers if obj.attempted_questions else 0
    
    def get_unanswered(self, obj):
        """Calculate unanswered questions"""
        return obj.total_questions - obj.attempted_questions if obj.total_questions and obj.attempted_questions else 0


class TestDetailSerializer(TestSerializer):
    # questions = TestQuestionSerializer(source='test_questions', many=True, read_only=True)
    
    class Meta(TestSerializer.Meta):
        # fields = TestSerializer.Meta.fields + ('questions',)
        fields = TestSerializer.Meta.fields


class OrganizationSerializer(serializers.ModelSerializer):
    exams_count = serializers.IntegerField(source='exams.count', read_only=True)
    
    class Meta:
        model = Organization
        fields = ('id', 'name', 'description', 'website', 'logo', 'is_active', 
                 'exams_count', 'created_at')
        read_only_fields = ('id', 'created_at')


class ExamMetadataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExamMetadata
        fields = ('id', 'exam', 'year', 'session', 'duration_hours', 'total_marks',
                 'negative_marking', 'qualifying_percentage', 'exam_pattern',
                 'syllabus_coverage', 'difficulty_distribution', 'special_instructions')


class SyllabusSerializer(serializers.ModelSerializer):
    exam_name = serializers.CharField(source='exam.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    nodes_count = serializers.IntegerField(source='nodes.count', read_only=True)
    
    class Meta:
        model = Syllabus
        fields = ('id', 'name', 'exam', 'exam_name', 'description', 'estimated_hours',
                 'is_active', 'created_by', 'created_by_name', 'nodes_count', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_at')


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = ('id', 'name', 'description', 'is_active', 'created_at')
        read_only_fields = ('id', 'created_at')


class SyllabusNodeSerializer(serializers.ModelSerializer):
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    children_count = serializers.IntegerField(source='children.count', read_only=True)
    content_count = serializers.IntegerField(source='learning_contents.count', read_only=True)
    
    class Meta:
        model = SyllabusNode
        fields = ('id', 'syllabus', 'parent', 'name', 'description', 'node_type',
                 'subject', 'subject_name', 'order', 'estimated_hours', 'is_mandatory',
                 'difficulty_level', 'children_count', 'content_count')


class StudentSyllabusProgressSerializer(serializers.ModelSerializer):
    node_name = serializers.CharField(source='node.name', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentSyllabusProgress
        fields = ('id', 'student', 'student_name', 'node', 'node_name', 'status',
                 'progress_percentage', 'time_spent_minutes', 'last_accessed', 'completed_at')
        read_only_fields = ('id', 'last_accessed')


class LearningContentSerializer(serializers.ModelSerializer):
    node_name = serializers.CharField(source='node.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = LearningContent
        fields = ('id', 'node', 'node_name', 'title', 'content_type', 'content_data',
                 'estimated_duration_minutes', 'difficulty_level', 'prerequisites',
                 'learning_objectives', 'is_published', 'created_by', 'created_by_name',
                 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')


class InteractiveElementSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source='content.title', read_only=True)
    
    class Meta:
        model = InteractiveElement
        fields = ('id', 'content', 'content_title', 'element_type', 'element_data',
                 'order', 'is_required', 'points_value')


class AssessmentSerializer(serializers.ModelSerializer):
    node_name = serializers.CharField(source='node.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    attempts_count = serializers.IntegerField(source='attempts.count', read_only=True)
    
    class Meta:
        model = Assessment
        fields = ('id', 'node', 'node_name', 'title', 'description', 'assessment_type',
                 'difficulty_level', 'estimated_duration_minutes', 'max_attempts',
                 'passing_score', 'is_adaptive', 'spaced_repetition_enabled',
                 'prerequisite_assessments', 'created_by', 'created_by_name',
                 'attempts_count', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_at')


class StudentLearningProgressSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source='content.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = StudentLearningProgress
        fields = ('id', 'student', 'student_name', 'content', 'content_title',
                 'completion_status', 'progress_percentage', 'time_spent_minutes',
                 'interaction_data', 'started_at', 'completed_at', 'last_accessed')
        read_only_fields = ('id', 'started_at', 'last_accessed')


class AssessmentAttemptSerializer(serializers.ModelSerializer):
    assessment_title = serializers.CharField(source='assessment.title', read_only=True)
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    
    class Meta:
        model = AssessmentAttempt
        fields = ('id', 'assessment', 'assessment_title', 'student', 'student_name',
                 'attempt_number', 'status', 'score', 'max_score', 'percentage',
                 'time_taken_minutes', 'responses', 'adaptive_level', 'next_review_date',
                 'started_at', 'completed_at')
        read_only_fields = ('id', 'started_at', 'completed_at')


class LearningAnalyticsSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.get_full_name', read_only=True)
    node_name = serializers.CharField(source='node.name', read_only=True)
    
    class Meta:
        model = LearningAnalytics
        fields = ('id', 'student', 'student_name', 'node', 'node_name',
                 'total_time_spent_minutes', 'content_completion_rate',
                 'assessment_average_score', 'learning_velocity', 'difficulty_preference',
                 'retention_rate', 'engagement_metrics', 'last_updated')
        read_only_fields = ('id', 'last_updated')