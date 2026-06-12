import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Dashboard } from '../components/layout/Dashboard';
import { ChecklistView } from '../components/layout/ChecklistView';
import { LoginScreen } from '../components/auth/LoginScreen';
import { IndicatorHeader } from '../components/indicators/IndicatorHeader';
import { IndicatorContent } from '../components/indicators/IndicatorContent';
import { EvidenceTable } from '../components/evidences/EvidenceTable';
import { EvidenceUploadModal } from '../components/evidences/EvidenceUploadModal';
import { EvidenceHistoryModal } from '../components/evidences/EvidenceHistoryModal';
import { CoordinatorEvidenceEditor } from '../components/coordinator/CoordinatorEvidenceEditor';
import { AssignmentsView } from '../components/assignments/AssignmentsView';
import { DocenteView } from '../components/docente/DocenteView';
import { TemplatesView } from '../components/templates/TemplatesView';

import { useAuth } from '../hooks/useAuth';
import { useIndicators } from '../hooks/useIndicators';
import { useEvidences } from '../hooks/useEvidences';
import { useNotifications } from '../hooks/useNotifications';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAssignments } from '../hooks/useAssignments';

import { getIndicatorCurrentStatus } from '../utils/progressUtils';
import { getReadableAllowedFormats, isFileAllowedForRequirement } from '../utils/evidenceFormatUtils';
import {
  canAccessAssignments,
  canAccessRepository,
  canAccessTemplates,
  canUserDelete,
  canUserUpload
} from '../utils/permissions';
import { viewTransition } from '../utils/animations';
import { getAcademicPeriodsForYear } from '../utils/academicPeriodUtils';
import { EvidenceFolder, Indicator, Requirement, Status } from '../types';

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
    selectIndicator,
    openCriterionSubCriteria
  } = useIndicators();

  const [activeRequirement, setActiveRequirement] = useState<Requirement | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isAssignmentsOpen, setIsAssignmentsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [uploadFolders, setUploadFolders] = useState<EvidenceFolder[]>([]);
  const [selectedUploadFolderId, setSelectedUploadFolderId] = useState('');

  const {
    allFiles,
    getRequirementFiles,
    uploadFile,
    updateStatus,
    deleteEvidence
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

  useAssignments();

  useEffect(() => {
    if (userRole === 'DOCENTE') {
      setIsEditorOpen(false);
      setIsUploadOpen(false);
      setIsHistoryOpen(false);
      setIsChecklistOpen(false);
      setIsTemplatesOpen(false);
      setActiveRequirement(null);
      setSelectedIndicator(null);
      setIsAssignmentsOpen(false);
      return;
    }

    if (!canAccessAssignments(userRole) && isAssignmentsOpen) {
      setIsAssignmentsOpen(false);
    }

    if (!canAccessTemplates(userRole) && isTemplatesOpen) {
      setIsTemplatesOpen(false);
    }

    if (!canAccessRepository(userRole)) {
      setIsChecklistOpen(false);
      setSelectedIndicator(null);
    }

    if (!canUserUpload(userRole)) {
      setIsEditorOpen(false);
      setIsUploadOpen(false);
      setActiveRequirement(null);
    }

    if (userRole === 'EVALUADOR') {
      setIsHistoryOpen(false);
      setIsTemplatesOpen(false);
      setIsAssignmentsOpen(false);
    }
  }, [isAssignmentsOpen, isTemplatesOpen, setSelectedIndicator, userRole]);

  const handleIndicatorSelect = useCallback((indicator: Indicator) => {
    setIsChecklistOpen(false);
    setIsAssignmentsOpen(false);
    setIsTemplatesOpen(false);
    selectIndicator(indicator);
  }, [selectIndicator]);

  const handleGoToStart = useCallback(() => {
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setIsChecklistOpen(false);
    setIsAssignmentsOpen(false);
    setIsTemplatesOpen(false);
    setActiveRequirement(null);
    setSelectedIndicator(null);
  }, [setSelectedIndicator]);

  const handleOpenTemplates = useCallback(() => {
    if (!canAccessTemplates(userRole)) return;
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setIsChecklistOpen(false);
    setIsAssignmentsOpen(false);
    setActiveRequirement(null);
    setSelectedIndicator(null);
    setIsTemplatesOpen(true);
  }, [setSelectedIndicator, userRole]);

  const handleOpenAssignments = useCallback(() => {
    if (!canAccessAssignments(userRole)) return;
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setIsChecklistOpen(false);
    setIsTemplatesOpen(false);
    setActiveRequirement(null);
    setSelectedIndicator(null);
    setIsAssignmentsOpen(true);
  }, [setSelectedIndicator, userRole]);

  const handleSaveUpload = async () => {
    if (!canUserUpload(userRole)) return;
    if (!activeRequirement || !selectedIndicator || !uploadFileContent || !user) return;
    if (!isFileAllowedForRequirement(uploadFileContent, activeRequirement)) {
      window.alert(`Formato no permitido. Para esta evidencia solo se acepta: ${getReadableAllowedFormats(activeRequirement.format)}.`);
      return;
    }

    try {
      const selectedUploadFolder = uploadFolders.find(folder => folder.id === selectedUploadFolderId) || null;
      await uploadFile(uploadFileContent, selectedIndicator, activeRequirement, user.name, uploadObs, selectedUploadFolder);
      setIsUploadOpen(false);
      setSelectedUploadFolderId('');
      setUploadFolders([]);
      resetUpload();
      refreshNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  const handleReviewUpdate = (evidenceId: string, status: Status, observation?: string) => {
    updateStatus(evidenceId, status, observation);
    refreshNotifications();
  };

  const visibleNodes = useMemo(() => {
    const nodes: { id: string; type: string; data?: any }[] = [];

    mockData.forEach(yearPeriod => {
      const yearId = yearPeriod.year.toString();
      nodes.push({ id: yearId, type: 'year', data: yearPeriod });
      if (!expandedNodes.has(yearId)) return;

      getAcademicPeriodsForYear(yearPeriod.year).forEach(period => {
        nodes.push({ id: period.id, type: 'period', data: period });
        if (!expandedNodes.has(period.id)) return;

        yearPeriod.criteria.forEach(criterion => {
          const criterionId = `${period.id}-crit-${criterion.id}`;
          nodes.push({ id: criterionId, type: 'crit', data: criterion });
          if (!expandedNodes.has(criterionId)) return;

          criterion.subCriteria.forEach(subCriterion => {
            const subCriterionId = `${period.id}-sub-${subCriterion.id}`;
            nodes.push({ id: subCriterionId, type: 'sub', data: subCriterion });
            if (!expandedNodes.has(subCriterionId)) return;

            subCriterion.indicators.forEach(indicator => {
              nodes.push({ id: `${period.id}-ind-${indicator.code}`, type: 'ind', data: indicator });
            });
          });
        });
      });
    });

    return nodes;
  }, [expandedNodes, mockData]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
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

  const canOpenAssignments = canAccessAssignments(userRole);
  const canOpenRepository = canAccessRepository(userRole);
  const activeView = selectedIndicator
    ? 'indicator'
    : isTemplatesOpen
      ? 'templates'
    : isAssignmentsOpen && canOpenAssignments
      ? 'assignments'
      : isChecklistOpen
        ? 'checklist'
        : 'dashboard';
  const selectedIndicatorContext = useMemo(() => {
    if (!selectedIndicator) return null;

    for (const yearPeriod of mockData) {
      for (const criterion of yearPeriod.criteria) {
        for (const subCriterion of criterion.subCriteria) {
          if (subCriterion.indicators.some(indicator => indicator.code === selectedIndicator.code)) {
            return {
              criterionName: criterion.name,
              subCriterionName: subCriterion.name
            };
          }
        }
      }
    }

    return null;
  }, [mockData, selectedIndicator]);

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="flex h-screen bg-[#f4f6f9] font-sans text-slate-800">
      <Sidebar
        mockData={mockData}
        selectedIndicator={selectedIndicator}
        expandedNodes={expandedNodes}
        focusedNodeId={focusedNodeId}
        userRole={userRole}
        onIndicatorSelect={handleIndicatorSelect}
        onToggleNode={toggleNode}
        onSetFocusedNode={setFocusedNodeId}
        onKeyDown={handleKeyDown}
        onSwitchRole={switchRole}
        activeView={activeView}
        onOpenDashboard={handleGoToStart}
        onOpenTemplates={handleOpenTemplates}
        onOpenAssignments={handleOpenAssignments}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={logout}
          notifications={notifications}
          showNotifications={showNotifications}
          onToggleNotifications={toggleShow}
          onMarkAsRead={markAsRead}
          onClearAllNotifications={clearAll}
          userName={user?.name}
          userRole={userRole}
        />

        {userRole === 'DOCENTE' ? (
          <DocenteView onLogout={logout} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-[#f4f6f9]">
            <AnimatePresence mode="wait">
              {!selectedIndicator && canOpenRepository && !isChecklistOpen && !isTemplatesOpen && (!isAssignmentsOpen || !canOpenAssignments) && (
                <motion.div key="dashboard" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <Dashboard
                    mockData={mockData}
                    allFiles={allFiles}
                    onIndicatorSelect={handleIndicatorSelect}
                    onViewChecklist={() => setIsChecklistOpen(true)}
                    onOpenCriterionSubCriteria={openCriterionSubCriteria}
                    onOpenAssignments={handleOpenAssignments}
                    canManageAssignments={canOpenAssignments}
                  />
                </motion.div>
              )}

              {!selectedIndicator && canOpenRepository && isChecklistOpen && !isAssignmentsOpen && !isTemplatesOpen && (
                <motion.div key="checklist" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <ChecklistView
                    mockData={mockData}
                    onIndicatorSelect={handleIndicatorSelect}
                    onBackToDashboard={handleGoToStart}
                  />
                </motion.div>
              )}

              {!selectedIndicator && isTemplatesOpen && canAccessTemplates(userRole) && (
                <motion.div key="templates" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <TemplatesView />
                </motion.div>
              )}

              {!selectedIndicator && isAssignmentsOpen && canOpenAssignments && !isTemplatesOpen && (
                <motion.div key="assignments" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <AssignmentsView userRole={userRole} mockData={mockData} />
                </motion.div>
              )}

              {selectedIndicator && canOpenRepository && (
                <motion.div
                  key="indicator"
                  variants={viewTransition}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="max-w-5xl mx-auto"
                >
              <IndicatorContent>
                <IndicatorHeader
                  indicator={selectedIndicator}
                  status={getIndicatorCurrentStatus(selectedIndicator, allFiles)}
                  onBackToDashboard={handleGoToStart}
                />

                <EvidenceTable
                  indicator={selectedIndicator}
                  userRole={userRole}
                  getRequirementFiles={requirementId => getRequirementFiles(requirementId, selectedIndicator.code)}
                  onOpenUpload={(requirement, folders = []) => {
                    if (!canUserUpload(userRole)) return;
                    setActiveRequirement(requirement);
                    setUploadFolders(folders);
                    setSelectedUploadFolderId('');
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
                  onReviewStatus={handleReviewUpdate}
                />
              </IndicatorContent>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <EvidenceUploadModal
        isOpen={isUploadOpen && canUserUpload(userRole)}
        onClose={() => {
          setIsUploadOpen(false);
          setSelectedUploadFolderId('');
          setUploadFolders([]);
        }}
        activeRequirement={activeRequirement}
        folders={uploadFolders}
        selectedFolderId={selectedUploadFolderId}
        onFolderChange={setSelectedUploadFolderId}
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
        onDeleteFile={canUserDelete(userRole) ? deleteEvidence : undefined}
      />

      {isEditorOpen && selectedIndicator && activeRequirement && (
        <CoordinatorEvidenceEditor
          indicator={selectedIndicator}
          requirement={activeRequirement}
          files={getRequirementFiles(activeRequirement.id, selectedIndicator.code)}
          userRole={userRole}
          currentUser={user}
          criterionName={selectedIndicatorContext?.criterionName}
          subCriterionName={selectedIndicatorContext?.subCriterionName}
          onClose={() => setIsEditorOpen(false)}
          onGoHome={handleGoToStart}
          onUpdateEvidenceStatus={handleReviewUpdate}
        />
      )}
    </div>
  );
}
