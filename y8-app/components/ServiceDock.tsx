'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Service definitions ───────────────────────────────────────────────────────

export interface ServiceOption {
  id:          string;
  label:       string;
  description: string;
  action:      string; // what the routed agent will do
}

export interface ServiceCategory {
  id:          string;
  icon:        string;
  label:       string;
  color:       string;
  description: string;
  options:     ServiceOption[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id:          'geo',
    icon:        '🗺️',
    label:       'Geo-Tag',
    color:       '#10b981',
    description: 'Location-based services and spatial markers',
    options: [
      { id: 'geo-pin',     label: 'Drop a Pin',          description: 'Tag your current location',              action: 'geo-tag'          },
      { id: 'geo-zone',    label: 'Create Zone',          description: 'Define a service area or boundary',      action: 'geo-zone'         },
      { id: 'geo-report',  label: 'Location Report',      description: 'Generate a geo-intelligence report',     action: 'geo-report'       },
      { id: 'geo-track',   label: 'Asset Tracking',       description: 'Track a person, vehicle, or asset',     action: 'geo-track'        },
    ],
  },
  {
    id:          'labor',
    icon:        '👷',
    label:       'Labor',
    color:       '#f59e0b',
    description: 'Skilled labor, task assignments, work orders',
    options: [
      { id: 'labor-post',  label: 'Post a Job',           description: 'List a task or work order',             action: 'labor-post'       },
      { id: 'labor-find',  label: 'Find Labor',           description: 'Match with available workers',          action: 'labor-match'      },
      { id: 'labor-escrow',label: 'Pay via Escrow',       description: 'Secure payment on Base chain',          action: 'labor-escrow'     },
      { id: 'labor-rate',  label: 'Rate & Review',        description: 'Submit a labor performance review',     action: 'labor-review'     },
    ],
  },
  {
    id:          'rides',
    icon:        '🚗',
    label:       'Ride-Share',
    color:       '#3b82f6',
    description: 'Transport requests and route matching',
    options: [
      { id: 'ride-request', label: 'Request a Ride',      description: 'Book transport now or later',           action: 'ride-request'     },
      { id: 'ride-offer',   label: 'Offer a Ride',        description: 'Register as a driver for this area',    action: 'ride-offer'       },
      { id: 'ride-pool',    label: 'Carpool',             description: 'Join an existing route',                action: 'ride-pool'        },
      { id: 'ride-pay',     label: 'Pay on Base',         description: 'Settle fare with Base ETH or USDC',     action: 'ride-pay'         },
    ],
  },
  {
    id:          'rooms',
    icon:        '🏠',
    label:       'Rooms',
    color:       '#8b5cf6',
    description: 'Short-term rooms, desks, and space rental',
    options: [
      { id: 'room-list',    label: 'List a Space',        description: 'Post a room, desk, or venue for rent',  action: 'room-list'        },
      { id: 'room-find',    label: 'Find a Room',         description: 'Browse available spaces nearby',        action: 'room-find'        },
      { id: 'room-book',    label: 'Book & Pay',          description: 'Reserve and pay on Base chain',         action: 'room-book'        },
      { id: 'room-review',  label: 'Leave a Review',      description: 'Rate a space you stayed in',            action: 'room-review'      },
    ],
  },
  {
    id:          'market',
    icon:        '🛍️',
    label:       'Market',
    color:       '#ec4899',
    description: 'Products and items for rent or sale',
    options: [
      { id: 'mkt-sell',     label: 'List for Sale',       description: 'Post an item to sell on Base',          action: 'market-sell'      },
      { id: 'mkt-rent',     label: 'List for Rent',       description: 'Post an item available to rent',        action: 'market-rent'      },
      { id: 'mkt-browse',   label: 'Browse Listings',     description: 'View items for sale or rent nearby',    action: 'market-browse'    },
      { id: 'mkt-offer',    label: 'Make an Offer',       description: 'Submit a bid or rental request',        action: 'market-offer'     },
    ],
  },
];

// ─── Option button ─────────────────────────────────────────────────────────────

function OptionButton({
  option,
  color,
  onSelect,
}: {
  option:    ServiceOption;
  color:     string;
  onSelect:  (option: ServiceOption) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <button
      id={`service-option-${option.id}`}
      onClick={() => onSelect(option)}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col items-start gap-1 p-3 px-3.5 rounded-lg text-left transition-all duration-150 w-full cursor-pointer"
      style={{
        border: `1px solid ${hover ? color + '66' : color + '22'}`,
        background: hover ? `${color}12` : 'rgba(10,10,30,0.6)',
      }}
    >
      <span className="font-semibold text-[13px]" style={{ color: hover ? color : '#e2e8f0' }}>
        {option.label}
      </span>
      <span className="text-slate-500 text-[11px] leading-relaxed">
        {option.description}
      </span>
    </button>
  );
}

// ─── Service panel (expands above dock) ───────────────────────────────────────

function ServicePanel({
  category,
  onSelect,
  onClose,
}: {
  category:  ServiceCategory;
  onSelect:  (cat: ServiceCategory, opt: ServiceOption) => void;
  onClose:   () => void;
}) {
  return (
    <motion.div
      id={`panel-${category.id}`}
      initial={{ opacity: 0, y: 15, scale: 0.95, x: '-50%' }}
      animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
      exit={{ opacity: 0, y: 15, scale: 0.95, x: '-50%' }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="absolute bottom-20 left-1/2 w-[min(360px,92vw)] bg-slate-950/95 rounded-2xl p-5 backdrop-blur-xl z-50"
      style={{
        border: `1px solid ${category.color}33`,
        boxShadow: `0 0 40px ${category.color}22, 0 8px 32px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <div className="font-bold text-sm tracking-widest uppercase" style={{ color: category.color }}>
              {category.label}
            </div>
            <div className="text-slate-500 text-[11px]">{category.description}</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="bg-none border-none text-slate-500 hover:text-slate-300 cursor-pointer text-lg px-1"
        >✕</button>
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2">
        {category.options.map((opt) => (
          <OptionButton
            key={opt.id}
            option={opt}
            color={category.color}
            onSelect={(o) => onSelect(category, o)}
          />
        ))}
      </div>
    </motion.div>
  );
}

// ─── Dock button ──────────────────────────────────────────────────────────────

function DockButton({
  category,
  isActive,
  onClick,
}: {
  category:  ServiceCategory;
  isActive:  boolean;
  onClick:   () => void;
}) {
  const [hover, setHover] = useState(false);
  const lit = isActive || hover;

  return (
    <button
      id={`dock-${category.id}`}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="flex flex-col items-center gap-1 py-2.5 px-3.5 rounded-xl cursor-pointer transition-all duration-150 min-w-[60px]"
      style={{
        border: `1px solid ${lit ? category.color + '55' : 'transparent'}`,
        background: lit ? `${category.color}18` : 'transparent',
        transform: lit ? 'translateY(-3px)' : 'none',
      }}
      title={category.label}
    >
      <span className="text-2xl leading-none">{category.icon}</span>
      <span
        className="text-[10px] font-semibold tracking-wider transition-colors duration-150"
        style={{ color: lit ? category.color : '#475569' }}
      >
        {category.label}
      </span>
      {isActive && (
        <span
          className="w-1 h-1 rounded-full mt-0.5"
          style={{ background: category.color }}
        />
      )}
    </button>
  );
}

// ─── Main ServiceDock ─────────────────────────────────────────────────────────

interface ServiceDockProps {
  /** Called when the user picks a service option — connect to useRouteAgent */
  onServiceSelect?: (category: ServiceCategory, option: ServiceOption) => void;
}

export default function ServiceDock({ onServiceSelect }: ServiceDockProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeCategory = SERVICE_CATEGORIES.find((c) => c.id === activeId) ?? null;

  function handleDockClick(id: string) {
    setActiveId(activeId === id ? null : id);
  }

  function handleOptionSelect(cat: ServiceCategory, opt: ServiceOption) {
    onServiceSelect?.(cat, opt);
    setActiveId(null);
  }

  return (
    <>
      {/* Expanded panel with Framer Motion AnimatePresence */}
      <AnimatePresence>
        {activeCategory && (
          <ServicePanel
            key={activeCategory.id}
            category={activeCategory}
            onSelect={handleOptionSelect}
            onClose={() => setActiveId(null)}
          />
        )}
      </AnimatePresence>

      {/* Dock bar */}
      <div
        id="y8-service-dock"
        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 p-2 px-3 bg-slate-950/80 border border-white/5 rounded-[18px] backdrop-blur-xl shadow-2xl z-40 max-w-[calc(100vw-32px)] overflow-x-auto"
      >
        {SERVICE_CATEGORIES.map((cat) => (
          <DockButton
            key={cat.id}
            category={cat}
            isActive={activeId === cat.id}
            onClick={() => handleDockClick(cat.id)}
          />
        ))}
      </div>
    </>
  );
}
