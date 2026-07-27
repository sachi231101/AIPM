import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { studentProfileService } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { toast } from "react-toastify";

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  const [profilesList, setProfilesList] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  const [loadingProfiles, setLoadingProfiles] = useState(false);

  const fetchProfiles = useCallback(async () => {
    if (!isStudent) return;
    try {
      setLoadingProfiles(true);
      const res = await studentProfileService.getAll();
      const profiles = res.data.data || [];
      setProfilesList(profiles);

      const savedActiveId = localStorage.getItem("apms_active_profile_id");
      let selected = profiles.find((p) => String(p.id) === String(savedActiveId));
      if (!selected) {
        selected = profiles.find((p) => p.is_default) || profiles[0] || null;
      }

      if (selected) {
        setActiveProfile(selected);
        localStorage.setItem("apms_active_profile_id", selected.id);
      }
    } catch (err) {
      console.error("Failed to load profiles", err);
    } finally {
      setLoadingProfiles(false);
    }
  }, [isStudent]);

  useEffect(() => {
    if (isStudent) {
      fetchProfiles();
    } else {
      setProfilesList([]);
      setActiveProfile(null);
    }
  }, [isStudent, fetchProfiles]);

  const switchProfile = (profileOrId) => {
    const targetId = typeof profileOrId === "object" ? profileOrId.id : profileOrId;
    const found = profilesList.find((p) => String(p.id) === String(targetId));
    if (found) {
      setActiveProfile(found);
      localStorage.setItem("apms_active_profile_id", found.id);
      toast.info(`Switched active career profile to "${found.profile_name}"`, { autoClose: 2000 });
    }
  };

  const createProfile = async (formData) => {
    try {
      const res = await studentProfileService.create(formData);
      const newProfile = res.data.data;
      toast.success(`Career Profile "${newProfile.profile_name}" created! 🎉`);
      await fetchProfiles();
      switchProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create profile.");
      throw err;
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profilesList,
        activeProfile,
        loadingProfiles,
        fetchProfiles,
        switchProfile,
        createProfile,
        setActiveProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    return {
      profilesList: [],
      activeProfile: null,
      loadingProfiles: false,
      fetchProfiles: () => {},
      switchProfile: () => {},
      createProfile: async () => {},
      setActiveProfile: () => {},
    };
  }
  return context;
}
