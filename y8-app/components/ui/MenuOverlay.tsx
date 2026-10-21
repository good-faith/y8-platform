"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { signOut } from 'next-auth/react';

// ─── Nav items with icons (inline SVG for zero-dep) ───────────────────────────
const navItems = [
  {
    href: '/',
    label: 'Home',
    description: 'Your personal dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/space',
    label: 'Space',
    description: 'Explore your universe',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>
      </svg>
    ),
  },
  {
    href: '/food',
    label: 'Food',
    description: 'Curated culinary experiences',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 010 8h-1"/>
        <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/>
        <line x1="10" y1="1" x2="10" y2="4"/>
        <line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
  },
  {
    href: '/energy',
    label: 'Energy',
    description: 'Power your lifestyle',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    href: '/health',
    label: 'Health',
    description: 'Wellness for body & mind',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
  },
  {
    href: '/about-us',
    label: 'About',
    description: 'Our story & mission',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
];

// ─── Component ─────────────────────────────────────────────────────────────────
interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const MenuOverlay = ({ isOpen, onClose }: MenuOverlayProps) => {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Focus first item when opened; return focus to trigger on close
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => firstLinkRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  // Backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      id="site-menu-overlay"
      ref={overlayRef}
      className={`menu-overlay${isOpen ? ' menu-overlay--open' : ''}`}
      aria-hidden={!isOpen}
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      onClick={handleBackdropClick}
    >
      {/* Close button */}
      <button
        className="menu-overlay__close"
        onClick={onClose}
        aria-label="Close menu"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Decorative background accent */}
      <div className="menu-overlay__accent" aria-hidden="true" />

      {/* Inner content */}
      <div className="menu-overlay__inner">
        {/* Eyebrow */}
        <p className="menu-overlay__eyebrow">Navigate</p>

        {/* Nav grid */}
        <nav className="menu-overlay__grid" aria-label="Main navigation">
          {navItems.map((item, idx) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                ref={idx === 0 ? firstLinkRef : undefined}
                className={`menu-card${isActive ? ' menu-card--active' : ''}`}
                style={{ '--delay': `${idx * 60}ms` } as React.CSSProperties}
                onClick={onClose}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="menu-card__icon">{item.icon}</span>
                <span className="menu-card__label">{item.label}</span>
                <span className="menu-card__desc">{item.description}</span>
                <span className="menu-card__arrow" aria-hidden="true">→</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="menu-overlay__bottom">
          {isAuthenticated && user ? (
            <div className="menu-overlay__auth">
              <span className="menu-overlay__wallet">
                <span className="menu-overlay__wallet-dot" />
                {user.address.slice(0, 6)}…{user.address.slice(-4)}
              </span>
              <button
                className="menu-overlay__signout"
                onClick={() => { signOut(); onClose(); }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <p className="menu-overlay__tagline">Premier lifestyle services for everyone.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MenuOverlay;
