
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AddTask } from '@/components/AddTask';
import { TaskList } from '@/components/TaskList';
import { MazeProgress } from '@/components/MazeProgress';
import { Task } from '@/types';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (title: string) => {
    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };
    setTasks([newTask, ...tasks]);
  };

  const completeTask = (id: string) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const progress = tasks.length ? (tasks.filter(t => t.completed).length / tasks.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="text-4xl font-bold text-gray-900"
          >
            TaskMaze
          </motion.h1>
          <motion.p
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-600"
          >
            Transform your tasks into an adventure
          </motion.p>
        </header>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-medium text-gray-600">Progress</h2>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}%
            </span>
          </div>
          <MazeProgress progress={progress} />
        </div>

        <div className="space-y-6">
          <AddTask onAdd={addTask} />
          <TaskList
            tasks={tasks}
            onComplete={completeTask}
            onDelete={deleteTask}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Index;
