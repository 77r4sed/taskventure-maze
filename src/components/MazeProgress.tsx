
import React from 'react';
import { motion } from 'framer-motion';

interface MazeProgressProps {
  progress: number;
}

export const MazeProgress: React.FC<MazeProgressProps> = ({ progress }) => {
  return (
    <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
    </div>
  );
};
