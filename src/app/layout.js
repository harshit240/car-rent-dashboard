import { Inter } from 'next/font/google'
import './globals.css'
import { AppProvider } from './context/AppContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Car Rental Admin Dashboard',
  description: 'Admin dashboard for managing car rental listings',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}