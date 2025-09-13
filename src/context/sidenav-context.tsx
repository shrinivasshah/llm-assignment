import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SidenavContextType {
  isOpen: boolean;
  openSidenav: () => void;
  closeSidenav: () => void;
  toggleSidenav: () => void;
}

const SidenavContext = createContext<SidenavContextType | undefined>(undefined);

interface SidenavProviderProps {
  children: ReactNode;
}

export const SidenavProvider: React.FC<SidenavProviderProps> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const openSidenav = () => setIsOpen(true);
  const closeSidenav = () => setIsOpen(false);
  const toggleSidenav = () => setIsOpen(!isOpen);

  const value: SidenavContextType = {
    isOpen,
    openSidenav,
    closeSidenav,
    toggleSidenav,
  };

  return (
    <SidenavContext.Provider value={value}>{children}</SidenavContext.Provider>
  );
};

export const useSidenavContext = (): SidenavContextType => {
  const context = useContext(SidenavContext);
  if (context === undefined) {
    throw new Error('useSidenavContext must be used within a SidenavProvider');
  }
  return context;
};
