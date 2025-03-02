import './globals.css'
import styles from './page.module.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Provider from './auth/provider'
import { DataProvider } from "./context/DataContext";

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hypnagogia RPG',
  description: 'Inkvizítorok az Ellenállás nyomában',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Provider>
          <DataProvider>
            <main className={styles.main}>
              {children}
            </main>
          </DataProvider>
        </Provider>
      </body>
    </html>
  )
}
