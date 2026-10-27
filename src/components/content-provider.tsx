"use client";
import { createContext, useContext } from "react";
import { emptyContent, type CMSContent } from "@/lib/cms-types";
const ContentContext = createContext<CMSContent>(emptyContent);
export function ContentProvider({
  value,
  children,
}: {
  value: CMSContent;
  children: React.ReactNode;
}) {
  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}
export const useContent = () => useContext(ContentContext);
