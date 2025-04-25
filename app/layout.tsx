'use client';

import './globals.css';
import styles from './page.module.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import { DataProvider } from './context/DataContext';
import Link from 'next/link';
import { StyleProvider, useStyle } from './context/StyleProvider';

const inter = Inter({ subsets: ['latin'] });

// Create AuthContext
const AuthContext = createContext<any>(null);

// AuthProvider to manage authentication logic
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser: any) => {
      setUser(currentUser); // Set the authenticated user
    });

    return () => unsubscribe(); // Cleanup the listener on unmount
  }, []);

  const handleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      console.log('User signed in:', result.user);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log('User signed out');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, handleSignIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use AuthContext
export function useAuth() {
  return useContext(AuthContext);
}

// RootLayout component
function RootLayout({ children }: { children: React.ReactNode }) {
  const { gameStyle } = useStyle();
  return (
    <html lang="en">
      <body className={inter.className} style={gameStyle}>
        <AuthProvider>
          <DataProvider>
            <header className={styles.header}>
              <Link href="/"> ☜ </Link>
            </header>
            <main className={styles.main}>{children}</main>
            <footer className={styles.footer}>♣♦♠</footer>
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

const StyledRoodLayout = (props: any) => {
  return (
    <StyleProvider>
      <RootLayout {...props} />
    </StyleProvider>
  );
}

export default StyledRoodLayout;