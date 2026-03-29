import React, { useState } from 'react';
import { 
  Menu, X, BookOpen, LayoutDashboard, Settings, 
  Search, LogOut, ChevronRight, GraduationCap,
  Sparkles, Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/sounds';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, color: 'text-sky-500' },
    { id: 'a2-vocab', label: 'A2 Vocabulary', icon: <BookOpen className="w-5 h-5" />, color: 'text-indigo-500' },
    { id: 'b1-vocab', label: 'B1 Vocabulary', icon: <Sparkles className="w-5 h-5" />, color: 'text-purple-500' },
    { id: 'courses', label: 'All Courses', icon: <GraduationCap className="w-5 h-5" />, color: 'text-amber-500' },
    { id: 'stats', label: 'Statistics', icon: <Layers className="w-5 h-5" />, color: 'text-emerald-500' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, color: 'text-slate-500' },
  ];

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={`sidebar-glass h-screen sticky top-0 z-50 flex flex-col transition-all duration-300 shadow-2xl overflow-hidden`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-800">Antigravity</span>
          </motion.div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-4 mt-6 space-y-2">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                playSound('select');
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative
                ${isActive ? 'active-nav-item text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}
              `}
            >
              <div className={`${!isActive && item.color} transition-colors group-hover:scale-110 duration-200`}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-bold text-sm tracking-wide"
                >
                  {item.label}
                </motion.span>
              )}
              {isActive && (
                <motion.div 
                  layoutId="active-nav"
                  className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100">
        <div className={`flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 ${isCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 border-2 border-white shadow-sm overflow-hidden">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">Nhật Trường</p>
              <p className="text-xs text-slate-500 truncate italic">A2 Learner</p>
            </div>
          )}
        </div>
        <button 
          className={`w-full mt-4 flex items-center gap-4 px-4 py-3 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-bold text-sm">Logout</span>}
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
