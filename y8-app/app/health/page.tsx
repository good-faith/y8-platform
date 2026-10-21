"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function HealthPage() {
  useEffect(() => { document.title = 'Health | Y8'; }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      <div style={{ background: '#ffffff', border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '12px', padding: '2.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.75rem', color: '#e91e63' }}>
          Y8 Health Services
        </h1>
        <p style={{ fontSize: '1rem', color: '#555', lineHeight: 1.7, marginBottom: '1.5rem' }}>
          Sanctuary care and wellness programs.
        </p>
        <Link
          href="/"
          style={{ display: 'inline-block', padding: '0.65rem 1.25rem', background: '#e91e63', color: '#ffffff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
