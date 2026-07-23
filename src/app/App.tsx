import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { LoginScreen } from '../components/auth/LoginScreen';
import { IndicatorHeader } from '../components/indicators/IndicatorHeader';
import { IndicatorContent } from '../components/indicators/IndicatorContent';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

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
import { CoordinatorAssignmentService } from '../services/coordinatorAssignmentService';
import {
  filterMockDataByAssignedIndicators,
  getIndicatorCodesFromMockData
} from '../utils/coordinatorIndicatorFilterUtils';
import { EvidenceFolder, Indicator, Requirement, Status } from '../types';
import { useToast } from '../components/common/Toast';

type AppView = 'dashboard' | 'checklist' | 'indicator' | 'templates' | 'assignments';

const CoordinatorEvidenceEditor = lazy(() => import('../components/coordinator/CoordinatorEvidenceEditor').then(module => ({ default: module.CoordinatorEvidenceEditor })));
const AssignmentsView = lazy(() => import('../components/assignments/AssignmentsView').then(module => ({ default: module.AssignmentsView })));
const DocenteView = lazy(() => import('../components/docente/DocenteView').then(module => ({ default: module.DocenteView })));
const TemplatesView = lazy(() => import('../components/templates/TemplatesView').then(module => ({ default: module.TemplatesView })));
const Dashboard = lazy(() => import('../components/layout/Dashboard').then(module => ({ default: module.Dashboard })));
const ChecklistView = lazy(() => import('../components/layout/ChecklistView').then(module => ({ default: module.ChecklistView })));
const EvidenceTable = lazy(() => import('../components/evidences/EvidenceTable').then(module => ({ default: module.EvidenceTable })));
const EvidenceUploadModal = lazy(() => import('../components/evidences/EvidenceUploadModal').then(module => ({ default: module.EvidenceUploadModal })));
const EvidenceHistoryModal = lazy(() => import('../components/evidences/EvidenceHistoryModal').then(module => ({ default: module.EvidenceHistoryModal })));

export default function App() {
  const { showToast } = useToast();
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
  const [appView, setAppView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [uploadFolders, setUploadFolders] = useState<EvidenceFolder[]>([]);
  const [selectedUploadFolderId, setSelectedUploadFolderId] = useState('');
  const [assignmentVersion, setAssignmentVersion] = useState(0);

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

  const assignedIndicatorCodes = useMemo(() => {
    if (userRole !== 'COORDINADOR' || !user?.id) return [];
    return CoordinatorAssignmentService.getAssignedIndicatorCodes(user.id);
  }, [assignmentVersion, user?.id, userRole]);

  const visibleMockData = useMemo(() => {
    if (userRole !== 'COORDINADOR') return mockData;
    return filterMockDataByAssignedIndicators(mockData, assignedIndicatorCodes);
  }, [assignedIndicatorCodes, mockData, userRole]);

  const visibleIndicatorCodes = useMemo(
    () => new Set(getIndicatorCodesFromMockData(visibleMockData)),
    [visibleMockData]
  );

  const isCoordinatorScopeFiltered = userRole === 'COORDINADOR' && assignedIndicatorCodes.length > 0;

  const refreshCoordinatorAssignments = useCallback(() => {
    setAssignmentVersion(version => version + 1);
  }, []);

  useEffect(() => {
    if (userRole === 'DOCENTE') {
      setIsEditorOpen(false);
      setIsUploadOpen(false);
      setIsHistoryOpen(false);
      setAppView('dashboard');
      setActiveRequirement(null);
      setSelectedIndicator(null);
      return;
    }

    if (!canAccessAssignments(userRole) && appView === 'assignments') {
      setAppView('dashboard');
    }

    if (!canAccessTemplates(userRole) && appView === 'templates') {
      setAppView('dashboard');
    }

    if (!canAccessRepository(userRole)) {
      setAppView('dashboard');
      setSelectedIndicator(null);
    }

    if (!canUserUpload(userRole)) {
      setIsEditorOpen(false);
      setIsUploadOpen(false);
      setActiveRequirement(null);
    }

    if (userRole === 'EVALUADOR') {
      setIsHistoryOpen(false);
      if (appView === 'templates' || appView === 'assignments') setAppView('dashboard');
    }
  }, [appView, setSelectedIndicator, userRole]);

  useEffect(() => {
    if (userRole !== 'COORDINADOR' || !selectedIndicator) return;
    if (visibleIndicatorCodes.has(selectedIndicator.code)) return;
    setSelectedIndicator(null);
    setActiveRequirement(null);
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setAppView('dashboard');
  }, [selectedIndicator, setSelectedIndicator, userRole, visibleIndicatorCodes]);

  const handleIndicatorSelect = useCallback((indicator: Indicator) => {
    setAppView('indicator');
    selectIndicator(indicator);
  }, [selectIndicator]);

  const handleGoToStart = useCallback(() => {
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setAppView('dashboard');
    setActiveRequirement(null);
    setSelectedIndicator(null);
  }, [setSelectedIndicator]);

  const handleOpenTemplates = useCallback(() => {
    if (!canAccessTemplates(userRole)) return;
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setAppView('templates');
    setActiveRequirement(null);
    setSelectedIndicator(null);
  }, [setSelectedIndicator, userRole]);

  const handleOpenAssignments = useCallback(() => {
    if (!canAccessAssignments(userRole)) return;
    setIsEditorOpen(false);
    setIsUploadOpen(false);
    setIsHistoryOpen(false);
    setAppView('assignments');
    setActiveRequirement(null);
    setSelectedIndicator(null);
  }, [setSelectedIndicator, userRole]);

  const handleSaveUpload = async () => {
    if (!canUserUpload(userRole)) return;
    if (!activeRequirement || !selectedIndicator || !uploadFileContent || !user) return;
    if (!isFileAllowedForRequirement(uploadFileContent, activeRequirement)) {
      showToast(`Formato no permitido. Solo se acepta: ${getReadableAllowedFormats(activeRequirement.format)}.`, 'error');
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
      showToast('Evidencia cargada correctamente.');
    } catch (error) {
      console.error(error);
      showToast('No se pudo cargar la evidencia. Intenta nuevamente.', 'error');
    }
  };

  const handleReviewUpdate = (evidenceId: string, status: Status, observation?: string) => {
    updateStatus(evidenceId, status, observation);
    refreshNotifications();
  };

  const visibleNodes = useMemo(() => {
    const nodes: { id: string; type: string; data?: any }[] = [];

    visibleMockData.forEach(yearPeriod => {
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
  }, [expandedNodes, visibleMockData]);

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
  const activeView: AppView = selectedIndicator ? 'indicator' : appView;
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
        mockData={visibleMockData}
        selectedIndicator={selectedIndicator}
        expandedNodes={expandedNodes}
        focusedNodeId={focusedNodeId}
        userRole={userRole}
        isCoordinatorScopeFiltered={isCoordinatorScopeFiltered}
        visibleIndicatorCount={visibleIndicatorCodes.size}
        onIndicatorSelect={handleIndicatorSelect}
        onToggleNode={toggleNode}
        onSetFocusedNode={setFocusedNodeId}
        onKeyDown={handleKeyDown}
        onSwitchRole={switchRole}
        activeView={activeView}
        onOpenDashboard={handleGoToStart}
        onOpenTemplates={handleOpenTemplates}
        onOpenAssignments={handleOpenAssignments}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
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
          onOpenMenu={() => setIsSidebarOpen(true)}
        />

        {userRole === 'DOCENTE' ? (
          <Suspense fallback={<LoadingSpinner label="Cargando portal docente" className="m-auto" />}>
            <DocenteView onLogout={logout} />
          </Suspense>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#f4f6f9] p-4 sm:p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {!selectedIndicator && canOpenRepository && appView === 'dashboard' && (
                <motion.div key="dashboard" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <Suspense fallback={<LoadingSpinner label="Cargando panel" />}>
                  <Dashboard
                    mockData={visibleMockData}
                    allFiles={allFiles}
                    onIndicatorSelect={handleIndicatorSelect}
                    onViewChecklist={() => setAppView('checklist')}
                    onOpenCriterionSubCriteria={openCriterionSubCriteria}
                    onOpenAssignments={handleOpenAssignments}
                    canManageAssignments={canOpenAssignments}
                    isScopedView={isCoordinatorScopeFiltered}
                  />
                  </Suspense>
                </motion.div>
              )}

              {!selectedIndicator && canOpenRepository && appView === 'checklist' && (
                <motion.div key="checklist" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <Suspense fallback={<LoadingSpinner label="Cargando indicadores" />}>
                  <ChecklistView
                    mockData={visibleMockData}
                    onIndicatorSelect={handleIndicatorSelect}
                    onBackToDashboard={handleGoToStart}
                    isScopedView={isCoordinatorScopeFiltered}
                  />
                  </Suspense>
                </motion.div>
              )}

              {!selectedIndicator && appView === 'templates' && canAccessTemplates(userRole) && (
                <motion.div key="templates" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <Suspense fallback={<LoadingSpinner label="Cargando formatos" />}>
                    <TemplatesView userRole={userRole} userName={user?.name} />
                  </Suspense>
                </motion.div>
              )}

              {!selectedIndicator && appView === 'assignments' && canOpenAssignments && (
                <motion.div key="assignments" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <Suspense fallback={<LoadingSpinner label="Cargando tareas" />}>
                    <AssignmentsView
                      userRole={userRole}
                      mockData={userRole === 'ADMIN' ? mockData : visibleMockData}
                      currentUserName={user?.name}
                      onAssignmentsChange={refreshCoordinatorAssignments}
                    />
                  </Suspense>
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

                <Suspense fallback={<LoadingSpinner label="Cargando evidencias" />}>
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
                </Suspense>
              </IndicatorContent>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Suspense fallback={null}>
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
      </Suspense>

      {isEditorOpen && selectedIndicator && activeRequirement && (
        <Suspense fallback={<LoadingSpinner label="Cargando editor" className="fixed inset-0 z-[200] m-auto" />}>
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
        </Suspense>
      )}
    </div>
  );
}
