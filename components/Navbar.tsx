'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useSearchParams } from 'next/navigation'
import { useState, Suspense, useEffect } from 'react'
import logo from '@/app/images/logomil.png'

const links = [
  { href: '/',                                                                                                                    label: 'მთავარი',       exact: true  },
  { href: '/items?category=%E1%83%A2%E1%83%90%E1%83%9C%E1%83%A1%E1%83%90%E1%83%AA%E1%83%9B%E1%83%94%E1%83%9A%E1%83%98',        label: 'ტანსაცმელი',   exact: false },
  { href: '/items?category=%E1%83%90%E1%83%A5%E1%83%A1%E1%83%94%E1%83%A1%E1%83%A3%E1%83%90%E1%83%A0%E1%83%94%E1%83%91%E1%83%98', label: 'აქსესუარები', exact: false },
  { href: '/items?category=%E1%83%A1%E1%83%AE%E1%83%95%E1%83%90',                                                                label: 'სხვა ნივთები', exact: false },
  { href: '/contact',                                                                                                             label: 'კონტაქტი',      exact: true  },
]

function useActiveLink() {
  const pathname    = usePathname()
  const searchParams = useSearchParams()
  const category    = searchParams.get('category')

  return (href: string, exact: boolean) => {
    if (exact) return pathname === href.split('?')[0] && !category
    const url = new URL(href, 'http://x')
    return pathname === url.pathname && category === url.searchParams.get('category')
  }
}

function NavLinks() {
  const isActive = useActiveLink()
  return (
    <div className="hidden lg:flex items-center gap-1">
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
  const isActive = useActiveLink()

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <div
      className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-200 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Drawer — slides down from top */}
      <div
        className={`absolute top-0 left-0 right-0 bg-white shadow-xl transition-transform duration-300 ease-out ${open ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* Drawer header with logo + close */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Link href="/" onClick={onClose}>
            <Image src={logo} alt="ათასნლეულის სკოლა" height={52} className="object-contain" />
          </Link>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="დახურვა"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Links */}
        <nav className="px-4 py-4 space-y-1">
          {links.map(({ href, label, exact }) => (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center w-full px-4 py-4 rounded-xl text-base font-medium transition-all font-sans ${
                isActive(href, exact)
                  ? 'bg-brand-light text-brand-dark font-semibold'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="h-6" /> {/* bottom breathing room */}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 lg:h-24">

            <Link href="/" className="flex items-center">
              <Image
                src={logo}
                alt="ათასნლეულის სკოლა"
                height={100}
                className="object-contain h-[52px] sm:h-[70px] lg:h-[90px] w-auto"
              />
            </Link>

            <Suspense fallback={<div className="hidden lg:flex gap-1" />}>
              <NavLinks />
            </Suspense>

            {/* Hamburger — mobile/tablet only */}
            <button
              className="lg:hidden w-11 h-11 flex items-center justify-center rounded-xl text-gray-600 hover:bg-gray-50 transition-colors active:bg-gray-100"
              onClick={() => setMenuOpen(o => !o)}
              aria-label="მენიუ"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      <Suspense fallback={null}>
        <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      </Suspense>
    </>
  )
}
