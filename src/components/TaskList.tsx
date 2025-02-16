
import React from 'react';
import { Task } from '@/types';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onComplete: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({ tasks, onComplete, onDelete }) => {
  return (
    <div className="space-y-3 w-full max-w-md mx-auto">
      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={cn(
              "glass p-4 rounded-lg flex items-center justify-between gap-4",
              "transform transition-all duration-200 hover:translate-y-[-2px]",
              task.completed && "bg-green-50/50"
            )}
          >
            <div className="flex items-center gap-3 flex-1">
              <button
                onClick={() => onComplete(task.id)}
                className={cn(
                  "w-6 h-6 rounded-full border-2 flex items-center justify-center",
                  "transition-all duration-200",
                  task.completed 
                    ? "bg-green-500 border-green-500" 
                    : "border-gray-300 hover:border-green-500"
                )}
              >
                {task.completed && <Check size={14} className="text-white" />}
              </button>
              <div className="flex-1">
                <p className={cn(
                  "font-medium",
                  task.completed && "text-gray-400 line-through"
                )}>
                  {task.title}
                </p>
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                    <Clock size={12} />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
