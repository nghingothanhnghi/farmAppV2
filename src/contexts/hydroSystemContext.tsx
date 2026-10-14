import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useHydroSystemStore } from "../hooks/useHydroSystemStore";
import { useAuth } from "./authContext";

const HydroSystemContext = createContext<ReturnType<typeof useHydroSystemStore> | null>(null);

export const HydroSystemProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const value = useHydroSystemStore(isAuthenticated); // no polling/401s when logged out
  return <HydroSystemContext.Provider value={value}>{children}</HydroSystemContext.Provider>;
};

export const useHydroSystemContext = () => {
  const ctx = useContext(HydroSystemContext);
  if (!ctx) throw new Error("useHydroSystemContext must be used inside HydroSystemProvider");
  return ctx;
};