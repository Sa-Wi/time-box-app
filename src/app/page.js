'use client';


import Sidebar from '@/components/Sidebar/Sidebar';
import TimeGrid from '@/components/TimeGrid/TimeGrid';
import CreateProfileForm from '@/components/CreateProfileForm/CreateProfileForm';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [view, setView] = useState('empty'); // 'empty', 'grid', 'create'
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();
  }, [router]);

  const handleSelectProfile = (profile) => {
    setSelectedProfile(profile);
    setView('grid');
  };

  const handleAddProfile = () => {
    setSelectedProfile(null);
    setView('create');
  };

  const handleProfileCreated = () => {
    setView('empty');
    window.location.reload(); 
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-zinc-950 text-white">Loading...</div>;
  if (!user) return null;

  return (
    <main className="flex min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none" />
      
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-40 md:hidden text-white hover:bg-white/10"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <Sidebar 
        userId={user.id}
        onSelectProfile={handleSelectProfile} 
        onAddProfile={handleAddProfile}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <section className="relative z-10 flex-1 ml-0 md:ml-72 p-4 md:p-8 h-screen overflow-y-auto custom-scrollbar">
        {view === 'empty' && (
          <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/20 rotate-3 hover:rotate-6 transition-transform duration-500">
              <span className="text-5xl font-bold text-white">T</span>
            </div>
            <h2 className="text-4xl font-bold mb-4 text-white tracking-tight">Welcome to TimeBox</h2>
            <p className="text-zinc-400 max-w-md text-lg leading-relaxed">
              Select a profile from the sidebar or create a new one to start visualizing your time.
            </p>
            <Button 
              onClick={handleAddProfile}
              className="mt-8 bg-white text-zinc-950 hover:bg-zinc-200 font-semibold h-12 px-8 rounded-full shadow-lg shadow-white/5 transition-all hover:scale-105"
            >
              Get Started
            </Button>
          </div>
        )}

        {view === 'create' && (
          <CreateProfileForm 
            userId={user.id}
            onSuccess={handleProfileCreated} 
            onCancel={() => setView('empty')} 
          />
        )}

        {view === 'grid' && selectedProfile && (
          <TimeGrid profile={selectedProfile} />
        )}
      </section>
    </main>
  );
}
