"use client";

import { motion } from "framer-motion";

export function AnimatedCheck({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
        checked ? "bg-brand-green border-brand-green" : "border-ios-gray"
      }`}
    >
      {checked && (
        <motion.svg
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.2 }}
            points="20 6 9 17 4 12"
          />
        </motion.svg>
      )}
    </motion.button>
  );
}
