"use client";

import { motion } from "framer-motion";

export default function SoundToggle({ enabled, onToggle }) {
  return (
    <motion.div 
      className="d-flex justify-content-end mb-2"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={onToggle}
        className="btn btn-sm btn-outline-secondary"
        aria-label="Toggle sound effects"
        title={enabled ? "Mute sounds" : "Enable sounds"}
      >
        {enabled ? "🔊 Sound On" : "🔇 Sound Off"}
      </button>
    </motion.div>
  );
}
