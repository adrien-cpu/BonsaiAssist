import { useState, useEffect } from 'react';
import { BonsaiProfile, CareReminder, PruningSession } from '@/types';

export function useBonsaiData() {
  const [bonsaiProfiles, setBonsaiProfiles] = useState<BonsaiProfile[]>([]);
  const [careReminders, setCareReminders] = useState<CareReminder[]>([]);
  const [pruningSessions, setPruningSessions] = useState<PruningSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage or API
    loadBonsaiData();
  }, []);

  const loadBonsaiData = async () => {
    try {
      setIsLoading(true);
      
      // Load from localStorage for now
      const profiles = localStorage.getItem('bonsai-profiles');
      const reminders = localStorage.getItem('care-reminders');
      const sessions = localStorage.getItem('pruning-sessions');

      if (profiles) setBonsaiProfiles(JSON.parse(profiles));
      if (reminders) setCareReminders(JSON.parse(reminders));
      if (sessions) setPruningSessions(JSON.parse(sessions));
    } catch (error) {
      console.error('Error loading bonsai data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveBonsaiProfile = (profile: BonsaiProfile) => {
    const updatedProfiles = [...bonsaiProfiles];
    const existingIndex = updatedProfiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      updatedProfiles[existingIndex] = profile;
    } else {
      updatedProfiles.push(profile);
    }
    
    setBonsaiProfiles(updatedProfiles);
    localStorage.setItem('bonsai-profiles', JSON.stringify(updatedProfiles));
  };

  const deleteBonsaiProfile = (id: string) => {
    const updatedProfiles = bonsaiProfiles.filter(p => p.id !== id);
    setBonsaiProfiles(updatedProfiles);
    localStorage.setItem('bonsai-profiles', JSON.stringify(updatedProfiles));
  };

  const addCareReminder = (reminder: CareReminder) => {
    const updatedReminders = [...careReminders, reminder];
    setCareReminders(updatedReminders);
    localStorage.setItem('care-reminders', JSON.stringify(updatedReminders));
  };

  const updateCareReminder = (id: string, updates: Partial<CareReminder>) => {
    const updatedReminders = careReminders.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    setCareReminders(updatedReminders);
    localStorage.setItem('care-reminders', JSON.stringify(updatedReminders));
  };

  const deleteCareReminder = (id: string) => {
    const updatedReminders = careReminders.filter(r => r.id !== id);
    setCareReminders(updatedReminders);
    localStorage.setItem('care-reminders', JSON.stringify(updatedReminders));
  };

  const addPruningSession = (session: PruningSession) => {
    const updatedSessions = [...pruningSessions, session];
    setPruningSessions(updatedSessions);
    localStorage.setItem('pruning-sessions', JSON.stringify(updatedSessions));
  };

  return {
    bonsaiProfiles,
    careReminders,
    pruningSessions,
    isLoading,
    saveBonsaiProfile,
    deleteBonsaiProfile,
    addCareReminder,
    updateCareReminder,
    deleteCareReminder,
    addPruningSession,
    loadBonsaiData,
  };
}