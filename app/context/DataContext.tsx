"use client";

import { createContext, useContext, useState, ReactNode } from "react";

const DataContext = createContext<any>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<any>(null);

  return (
    <DataContext.Provider value={{ data, setData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}