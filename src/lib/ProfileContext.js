"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "./supabase";

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [activeProfile, setActiveProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

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
        
        // Try to restore active profile from localStorage
        const savedProfileId = localStorage.getItem(`activeProfile_${user.id}`);
        if (savedProfileId) {
          const profile = data.find(p => p.id === savedProfileId);
          if (profile) {
            setActiveProfile(profile);
            setLoading(false);
            return;
          }
        }
        
        // Default to first profile if none saved
        if (data.length > 0) {
          setActiveProfile(data[0]);
          localStorage.setItem(`activeProfile_${user.id}`, data[0].id);
        }
      }
      setLoading(false);
    }

    loadProfiles();
  }, [user]);

  const changeProfile = (profileId) => {
    const profile = profiles.find(p => p.id === profileId);
    if (profile && user) {
      setActiveProfile(profile);
      localStorage.setItem(`activeProfile_${user.id}`, profile.id);
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
      loading
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileContext);
}
