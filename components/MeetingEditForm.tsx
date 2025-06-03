import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";

export interface MeetingEditFormProps {
  initialData: {
    title?: string;
    date?: string | Date;
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
  const [keyPoints, setKeyPoints] = useState(initialData.summary.keyPoints);
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
      summary: { keyPoints, decisions },
      tags,
      participants,
    });
    setSaving(false);
  };

  return (
    <Card className="max-w-2xl mx-auto shadow-lg border-orange-200">
      <form onSubmit={handleSubmit}>
        <CardHeader className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400 rounded-t-md p-6">
          <CardTitle className="text-white text-2xl font-bold">Review & Edit Meeting Summary</CardTitle>
          <CardDescription className="text-orange-50 mt-2">Edit the AI-generated summary and details before saving your meeting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} required className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1" />
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Key Points</Label>
              <div className="space-y-2 mt-2">
                {keyPoints.map((point, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={point} onChange={e => handleListChange(setKeyPoints, idx, e.target.value)} />
                    <Button type="button" variant="destructive" onClick={() => handleListRemove(setKeyPoints, idx)}>-</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => handleListAdd(setKeyPoints)}>Add Key Point</Button>
              </div>
            </div>
            <div>
              <Label>Decisions</Label>
              <div className="space-y-2 mt-2">
                {decisions.map((item, idx) => (
                  <div key={idx} className="flex gap-2">
                    <Input value={item} onChange={e => handleListChange(setDecisions, idx, e.target.value)} />
                    <Button type="button" size="icon" variant="destructive" onClick={() => handleListRemove(setDecisions, idx)}>-</Button>
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" className="mt-2" onClick={() => handleListAdd(setDecisions)}>Add Decision</Button>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Tags</Label>
              <Input
                value={tags.join(", ")}
                onChange={e => setTags(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                placeholder="Comma separated tags"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Participants</Label>
              <Input
                value={participants.join(", ")}
                onChange={e => setParticipants(e.target.value.split(",").map(t => t.trim()).filter(Boolean))}
                placeholder="Comma separated participants"
                className="mt-1"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex gap-4 justify-end bg-gray-50 p-6 rounded-b-md border-t">
          <Button type="submit" disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-md">
            {saving ? "Saving..." : "Save Meeting"}
          </Button>
          {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        </CardFooter>
      </form>
    </Card>
  );
}; 