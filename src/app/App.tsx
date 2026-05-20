import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Dashboard } from '../components/layout/Dashboard';
import { ChecklistView } from '../components/layout/ChecklistView';
import { LoginScreen } from '../components/auth/LoginScreen';
import { IndicatorHeader } from '../components/indicators/IndicatorHeader';
import { IndicatorStatsCards } from '../components/indicators/IndicatorStatsCards';
import { IndicatorContent } from '../components/indicators/IndicatorContent';
import { EvidenceTable } from '../components/evidences/EvidenceTable';
import { EvidenceUploadModal } from '../components/evidences/EvidenceUploadModal';
import { EvidenceHistoryModal } from '../components/evidences/EvidenceHistoryModal';
import { CoordinatorEvidenceEditor } from '../components/coordinator/CoordinatorEvidenceEditor';

import { useAuth } from '../hooks/useAuth';
import { useIndicators } from '../hooks/useIndicators';
import { useEvidences } from '../hooks/useEvidences';
import { useNotifications } from '../hooks/useNotifications';
import { useFileUpload } from '../hooks/useFileUpload';

import { calculateIndicatorProgress, getIndicatorStats } from '../utils/progressUtils';
import { Indicator, Requirement } from '../types';

export default function App() {
  const { isAuthenticated, userRole, login, logout, switchRole, user } = useAuth();
  const {
    mockData,
    selectedIndicator,
    expandedNodes,
    focusedNodeId,
    setSelectedIndicator,
    setFocusedNodeId,
    toggleNode,
    selectIndicator
  } = useIndicators();

  const [viewMode, setViewMode] = useState<'dashboard' | 'indicator' | 'checklist'>('dashboard');
  const [activeRequirement, setActiveRequirement] = useState<Requirement | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const {
    allFiles,
    getRequirementFiles,
    uploadFile
  } = useEvidences();

  const {
    notifications,
    showNotifications,
    markAsRead,
    clearAll,
    toggleShow,
    refreshNotifications
  } = useNotifications();

  const {
    file: uploadFileContent,
    observation: uploadObs,
    setObservation: setUploadObs,
    onFileChange,
    reset: resetUpload
  } = useFileUpload();

  const handleIndicatorSelect = (indicator: Indicator) => {
    selectIndicator(indicator);
    setViewMode('indicator');
  };

  const handleSaveUpload = async () => {
    if (!activeRequirement || !selectedIndicator || !uploadFileContent || !user) return;

    try {
      await uploadFile(uploadFileContent, selectedIndicator, activeRequirement, user.name, uploadObs);
      setIsUploadOpen(false);
      resetUpload();
      refreshNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const getVisibleNodes = () => {
    const nodes: { id: string; type: string; data?: any }[] = [];

    mockData.forEach(yearPeriod => {
      const yearId = yearPeriod.year.toString();
      nodes.push({ id: yearId, type: 'year', data: yearPeriod });
      if (!expandedNodes.has(yearId)) return;

      yearPeriod.criteria.forEach(criterion => {
        const criterionId = `crit-${criterion.id}`;
        nodes.push({ id: criterionId, type: 'crit', data: criterion });
        if (!expandedNodes.has(criterionId)) return;

        criterion.subCriteria.forEach(subCriterion => {
          const subCriterionId = `sub-${subCriterion.id}`;
          nodes.push({ id: subCriterionId, type: 'sub', data: subCriterion });
          if (!expandedNodes.has(subCriterionId)) return;

          subCriterion.indicators.forEach(indicator => {
            nodes.push({ id: `ind-${indicator.code}`, type: 'ind', data: indicator });
          });
        });
      });
    });

    return nodes;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    const visibleNodes = getVisibleNodes();
    const currentIndex = visibleNodes.findIndex(node => node.id === focusedNodeId);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (currentIndex < visibleNodes.length - 1) setFocusedNodeId(visibleNodes[currentIndex + 1].id);
        else if (focusedNodeId === null && visibleNodes.length > 0) setFocusedNodeId(visibleNodes[0].id);
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (currentIndex > 0) setFocusedNodeId(visibleNodes[currentIndex - 1].id);
        break;
      case 'ArrowRight':
        event.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-') && !expandedNodes.has(focusedNodeId)) {
          toggleNode(focusedNodeId);
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-') && expandedNodes.has(focusedNodeId)) {
          toggleNode(focusedNodeId);
        }
        break;
      case 'Enter':
        event.preventDefault();
        if (!focusedNodeId) break;
        {
          const node = visibleNodes.find(item => item.id === focusedNodeId);
          if (node?.type === 'ind') handleIndicatorSelect(node.data);
          else toggleNode(focusedNodeId);
        }
        break;
    }
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      <Sidebar
        mockData={mockData}
        selectedIndicator={selectedIndicator}
        expandedNodes={expandedNodes}
        focusedNodeId={focusedNodeId}
        userRole={userRole}
        onIndicatorSelect={handleIndicatorSelect}
        onDashboardClick={() => {
          setSelectedIndicator(null);
          setViewMode('dashboard');
        }}
        onToggleNode={toggleNode}
        onSetFocusedNode={setFocusedNodeId}
        onKeyDown={handleKeyDown}
        onSwitchRole={switchRole}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={logout}
          notifications={notifications}
          showNotifications={showNotifications}
          onToggleNotifications={toggleShow}
          onMarkAsRead={markAsRead}
          onClearAllNotifications={clearAll}
        />

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {!selectedIndicator ? (
              <Dashboard
                mockData={mockData}
                allFiles={allFiles}
                onIndicatorSelect={handleIndicatorSelect}
                onViewChecklist={() => setViewMode('checklist')}
                onToggleNode={toggleNode}
              />
            ) : viewMode === 'checklist' ? (
              <ChecklistView
                mockData={mockData}
                onIndicatorSelect={handleIndicatorSelect}
                onBackToDashboard={() => setViewMode('dashboard')}
              />
            ) : (
              <motion.div
                key={selectedIndicator.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-5xl mx-auto"
              >
                <IndicatorContent>
                  <IndicatorHeader
                    indicator={selectedIndicator}
                    progress={calculateIndicatorProgress(selectedIndicator, allFiles)}
                    onBackToDashboard={() => setViewMode('dashboard')}
                  />

                  <IndicatorStatsCards stats={getIndicatorStats(selectedIndicator, allFiles)} />

                  <EvidenceTable
                    indicator={selectedIndicator}
                    userRole={userRole}
                    getRequirementFiles={requirementId => getRequirementFiles(requirementId, selectedIndicator.code)}
                    onOpenUpload={requirement => {
                      setActiveRequirement(requirement);
                      setIsUploadOpen(true);
                      resetUpload();
                    }}
                    onOpenEditor={requirement => {
                      setActiveRequirement(requirement);
                      setIsEditorOpen(true);
                    }}
                    onOpenHistory={requirement => {
                      setActiveRequirement(requirement);
                      setIsHistoryOpen(true);
                    }}
                  />
                </IndicatorContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <EvidenceUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        activeRequirement={activeRequirement}
        uploadForm={{ file: uploadFileContent, obs: uploadObs }}
        onFileChange={onFileChange}
        onObsChange={setUploadObs}
        onSave={handleSaveUpload}
        isGenerating={false}
      />

      <EvidenceHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        activeRequirement={activeRequirement}
        files={selectedIndicator && activeRequirement ? getRequirementFiles(activeRequirement.id, selectedIndicator.code) : []}
      />

      <AnimatePresence>
        {isEditorOpen && selectedIndicator && activeRequirement && (
          <CoordinatorEvidenceEditor
            indicator={selectedIndicator}
            requirement={activeRequirement}
            files={getRequirementFiles(activeRequirement.id, selectedIndicator.code)}
            currentUser={user}
            onClose={() => setIsEditorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
