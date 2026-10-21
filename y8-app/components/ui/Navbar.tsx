"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/about-us', label: 'About Us' },
  { href: '/shop', label: 'Shop' },
  { href: '/blog', label: 'Blog' },
  { href: '/calendar', label: 'Calendar' },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  // Check if we're on mobile and reset menu state when window is resized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    setIsOpen(false);
    await logout();
  };

  return (
    <nav className="slimmenu-container">
      <button 
        className={`hamburger-menu ${isOpen ? 'open' : ''}`} 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <AnimatePresence>
        {(isOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { y: -50, opacity: 0 } : {}}
            animate={isMobile ? { y: 0, opacity: 1 } : {}}
            exit={isMobile ? { y: -50, opacity: 0 } : {}}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={`slimmenu ${isOpen ? 'open' : ''}`}
            style={isMobile ? { position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 150 } : {}}
          >
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? 'active' : ''}
                  onClick={() => isMobile && setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
            
            {/* Show logout button if authenticated */}
            {isAuthenticated && user && (
              <div className="border-t border-slate-700/60 pt-2 mt-2">
                <div className="text-[13px] text-slate-400 pb-2">
                  {user.address.slice(0, 6)}...{user.address.slice(-4)}
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full p-2 bg-red-600 hover:bg-red-700 text-white border-none rounded cursor-pointer text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;