import React, { createContext, ReactNode, useContext, useState } from "react";

const StyleContext = createContext<any>(null);

export function StyleProvider({ children }: { children: ReactNode }) {
  const [gameStyle, setGameStyle] = useState({}); // Default styles

  return (
    <StyleContext.Provider value={{ gameStyle, setGameStyle }}>
      {children}
    </StyleContext.Provider>
  );
}

export function useStyle() {
  return useContext(StyleContext);
}