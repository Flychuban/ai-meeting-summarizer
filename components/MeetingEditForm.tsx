import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export interface MeetingEditFormProps {
  initialData: {
    title?: string;
    date?: string | Date;
    transcript: string;
    summary: {
      keyPoints: string[];
      actionItems: string[];
      decisions: string[];
    };
    tags?: string[];
    participants?: string[];
  };
  onSave: (data: any) => void;
  onCancel?: () => void;
}

export const MeetingEditForm: React.FC<MeetingEditFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData.title || "");
  const [date, setDate] = useState(
    initialData.date ? format(new Date(initialData.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd")
  );
  const [transcript, setTranscript] = useState(initialData.transcript);
  const [keyPoints, setKeyPoints] = useState(initialData.summary.keyPoints);
  const [actionItems, setActionItems] = useState(initialData.summary.actionItems);
  const [decisions, setDecisions] = useState(initialData.summary.decisions);
  const [tags, setTags] = useState(initialData.tags || []);
  const [participants, setParticipants] = useState(initialData.participants || []);
  const [saving, setSaving] = useState(false);

  // Helper to handle list edits
  const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number, value: string) => {
    setter((prev) => prev.map((item, i) => (i === idx ? value : item)));
  };
  const handleListAdd = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };
  const handleListRemove = (setter: React.Dispatch<React.SetStateAction<string[]>>, idx: number) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await onSave({
      title,
      date,
      transcript,
      summary: { keyPoints, actionItems, decisions },
      tags,
      participants,
    });
    setSaving(false);
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <Label>Title</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} required />
      </div>
      <div>
        <Label>Date</Label>
        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
      </div>
      <div>
        <Label>Transcript</Label>
        <Textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={6} required />
      </div>
      <div>
        <Label>Key Points</Label>
        {keyPoints.map((point, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input value={point} onChange={e => handleListChange(setKeyPoints, idx, e.target.value)} />
            <Button type="button" variant="destructive" onClick={() => handleListRemove(setKeyPoints, idx)}>-</Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => handleListAdd(setKeyPoints)}>Add Key Point</Button>
      </div>
      <div>
        <Label>Action Items</Label>
        {actionItems.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input value={item} onChange={e => handleListChange(setActionItems, idx, e.target.value)} />
            <Button type="button" variant="destructive" onClick={() => handleListRemove(setActionItems, idx)}>-</Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => handleListAdd(setActionItems)}>Add Action Item</Button>
      </div>
      <div>
        <Label>Decisions</Label>
        {decisions.map((item, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input value={item} onChange={e => handleListChange(setDecisions, idx, e.target.value)} />
            <Button type="button" variant="destructive" onClick={() => handleListRemove(setDecisions, idx)}>-</Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={() => handleListAdd(setDecisions)}>Add Decision</Button>
      </div>
      <div>
        <Label>Tags</Label>
        <Input
          value={tags.join(", ")}
          onChange={e => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
          placeholder="Comma separated tags"
        />
      </div>
      <div>
        <Label>Participants</Label>
        <Input
          value={participants.join(", ")}
          onChange={e => setParticipants(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
          placeholder="Comma separated participants"
        />
      </div>
      <div className="flex gap-4">
        <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save Meeting"}</Button>
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}; 