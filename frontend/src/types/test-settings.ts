export interface TestSettings {
  id: string;
  test_id: string;
  
  // Auto-save Settings
  auto_save_enabled: boolean;
  auto_save_interval: number; // seconds
  save_on_navigation: boolean;
  save_on_focus_loss: boolean;
  
  // Navigation Settings
  randomize_questions: boolean;
  randomize_options: boolean;
  allow_question_skip: boolean;
  allow_previous_navigation: boolean;
  section_wise_navigation: boolean;
  lock_section_on_completion: boolean;
  
  // Timing Settings
  show_timer: boolean;
  timer_position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  warning_intervals: number[]; // minutes before end [30, 15, 5, 1]
  warning_notifications: boolean;
  auto_submit_on_timeout: boolean;
  grace_period_seconds: number; // grace period after timeout
  
  // Marking & Scoring
  negative_marking_enabled: boolean;
  negative_marking_ratio: number; // e.g., 0.25 for -1/4
  partial_marking_enabled: boolean;
  bonus_marks_enabled: boolean;
  bonus_marks_ratio: number;
  
  // Question Display
  questions_per_page: number;
  show_question_numbers: boolean;
  show_progress_bar: boolean;
  show_attempted_count: boolean;
  show_marks_per_question: boolean;
  
  // Review & Submission
  allow_review_before_submit: boolean;
  mandatory_review_flagged: boolean;
  allow_answer_change_in_review: boolean;
  require_confirmation_for_submit: boolean;
  
  // Accessibility
  text_size_adjustment: 'small' | 'normal' | 'large' | 'extra-large';
  high_contrast_mode: boolean;
  screen_reader_support: boolean;
  keyboard_navigation: boolean;
  
  // Security & Proctoring
  disable_copy_paste: boolean;
  disable_right_click: boolean;
  disable_print_screen: boolean;
  block_browser_navigation: boolean;
  fullscreen_required: boolean;
  tab_switch_detection: boolean;
  max_tab_switches: number;
  
  // Advanced Features
  calculator_allowed: boolean;
  formula_sheet_provided: boolean;
  rough_work_area: boolean;
  bookmark_questions: boolean;
  notes_allowed: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface TestPreferences {
  user_id: string;
  
  // Personal Preferences
  preferred_timer_position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  preferred_text_size: 'small' | 'normal' | 'large' | 'extra-large';
  preferred_theme: 'light' | 'dark' | 'auto';
  
  // Navigation Preferences
  auto_move_to_next: boolean;
  show_solution_immediately: boolean;
  reminder_for_unattempted: boolean;
  
  // Notification Preferences
  sound_notifications: boolean;
  browser_notifications: boolean;
  email_reminders: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface TestSession {
  id: string;
  test_attempt_id: string;
  user_id: string;
  
  // Session State
  current_question_index: number;
  time_remaining: number; // seconds
  questions_attempted: number;
  questions_flagged: string[]; // question IDs
  
  // Auto-save Data
  answers: Record<string, any>; // questionId -> answer
  last_auto_save: string;
  unsaved_changes: boolean;
  
  // Behavior Tracking
  tab_switches: number;
  focus_lost_count: number;
  total_idle_time: number; // seconds
  question_wise_time: Record<string, number>; // questionId -> seconds spent
  
  // Session Events
  session_events: SessionEvent[];
  
  created_at: string;
  updated_at: string;
}

export interface SessionEvent {
  timestamp: string;
  event_type: 'question_viewed' | 'answer_changed' | 'answer_saved' | 'question_flagged' | 
             'tab_switch' | 'focus_lost' | 'timer_warning' | 'break_started' | 'break_ended';
  question_id?: string;
  data?: Record<string, any>;
}

// Mock data for test settings
export const mockTestSettings: TestSettings = {
  id: 'settings-1',
  test_id: 'test-1',
  
  // Auto-save Settings
  auto_save_enabled: true,
  auto_save_interval: 30, // 30 seconds
  save_on_navigation: true,
  save_on_focus_loss: true,
  
  // Navigation Settings
  randomize_questions: false,
  randomize_options: true,
  allow_question_skip: true,
  allow_previous_navigation: true,
  section_wise_navigation: false,
  lock_section_on_completion: false,
  
  // Timing Settings
  show_timer: true,
  timer_position: 'top-right',
  warning_intervals: [30, 15, 5, 1], // minutes
  warning_notifications: true,
  auto_submit_on_timeout: true,
  grace_period_seconds: 30,
  
  // Marking & Scoring
  negative_marking_enabled: true,
  negative_marking_ratio: 0.25,
  partial_marking_enabled: false,
  bonus_marks_enabled: false,
  bonus_marks_ratio: 0.1,
  
  // Question Display
  questions_per_page: 1,
  show_question_numbers: true,
  show_progress_bar: true,
  show_attempted_count: true,
  show_marks_per_question: true,
  
  // Review & Submission
  allow_review_before_submit: true,
  mandatory_review_flagged: true,
  allow_answer_change_in_review: true,
  require_confirmation_for_submit: true,
  
  // Accessibility
  text_size_adjustment: 'normal',
  high_contrast_mode: false,
  screen_reader_support: false,
  keyboard_navigation: true,
  
  // Security & Proctoring
  disable_copy_paste: true,
  disable_right_click: true,
  disable_print_screen: true,
  block_browser_navigation: true,
  fullscreen_required: false,
  tab_switch_detection: true,
  max_tab_switches: 3,
  
  // Advanced Features
  calculator_allowed: false,
  formula_sheet_provided: false,
  rough_work_area: true,
  bookmark_questions: true,
  notes_allowed: false,
  
  created_at: '2024-09-27T10:00:00Z',
  updated_at: '2024-09-27T10:00:00Z'
};

export const mockUserPreferences: TestPreferences = {
  user_id: 'current-user',
  
  // Personal Preferences
  preferred_timer_position: 'top-right',
  preferred_text_size: 'normal',
  preferred_theme: 'auto',
  
  // Navigation Preferences
  auto_move_to_next: false,
  show_solution_immediately: false,
  reminder_for_unattempted: true,
  
  // Notification Preferences
  sound_notifications: true,
  browser_notifications: true,
  email_reminders: false,
  
  created_at: '2024-09-01T10:00:00Z',
  updated_at: '2024-09-25T15:30:00Z'
};

export const getDefaultTestSettings = (testId: string): TestSettings => ({
  id: `settings-${testId}`,
  test_id: testId,
  
  // Conservative defaults for new tests
  auto_save_enabled: true,
  auto_save_interval: 60,
  save_on_navigation: true,
  save_on_focus_loss: true,
  
  randomize_questions: false,
  randomize_options: false,
  allow_question_skip: true,
  allow_previous_navigation: true,
  section_wise_navigation: false,
  lock_section_on_completion: false,
  
  show_timer: true,
  timer_position: 'top-right',
  warning_intervals: [30, 15, 5],
  warning_notifications: true,
  auto_submit_on_timeout: true,
  grace_period_seconds: 60,
  
  negative_marking_enabled: false,
  negative_marking_ratio: 0.25,
  partial_marking_enabled: false,
  bonus_marks_enabled: false,
  bonus_marks_ratio: 0.1,
  
  questions_per_page: 1,
  show_question_numbers: true,
  show_progress_bar: true,
  show_attempted_count: true,
  show_marks_per_question: true,
  
  allow_review_before_submit: true,
  mandatory_review_flagged: false,
  allow_answer_change_in_review: true,
  require_confirmation_for_submit: true,
  
  text_size_adjustment: 'normal',
  high_contrast_mode: false,
  screen_reader_support: false,
  keyboard_navigation: true,
  
  disable_copy_paste: false,
  disable_right_click: false,
  disable_print_screen: false,
  block_browser_navigation: false,
  fullscreen_required: false,
  tab_switch_detection: false,
  max_tab_switches: 5,
  
  calculator_allowed: false,
  formula_sheet_provided: false,
  rough_work_area: false,
  bookmark_questions: true,
  notes_allowed: false,
  
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

// Preset configurations for different exam types
export const examTypePresets: Record<string, Partial<TestSettings>> = {
  upsc: {
    negative_marking_enabled: true,
    negative_marking_ratio: 0.33,
    warning_intervals: [60, 30, 15, 5],
    auto_submit_on_timeout: true,
    disable_copy_paste: true,
    tab_switch_detection: true,
    max_tab_switches: 2,
    allow_review_before_submit: true
  },
  ssc: {
    negative_marking_enabled: true,
    negative_marking_ratio: 0.25,
    warning_intervals: [30, 15, 5],
    randomize_options: true,
    auto_submit_on_timeout: true,
    tab_switch_detection: true
  },
  banking: {
    negative_marking_enabled: true,
    negative_marking_ratio: 0.25,
    section_wise_navigation: true,
    lock_section_on_completion: true,
    warning_intervals: [20, 10, 5, 1],
    calculator_allowed: true
  },
  gate: {
    negative_marking_enabled: true,
    negative_marking_ratio: 0.33,
    partial_marking_enabled: true,
    calculator_allowed: true,
    formula_sheet_provided: true,
    rough_work_area: true,
    warning_intervals: [60, 30, 15, 5]
  },
  neet: {
    negative_marking_enabled: true,
    negative_marking_ratio: 0.25,
    warning_intervals: [60, 30, 15, 5],
    disable_copy_paste: true,
    disable_right_click: true,
    fullscreen_required: true,
    tab_switch_detection: true,
    max_tab_switches: 1
  }
};

export const getPresetForExamType = (examType: string): Partial<TestSettings> => {
  return examTypePresets[examType.toLowerCase()] || {};
};