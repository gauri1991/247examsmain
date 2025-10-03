from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserAnalytics(models.Model):
    """Track user activity and performance analytics"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='analytics')
    
    # Activity tracking
    login_count = models.PositiveIntegerField(default=0)
    last_login_date = models.DateTimeField(null=True, blank=True)
    total_time_spent = models.DurationField(default=timezone.timedelta)
    
    # Performance metrics
    tests_taken = models.PositiveIntegerField(default=0)
    total_score = models.FloatField(default=0.0)
    average_score = models.FloatField(default=0.0)
    highest_score = models.FloatField(default=0.0)
    
    # Study patterns
    study_streak = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveIntegerField(default=0)
    last_study_date = models.DateField(null=True, blank=True)
    
    # Progress tracking
    completed_courses = models.PositiveIntegerField(default=0)
    certificates_earned = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "User Analytics"
        verbose_name_plural = "User Analytics"
        ordering = ['-updated_at']
    
    def __str__(self):
        return f"Analytics for {self.user.username}"
    
    def update_test_score(self, score):
        """Update analytics when user completes a test"""
        self.tests_taken += 1
        self.total_score += score
        self.average_score = self.total_score / self.tests_taken
        if score > self.highest_score:
            self.highest_score = score
        self.save()
    
    def update_login(self):
        """Update analytics when user logs in"""
        self.login_count += 1
        self.last_login_date = timezone.now()
        self.save()
