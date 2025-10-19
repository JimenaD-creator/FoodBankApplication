import React, { createContext, useContext, useState, ReactNode } from "react";

interface ActiveTabContextType {
  activeTab: "home" | "dashboard" | "profile";
  setActiveTab: (tab: "home" | "dashboard" | "profile") => void;
}

const ActiveTabContext = createContext<ActiveTabContextType>({
  activeTab: "home",
  setActiveTab: () => {},
});

export const ActiveTabProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<"home" | "dashboard" | "profile">("home");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
};

export const useActiveTab = () => useContext(ActiveTabContext);
