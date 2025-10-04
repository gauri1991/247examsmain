from django import forms
from django.core.exceptions import ValidationError
from .models import ContentUpload
import json


class JSONContentUploadForm(forms.ModelForm):
    """Form for uploading JSON content files"""
    
    json_file = forms.FileField(
        widget=forms.FileInput(attrs={
            'class': 'form-control',
            'accept': '.json'
        }),
        help_text="Select a JSON file to upload"
    )
    
    class Meta:
        model = ContentUpload
        fields = ['file_name', 'content_type']
        widgets = {
            'file_name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter descriptive name for this upload'
            }),
            'content_type': forms.Select(attrs={
                'class': 'form-control'
            }),
        }

    def clean_json_file(self):
        """Validate that uploaded file is valid JSON"""
        json_file = self.cleaned_data.get('json_file')
        
        if not json_file:
            raise ValidationError("JSON file is required")
        
        if not json_file.name.endswith('.json'):
            raise ValidationError("File must have .json extension")
        
        # Read and validate JSON structure
        try:
            json_file.seek(0)
            content = json_file.read().decode('utf-8')
            data = json.loads(content)
            
            # Basic structure validation
            if not isinstance(data, dict):
                raise ValidationError("JSON must contain an object at root level")
            
            # Reset file pointer for later processing
            json_file.seek(0)
            
        except json.JSONDecodeError as e:
            raise ValidationError(f"Invalid JSON format: {str(e)}")
        except UnicodeDecodeError:
            raise ValidationError("File must be UTF-8 encoded")
        
        return json_file

    def clean(self):
        """Additional validation for the entire form"""
        cleaned_data = super().clean()
        content_type = cleaned_data.get('content_type')
        json_file = cleaned_data.get('json_file')
        
        if content_type and json_file:
            try:
                json_file.seek(0)
                content = json_file.read().decode('utf-8')
                data = json.loads(content)
                
                # Validate structure based on content type
                if content_type == 'exam':
                    self._validate_exam_structure(data)
                elif content_type == 'test':
                    self._validate_test_structure(data)
                elif content_type == 'question_bank':
                    self._validate_question_bank_structure(data)
                elif content_type == 'mixed':
                    self._validate_mixed_structure(data)
                
                json_file.seek(0)
                
            except (json.JSONDecodeError, UnicodeDecodeError):
                # Already handled in clean_json_file
                pass
        
        return cleaned_data

    def _validate_exam_structure(self, data):
        """Validate exam JSON structure"""
        required_fields = ['title', 'description', 'category', 'subcategory', 'duration_minutes']
        
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"Exam structure missing required field: {field}")
        
        if 'tests' in data and isinstance(data['tests'], list):
            for i, test in enumerate(data['tests']):
                if not isinstance(test, dict):
                    raise ValidationError(f"Test {i+1} must be an object")
                if 'title' not in test:
                    raise ValidationError(f"Test {i+1} missing required field: title")

    def _validate_test_structure(self, data):
        """Validate test JSON structure"""
        required_fields = ['title', 'description', 'category', 'subcategory', 'duration_minutes']
        
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"Test structure missing required field: {field}")
        
        if 'questions' in data and isinstance(data['questions'], list):
            for i, question in enumerate(data['questions']):
                self._validate_question_structure(question, f"Question {i+1}")

    def _validate_question_bank_structure(self, data):
        """Validate question bank JSON structure"""
        required_fields = ['name', 'description', 'category', 'subcategory']
        
        for field in required_fields:
            if field not in data:
                raise ValidationError(f"Question bank structure missing required field: {field}")
        
        if 'questions' not in data or not isinstance(data['questions'], list):
            raise ValidationError("Question bank must contain a 'questions' array")
        
        if len(data['questions']) == 0:
            raise ValidationError("Question bank must contain at least one question")
        
        for i, question in enumerate(data['questions']):
            self._validate_question_structure(question, f"Question {i+1}")

    def _validate_question_structure(self, question, context="Question"):
        """Validate individual question structure"""
        if not isinstance(question, dict):
            raise ValidationError(f"{context} must be an object")
        
        required_fields = ['text', 'question_type', 'options', 'correct_answer']
        
        for field in required_fields:
            if field not in question:
                raise ValidationError(f"{context} missing required field: {field}")
        
        # Validate question type
        valid_types = ['multiple_choice', 'true_false', 'fill_blank']
        if question['question_type'] not in valid_types:
            raise ValidationError(f"{context} has invalid question_type. Must be one of: {', '.join(valid_types)}")
        
        # Validate options structure
        if not isinstance(question['options'], list) or len(question['options']) < 2:
            raise ValidationError(f"{context} must have at least 2 options")
        
        # Validate correct answer
        if question['question_type'] == 'multiple_choice':
            if not isinstance(question['correct_answer'], list):
                raise ValidationError(f"{context} correct_answer must be a list for multiple choice")
            
            valid_indices = list(range(len(question['options'])))
            for idx in question['correct_answer']:
                if idx not in valid_indices:
                    raise ValidationError(f"{context} correct_answer contains invalid option index: {idx}")

    def _validate_mixed_structure(self, data):
        """Validate mixed content JSON structure"""
        if 'content' not in data or not isinstance(data['content'], list):
            raise ValidationError("Mixed content must contain a 'content' array")
        
        for i, item in enumerate(data['content']):
            if not isinstance(item, dict) or 'type' not in item:
                raise ValidationError(f"Content item {i+1} must be an object with 'type' field")
            
            item_type = item['type']
            if item_type == 'exam':
                self._validate_exam_structure(item)
            elif item_type == 'test':
                self._validate_test_structure(item)
            elif item_type == 'question_bank':
                self._validate_question_bank_structure(item)
            else:
                raise ValidationError(f"Content item {i+1} has invalid type: {item_type}")


class ContentProcessingForm(forms.Form):
    """Form for processing uploaded content"""
    
    upload_id = forms.IntegerField(widget=forms.HiddenInput())
    
    create_question_banks = forms.BooleanField(
        required=False,
        initial=True,
        label="Create Question Banks",
        help_text="Create new question banks for uploaded content"
    )
    
    create_exams = forms.BooleanField(
        required=False,
        initial=True,
        label="Create Exams",
        help_text="Create new exams from uploaded content"
    )
    
    create_tests = forms.BooleanField(
        required=False,
        initial=True,
        label="Create Tests",
        help_text="Create new tests from uploaded content"
    )
    
    import_batch_name = forms.CharField(
        max_length=100,
        required=True,
        label="Import Batch Name",
        help_text="Name to identify this import batch",
        widget=forms.TextInput(attrs={
            'class': 'form-control',
            'placeholder': 'e.g., UPSC_2024_Batch_1'
        })
    )
    
    overwrite_existing = forms.BooleanField(
        required=False,
        initial=False,
        label="Overwrite Existing",
        help_text="Overwrite existing content with same titles/names"
    )