"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Calendar, MessageSquare, ShieldCheck, Cpu, Code, Users, Globe, ExternalLink } from 'lucide-react';
import styles from '../../styles/About.module.css';

export default function AboutUsPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' as const }
    }
  };

  return (
    <div className={styles.container}>
      {/* Hero Header Banner */}
      <section className={styles.heroSection}>
        <div className={styles.heroGlow}></div>
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className={styles.heroContent}
        >
          <div className={styles.avatarContainer}>
            <div className={styles.avatarHalo}></div>
            <span className={styles.avatarIcon}>🚀</span>
          </div>
          <h1 className={styles.title}>Project Y8 Architecture</h1>
          <p className={styles.subtitle}>
            A decentralized PWA portal coordinating edge infrastructure telemetry, localized safe transaction zones, and AI swarm orchestration.
          </p>
        </motion.div>
      </section>

      {/* Main Content Grid */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={styles.bentoGrid}
      >
        
        {/* Core Development Chronicles: AI & Operator Jason */}
        <motion.div variants={itemVariants} className={`${styles.bentoCard} ${styles.cardFull}`}>
          <div className={styles.cardHeader}>
            <Users className="h-5 w-5 text-teal-400" />
            <h2>Development Chronicles: Operator Jason & AI Pair-Programming</h2>
          </div>
          <div className={styles.devStory}>
            <p>
              Project Y8 was constructed through a collaborative pair-programming sequence between <strong>Operator Jason</strong> (Human Systems Lead) and <strong>Antigravity</strong> (AI System Architect). Operating within a high-frequency workspace, we successfully designed, compiled, and integrated five major functional modules under strict Web3 compliance structures.
            </p>
            <div className={styles.devMilestones}>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>🤖</span>
                <div>
                  <strong>AI System Logic</strong>
                  <span>Custom background agent runners, scheduling presets, and simulated response bot telemetry.</span>
                </div>
              </div>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>📡</span>
                <div>
                  <strong>Hardware & Geolocation</strong>
                  <span>Haversine spatial geometry resolving proximity calculations between operators and local physical nodes.</span>
                </div>
              </div>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>🔒</span>
                <div>
                  <strong>PWA & Offline Registry</strong>
                  <span>Fully integrated web manifest specifications and service worker runtime interceptors for complete offline functionality.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Feature Card: Shop */}
        <motion.div variants={itemVariants} className={styles.bentoCard}>
          <div className={styles.cardHeader}>
            <ShoppingBag className="h-5 w-5 text-pink-400" />
            <h2>Franchise Shop & Node Registry</h2>
          </div>
          <p className={styles.cardText}>
            Provides license minting pipelines for localized physical franchises. Operators register infrastructure assets (food domes, compute servers, therapeutic sanctuaries) with custom attributes (IP address, location coordinates, storage capacity).
          </p>
          <div className={styles.cardBadgeContainer}>
            <span className={styles.cardBadge}>Space Albedo</span>
            <span className={styles.cardBadge}>Hydroponics</span>
            <span className={styles.cardBadge}>Virtual Power Grid</span>
            <span className={styles.cardBadge}>Biometric Locks</span>
          </div>
        </motion.div>

        {/* Feature Card: Blog */}
        <motion.div variants={itemVariants} className={styles.bentoCard}>
          <div className={styles.cardHeader}>
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h2>GPS Chat Rooms & Map Listings</h2>
          </div>
          <p className={styles.cardText}>
            Enables secure, geographically locked community chat rooms. Integrates browser GPS telemetry to automatically resolve the user's nearest Safe Purchase Zone, stamp postings with zone context, and project live trade offers (rideshare, labor, tools) onto an interactive 3D globe visualization.
          </p>
          <div className={styles.cardBadgeContainer}>
            <span className={styles.cardBadge}>GPS Tracking</span>
            <span className={styles.cardBadge}>3D Globe HUD</span>
            <span className={styles.cardBadge}>Trade Filters</span>
            <span className={styles.cardBadge}>Live Peer Bot</span>
          </div>
        </motion.div>

        {/* Feature Card: Calendar */}
        <motion.div variants={itemVariants} className={styles.bentoCard}>
          <div className={styles.cardHeader}>
            <Calendar className="h-5 w-5 text-amber-400" />
            <h2>AI Swarm Agent Scheduler</h2>
          </div>
          <p className={styles.cardText}>
            A centralized dashboard where operators schedule autonomous AI work agents on a calendar timeline. Built with presets for digital growth pipelines (such as automating video outreach, subscribers, views, and social media likes optimization).
          </p>
          <div className={styles.cardBadgeContainer}>
            <span className={styles.cardBadge}>AI Swarms</span>
            <span className={styles.cardBadge}>Outreach Automation</span>
            <span className={styles.cardBadge}>Job Schedules</span>
            <span className={styles.cardBadge}>Cron Execution</span>
          </div>
        </motion.div>

        {/* Feature Card: PWA & Offline Tech */}
        <motion.div variants={itemVariants} className={styles.bentoCard}>
          <div className={styles.cardHeader}>
            <Globe className="h-5 w-5 text-emerald-400" />
            <h2>Progressive Web App Architecture</h2>
          </div>
          <p className={styles.cardText}>
            Ensures Project Y8 operates reliably under weak network coverage or complete blackout conditions. A native service worker pre-caches static resources, caches dynamic routes on fetch, and handles offline page loads cleanly.
          </p>
          <div className={styles.cardBadgeContainer}>
            <span className={styles.cardBadge}>Network-First</span>
            <span className={styles.cardBadge}>Offline Fallback</span>
            <span className={styles.cardBadge}>Dynamic Cache</span>
            <span className={styles.cardBadge}>Web Manifest</span>
          </div>
        </motion.div>

        {/* Feature Card: Proof-of-Entropy */}
        <motion.div variants={itemVariants} className={`${styles.bentoCard} ${styles.cardFull}`}>
          <div className={styles.cardHeader}>
            <ShieldCheck className="h-5 w-5 text-purple-400" />
            <h2>Proof-of-Entropy (PoE) Cryptographic Harvesting</h2>
          </div>
          <div className={styles.devStory}>
            <p>
              Project Y8 incorporates a consent-based cryptographic telemetry harvesting engine called <strong>Proof-of-Entropy (PoE)</strong>. Instead of relying on invasive tracking or central servers, PoE collects local operator inputs directly inside the browser sandbox, converting them into secure cryptographic seed hashes.
            </p>
            <div className={styles.devMilestones}>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>🖱️</span>
                <div>
                  <strong>Input Harvesting</strong>
                  <span>Gathers mouse track movement vectors (+1.2 bits) and physical keypresses (+4.8 bits) locally in the browser memory.</span>
                </div>
              </div>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>🽽</span>
                <div>
                  <strong>Oculus Quest VR Link</strong>
                  <span>Synchronizes simulated/real Meta Quest headset coordinates and Touch controller motion coordinates (+12.8 bits).</span>
                </div>
              </div>
              <div className={styles.milestone}>
                <span className={styles.milestoneIcon}>⚖️</span>
                <div>
                  <strong>Ledger Commits</strong>
                  <span>Committing a completed 512-bit entropy block generates a secure seed block on the ledger and awards +100 Operator XP.</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
