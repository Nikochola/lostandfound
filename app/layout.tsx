import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'დაკარგული & ნაპოვნი — ათასწლეულის სკოლა',
  description: 'ათასწლეულის სკოლის დაკარგული და ნაპოვნი ნივთები',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ka">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Georgian:wght@300;400;500;600;700&family=Noto+Serif+Georgian:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-gray-100 bg-white mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
            <span className="text-sm text-gray-400 font-sans">
              © 2026 ათასნლეულის სკოლა
            </span>
            <a href="/admin" className="text-xs text-gray-300 hover:text-gray-400 font-sans transition-colors">
              ადმინი
            </a>
          </div>
        </footer>
      </body>
    </html>
  )
}
