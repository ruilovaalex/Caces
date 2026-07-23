import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, CheckSquare, FileText, User } from 'lucide-react';
import { DocenteDashboard } from './DocenteDashboard';
import { DocenteActivities } from './DocenteActivities';
import { DocenteFiles } from './DocenteFiles';
import { DocenteProfile } from './DocenteProfile';
import { DocenteUploadModal } from './DocenteUploadModal';
import { hoverScale, tapScale } from '../../utils/animations';

interface DocenteViewProps {
  onLogout: () => void;
}

const tabs = [
  { key: 'dashboard' as const, label: 'Dashboard', Icon: LayoutDashboard },
  { key: 'activities' as const, label: 'Actividades', Icon: CheckSquare },
  { key: 'files' as const, label: 'Mis Archivos', Icon: FileText },
  { key: 'profile' as const, label: 'Perfil', Icon: User },
];

export const DocenteView = ({ onLogout }: DocenteViewProps) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'activities' | 'files' | 'profile'>('dashboard');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DocenteDashboard 
                  onViewAllFiles={() => setActiveTab('files')} 
                  onViewAllActivities={() => setActiveTab('activities')} 
                />;
      case 'activities':
        return <DocenteActivities onOpenUploadModal={() => setIsUploadModalOpen(true)} />;
      case 'files':
        return <DocenteFiles onOpenUploadModal={() => setIsUploadModalOpen(true)} />;
      case 'profile':
        return <DocenteProfile onLogout={onLogout} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f4f6f9]">
      {/* Docente Navigation Menu */}
      <nav aria-label="Portal docente" className="order-2 z-20 flex shrink-0 items-center justify-around gap-1 overflow-x-auto border-t border-slate-200 bg-white px-2 py-2 md:order-none md:justify-center md:border-b md:border-t-0 md:px-6 md:py-3">
        {tabs.map(({ key, label, Icon }) => (
          <motion.button
            key={key}
            onClick={() => setActiveTab(key)}
            aria-current={activeTab === key ? 'page' : undefined}
            whileHover={hoverScale}
            whileTap={tapScale}
            className={`relative flex min-h-11 items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition-colors ${
              activeTab === key ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </motion.button>
        ))}
      </nav>

      <div className="order-1 flex-1 overflow-y-auto p-4 sm:p-6 md:order-none md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      <DocenteUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
};
