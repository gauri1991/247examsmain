from django.core.management.base import BaseCommand
from django.db import transaction
from core.models import FeatureCategory, Feature


class Command(BaseCommand):
    help = 'Setup comprehensive feature management system with categories and features'

    def handle(self, *args, **options):
        self.stdout.write('Setting up feature management system...')
        
        with transaction.atomic():
            # Create categories
            categories_data = [
                {
                    'name': 'STUDENT_UI',
                    'display_name': 'Student Interface',
                    'description': 'Features related to student-facing interface and interactions',
                    'icon': 'user-circle',
                    'order': 1
                },
                {
                    'name': 'STUDENT_DASHBOARD',
                    'display_name': 'Student Dashboard',
                    'description': 'Dashboard-specific features for students',
                    'icon': 'chart-bar',
                    'order': 2
                },
                {
                    'name': 'EXAM_FEATURES',
                    'display_name': 'Exam Features',
                    'description': 'Core examination functionality and features',
                    'icon': 'document-text',
                    'order': 3
                },
                {
                    'name': 'CONTENT_MANAGEMENT',
                    'display_name': 'Content Management',
                    'description': 'Content creation, management, and organization features',
                    'icon': 'folder',
                    'order': 4
                },
                {
                    'name': 'ANALYTICS',
                    'display_name': 'Analytics & Reporting',
                    'description': 'Analytics, reporting, and insights features',
                    'icon': 'presentation-chart-line',
                    'order': 5
                },
                {
                    'name': 'ADMIN_TOOLS',
                    'display_name': 'Admin Tools',
                    'description': 'Administrative tools and management features',
                    'icon': 'cog',
                    'order': 6
                },
                {
                    'name': 'PAYMENT_SYSTEM',
                    'display_name': 'Payment System',
                    'description': 'Payment processing and subscription features',
                    'icon': 'credit-card',
                    'order': 7
                },
                {
                    'name': 'COMMUNICATION',
                    'display_name': 'Communication',
                    'description': 'Notifications, messaging, and communication features',
                    'icon': 'chat-bubble-left',
                    'order': 8
                },
                {
                    'name': 'SECURITY',
                    'display_name': 'Security Features',
                    'description': 'Security, authentication, and privacy features',
                    'icon': 'shield-check',
                    'order': 9
                },
                {
                    'name': 'INTEGRATIONS',
                    'display_name': 'External Integrations',
                    'description': 'Third-party integrations and API features',
                    'icon': 'link',
                    'order': 10
                }
            ]
            
            categories = {}
            for cat_data in categories_data:
                category, created = FeatureCategory.objects.get_or_create(
                    name=cat_data['name'],
                    defaults=cat_data
                )
                categories[cat_data['name']] = category
                if created:
                    self.stdout.write(f'Created category: {category.display_name}')
            
            # Create comprehensive features
            features_data = [
                # Student Interface Features
                {
                    'key': 'student_sidebar_navigation',
                    'name': 'Student Sidebar Navigation',
                    'description': 'Enhanced sidebar navigation with quick access to exams, results, and profile',
                    'category': 'STUDENT_UI',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'UI_COMPONENT',
                    'user_roles': ['student']
                },
                {
                    'key': 'student_dark_mode',
                    'name': 'Dark Mode for Students',
                    'description': 'Dark theme option for student interface',
                    'category': 'STUDENT_UI',
                    'is_enabled': False,
                    'is_beta': True,
                    'priority': 'LOW',
                    'feature_type': 'UI_COMPONENT',
                    'user_roles': ['student']
                },
                {
                    'key': 'student_profile_customization',
                    'name': 'Profile Customization',
                    'description': 'Allow students to customize their profile with avatar, bio, and preferences',
                    'category': 'STUDENT_UI',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'student_quick_search',
                    'name': 'Quick Search',
                    'description': 'Global search functionality for exams, subjects, and content',
                    'category': 'STUDENT_UI',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                
                # Student Dashboard Features
                {
                    'key': 'dashboard_performance_analytics',
                    'name': 'Performance Analytics Dashboard',
                    'description': 'Comprehensive performance analytics with charts and insights',
                    'category': 'STUDENT_DASHBOARD',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['student'],
                    'affects_performance': True
                },
                {
                    'key': 'dashboard_progress_tracking',
                    'name': 'Progress Tracking',
                    'description': 'Visual progress tracking for courses and exam preparation',
                    'category': 'STUDENT_DASHBOARD',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'dashboard_recommended_exams',
                    'name': 'Recommended Exams',
                    'description': 'AI-powered exam recommendations based on performance and interests',
                    'category': 'STUDENT_DASHBOARD',
                    'is_enabled': False,
                    'is_beta': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['student'],
                    'affects_performance': True
                },
                {
                    'key': 'dashboard_study_streaks',
                    'name': 'Study Streaks',
                    'description': 'Gamified study streak tracking and achievements',
                    'category': 'STUDENT_DASHBOARD',
                    'is_enabled': True,
                    'priority': 'LOW',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'dashboard_upcoming_deadlines',
                    'name': 'Upcoming Deadlines',
                    'description': 'Calendar view of upcoming exam deadlines and important dates',
                    'category': 'STUDENT_DASHBOARD',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                
                # Exam Features
                {
                    'key': 'exam_auto_save',
                    'name': 'Auto-save Functionality',
                    'description': 'Automatically save exam progress to prevent data loss',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': True,
                    'priority': 'CRITICAL',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'exam_timer_warnings',
                    'name': 'Timer Warnings',
                    'description': 'Visual and audio warnings when exam time is running low',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'exam_question_bookmarking',
                    'name': 'Question Bookmarking',
                    'description': 'Allow students to bookmark questions for review',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                {
                    'key': 'exam_offline_mode',
                    'name': 'Offline Mode',
                    'description': 'Allow exams to be taken offline with sync when connection is restored',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': False,
                    'is_beta': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student'],
                    'requires_restart': True
                },
                {
                    'key': 'exam_proctoring',
                    'name': 'AI Proctoring',
                    'description': 'AI-powered exam proctoring with camera and behavior monitoring',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': False,
                    'priority': 'HIGH',
                    'feature_type': 'SECURITY',
                    'user_roles': ['student', 'teacher'],
                    'affects_performance': True
                },
                {
                    'key': 'exam_instant_results',
                    'name': 'Instant Results',
                    'description': 'Show exam results immediately after completion',
                    'category': 'EXAM_FEATURES',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student']
                },
                
                # Content Management Features
                {
                    'key': 'content_bulk_upload',
                    'name': 'Bulk Content Upload',
                    'description': 'Upload multiple questions and media files in batch',
                    'category': 'CONTENT_MANAGEMENT',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['teacher', 'admin']
                },
                {
                    'key': 'content_version_control',
                    'name': 'Version Control',
                    'description': 'Track changes and maintain version history of questions and exams',
                    'category': 'CONTENT_MANAGEMENT',
                    'is_enabled': False,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['teacher', 'admin']
                },
                {
                    'key': 'content_ai_generation',
                    'name': 'AI Question Generation',
                    'description': 'Generate questions automatically using AI based on topics and difficulty',
                    'category': 'CONTENT_MANAGEMENT',
                    'is_enabled': False,
                    'is_beta': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['teacher', 'admin'],
                    'affects_performance': True
                },
                {
                    'key': 'content_plagiarism_detection',
                    'name': 'Plagiarism Detection',
                    'description': 'Detect duplicate or similar questions across question banks',
                    'category': 'CONTENT_MANAGEMENT',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['teacher', 'admin']
                },
                
                # Analytics Features
                {
                    'key': 'analytics_detailed_reports',
                    'name': 'Detailed Analytics Reports',
                    'description': 'Comprehensive analytics reports with insights and recommendations',
                    'category': 'ANALYTICS',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['teacher', 'admin'],
                    'affects_performance': True
                },
                {
                    'key': 'analytics_real_time_monitoring',
                    'name': 'Real-time Monitoring',
                    'description': 'Real-time monitoring of ongoing exams and student performance',
                    'category': 'ANALYTICS',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['teacher', 'admin'],
                    'affects_performance': True
                },
                {
                    'key': 'analytics_predictive_insights',
                    'name': 'Predictive Insights',
                    'description': 'AI-powered predictive analytics for student performance',
                    'category': 'ANALYTICS',
                    'is_enabled': False,
                    'is_beta': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['teacher', 'admin'],
                    'affects_performance': True
                },
                
                # Admin Tools
                {
                    'key': 'admin_user_management',
                    'name': 'Advanced User Management',
                    'description': 'Comprehensive user management with roles, permissions, and bulk operations',
                    'category': 'ADMIN_TOOLS',
                    'is_enabled': True,
                    'priority': 'CRITICAL',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['admin']
                },
                {
                    'key': 'admin_system_monitoring',
                    'name': 'System Monitoring',
                    'description': 'Monitor system performance, usage statistics, and health metrics',
                    'category': 'ADMIN_TOOLS',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'ANALYTICS',
                    'user_roles': ['admin'],
                    'affects_performance': True
                },
                {
                    'key': 'admin_backup_restore',
                    'name': 'Backup & Restore',
                    'description': 'Automated backup and restore functionality for data protection',
                    'category': 'ADMIN_TOOLS',
                    'is_enabled': True,
                    'priority': 'CRITICAL',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['admin'],
                    'requires_restart': True
                },
                
                # Payment System Features
                {
                    'key': 'payment_multiple_gateways',
                    'name': 'Multiple Payment Gateways',
                    'description': 'Support for multiple payment processors and methods',
                    'category': 'PAYMENT_SYSTEM',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'INTEGRATION',
                    'user_roles': ['student']
                },
                {
                    'key': 'payment_subscription_management',
                    'name': 'Subscription Management',
                    'description': 'Comprehensive subscription and recurring payment management',
                    'category': 'PAYMENT_SYSTEM',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student', 'admin']
                },
                {
                    'key': 'payment_refund_processing',
                    'name': 'Automated Refund Processing',
                    'description': 'Automated refund processing with configurable rules',
                    'category': 'PAYMENT_SYSTEM',
                    'is_enabled': False,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['admin']
                },
                
                # Communication Features
                {
                    'key': 'notifications_email',
                    'name': 'Email Notifications',
                    'description': 'Comprehensive email notification system for various events',
                    'category': 'COMMUNICATION',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student', 'teacher', 'admin']
                },
                {
                    'key': 'notifications_push',
                    'name': 'Push Notifications',
                    'description': 'Browser and mobile push notifications',
                    'category': 'COMMUNICATION',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student', 'teacher']
                },
                {
                    'key': 'messaging_system',
                    'name': 'Internal Messaging',
                    'description': 'Internal messaging system between students and teachers',
                    'category': 'COMMUNICATION',
                    'is_enabled': False,
                    'priority': 'LOW',
                    'feature_type': 'FUNCTIONALITY',
                    'user_roles': ['student', 'teacher']
                },
                
                # Security Features
                {
                    'key': 'security_two_factor_auth',
                    'name': 'Two-Factor Authentication',
                    'description': 'Enhanced security with 2FA for all user accounts',
                    'category': 'SECURITY',
                    'is_enabled': False,
                    'priority': 'HIGH',
                    'feature_type': 'SECURITY',
                    'user_roles': ['student', 'teacher', 'admin']
                },
                {
                    'key': 'security_session_management',
                    'name': 'Advanced Session Management',
                    'description': 'Enhanced session security with device tracking and forced logout',
                    'category': 'SECURITY',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'SECURITY',
                    'user_roles': ['student', 'teacher', 'admin']
                },
                {
                    'key': 'security_audit_logging',
                    'name': 'Audit Logging',
                    'description': 'Comprehensive audit logging for all user actions and system events',
                    'category': 'SECURITY',
                    'is_enabled': True,
                    'priority': 'HIGH',
                    'feature_type': 'SECURITY',
                    'user_roles': ['admin'],
                    'affects_performance': True
                },
                
                # Integration Features
                {
                    'key': 'integration_google_classroom',
                    'name': 'Google Classroom Integration',
                    'description': 'Seamless integration with Google Classroom for assignment sync',
                    'category': 'INTEGRATIONS',
                    'is_enabled': False,
                    'priority': 'MEDIUM',
                    'feature_type': 'INTEGRATION',
                    'user_roles': ['teacher']
                },
                {
                    'key': 'integration_lms',
                    'name': 'LMS Integration',
                    'description': 'Integration with popular Learning Management Systems',
                    'category': 'INTEGRATIONS',
                    'is_enabled': False,
                    'priority': 'LOW',
                    'feature_type': 'INTEGRATION',
                    'user_roles': ['teacher', 'admin']
                },
                {
                    'key': 'integration_calendar',
                    'name': 'Calendar Integration',
                    'description': 'Sync exam schedules with external calendar applications',
                    'category': 'INTEGRATIONS',
                    'is_enabled': True,
                    'priority': 'MEDIUM',
                    'feature_type': 'INTEGRATION',
                    'user_roles': ['student', 'teacher']
                }
            ]
            
            # Create features
            created_features = {}
            for feature_data in features_data:
                category = categories[feature_data.pop('category')]
                feature, created = Feature.objects.get_or_create(
                    key=feature_data['key'],
                    defaults={
                        **feature_data,
                        'category': category
                    }
                )
                created_features[feature.key] = feature
                if created:
                    self.stdout.write(f'Created feature: {feature.name}')
            
            # Set up dependencies
            dependencies = [
                ('dashboard_recommended_exams', ['dashboard_performance_analytics']),
                ('analytics_predictive_insights', ['analytics_detailed_reports', 'analytics_real_time_monitoring']),
                ('exam_proctoring', ['security_session_management']),
                ('security_two_factor_auth', ['security_session_management']),
                ('content_ai_generation', ['content_bulk_upload']),
                ('payment_refund_processing', ['payment_subscription_management']),
                ('integration_google_classroom', ['security_audit_logging']),
                ('integration_lms', ['security_audit_logging']),
                ('exam_offline_mode', ['exam_auto_save']),
            ]
            
            for feature_key, dep_keys in dependencies:
                if feature_key in created_features:
                    feature = created_features[feature_key]
                    for dep_key in dep_keys:
                        if dep_key in created_features:
                            feature.depends_on.add(created_features[dep_key])
                            self.stdout.write(f'Added dependency: {feature_key} depends on {dep_key}')
            
            # Set up conflicts
            conflicts = [
                ('student_dark_mode', ['dashboard_performance_analytics']),  # Example conflict
                ('exam_offline_mode', ['exam_proctoring']),  # Can't proctor offline exams
            ]
            
            for feature_key, conflict_keys in conflicts:
                if feature_key in created_features:
                    feature = created_features[feature_key]
                    for conflict_key in conflict_keys:
                        if conflict_key in created_features:
                            feature.conflicts_with.add(created_features[conflict_key])
                            self.stdout.write(f'Added conflict: {feature_key} conflicts with {conflict_key}')
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created {len(categories_data)} categories and {len(features_data)} features!'
            )
        )