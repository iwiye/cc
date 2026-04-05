'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { WHATSAPP_URL, NAV_LINKS } from '@/lib/constants'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    const el = document.querySelector(href)
    el?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-200"
        style={{
          backgroundColor: isScrolled ? 'rgba(255,255,255,0.9)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(12px)' : 'none',
          boxShadow: isScrolled ? '0 4px 24px rgba(15,44,111,.1)' : 'none',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => { e.preventDefault(); handleNavClick('#hero') }}
            className="text-2xl font-bold transition-colors duration-200"
            style={{
              fontFamily: 'var(--font-playfair, Georgia, serif)',
              color: isScrolled ? '#0F2C6F' : '#ffffff',
            }}
          >
            SchoolMo
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm transition-colors duration-200 hover:opacity-100"
                style={{
                  fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                  color: isScrolled ? 'rgba(15,44,111,0.8)' : 'rgba(255,255,255,0.85)',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold transition-opacity duration-200 hover:opacity-90 px-6 py-2.5"
              style={{
                fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                backgroundColor: '#F0A500',
                color: '#0A1628',
                borderRadius: '999px',
              }}
              aria-label="Évaluation gratuite via WhatsApp"
            >
              Évaluation gratuite
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 transition-colors duration-200"
            style={{ color: isScrolled ? '#0F2C6F' : '#ffffff' }}
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Ouvrir le menu"
          >
            <Menu size={24} />
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      <div
        className="md:hidden fixed inset-0 z-50 transition-all duration-300"
        style={{
          visibility: isMobileMenuOpen ? 'visible' : 'hidden',
          pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
        }}
        aria-hidden={!isMobileMenuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            backgroundColor: 'rgba(10,22,40,0.5)',
            opacity: isMobileMenuOpen ? 1 : 0,
          }}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        {/* Slide-in panel */}
        <div
          className="absolute top-0 right-0 h-full w-3/4 max-w-sm bg-white flex flex-col p-6 transition-transform duration-300"
          style={{ transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <button
            className="self-end mb-8 p-1"
            style={{ color: '#0F2C6F' }}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Fermer le menu"
          >
            <X size={24} />
          </button>
          <nav className="flex flex-col gap-6 flex-1" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-lg font-semibold text-left focus:outline-none focus-visible:ring-2"
                style={{
                  fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
                  color: '#0F2C6F',
                }}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-center font-semibold py-3 px-6 text-base"
            style={{
              fontFamily: 'var(--font-dm-sans, system-ui, sans-serif)',
              backgroundColor: '#F0A500',
              color: '#0A1628',
              borderRadius: '999px',
            }}
          >
            Évaluation gratuite
          </a>
        </div>
      </div>
    </>
  )
}
