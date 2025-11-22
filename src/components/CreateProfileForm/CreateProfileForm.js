'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateProfileForm({ userId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: '',
    unit: 'day',
    color: '#3b82f6'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value) => {
    setFormData({ ...formData, unit: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .insert([{ ...formData, user_id: userId }]);

      if (error) throw error;
      onSuccess();
    } catch (error) {
      alert('Error creating profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-full animate-in zoom-in-95 duration-500">
      <Card className="w-full max-w-lg bg-zinc-950/80 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-white text-center">Create New Profile</CardTitle>
          <p className="text-zinc-400 text-center text-sm">Set up a new timeline to track your goals</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Profile Title</label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Project Deadline, Vacation Countdown"
                required
                className="bg-zinc-900/50 border-white/10 text-white placeholder:text-zinc-600 focus:ring-blue-500/50 h-11"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Start Date</label>
                <Input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  className="bg-zinc-900/50 border-white/10 text-white focus:ring-blue-500/50 h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">End Date</label>
                <Input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  className="bg-zinc-900/50 border-white/10 text-white focus:ring-blue-500/50 h-11"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Time Unit</label>
                <Select value={formData.unit} onValueChange={handleSelectChange}>
                  <SelectTrigger className="bg-zinc-900/50 border-white/10 text-white h-11 focus:ring-blue-500/50">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                    <SelectItem value="year">Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Theme Color</label>
                <div className="flex gap-2 items-center h-11 p-1.5 rounded-md bg-zinc-900/50 border border-white/10">
                  <Input
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    className="w-full h-full p-0 cursor-pointer border-0 rounded bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="w-full h-11 border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 bg-transparent">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-0 shadow-lg shadow-blue-900/20">
                {loading ? 'Creating...' : 'Create Profile'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
