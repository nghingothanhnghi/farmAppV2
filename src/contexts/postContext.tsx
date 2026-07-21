// src/contexts/postContext.tsx
import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { usePost } from "../hooks/usePost";

interface PostProviderProps {
  children: ReactNode;
}

const PostContext = createContext<ReturnType<typeof usePost> | null>(null);

export const PostProvider = ({ children }: PostProviderProps) => {
  const post = usePost();

  return (
    <PostContext.Provider value={post}>
      {children}
    </PostContext.Provider>
  );
};

export const usePostContext = () => {
  const ctx = useContext(PostContext);
  if (!ctx) throw new Error("usePostContext must be used inside PostProvider");
  return ctx;
};