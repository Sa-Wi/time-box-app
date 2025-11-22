'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Sidebar({ userId, onSelectProfile, onAddProfile, isOpen, onClose }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (userId) {
      fetchProfiles();
    }
  }, [userId]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProfile = (profile) => {
    setSelectedId(profile.id);
    onSelectProfile(profile);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh list
      setProfiles(profiles.filter(p => p.id !== id));
      if (selectedId === id) {
        onSelectProfile(null);
        setSelectedId(null);
      }
    } catch (error) {
      console.error('Error deleting profile:', error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-72 h-screen border-r border-white/10 flex flex-col p-6 fixed left-0 top-0 z-30 transition-transform duration-300 ease-in-out
        bg-zinc-950/95 backdrop-blur-xl shadow-2xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">TimeBox</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden text-white/60 hover:text-white hover:bg-white/10" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : (
            profiles.map((profile) => (
              <div
                key={profile.id}
                className={`group relative flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 border ${
                  selectedId === profile.id 
                    ? 'bg-white/10 border-white/10 shadow-inner' 
                    : 'hover:bg-white/5 border-transparent hover:border-white/5'
                }`}
                onClick={() => handleSelectProfile(profile)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <div 
                    className={`w-2 h-8 rounded-full shrink-0 transition-all duration-300 ${selectedId === profile.id ? 'scale-y-100' : 'scale-y-50 group-hover:scale-y-75'}`}
                    style={{ backgroundColor: profile.color || '#3b82f6', boxShadow: `0 0 10px ${profile.color}40` }}
                  />
                  <span className={`truncate font-medium transition-colors ${selectedId === profile.id ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                    {profile.title}
                  </span>
                </div>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-all duration-200 text-white/40 hover:text-red-400 hover:bg-red-400/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-zinc-900 border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Profile?</AlertDialogTitle>
                      <AlertDialogDescription className="text-zinc-400">
                        This will permanently delete "{profile.title}". This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={(e) => e.stopPropagation()} className="bg-transparent border-white/10 text-white hover:bg-white/5 hover:text-white">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 text-white hover:bg-red-700 border-none"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(profile.id);
                        }}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            ))
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-3">
          <Button onClick={onAddProfile} className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 border-0 h-11 rounded-xl font-medium transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-4 w-4" /> New Profile
          </Button>
          <Button variant="ghost" onClick={handleLogout} className="w-full text-white/40 hover:text-white hover:bg-white/5 h-10 rounded-xl">
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
