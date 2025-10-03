'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, Globe, Clock, Bell, User, Shield, 
  Monitor, Moon, Sun, Languages, Timer, Volume2
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';
import { PreferencesService, UserPreferences, defaultPreferences } from '@/services/preferences';

export default function SettingsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    loadPreferences();
  }, [isAuthenticated]);

  const loadPreferences = async () => {
    try {
      const loadedPreferences = await PreferencesService.loadPreferences();
      setPreferences(loadedPreferences);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const savePreferences = async () => {
    setLoading(true);
    try {
      await PreferencesService.savePreferences(preferences);
      toast.success('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save preferences:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = async () => {
    try {
      await PreferencesService.resetToDefaults();
      setPreferences(defaultPreferences);
      toast.success('Settings reset to defaults!');
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      toast.error('Failed to reset settings');
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <DashboardHeader title="Settings" />
      <div className="flex-1 overflow-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Account Settings</h2>
            <p className="text-muted-foreground">
              Manage your account preferences and exam settings.
            </p>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="exam">Exam Settings</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="privacy">Privacy</TabsTrigger>
            </TabsList>

            {/* Appearance Settings */}
            <TabsContent value="appearance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Appearance & Display
                  </CardTitle>
                  <CardDescription>
                    Customize how the application looks and feels.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Theme Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="theme">Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value: 'light' | 'dark' | 'system') => 
                        updatePreference('theme', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            Light
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            Dark
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4" />
                            System
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Font Size */}
                  <div className="space-y-2">
                    <Label htmlFor="fontSize">Font Size</Label>
                    <Select
                      value={preferences.fontSize}
                      onValueChange={(value: 'small' | 'medium' | 'large') => 
                        updatePreference('fontSize', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium (Default)</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Language */}
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => updatePreference('language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">
                          <div className="flex items-center gap-2">
                            <Languages className="h-4 w-4" />
                            English
                          </div>
                        </SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Animations</Label>
                      <p className="text-sm text-muted-foreground">
                        Show smooth transitions and animations
                      </p>
                    </div>
                    <Switch
                      checked={preferences.animationsEnabled}
                      onCheckedChange={(checked) => updatePreference('animationsEnabled', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exam Settings */}
            <TabsContent value="exam" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Exam Preferences
                  </CardTitle>
                  <CardDescription>
                    Configure your exam taking experience.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Default Exam Duration */}
                  <div className="space-y-2">
                    <Label htmlFor="examDuration">Default Exam Duration (minutes)</Label>
                    <Select
                      value={preferences.defaultExamDuration.toString()}
                      onValueChange={(value) => updatePreference('defaultExamDuration', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="90">1.5 hours</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="180">3 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  {/* Auto Save */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Auto-save Progress</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically save your answers while taking exams
                      </p>
                    </div>
                    <Switch
                      checked={preferences.autoSave}
                      onCheckedChange={(checked) => updatePreference('autoSave', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Sound Effects</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sounds for timer warnings and submission
                      </p>
                    </div>
                    <Switch
                      checked={preferences.soundEffects}
                      onCheckedChange={(checked) => updatePreference('soundEffects', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Timezone */}
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={preferences.timezone}
                      onValueChange={(value) => updatePreference('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="Asia/Dubai">Asia/Dubai (GST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications */}
            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Exam Reminders */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Exam Reminders</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified about upcoming scheduled exams
                      </p>
                    </div>
                    <Switch
                      checked={preferences.examReminders}
                      onCheckedChange={(checked) => updatePreference('examReminders', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Email Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Results</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive exam results via email
                      </p>
                    </div>
                    <Switch
                      checked={preferences.resultsEmailNotifications}
                      onCheckedChange={(checked) => updatePreference('resultsEmailNotifications', checked)}
                    />
                  </div>

                  <Separator />

                  {/* Weekly Reports */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Progress Reports</Label>
                      <p className="text-sm text-muted-foreground">
                        Get weekly summary of your performance
                      </p>
                    </div>
                    <Switch
                      checked={preferences.weeklyReports}
                      onCheckedChange={(checked) => updatePreference('weeklyReports', checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Privacy Settings */}
            <TabsContent value="privacy" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Privacy & Security
                  </CardTitle>
                  <CardDescription>
                    Control your privacy and data sharing preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Collection</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        We collect anonymized performance data to improve our platform. 
                        Your personal information is never shared with third parties.
                      </p>
                      <Button variant="outline" size="sm">
                        View Privacy Policy
                      </Button>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Account Security</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Keep your account secure by using a strong password and enabling 
                        two-factor authentication.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>

                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Export Data</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Download a copy of your exam data and performance history.
                      </p>
                      <Button variant="outline" size="sm">
                        Download My Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Save Button */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button variant="outline" onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={savePreferences} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}