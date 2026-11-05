import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { Dashboard } from '../components/layout/Dashboard';
import { ChecklistView } from '../components/layout/ChecklistView';
import { LoginScreen } from '../components/auth/LoginScreen';
import { IndicatorHeader } from '../components/indicators/IndicatorHeader';
import { IndicatorContent } from '../components/indicators/IndicatorContent';
import { IndicatorAssessmentPanel } from '../components/indicators/IndicatorAssessmentPanel';
import { EvidenceTable } from '../components/evidences/EvidenceTable';
import { EvidenceUploadModal } from '../components/evidences/EvidenceUploadModal';
import { EvidenceHistoryModal } from '../components/evidences/EvidenceHistoryModal';
import { CoordinatorEvidenceEditor } from '../components/coordinator/CoordinatorEvidenceEditor';
import { AssignmentsView } from '../components/assignments/AssignmentsView';
import { DocenteView } from '../components/docente/DocenteView';
import { UsersAdminView } from '../components/admin/UsersAdminView';
import { TemplatesView } from '../components/templates/TemplatesView';
import { LocalDataImportCard } from '../components/layout/LocalDataImportCard';

import { useAuth } from '../hooks/useAuth';
import { useIndicators } from '../hooks/useIndicators';
import { useEvidences } from '../hooks/useEvidences';
import { useNotifications } from '../hooks/useNotifications';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAssignments } from '../hooks/useAssignments';
import { useEvaluatorRecords } from '../hooks/useEvaluatorRecords';

import { getIndicatorCurrentStatus, getIndicatorStats, getPresentialStats } from '../utils/progressUtils';
import { getIndicatorAssessmentHistory } from '../services/indicatorAssessmentService';
import { getReadableAllowedFormats, isFileAllowedForRequirement } from '../utils/evidenceFormatUtils';
import { canUserAssessIndicator, canUserAssign, canUserDelete, canUserUpload, canUserVerifyPresential } from '../utils/permissions';
import { configurationError, describeError, isApiMode } from '../services/api/apiClient';
import { viewTransition } from '../utils/animations';
import { getAcademicPeriodsForYear } from '../utils/academicPeriodUtils';
import { Indicator, IndicatorRating, Requirement, Status, VerificationResult } from '../types';

export default function App() {
  const { isAuthenticated, isRestoring, userRole, login, loginWithCredentials, logout, switchRole, user } = useAuth();
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

  // Periodo academico activo: las evidencias, verificaciones y valoraciones se consultan por periodo.
  const academicPeriods = useMemo(() => getAcademicPeriodsForYear(mockData[0].year), [mockData]);
  const [activePeriodId, setActivePeriodId] = useState(() => academicPeriods[0].id);
  const activePeriod = academicPeriods.find(period => period.id === activePeriodId) ?? academicPeriods[0];

  const {
    allFiles,
    getRequirementFiles,
    uploadFile,
    updateStatus,
    deleteEvidence,
    refreshEvidences
  } = useEvidences(activePeriodId, isAuthenticated);

  const {
    notifications,
    showNotifications,
    markAsRead,
    clearAll,
    remove: removeNotification,
    toggleShow,
    refreshNotifications
  } = useNotifications(isAuthenticated);

  const {
    file: uploadFileContent,
    observation: uploadObs,
    setObservation: setUploadObs,
    onFileChange,
    reset: resetUpload
  } = useFileUpload();

  useAssignments();

  const { verifications, assessments, registerVerification, registerAssessment, refreshEvaluatorRecords } = useEvaluatorRecords(activePeriodId, isAuthenticated);

  // Las notificaciones dirigidas a un perfil solo se muestran a ese perfil.
  const visibleNotifications = useMemo(
    () => notifications.filter(notification => !notification.targetRole || notification.targetRole === userRole),
    [notifications, userRole]
  );

  useEffect(() => {
    if (userRole === 'ADMIN') {
      setIsTemplatesOpen(false);
    }

    if (userRole === 'EVALUADOR') {
      setIsEditorOpen(false);
      setIsUploadOpen(false);
      setIsHistoryOpen(false);
      setIsChecklistOpen(false);
      setIsTemplatesOpen(false);
      setActiveRequirement(null);
      setIsAssignmentsOpen(false);
    }
  }, [setSelectedIndicator, userRole]);

  const handleIndicatorSelect = useCallback((indicator: Indicator, periodId?: string) => {
    setIsChecklistOpen(false);
    setIsAssignmentsOpen(false);
    setIsTemplatesOpen(false);
    if (periodId) setActivePeriodId(periodId);
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

  // Al cambiar de usuario (o cerrar sesion) no se conservan vistas ni modales del usuario anterior.
  useEffect(() => {
    handleGoToStart();
  }, [handleGoToStart, user?.id]);

  const handleOpenTemplates = useCallback(() => {
    if (userRole !== 'COORDINADOR') return;
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
    if (userRole !== 'ADMIN' && !canUserAssign(userRole)) return;
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
      await uploadFile(uploadFileContent, selectedIndicator, activeRequirement, user.name, uploadObs);
      setIsUploadOpen(false);
      resetUpload();
      refreshNotifications();
    } catch (error) {
      console.error(error);
      window.alert(describeError(error));
    }
  };

  const handleReviewUpdate = (evidenceId: string, status: Status, observation?: string) => {
    updateStatus(evidenceId, status, observation);
    refreshNotifications();
  };

  const handleRegisterVerification = (requirement: Requirement, result: VerificationResult, notes: string) => {
    if (!canUserVerifyPresential(userRole) || !selectedIndicator || !user) return;
    registerVerification(selectedIndicator.code, requirement, result, notes, user.name);
    refreshNotifications();
  };

  const handleRegisterAssessment = (rating: IndicatorRating, achievements: string, deficiencies: string) => {
    if (!canUserAssessIndicator(userRole) || !selectedIndicator || !user) return;
    registerAssessment(selectedIndicator.code, rating, achievements, deficiencies, user.name);
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
          if (node?.type === 'ind') handleIndicatorSelect(node.data, node.id.split('-ind-')[0]);
          else toggleNode(focusedNodeId);
        }
        break;
    }
  };

  const canAccessAssignments = userRole === 'ADMIN' || canUserAssign(userRole);
  const activeView = selectedIndicator
    ? 'indicator'
    : isTemplatesOpen
      ? 'templates'
    : isAssignmentsOpen && canAccessAssignments
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

  const indicatorSummaries = useMemo(() => {
    if (!selectedIndicator) return null;
    const documental = getIndicatorStats(selectedIndicator, allFiles);
    const presential = getPresentialStats([selectedIndicator], verifications);
    return {
      documental: { validated: documental.valid, total: documental.total },
      presential: { verified: presential.verified, total: presential.total },
    };
  }, [allFiles, selectedIndicator, verifications]);

  if (configurationError) {
    return (
      <div role="alert" className="flex h-screen items-center justify-center bg-[#0f172a] p-6 text-center">
        <div className="max-w-md space-y-2 rounded-2xl bg-white p-8">
          <h1 className="text-sm font-black uppercase tracking-widest text-rose-600">Configuracion incompleta</h1>
          <p className="text-sm text-slate-600">{configurationError}</p>
        </div>
      </div>
    );
  }

  if (isRestoring) {
    return <div className="flex h-screen items-center justify-center bg-[#0f172a] text-xs font-black uppercase tracking-widest text-slate-400">Recuperando sesion...</div>;
  }

  if (!isAuthenticated) {
    return <LoginScreen onLogin={login} onCredentialsLogin={isApiMode ? loginWithCredentials : undefined} />;
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
        activePeriodId={activePeriodId}
        userName={user?.name}
        activeView={activeView}
        onOpenDashboard={handleGoToStart}
        onOpenTemplates={handleOpenTemplates}
        onOpenAssignments={handleOpenAssignments}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header
          onLogout={logout}
          notifications={visibleNotifications}
          showNotifications={showNotifications}
          onToggleNotifications={toggleShow}
          onMarkAsRead={markAsRead}
          onClearAllNotifications={clearAll}
          onDeleteNotification={removeNotification}
          userName={user?.name}
          userRole={userRole}
        />

        {userRole === 'DOCENTE' ? (
          <DocenteView onLogout={logout} />
        ) : (
          <div className="flex-1 overflow-y-auto p-8 bg-[#f4f6f9]">
            <AnimatePresence mode="wait">
              {!selectedIndicator && !isChecklistOpen && !isTemplatesOpen && (!isAssignmentsOpen || !canAccessAssignments) && (
                <motion.div key="dashboard" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <div className="max-w-6xl mx-auto mb-6 empty:hidden">
                    <LocalDataImportCard
                      userRole={userRole}
                      periodCode={activePeriodId}
                      periodLabel={activePeriod.label}
                      onImported={() => {
                        void refreshEvidences();
                        void refreshEvaluatorRecords();
                      }}
                    />
                  </div>
                  <Dashboard
                    mockData={mockData}
                    allFiles={allFiles}
                    verifications={verifications}
                    periods={academicPeriods}
                    activePeriodId={activePeriodId}
                    onChangePeriod={setActivePeriodId}
                    onIndicatorSelect={handleIndicatorSelect}
                    onViewChecklist={() => setIsChecklistOpen(true)}
                    onOpenCriterionSubCriteria={openCriterionSubCriteria}
                    onOpenAssignments={handleOpenAssignments}
                    canManageAssignments={canUserAssign(userRole)}
                  />
                </motion.div>
              )}

              {!selectedIndicator && isChecklistOpen && !isAssignmentsOpen && !isTemplatesOpen && (
                <motion.div key="checklist" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <ChecklistView
                    mockData={mockData}
                    onIndicatorSelect={handleIndicatorSelect}
                    onBackToDashboard={handleGoToStart}
                  />
                </motion.div>
              )}

              {!selectedIndicator && isTemplatesOpen && (
                <motion.div key="templates" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  <TemplatesView userRole={userRole} currentUserName={user?.name} />
                </motion.div>
              )}

              {!selectedIndicator && isAssignmentsOpen && canAccessAssignments && !isTemplatesOpen && (
                <motion.div key="assignments" variants={viewTransition} initial="initial" animate="animate" exit="exit">
                  {isApiMode && userRole === 'ADMIN'
                    ? <UsersAdminView currentUserId={user?.id} />
                    : <AssignmentsView userRole={userRole} mockData={mockData} />}
                </motion.div>
              )}

              {selectedIndicator && (
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
                  periodLabel={isApiMode ? activePeriod.label : undefined}
                  onBackToDashboard={handleGoToStart}
                />

                <IndicatorAssessmentPanel
                  indicator={selectedIndicator}
                  history={getIndicatorAssessmentHistory(assessments, selectedIndicator.code)}
                  canAssess={canUserAssessIndicator(userRole)}
                  documentalSummary={indicatorSummaries?.documental ?? { validated: 0, total: 0 }}
                  presentialSummary={indicatorSummaries?.presential ?? { verified: 0, total: 0 }}
                  onSave={handleRegisterAssessment}
                />

                <EvidenceTable
                  indicator={selectedIndicator}
                  userRole={userRole}
                  currentUserName={user?.name}
                  getRequirementFiles={requirementId => getRequirementFiles(requirementId, selectedIndicator.code)}
                  onOpenUpload={requirement => {
                    if (!canUserUpload(userRole)) return;
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
                  onReviewStatus={handleReviewUpdate}
                  verifications={verifications}
                  onRegisterVerification={handleRegisterVerification}
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
