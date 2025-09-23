// src/contexts/jackpotContext.tsx
import { createContext, useContext } from "react";
import { useJackpot } from "../hooks/useJackpot";

const JackpotContext = createContext<ReturnType<typeof useJackpot> | null>(null);

export const JackpotProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const jackpot = useJackpot();
  return <JackpotContext.Provider value={jackpot}>{children}</JackpotContext.Provider>;
};

export const useJackpotContext = () => {
  const ctx = useContext(JackpotContext);
  if (!ctx) throw new Error("useJackpotContext must be used within JackpotProvider");
  return ctx;
};
