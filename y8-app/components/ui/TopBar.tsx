"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import MenuOverlay from './MenuOverlay';

const TopBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header className={`topbar${scrolled ? ' topbar--scrolled' : ''}`} role="banner">
        {/* Logo */}
        <Link href="/" className="topbar__logo" aria-label="Y8 Home">
          <span className="topbar__logo-mark">Y8</span>
          <span className="topbar__logo-sub">Premier Lifestyle</span>
        </Link>

        {/* Right side controls */}
        <div className="topbar__controls">
          {isAuthenticated && user && (
            <div className="topbar__user" aria-label="Connected wallet">
              <span className="topbar__user-dot" />
              <span className="topbar__user-addr">
                {user.address.slice(0, 6)}…{user.address.slice(-4)}
              </span>
            </div>
          )}

          {/* Menu trigger */}
          <button
            id="menu-trigger-btn"
            className={`topbar__menu-btn${menuOpen ? ' topbar__menu-btn--open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="site-menu-overlay"
          >
            <span className="topbar__menu-icon">
              <span />
              <span />
              <span />
            </span>
            <span className="topbar__menu-label">{menuOpen ? 'Close' : 'Menu'}</span>
          </button>
        </div>
      </header>

      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default TopBar;
