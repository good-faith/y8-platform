"use client";

// components/Header.tsx
import React, { useState } from 'react';

const Header = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`header-wrapper${collapsed ? ' header-wrapper--collapsed' : ''}`}>
      <header className="header">
        {/* Original SVG — unchanged */}
        <svg preserveAspectRatio="xMidYMid slice" viewBox="0 0 1200 300">
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="#34A853" />
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
          <g>
            <line x1="0" y1="0" x2="1200" y2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="2">
              <animate attributeName="y1" from="-300" to="300" dur="10s" repeatCount="indefinite"/>
              <animate attributeName="y2" from="0" to="600" dur="10s" repeatCount="indefinite"/>
            </line>
            <line x1="0" y1="300" x2="1200" y2="300" stroke="rgba(0,0,0,0.1)" strokeWidth="2">
              <animate attributeName="y1" from="600" to="0" dur="12s" repeatCount="indefinite"/>
              <animate attributeName="y2" from="900" to="300" dur="12s" repeatCount="indefinite"/>
            </line>
          </g>
          <g>
            <line y1="0" x1="0" y2="300" x2="0" stroke="rgba(0,0,0,0.1)" strokeWidth="2">
              <animate attributeName="x1" from="-300" to="300" dur="11s" repeatCount="indefinite"/>
              <animate attributeName="x2" from="0" to="600" dur="11s" repeatCount="indefinite"/>
            </line>
            <line y1="0" x1="1200" y2="300" x2="1200" stroke="rgba(0,0,0,0.1)" strokeWidth="2">
              <animate attributeName="x1" from="1500" to="900" dur="13s" repeatCount="indefinite"/>
              <animate attributeName="x2" from="1200" to="600" dur="13s" repeatCount="indefinite"/>
            </line>
          </g>
        </svg>

        <div className="header-content">
          <h1>Y8</h1>
          <p>Premier lifestyle services for everyone.</p>
        </div>
      </header>

      {/* Collapse toggle button — sits on the bottom edge of the header */}
      <button
        className="header-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expand header' : 'Collapse header'}
        aria-expanded={!collapsed}
      >
        <svg
          className="header-collapse-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>
    </div>
  );
};

export default Header;