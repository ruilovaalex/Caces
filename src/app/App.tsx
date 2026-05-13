import React, { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import jsPDF from 'jspdf';
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
import { EvidenceManageModal } from '../components/evidences/EvidenceManageModal';
import { CoordinatorEvidenceEditor } from '../components/coordinator/CoordinatorEvidenceEditor';
import { AIMentorPanel } from '../components/ai/AIMentorPanel';
import { AIGuideViewer } from '../components/ai/AIGuideViewer';

import { useAuth } from '../hooks/useAuth';
import { useIndicators } from '../hooks/useIndicators';
import { useEvidences } from '../hooks/useEvidences';
import { useNotifications } from '../hooks/useNotifications';
import { useAIMentor } from '../hooks/useAIMentor';
import { useFileUpload } from '../hooks/useFileUpload';

import { calculateIndicatorProgress, getIndicatorStats } from '../utils/progressUtils';
import { canUserRequestAI, canUserUpload } from '../utils/permissions';
import { Indicator, Requirement, GeneratedDoc } from '../types';
import { TEMPLATES } from '../data/templates';

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
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { 
    allFiles, 
    generatedDocs, 
    getRequirementFiles, 
    uploadFile, 
    updateStatus, 
    refreshEvidences 
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
    isGenerating, 
    aiResponse, 
    selectedTemplate, 
    setSelectedTemplate, 
    setAiResponse,
    requestRequirementGuide, 
    generateGuideline,
    saveDocLocally
  } = useAIMentor();

  const { 
    file: uploadFileContent, 
    observation: uploadObs, 
    setObservation: setUploadObs, 
    onFileChange, 
    reset: resetUpload 
  } = useFileUpload();

  const handleIndicatorSelect = (ind: Indicator) => {
    selectIndicator(ind);
    setViewMode('indicator');
    setAiResponse("");
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

  const exportToPDF = (doc: GeneratedDoc) => {
    const pdf = new jsPDF();
    pdf.setFillColor(26, 54, 93);
    pdf.rect(0, 0, 210, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(22);
    pdf.text("EduSudamericano", 15, 25);
    pdf.setFontSize(10);
    pdf.text("SISTEMA DE GESTIÓN DE CALIDAD - CACES 2025", 15, 32);
    pdf.setTextColor(33, 33, 33);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Indicator: ${doc.indicatorCode}`, 15, 55);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Documento: ${doc.label}`, 15, 62);
    pdf.text(`Fecha: ${doc.timestamp}`, 15, 67);
    pdf.setDrawColor(200, 200, 200);
    pdf.line(15, 75, 195, 75);
    pdf.setFontSize(11);
    const splitText = pdf.splitTextToSize(doc.content, 180);
    pdf.text(splitText, 15, 85);
    pdf.save(`${doc.label}.pdf`);
  };

  const getVisibleNodes = () => {
    const nodes: { id: string; type: string; data?: any }[] = [];
    mockData.forEach(yearPeriod => {
      const yearId = yearPeriod.year.toString();
      nodes.push({ id: yearId, type: 'year', data: yearPeriod });
      if (expandedNodes.has(yearId)) {
        yearPeriod.criteria.forEach(crit => {
          const critId = `crit-${crit.id}`;
          nodes.push({ id: critId, type: 'crit', data: crit });
          if (expandedNodes.has(critId)) {
            crit.subCriteria.forEach(sub => {
              const subId = `sub-${sub.id}`;
              nodes.push({ id: subId, type: 'sub', data: sub });
              if (expandedNodes.has(subId)) {
                sub.indicators.forEach(ind => {
                  nodes.push({ id: `ind-${ind.code}`, type: 'ind', data: ind });
                });
              }
            });
          }
        });
      }
    });
    return nodes;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const visibleNodes = getVisibleNodes();
    const currentIndex = visibleNodes.findIndex(n => n.id === focusedNodeId);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < visibleNodes.length - 1) setFocusedNodeId(visibleNodes[currentIndex + 1].id);
        else if (focusedNodeId === null && visibleNodes.length > 0) setFocusedNodeId(visibleNodes[0].id);
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) setFocusedNodeId(visibleNodes[currentIndex - 1].id);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-') && !expandedNodes.has(focusedNodeId)) toggleNode(focusedNodeId);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-') && expandedNodes.has(focusedNodeId)) toggleNode(focusedNodeId);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedNodeId) {
          const node = visibleNodes.find(n => n.id === focusedNodeId);
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
        onDashboardClick={() => { setSelectedIndicator(null); setViewMode('dashboard'); }}
        onToggleNode={toggleNode}
        onSetFocusedNode={setFocusedNodeId}
        onKeyDown={handleKeyDown}
        onSwitchRole={switchRole}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onLogout={logout}
          onGenerateAI={(autoSave) => selectedIndicator && generateGuideline(selectedIndicator, autoSave, refreshEvidences)}
          selectedIndicator={selectedIndicator}
          isGenerating={isGenerating}
          canWrite={canUserUpload(userRole)}
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

                  <IndicatorStatsCards 
                    stats={getIndicatorStats(selectedIndicator, allFiles)}
                  />

                  <EvidenceTable 
                    indicator={selectedIndicator}
                    userRole={userRole}
                    getRequirementFiles={(reqId) => getRequirementFiles(reqId, selectedIndicator.code)}
                    onOpenManagement={(req) => { setActiveRequirement(req); setIsManagementOpen(true); }}
                    onOpenUpload={(req) => { setActiveRequirement(req); setIsUploadOpen(true); resetUpload(); }}
                    onRequestAI={(req) => requestRequirementGuide(selectedIndicator, req)}
                    onOpenEditor={(req) => { setActiveRequirement(req); setIsEditorOpen(true); }}
                  />

                  <AIMentorPanel 
                    indicator={selectedIndicator}
                    selectedTemplate={selectedTemplate}
                    isGenerating={isGenerating}
                    aiResponse={aiResponse}
                    canWrite={canUserRequestAI(userRole)}
                    onTemplateSelect={setSelectedTemplate}
                    onGenerateAI={(autoSave) => generateGuideline(selectedIndicator, autoSave, refreshEvidences)}
                    onSaveGuide={() => {
                      const template = TEMPLATES.find((t: any) => t.id === selectedTemplate);
                      if (template) {
                        saveDocLocally(aiResponse, template, selectedIndicator);
                        setAiResponse("");
                      }
                    }}
                    onExportPDF={exportToPDF}
                  />
                </IndicatorContent>
              </motion.div>
            )}
          </AnimatePresence>

          <AIGuideViewer 
            indicator={selectedIndicator}
            aiResponse={aiResponse}
            onClose={() => setAiResponse("")}
            onCopy={() => {
              if (typeof navigator !== 'undefined' && navigator.clipboard) {
                navigator.clipboard.writeText(aiResponse);
              }
            }}
          />
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
        isGenerating={isGenerating}
      />

      <EvidenceManageModal 
        isOpen={isManagementOpen}
        onClose={() => setIsManagementOpen(false)}
        activeRequirement={activeRequirement}
        files={activeRequirement ? getRequirementFiles(activeRequirement.id, selectedIndicator?.code || "") : []}
        onRequestAI={(req) => selectedIndicator && requestRequirementGuide(selectedIndicator, req)}
        onOpenUpload={(req) => { setActiveRequirement(req); setIsUploadOpen(true); resetUpload(); }}
      />

      <AnimatePresence>
        {isEditorOpen && selectedIndicator && activeRequirement && (
          <CoordinatorEvidenceEditor 
            indicator={selectedIndicator}
            requirement={activeRequirement}
            currentUser={user}
            onClose={() => setIsEditorOpen(false)}
            onUploadFinal={(req) => {
              setActiveRequirement(req);
              setIsEditorOpen(false);
              setIsUploadOpen(true);
              resetUpload();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
