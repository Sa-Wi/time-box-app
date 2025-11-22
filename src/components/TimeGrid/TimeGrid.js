'use client';

import { calculateTimeDifference, getPassedTime } from '@/utils/dateUtils';
import { useMemo, useState, useDeferredValue } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function TimeGrid({ profile }) {
  const { id, title, start_date, end_date, unit: initialUnit, color: initialColor } = profile;
  const [unit, setUnit] = useState(initialUnit);
  const [color, setColor] = useState(initialColor || '#3b82f6');
  const [updating, setUpdating] = useState(false);

  const deferredUnit = useDeferredValue(unit);
  
  const totalUnits = useMemo(() => calculateTimeDifference(start_date, end_date, unit), [start_date, end_date, unit]);
  const passedUnits = useMemo(() => getPassedTime(start_date, unit), [start_date, unit]);
  const remainingUnits = Math.max(0, totalUnits - passedUnits);
  const percentage = Math.min(100, Math.round((passedUnits / totalUnits) * 100));

  const handleUnitChange = async (value) => {
    setUnit(value);
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ unit: value })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating unit:', error);
    } finally {
      setUpdating(false);
    }
  };

  const handleColorChange = async (newColor) => {
    setColor(newColor);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ color: newColor })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating color:', error);
    }
  };

  const boxes = useMemo(() => {
    const deferredTotal = calculateTimeDifference(start_date, end_date, deferredUnit);
    const deferredPassed = getPassedTime(start_date, deferredUnit);
    
    if (deferredTotal > 20000) {
      return <div className="text-muted-foreground italic p-8 text-center w-full">Too many items to display. Please select a larger unit.</div>;
    }

    return Array.from({ length: deferredTotal }, (_, i) => {
      const isFilled = i < deferredPassed;
      
      return (
        <div
          key={i}
          className={`w-4 h-4 md:w-5 md:h-5 rounded-md transition-all duration-300 ${
            isFilled 
              ? 'shadow-[0_0_10px_rgba(0,0,0,0.2)] hover:brightness-110 hover:scale-110 z-10' 
              : 'bg-white/5 border border-white/5 hover:bg-white/10'
          }`}
          style={isFilled ? { 
            backgroundColor: color,
            boxShadow: `0 0 15px ${color}40`
          } : {}}
          title={`${deferredUnit} ${i + 1}`}
        />
      );
    });
  }, [start_date, end_date, deferredUnit, color]);

  return (
    <div className="flex flex-col gap-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 shrink-0 pl-12 md:pl-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-zinc-400 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 rounded-full bg-zinc-700"></span>
              {new Date(start_date).toLocaleDateString(undefined, { dateStyle: 'long' })} - {new Date(end_date).toLocaleDateString(undefined, { dateStyle: 'long' })}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-[140px]">
              <Select value={unit} onValueChange={handleUnitChange} disabled={updating}>
                <SelectTrigger className="bg-zinc-900/50 border-white/10 text-white h-10 rounded-xl focus:ring-blue-500/50">
                  <SelectValue placeholder="Unit" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="day">Days</SelectItem>
                  <SelectItem value="week">Weeks</SelectItem>
                  <SelectItem value="month">Months</SelectItem>
                  <SelectItem value="year">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10 bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl">
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle>Edit Appearance</DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-zinc-400">Accent Color</label>
                    <div className="flex gap-3 items-center p-3 rounded-xl bg-white/5 border border-white/10">
                      <Input
                        type="color"
                        value={color}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-12 h-12 p-1 cursor-pointer rounded-lg bg-transparent border-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-white">Selected Color</span>
                        <span className="text-xs text-zinc-500 uppercase">{color}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: `Total ${unit}s`, value: totalUnits, color: "text-zinc-400" },
          { label: "Passed", value: passedUnits, color: "text-blue-400" },
          { label: "Remaining", value: remainingUnits, color: "text-emerald-400" },
          { label: "Progress", value: `${percentage}%`, color: "text-purple-400" }
        ].map((stat, i) => (
          <div key={i} className="bg-zinc-900/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col gap-1 shadow-lg shadow-black/20 hover:bg-zinc-900/60 transition-colors">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{stat.label}</span>
            <span className={`text-3xl font-bold ${stat.color} tracking-tight`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-zinc-900/20 border border-white/5 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-inner">
        <div className="flex flex-wrap gap-1.5">
          {boxes}
        </div>
      </div>
    </div>
  );
}
