import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageNav from '@/components/PageNav';
import AdminMenu from '@/admin/components/AdminMenu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

type MentorType = 'mentor' | 'coach';

export default function AdminMentorEditPageSimple() {
  const { id } = useParams<{ id: string }>();
  const isNew = id === 'new';
  const navigate = useNavigate();
  
  console.log('🐛 Simple AdminMentorEdit - id:', id, 'isNew:', isNew);

  // form state
  const [userId, setUserId] = useState<string>('');
  const [mentorType, setMentorType] = useState<MentorType>('mentor');
  const [primaryCategoryId, setPrimaryCategoryId] = useState<string>('');
  const [isActive, setIsActive] = useState<boolean>(true);
  const [bio, setBio] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const title = isNew ? 'New Mentor' : 'Edit Mentor';

  const onSave = async () => {
    setError(null);
    setSaving(true);
    
    try {
      // Basic validation
      if (!userId) {
        setError('User ID is required.');
        return;
      }
      
      console.log('📝 Saving mentor with basic form data');
      // For now just show success - will implement actual save later
      alert('Save functionality will be implemented once the page loads properly');
      
    } catch (e: any) {
      setError(e?.message || 'Failed to save mentor.');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (isNew) return navigate('/admin/mentors');
    if (!confirm('Delete this mentor profile? This cannot be undone.')) return;
    
    alert('Delete functionality will be implemented once the page loads properly');
  };

  return (
    <main className="container py-12">
      <PageNav current={`Admin / Mentors / ${title}`} />
      <AdminMenu />
      
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{title}</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/admin/mentors')}
              variant="outline"
            >
              Back
            </Button>
            {!isNew && (
              <Button
                onClick={onDelete}
                variant="destructive"
              >
                Delete
              </Button>
            )}
            <Button
              onClick={onSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* User ID */}
          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              placeholder="User UUID (paste from Users list)"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For now, paste the User ID from the Users management page.
            </p>
          </div>

          {/* Mentor Type */}
          <div className="space-y-2">
            <Label htmlFor="mentorType">Type</Label>
            <Select value={mentorType} onValueChange={(value) => setMentorType(value as MentorType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="coach">Coach</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Primary Category */}
          <div className="space-y-2">
            <Label htmlFor="primaryCategory">Primary Category</Label>
            <Select value={primaryCategoryId} onValueChange={setPrimaryCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">— None —</SelectItem>
                <SelectItem value="health">Health</SelectItem>
                <SelectItem value="relationships">Relationships</SelectItem>
                <SelectItem value="purpose">Purpose & Growth</SelectItem>
                <SelectItem value="wealth">Wealth</SelectItem>
                <SelectItem value="mind">Mind & Emotions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setIsActive(!!checked)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio (optional)</Label>
            <Textarea
              id="bio"
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio or description..."
            />
          </div>

          {/* Hourly Rate */}
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate (optional)</Label>
            <Input
              id="hourlyRate"
              type="number"
              step="0.01"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
              placeholder="e.g. 49.99"
            />
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded">
            <h3 className="font-bold text-lg mb-2">🐛 Debug Info</h3>
            <p className="text-sm text-blue-800">
              This is a simplified version of the mentor edit page to test basic loading.
              If this loads successfully, we can then add the database integration back.
            </p>
            <div className="mt-2 text-xs text-blue-700">
              <p>Route ID: {id}</p>
              <p>Is New: {isNew ? 'true' : 'false'}</p>
              <p>Current URL: {window.location.href}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}