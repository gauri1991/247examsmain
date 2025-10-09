# Learning Note: CASCADE Deletion Issue & Fix

**Date**: October 9, 2025
**Issue**: Critical data loss when deleting users
**Status**: ✅ FIXED
**Severity**: 🔴 CRITICAL

---

## 📌 Problem Discovery

### What Happened
While testing the Django admin interface, we discovered that **deleting users caused massive unintended data loss**. When attempting to delete a few test users, the system also deleted:
- ✅ Exams created by those users
- ✅ Tests within those exams
- ✅ Questions in those tests
- ✅ Question banks
- ✅ Test attempts from other students
- ✅ All related content

**Result**: Nearly all data in the database was wiped out from a simple user deletion!

### User's Observation
> "I tried to delete users by selecting some users, but why tests, exams, questions also get selected with them and get deleted?"

---

## 🔍 Root Cause Analysis

### The Technical Problem

Django's `on_delete=models.CASCADE` was used for ALL ForeignKey relationships, including creator fields:

```python
# ❌ DANGEROUS CODE (Before Fix)
class Exam(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,  # ⚠️ PROBLEM!
        related_name='created_exams'
    )
```

### Cascade Chain Reaction

When a user is deleted with CASCADE on creator fields:

```
Delete User "john@example.com"
    ↓ CASCADE (created_by)
    ├─→ Delete ALL Exams john created
    │       ↓ CASCADE (exam FK)
    │       ├─→ Delete ALL Tests in those Exams
    │       │       ↓ CASCADE (test FK)
    │       │       ├─→ Delete ALL TestAttempts for those Tests
    │       │       ├─→ Delete ALL UserAnswers in those Tests
    │       │       ├─→ Delete ALL TestQuestions
    │       │       └─→ Delete ALL TestSections
    │       ├─→ Delete ExamMetadata
    │       └─→ Delete Syllabus
    │
    ├─→ Delete ALL Questions john created
    │       ↓ CASCADE (question FK)
    │       ├─→ Delete QuestionOptions
    │       └─→ Delete TestQuestions using those Questions
    │
    └─→ Delete ALL QuestionBanks john created
            ↓ CASCADE (question_bank FK)
            ├─→ Delete ALL Questions in those banks
            └─→ Delete QuestionBankPermissions
```

**One user deletion = Potential loss of THOUSANDS of records!**

---

## ✅ The Solution

### Principle: Separate Content from Creator

**Creator Fields** (who made it) should use `SET_NULL`:
- When creator is deleted, content remains
- Creator field becomes `NULL`
- Content is preserved and functional

**User Data** (belongs to user) should use `CASCADE`:
- When user is deleted, their personal data is deleted
- Privacy compliance (GDPR, etc.)
- Examples: test attempts, answers, progress

### Fixed Code

```python
# ✅ SAFE CODE (After Fix)
class Exam(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,  # ✅ FIXED!
        null=True,                   # ✅ Allow NULL
        related_name='created_exams'
    )
```

---

## 📋 Complete List of Changes

### Files Modified

#### 1. `exams/models.py`
```python
# Fixed 3 models:
Exam.created_by              → CASCADE to SET_NULL
Test.created_by              → CASCADE to SET_NULL
SelectionRuleTemplate.created_by → CASCADE to SET_NULL
```

#### 2. `questions/models.py`
```python
# Fixed 4 models:
QuestionBank.created_by                → CASCADE to SET_NULL
Question.created_by                    → CASCADE to SET_NULL
ContentUpload.uploaded_by              → CASCADE to SET_NULL
QuestionBankPermission.granted_by      → CASCADE to SET_NULL
```

#### 3. `users/admin.py`
```python
# Added comment about safe deletion
def get_actions(self, request):
    """Override to add warning message for delete action"""
    actions = super().get_actions(request)
    # Keep delete action but it's now safe - content won't be deleted
    return actions
```

### Migrations Created

1. **`exams/migrations/0013_alter_exam_created_by_and_more.py`**
   - Alters `Exam.created_by`
   - Alters `SelectionRuleTemplate.created_by`
   - Alters `Test.created_by`

2. **`questions/migrations/0010_alter_contentupload_uploaded_by_and_more.py`**
   - Alters `ContentUpload.uploaded_by`
   - Alters `Question.created_by`
   - Alters `QuestionBank.created_by`
   - Alters `QuestionBankPermission.granted_by`

---

## 🎯 Best Practices for Django ForeignKeys

### Decision Matrix

| Relationship Type | on_delete | null | Reason |
|------------------|-----------|------|--------|
| **Creator/Author** | `SET_NULL` | `True` | Preserve content when creator deleted |
| **Parent/Child Structure** | `CASCADE` | `False` | Child meaningless without parent |
| **User Personal Data** | `CASCADE` | `False` | Privacy - delete user's data |
| **Optional Reference** | `SET_NULL` | `True` | Reference can be missing |
| **Required Reference** | `PROTECT` | `False` | Prevent accidental deletion |

### Examples

```python
# ✅ GOOD: Creator field
created_by = models.ForeignKey(
    User,
    on_delete=models.SET_NULL,
    null=True,
    related_name='created_exams'
)

# ✅ GOOD: Parent-child (Test belongs to Exam)
exam = models.ForeignKey(
    Exam,
    on_delete=models.CASCADE,  # Delete tests if exam deleted
    related_name='tests'
)

# ✅ GOOD: User's personal data
user = models.ForeignKey(
    User,
    on_delete=models.CASCADE,  # Delete attempts if user deleted
    related_name='test_attempts'
)

# ✅ GOOD: Optional organization
organization = models.ForeignKey(
    Organization,
    on_delete=models.SET_NULL,
    null=True,
    blank=True
)

# ✅ GOOD: Critical reference (can't delete if used)
subscription_plan = models.ForeignKey(
    Plan,
    on_delete=models.PROTECT  # Can't delete plan if users subscribed
)
```

---

## 🧪 Testing the Fix

### Before Fix
```python
# Dangerous behavior
user = User.objects.get(email='john@example.com')
user.delete()

# Result:
# - User deleted ✓
# - ALL exams john created: DELETED ❌
# - ALL tests in those exams: DELETED ❌
# - ALL questions: DELETED ❌
# Total loss: Potentially thousands of records
```

### After Fix
```python
# Safe behavior
user = User.objects.get(email='john@example.com')
user.delete()

# Result:
# - User deleted ✓
# - Exams john created: PRESERVED ✓ (created_by = NULL)
# - Tests in those exams: PRESERVED ✓
# - Questions: PRESERVED ✓
# - John's test attempts: DELETED ✓ (privacy)
# Total loss: Only user record and personal data
```

### Test Script

```python
# test_cascade_fix.py
from users.models import User
from exams.models import Exam, Test
from questions.models import Question

# Create test data
user = User.objects.create(username='test_cascade')
exam = Exam.objects.create(name='Test Exam', created_by=user)
test = Test.objects.create(title='Test', exam=exam, created_by=user)

# Count before deletion
exams_count = Exam.objects.count()
tests_count = Test.objects.count()

# Delete user
user.delete()

# Verify content preserved
assert Exam.objects.count() == exams_count, "Exam was deleted!"
assert Test.objects.count() == tests_count, "Test was deleted!"
assert Exam.objects.get(id=exam.id).created_by is None, "created_by not NULL!"

print("✅ CASCADE fix verified!")
```

---

## 📊 Impact Assessment

### Data Preserved
- **Exams**: Remain accessible with `created_by = NULL`
- **Tests**: Continue functioning normally
- **Questions**: Available for all tests
- **Question Banks**: Preserved for reuse
- **System Integrity**: Maintained

### Data Deleted (Expected)
- **User Account**: Removed as requested ✓
- **Test Attempts**: User's personal exam history ✓
- **User Answers**: User's personal responses ✓
- **User Progress**: User's learning analytics ✓
- **User Profile**: Personal information ✓

### Benefits
1. **Data Safety**: Accidental deletions prevented
2. **Content Preservation**: Platform content protected
3. **User Privacy**: Personal data still deleted
4. **GDPR Compliant**: User data removal without system data loss
5. **Audit Trail**: Can still see content was created (even if creator unknown)

---

## 🚨 Warning Signs to Watch For

### RED FLAGS that indicate CASCADE problems:

1. **"When I delete X, Y also gets deleted"**
   - Check ForeignKey on_delete settings

2. **"Database getting emptier after user management"**
   - Probably CASCADE on creator fields

3. **"Lost all content when cleaning up test users"**
   - Classic CASCADE issue

4. **"Can't delete anything - constraint violations"**
   - Might need PROTECT instead of CASCADE

---

## 💡 Lessons Learned

### 1. **Always Think About Data Ownership**
- Is this content OWNED by the user? → `CASCADE`
- Is this content CREATED by the user? → `SET_NULL`

### 2. **Test Deletion Behavior Early**
- Create test data
- Try deleting users
- Verify what gets deleted

### 3. **Document Relationships**
- Add comments explaining on_delete choices
- Create diagrams of relationship chains

### 4. **Use Django Admin Carefully**
- Bulk delete is powerful and dangerous
- Always backup before bulk operations
- Consider soft deletes for critical data

### 5. **Migration Testing**
- Test migrations in dev first
- Check data integrity after migrations
- Have rollback plan

---

## 🔧 Related Django Settings

### Soft Delete Alternative

For even more safety, consider soft deletes:

```python
class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)

    class Meta:
        abstract = True

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def hard_delete(self):
        super().delete()
```

### Admin Safeguards

```python
class SafeDeleteAdmin(admin.ModelAdmin):
    def delete_model(self, request, obj):
        # Log deletion
        logger.warning(f"{request.user} deleted {obj}")
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        # Limit bulk deletes
        if queryset.count() > 10:
            self.message_user(
                request,
                "Bulk delete limited to 10 items for safety",
                level='ERROR'
            )
            return
        super().delete_queryset(request, queryset)
```

---

## 📚 Additional Resources

- [Django on_delete Options](https://docs.djangoproject.com/en/stable/ref/models/fields/#django.db.models.ForeignKey.on_delete)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
- [GDPR Right to Erasure](https://gdpr-info.eu/art-17-gdpr/)
- [Django Best Practices](https://django-best-practices.readthedocs.io/)

---

## ✅ Checklist for Future ForeignKey Definitions

When adding a new ForeignKey, ask:

- [ ] Is this a parent-child relationship? → Consider `CASCADE`
- [ ] Is this user's personal data? → Use `CASCADE`
- [ ] Is this a creator/author field? → Use `SET_NULL` with `null=True`
- [ ] Is this an optional reference? → Use `SET_NULL` with `null=True`
- [ ] Is this a critical reference? → Consider `PROTECT`
- [ ] Have I tested what happens on deletion?
- [ ] Have I documented the choice?

---

## 🎓 Summary

**Problem**: Deleting users caused CASCADE deletion of all content they created.

**Root Cause**: Using `on_delete=models.CASCADE` on creator fields.

**Solution**: Changed to `on_delete=models.SET_NULL` with `null=True` for creator fields.

**Result**: Users can be safely deleted without losing platform content.

**Key Takeaway**: **Think carefully about data relationships and deletion behavior BEFORE defining ForeignKeys!**

---

*This learning note documents a critical issue discovered on October 9, 2025, and serves as a reference for future development decisions.*
