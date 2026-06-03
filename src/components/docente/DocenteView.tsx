import React, { useState } from 'react';
import { LayoutDashboard, CheckSquare, FileText, User } from 'lucide-react';
import { DocenteDashboard } from './DocenteDashboard';
import { DocenteActivities } from './DocenteActivities';
import { DocenteFiles } from './DocenteFiles';
import { DocenteProfile } from './DocenteProfile';
import { DocenteUploadModal } from './DocenteUploadModal';

interface DocenteViewProps {
  onLogout: () => void;
}

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
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-center gap-2 md:gap-4 shadow-sm z-10">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'dashboard' ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab('activities')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'activities' ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          Actividades
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'files' ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          Mis Archivos
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'profile' ? 'bg-[#2563eb] text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
          }`}
        >
          <User className="w-4 h-4" />
          Perfil
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8">
        {renderTabContent()}
      </div>

      <DocenteUploadModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
    </div>
  );
};
