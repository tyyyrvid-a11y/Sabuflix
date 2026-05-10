"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCensored, setIsCensored] = useState(true);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load profiles when user changes
  useEffect(() => {
    async function loadProfiles() {
      if (!user) {
        setProfiles([]);
        setActiveProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!error && data) {
        setProfiles(data);
        
        // Try to restore active profile from sessionStorage (persists only for current tab session)
        const savedProfileId = sessionStorage.getItem(`activeProfile_${user.id}`);
        if (savedProfileId) {
          const profile = data.find(p => p.id === savedProfileId);
          if (profile) {
            setActiveProfile(profile);
            const savedCensor = localStorage.getItem(`censor_${profile.id}`);
            setIsCensored(savedCensor === null ? true : savedCensor === 'true');
            setLoading(false);
            return;
          }
        }
        
        // If no profile is saved in session, we leave activeProfile as null 
        // to force the user to choose one.

      }
      setLoading(false);
    }

    loadProfiles();
  }, [user]);

  const changeProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile && user) {
      setActiveProfile(profile);
      sessionStorage.setItem(`activeProfile_${user.id}`, profile.id);
      const savedCensor = localStorage.getItem(`censor_${profile.id}`);
      setIsCensored(savedCensor === null ? true : savedCensor === 'true');
    }
  };

  const toggleCensor = () => {
    if (activeProfile) {
      const newValue = !isCensored;
      setIsCensored(newValue);
      localStorage.setItem(`censor_${activeProfile.id}`, newValue.toString());
    }
  };

  const addProfile = async (name, avatar = "default") => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("profiles")
      .insert([{ user_id: user.id, name, avatar }])
      .select()
      .single();

    if (!error && data) {
      setProfiles(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  return (
    <ProfileContext.Provider value={{
      user,
      activeProfile,
      profiles,
      changeProfile,
      addProfile,
      loading,
      isCensored,
      toggleCensor
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
