'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import logo from '@/app/images/logomil.png'

const links = [
  { href: '/',                                    label: 'მთავარი',       exact: true  },
  { href: '/items?category=%E1%83%A2%E1%83%90%E1%83%9C%E1%83%A1%E1%83%90%E1%83%AA%E1%83%9B%E1%83%94%E1%83%9A%E1%83%98', label: 'ტანსაცმელი',   exact: false },
  { href: '/items?category=%E1%83%90%E1%83%A5%E1%83%A1%E1%83%94%E1%83%A1%E1%83%A3%E1%83%90%E1%83%A0%E1%83%94%E1%83%91%E1%83%98', label: 'აქსესუარები', exact: false },
  { href: '/items?category=%E1%83%A1%E1%83%AE%E1%83%95%E1%83%90',                                                          label: 'სხვა ნივთები', exact: false },
  { href: '/contact',                             label: 'კონტაქტი',      exact: true  },
]

function NavLinks() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href.split('?')[0] && !category
    const url = new URL(href, 'http://x')
    return pathname === url.pathname && category === url.searchParams.get('category')
  }

  return (
    <div className="hidden sm:flex items-center gap-1">
      {links.map(({ href, label, exact }) => (
        <Link
          key={href}
          href={href}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 font-sans ${
            isActive(href, exact)
              ? 'bg-brand-light text-brand-dark font-semibold'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const category = searchParams.get('category')

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href.split('?')[0] && !category
    const url = new URL(href, 'http://x')
    return pathname === url.pathname && category === url.searchParams.get('category')
  }

  if (!open) return null
  return (
    <div className="sm:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
      {links.map(({ href, label, exact }) => (
        <Link
          key={href}
          href={href}
          onClick={onClose}
          className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all font-sans ${
            isActive(href, exact)
              ? 'bg-brand-light text-brand-dark'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">

          <Link href="/" className="flex items-center">
            <Image src={logo} alt="ათასნლეულის სკოლა" height={100} className="object-contain" />
          </Link>

          <Suspense fallback={<div className="hidden sm:flex gap-1" />}>
            <NavLinks />
          </Suspense>

          <button
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-50"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="მენიუ"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      <Suspense fallback={null}>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </Suspense>
    </nav>
  )
}
