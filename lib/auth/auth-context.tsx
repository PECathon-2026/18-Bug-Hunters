"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";

export type SubscriptionTier = "free" | "samurai" | "shogun";

export type UserProfile = {
  name: string;
  email?: string;
  title: string;
  rank: string;
  honorPoints: number;
  homeBase: string;
  isGuest: boolean;
  plan: SubscriptionTier;
  completedMissions?: string[];
  redeemedDiscounts?: string[];
};

const DEFAULT_GUEST: UserProfile = {
  name: "Ronin Traveler",
  email: "guest.ronin@tsukuyomi.io",
  title: "Guest Stargazer",
  rank: "Novice of the Night Sky",
  honorPoints: 240,
  homeBase: "Tokyo / Global Sky",
  isGuest: true,
  plan: "free",
  completedMissions: [],
  redeemedDiscounts: [],
};

type AuthContextType = {
  user: UserProfile;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  isLoginGateOpen: boolean;
  hasEnteredDojo: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openLoginGate: () => void;
  closeLoginGate: () => void;
  login: (name: string, email?: string) => void;
  continueAsGuest: () => void;
  logout: () => void;
  selectPlan: (tier: SubscriptionTier) => void;
  addHonorPoints: (points: number, reason?: string) => void;
  completeMission: (missionId: string, points: number) => boolean;
  redeemDiscount: (code: string) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "tsukuyomi_user_profile";
const ENTERED_KEY = "tsukuyomi_entered_session";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("tsukuyomi_auth_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("tsukuyomi_auth_change", callback);
  };
}

function getSnapshot() {
  return localStorage.getItem(STORAGE_KEY);
}

function getServerSnapshot() {
  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginGateOpen, setIsLoginGateOpen] = useState(false);
  const [hasEnteredDojo, setHasEnteredDojo] = useState(false);
  const rawStorage = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Check if session has previously entered
  useEffect(() => {
    try {
      const entered = sessionStorage.getItem(ENTERED_KEY);
      if (entered === "true") {
        setHasEnteredDojo(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const user = useMemo<UserProfile>(() => {
    if (!rawStorage) return DEFAULT_GUEST;
    try {
      const parsed = JSON.parse(rawStorage) as UserProfile;
      return {
        ...DEFAULT_GUEST,
        ...parsed,
        plan: parsed.plan || (parsed.isGuest ? "free" : "samurai"),
        completedMissions: parsed.completedMissions || [],
        redeemedDiscounts: parsed.redeemedDiscounts || [],
      };
    } catch {
      return DEFAULT_GUEST;
    }
  }, [rawStorage]);

  const isLoggedIn = !user.isGuest || user.plan !== "free";

  const notifyChange = (updated: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("tsukuyomi_auth_change"));
    } catch {
      // ignore
    }
  };

  const markEntered = () => {
    setHasEnteredDojo(true);
    setIsLoginGateOpen(false);
    try {
      sessionStorage.setItem(ENTERED_KEY, "true");
    } catch {
      // ignore
    }
  };

  const login = (name: string, email?: string) => {
    const formattedEmail = email?.trim() || "samurai.stargazer@tsukuyomi.io";
    const displayName = name.trim() || (email ? email.split("@")[0] : "Samurai Stargazer");
    const newUser: UserProfile = {
      name: displayName,
      email: formattedEmail,
      title: "Master of the Celestial Eye",
      rank: "Celestial Samurai · Rank 1",
      honorPoints: Math.max(user.honorPoints, 350),
      homeBase: "Hanle High Plateau",
      isGuest: false,
      plan: user.plan === "free" ? "samurai" : user.plan,
      completedMissions: user.completedMissions || [],
      redeemedDiscounts: user.redeemedDiscounts || [],
    };
    notifyChange(newUser);
    setIsAuthModalOpen(false);
    markEntered();
  };

  const continueAsGuest = () => {
    notifyChange({
      ...DEFAULT_GUEST,
      honorPoints: user.honorPoints || 240,
      completedMissions: user.completedMissions || [],
      redeemedDiscounts: user.redeemedDiscounts || [],
    });
    setIsAuthModalOpen(false);
    markEntered();
  };

  const selectPlan = (tier: SubscriptionTier) => {
    if (tier === "free") {
      notifyChange({
        ...user,
        plan: "free",
        rank: "Novice of the Night Sky",
        title: "Ronin Stargazer",
      });
    } else if (tier === "samurai") {
      notifyChange({
        ...user,
        name: user.name === "Ronin Traveler" ? "Samurai Stargazer" : user.name,
        plan: "samurai",
        rank: "Celestial Samurai · Rank 1",
        title: "Master of the Celestial Eye",
        honorPoints: Math.max(user.honorPoints, 500),
        isGuest: false,
      });
    } else if (tier === "shogun") {
      notifyChange({
        ...user,
        name: user.name === "Ronin Traveler" ? "Shogun Commander" : user.name,
        plan: "shogun",
        rank: "Night Sky Shogun · Grand Marshal",
        title: "Supreme Commander of the Celestial Realm",
        honorPoints: Math.max(user.honorPoints, 1000),
        isGuest: false,
      });
    }
  };

  const addHonorPoints = (points: number) => {
    const nextPoints = (user.honorPoints || 0) + points;
    let rank = user.rank;
    let title = user.title;
    if (nextPoints >= 1500) {
      rank = "Cosmic Daimyo · Grand Emperor";
      title = "Celestial Grandmaster of the Heavens";
    } else if (nextPoints >= 1000) {
      rank = "Night Sky Shogun · Grand Marshal";
      title = "Supreme Commander of the Celestial Realm";
    } else if (nextPoints >= 500) {
      rank = "Celestial Samurai · Rank 1";
      title = "Master of the Celestial Eye";
    } else if (nextPoints >= 200) {
      rank = "Sky Scout · Samurai Initiate";
      title = "Guardian of the Starlit Way";
    }

    notifyChange({
      ...user,
      honorPoints: nextPoints,
      rank,
      title,
    });
  };

  const completeMission = (missionId: string, points: number): boolean => {
    const list = user.completedMissions || [];
    if (list.includes(missionId)) return false;
    const updatedMissions = [...list, missionId];
    const nextPoints = (user.honorPoints || 0) + points;

    notifyChange({
      ...user,
      honorPoints: nextPoints,
      completedMissions: updatedMissions,
    });
    return true;
  };

  const redeemDiscount = (code: string) => {
    const list = user.redeemedDiscounts || [];
    if (!list.includes(code)) {
      notifyChange({
        ...user,
        redeemedDiscounts: [...list, code],
      });
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(ENTERED_KEY);
      setHasEnteredDojo(false);
      setIsLoginGateOpen(true);
      window.dispatchEvent(new Event("tsukuyomi_auth_change"));
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAuthModalOpen,
        isLoginGateOpen,
        hasEnteredDojo,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        openLoginGate: () => setIsLoginGateOpen(true),
        closeLoginGate: () => setIsLoginGateOpen(false),
        login,
        continueAsGuest,
        logout,
        selectPlan,
        addHonorPoints,
        completeMission,
        redeemDiscount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
