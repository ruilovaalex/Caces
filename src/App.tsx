/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  LayoutDashboard,
  LogOut,
  Bell,
  Search,
  Filter,
  Users,
  Settings,
  HelpCircle,
  Lightbulb,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import jsPDF from 'jspdf';
import { 
  Role, 
  Status,
  Indicator, 
  Template, 
  GeneratedDoc, 
  YearPeriod, 
  Criterion, 
  SubCriterion,
  Notification 
} from './types';
import { AIService } from './services/aiService';
import { EvidenceService } from './services/evidenceService';
import { NotificationService } from './services/notificationService';

// --- Templates ---
const TEMPLATES: Template[] = [
  { id: 'acta', label: 'Acta', description: 'Registro formal de sesiones, reuniones o acuerdos.' },
  { id: 'informe', label: 'Informe', description: 'Documento detallado de resultados o actividades.' },
  { id: 'registro', label: 'Registro', description: 'Lista o bitácora de eventos o datos específicos.' },
  { id: 'plan', label: 'Plan', description: 'Documento de planificación y pasos a seguir.' },
  { id: 'documento', label: 'Documento', description: 'Escrito formal o normativo general.' },
  { id: 'evidencia', label: 'Evidencia', description: 'Prueba tangible del cumplimiento de una actividad.' },
];

// --- Mock Data ---

const MOCK_DATA: YearPeriod[] = [
  {
    year: 2025,
    criteria: [
      {
        id: "1",
        name: "CATEGORÍA 1: ORGANIZACIÓN",
        subCriteria: [
          {
            id: "1.1",
            name: "1.1 Planificación y desarrollo",
            indicators: [
              { 
                code: "1.1.1", 
                name: "Planificación estratégica y operativa", 
                status: "Validado", 
                description: "Evalúa el sistema de planificación cuyo centro es el PEDI ejecutado a través de POAs.", 
                requirements: [
                  { id: "1", label: "PEDI Institucional Vigente", status: "Validado" }, 
                  { id: "2", label: "Plan Operativo Anual (POA)", status: "Validado" },
                  { id: "3", label: "Evidencias de Diagnóstico Participativo", status: "Validado" }
                ] 
              },
              { 
                code: "1.1.2", 
                name: "Relaciones interinstitucionales", 
                status: "Cargado", 
                description: "Convenios y redes académicas para el desarrollo institucional.", 
                requirements: [
                  { id: "1", label: "Convenios Vigentes con Firmas", status: "Cargado" },
                  { id: "2", label: "Informes de Resultados de Redes", status: "Cargado" }
                ] 
              },
              { 
                code: "1.1.3", 
                name: "Aseguramiento interno de la calidad", 
                status: "Pendiente", 
                description: "Acciones sistemáticas dirigidas al mejoramiento de la calidad.", 
                requirements: [
                  { id: "1", label: "Normativa de AIC Aprobad", status: "Pendiente" },
                  { id: "2", label: "Informes de Autoevaluación", status: "Pendiente" }
                ] 
              }
            ]
          },
          {
            id: "1.2",
            name: "1.2 Gestión social",
            indicators: [
              { 
                code: "1.2.1", 
                name: "Igualdad de oportunidades", 
                status: "Pendiente", 
                description: "Políticas de inclusión para grupos vulnerables.", 
                requirements: [
                  { id: "1", label: "Normativa de Acción Afirmativa", status: "Pendiente" },
                  { id: "2", label: "Evidencias de Acciones Educativas", status: "Pendiente" }
                ] 
              }
            ]
          }
        ]
      },
      {
        id: "2",
        name: "CATEGORÍA 2: INFRAESTRUCTURA",
        subCriteria: [
          {
            id: "2.1",
            name: "2.1 Infraestructura básica",
            indicators: [
              { 
                code: "2.1.1", 
                name: "Puestos de trabajo de los profesores", 
                status: "Pendiente", 
                description: "Condiciones físicas para el trabajo docente.", 
                requirements: [
                  { id: "1", label: "Verificación de Cubículos", status: "Pendiente" },
                  { id: "2", label: "Inventario de Equipos", status: "Pendiente" }
                ] 
              },
              { 
                code: "2.1.2", 
                name: "Seguridad y salud ocupacional", 
                status: "Cargado", 
                description: "Cumplimiento de normativa de seguridad laboral.", 
                requirements: [
                  { id: "1", label: "Reglamento de Higiene", status: "Cargado" },
                  { id: "2", label: "Registros de Simulacros", status: "Cargado" }
                ] 
              }
            ]
          }
        ]
      },
      {
        id: "4",
        name: "CATEGORÍA 4: DOCENCIA",
        subCriteria: [
          {
            id: "4.1",
            name: "4.1 Formación académica",
            indicators: [
              { 
                code: "4.1.1", 
                name: "Programas de estudio de asignaturas", 
                status: "Pendiente", 
                description: "Documentación que sustenta los PEA (Syllabus).", 
                requirements: [
                  { id: "1", label: "Mallas Curriculares", status: "Pendiente" },
                  { id: "2", label: "Programas de Asignaturas (PEA)", status: "Pendiente" }
                ] 
              }
            ]
          }
        ]
      }
    ]
  }
];

// --- Components ---

const StatusBadge = ({ status }: { status: Status }) => {
  const colors = {
    Pendiente: 'bg-amber-100 text-amber-700 border-amber-200',
    Cargado: 'bg-blue-100 text-blue-700 border-blue-200',
    Validado: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Observado: 'bg-rose-100 text-rose-700 border-rose-200',
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colors[status]}`}>
      {status}
    </span>
  );
};

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<Role>('ADMIN');
  const [selectedIndicator, setSelectedIndicator] = useState<Indicator | null>(null);
  const [viewMode, setViewMode] = useState<'dashboard' | 'indicator' | 'checklist'>('dashboard');

  const handleIndicatorSelect = (ind: Indicator) => {
    setSelectedIndicator(ind);
    setViewMode('indicator');
  };

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['2025']));
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [generatedDocs, setGeneratedDocs] = useState<GeneratedDoc[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Cargar datos iniciales de localStorage
  useEffect(() => {
    setGeneratedDocs(EvidenceService.getAll());
    setNotifications(NotificationService.getAll());
  }, []);

  const refreshNotifications = () => {
    setNotifications(NotificationService.getAll());
  };

  // Helpers de permisos
  const canWrite = userRole === 'ADMIN' || userRole === 'COORDINADOR';
  const isAdmin = userRole === 'ADMIN';

  const toggleNode = (nodeId: string) => {
    const newSet = new Set(expandedNodes);
    if (newSet.has(nodeId)) newSet.delete(nodeId);
    else newSet.add(nodeId);
    setExpandedNodes(newSet);
  };

  const handleGenerateAI = async (autoSave = false) => {
    if (!selectedIndicator) return;
    setIsGenerating(true);
    
    if (!autoSave) setAiResponse("");

    try {
      const template = TEMPLATES.find(t => t.id === selectedTemplate);
      if (!template) return;
      
      const text = await AIService.getGuideline(selectedIndicator, template);

      if (autoSave) {
        saveDoc(text, template);
        alert(`Guía institucional generada y guardada automáticamente.`);
      } else {
        setAiResponse(text);
      }
    } catch (error) {
      console.error("AI Generation failed:", error);
      setAiResponse("Error de conexión con el mentor de calidad IA.");
      NotificationService.add({
        title: 'Error de IA',
        message: 'No se pudo conectar con el motor de inteligencia artificial. Verifique su conexión o intente más tarde.',
        type: 'error'
      });
      refreshNotifications();
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDoc = (content: string, template: Template) => {
    if (!selectedIndicator) return;

    const docCount = generatedDocs.filter(d => d.indicatorCode === selectedIndicator.code).length + 1;
    const paddedCount = docCount.toString().padStart(3, '0');
    const fileName = `${template.id}_${selectedIndicator.code.replace(/\./g, '_')}_2025_${paddedCount}`;

    const newDoc: GeneratedDoc = {
      id: Math.random().toString(36).substr(2, 9),
      indicatorCode: selectedIndicator.code,
      templateId: template.id,
      content: content,
      timestamp: new Date().toLocaleString(),
      label: fileName
    };
    
    EvidenceService.save(newDoc);
    setGeneratedDocs(EvidenceService.getAll());
    
    NotificationService.add({
      title: 'Nueva Guía Generada',
      message: `Se ha guardado la guía SIG-EV-${selectedIndicator.code}-2025 para el indicador ${selectedIndicator.name}.`,
      type: 'success'
    });
    refreshNotifications();
  };

  const onSaveClick = () => {
    const template = TEMPLATES.find(t => t.id === selectedTemplate);
    if (!template || !aiResponse) return;
    
    saveDoc(aiResponse, template);
    setAiResponse("");
    alert("Guía de IA guardada exitosamente en el sistema de evidencias.");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedIndicator) return;

    try {
      setIsGenerating(true);
      await EvidenceService.upload(file, selectedIndicator.code);
      setGeneratedDocs(EvidenceService.getAll());
      
      NotificationService.add({
        title: 'Archivo Subido',
        message: `Se ha subido correctamente el archivo: ${file.name}`,
        type: 'success'
      });
      refreshNotifications();
      alert(`Archivo "${file.name}" subido con éxito.`);
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = (doc: GeneratedDoc) => {
    const pdf = new jsPDF();
    
    // Configuración estética del PDF
    pdf.setFillColor(26, 54, 93); // Azul oscuro
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
    
    // Contenido (simplificado ya que es texto Markdown)
    pdf.setFontSize(11);
    const splitText = pdf.splitTextToSize(doc.content, 180);
    pdf.text(splitText, 15, 85);
    
    pdf.save(`${doc.label}.pdf`);
    
    NotificationService.add({
      title: 'PDF Descargado',
      message: `Se ha exportado el documento ${doc.label} correctamente.`,
      type: 'info'
    });
    refreshNotifications();
  };

  const filteredDocs = generatedDocs.filter(doc => doc.indicatorCode === selectedIndicator?.code);

  const getVisibleNodes = () => {
    const nodes: { id: string; type: 'year' | 'crit' | 'sub' | 'ind'; data?: any }[] = [];
    MOCK_DATA.forEach(yearPeriod => {
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
        if (currentIndex < visibleNodes.length - 1) {
          setFocusedNodeId(visibleNodes[currentIndex + 1].id);
        } else if (focusedNodeId === null && visibleNodes.length > 0) {
          setFocusedNodeId(visibleNodes[0].id);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          setFocusedNodeId(visibleNodes[currentIndex - 1].id);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-')) {
          if (!expandedNodes.has(focusedNodeId)) {
            toggleNode(focusedNodeId);
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedNodeId && !focusedNodeId.startsWith('ind-')) {
          if (expandedNodes.has(focusedNodeId)) {
            toggleNode(focusedNodeId);
          }
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedNodeId) {
          const node = visibleNodes.find(n => n.id === focusedNodeId);
          if (node?.type === 'ind') {
            setSelectedIndicator(node.data);
          } else {
            toggleNode(focusedNodeId);
          }
        }
        break;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/5 border border-slate-100 overflow-hidden"
        >
          <div className="p-10 text-center space-y-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-blue-600 p-4 rounded-2xl shadow-xl shadow-blue-600/30">
                <FileText className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">EduSudamericano</h1>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.25em] mt-1">Gestión de Acreditación CACES</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Perfil de Acceso</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['ADMIN', 'COORDINADOR', 'EVALUADOR'] as Role[]).map(role => (
                    <button
                      key={role}
                      onClick={() => setUserRole(role)}
                      className={`py-2 rounded-xl text-[9px] font-black border transition-all ${
                        userRole === role 
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                        : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Usuario Institucional</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Users className="w-4 h-4" />
                  </span>
                  <input 
                    type="text" 
                    defaultValue="admin@edusudamericano.edu.ec"
                    readOnly
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                  <input 
                    type="password" 
                    defaultValue="••••••••"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setIsAuthenticated(true);
                NotificationService.add({
                  title: 'Sesión Iniciada',
                  message: `Bienvenido al sistema de acreditación EduSudamericano. Perfil activo: ${userRole}`,
                  type: 'info'
                });
              }}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
            >
              Iniciar Sesión
            </button>

            <div className="pt-4 flex items-center justify-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="hover:text-blue-600 cursor-pointer transition-colors">¿Olvidó su clave?</span>
              <div className="w-1 h-1 bg-slate-200 rounded-full" />
              <span className="hover:text-blue-600 cursor-pointer transition-colors">Soporte Técnico</span>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 border-t border-slate-100 text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
              Plataforma oficial de aseguramiento de la calidad • 2025
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-800">
      {/* Sidebar - Explorador estilo VS Code */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded shadow-lg shadow-blue-600/20">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-800 leading-none">CACES</h1>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Acreditación</span>
          </div>
        </div>

        <nav 
          className="flex-1 overflow-y-auto p-4 space-y-1 outline-none"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          aria-label="Explorador de indicadores"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-4 flex items-center justify-between">
            <span>Gestión de Periodos</span>
            <button 
              onClick={() => { setSelectedIndicator(null); setViewMode('dashboard'); }}
              className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-all"
              title="Ir al Dashboard Global"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
            </button>
          </div>
          
          {MOCK_DATA.map((yearPeriod) => (
            <div key={yearPeriod.year} className="space-y-1">
              {/* Nivel 1: Año */}
              <button 
                onClick={() => { toggleNode(yearPeriod.year.toString()); setFocusedNodeId(yearPeriod.year.toString()); }}
                className={`w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-50 rounded-md transition-colors text-sm font-semibold text-slate-700 outline-none ${focusedNodeId === yearPeriod.year.toString() ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                aria-expanded={expandedNodes.has(yearPeriod.year.toString())}
              >
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expandedNodes.has(yearPeriod.year.toString()) ? 'rotate-90' : ''}`} />
                <Folder className="w-4 h-4 text-amber-500/70" />
                Año {yearPeriod.year}
              </button>

              {expandedNodes.has(yearPeriod.year.toString()) && (
                <div className="ml-4 space-y-1 border-l border-slate-200 pl-2">
                  {yearPeriod.criteria.map((criterion) => (
                    <div key={criterion.id}>
                      {/* Nivel 2: Categoría/Criterio */}
                      <button 
                        onClick={() => { toggleNode(`crit-${criterion.id}`); setFocusedNodeId(`crit-${criterion.id}`); }}
                        className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-md transition-colors text-xs font-bold text-slate-500 uppercase tracking-wide truncate text-left outline-none ${focusedNodeId === `crit-${criterion.id}` ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                        aria-expanded={expandedNodes.has(`crit-${criterion.id}`)}
                      >
                        <ChevronRight className={`w-3 h-3 text-slate-400 transition-transform ${expandedNodes.has(`crit-${criterion.id}`) ? 'rotate-90' : ''}`} />
                        <Folder className="w-4 h-4 text-blue-600/70 shrink-0" />
                        <span className="truncate">{criterion.name}</span>
                      </button>

                      {expandedNodes.has(`crit-${criterion.id}`) && (
                        <div className="ml-4 mt-1 space-y-1 border-l border-slate-100 pl-2">
                          {criterion.subCriteria.map((sub) => (
                            <div key={sub.id}>
                              {/* Nivel 3: Subcriterio */}
                              <button 
                                onClick={() => { toggleNode(`sub-${sub.id}`); setFocusedNodeId(`sub-${sub.id}`); }}
                                className={`w-full flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-md transition-colors text-[11px] font-semibold text-slate-400 text-left outline-none ${focusedNodeId === `sub-${sub.id}` ? 'bg-slate-100 ring-1 ring-slate-200' : ''}`}
                                aria-expanded={expandedNodes.has(`sub-${sub.id}`)}
                              >
                                <ChevronRight className={`w-2.5 h-2.5 text-slate-300 transition-transform ${expandedNodes.has(`sub-${sub.id}`) ? 'rotate-90' : ''}`} />
                                <Folder className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                                <span className="truncate">{sub.name}</span>
                              </button>

                              {expandedNodes.has(`sub-${sub.id}`) && (
                                <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-50 pl-2">
                                  {sub.indicators.map((indicator) => (
                                    <button 
                                      key={indicator.code}
                                      onClick={() => { setSelectedIndicator(indicator); setFocusedNodeId(`ind-${indicator.code}`); }}
                                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded transition-all text-[11px] font-medium leading-tight text-left outline-none ${
                                        selectedIndicator?.code === indicator.code 
                                        ? 'tree-item-active shadow-sm' 
                                        : (focusedNodeId === `ind-${indicator.code}` ? 'bg-slate-100 ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50')
                                      }`}
                                    >
                                      <FileText className="w-3 h-3 text-slate-300 shrink-0" />
                                      <span className="flex-1 truncate">
                                        {indicator.code} {indicator.name}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-white font-black text-xs ring-4 ring-white shadow-lg ${
              userRole === 'ADMIN' ? 'bg-slate-900' : userRole === 'COORDINADOR' ? 'bg-blue-600' : 'bg-emerald-600'
            }`}>
              {userRole === 'ADMIN' ? 'PM' : userRole === 'COORDINADOR' ? 'CO' : 'EV'}
            </div>
            <div className="text-[10px]">
              <p className="font-bold text-slate-700 leading-tight">
                {userRole === 'ADMIN' ? 'Admin Sudamericano' : userRole === 'COORDINADOR' ? 'Coord. Académico' : 'Evaluador Externo'}
              </p>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[8px] mt-0.5">{userRole}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">Gestión de Evidencias 2025</h2>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">En Proceso de Acreditación</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {canWrite && (
              <button 
                onClick={() => handleGenerateAI(true)}
                disabled={!selectedIndicator || isGenerating}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 rounded-xl text-xs font-black text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
              >
                <Users className="w-4 h-4" />
                Obtener Guía de Acreditación
              </button>
            )}
            <div className="h-8 w-[1px] bg-slate-200 mx-1" />
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={`p-2.5 hover:bg-slate-100 rounded-xl transition-colors relative ${showNotifications ? 'bg-slate-100 text-blue-600' : 'text-slate-500'}`}
                >
                  <Bell className="w-5 h-5" />
                  {notifications.some(n => !n.isRead) && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </button>

                {/* Notifications Panel */}
                <AnimatePresence>
                  {showNotifications && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notificaciones</span>
                        <button 
                          onClick={() => { NotificationService.clearAll(); refreshNotifications(); }}
                          className="text-[9px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-wider"
                        >
                          Limpiar todo
                        </button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => { NotificationService.markAsRead(n.id); refreshNotifications(); }}
                              className={`p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 cursor-pointer transition-colors relative ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                            >
                              {!n.isRead && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-1 bg-blue-500 rounded-full" />}
                              <div className="flex items-start gap-3">
                                <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${
                                  n.type === 'success' ? 'bg-emerald-500' : 
                                  n.type === 'warning' ? 'bg-amber-500' : 
                                  n.type === 'error' ? 'bg-rose-500' : 'bg-blue-500'
                                }`} />
                                <div className="space-y-1">
                                  <p className="text-[11px] font-bold text-slate-800 leading-tight">{n.title}</p>
                                  <p className="text-[10px] text-slate-500 leading-relaxed">{n.message}</p>
                                  <p className="text-[8px] text-slate-400 font-bold uppercase">{n.timestamp}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-10 text-center space-y-3">
                            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                              <Bell className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No hay notificaciones</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button 
                onClick={() => setIsAuthenticated(false)}
                className="h-9 w-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-black text-xs shadow-inner hover:bg-rose-500 hover:text-white transition-all group"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {!selectedIndicator ? (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto space-y-8"
              >
                {/* Global Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Estado General</span>
                    <h3 className="text-3xl font-black text-slate-800">42%</h3>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 w-[42%]" />
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Meta de Acreditación 2025</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Evidencias Cargadas</span>
                    <h3 className="text-3xl font-black text-emerald-600">{generatedDocs.length}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Archivos & Guías validadas</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Alertas Calidad</span>
                    <h3 className="text-3xl font-black text-amber-500">12</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Requerimientos sin evidencia</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Estructura Institucional de Calidad</h3>
                    <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Ver Mapa Completo</button>
                  </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {MOCK_DATA[0].criteria.map(crit => (
                      <div 
                        key={crit.id} 
                        onClick={() => toggleNode(`crit-${crit.id}`)}
                        className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:border-blue-200 transition-all cursor-pointer group"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-slate-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <Folder className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Criterio {crit.id}</span>
                        </div>
                        <h4 className="font-bold text-slate-800 mb-1">{crit.name}</h4>
                        <div className="space-y-4">
                           {crit.subCriteria.map(sub => (
                             <div key={sub.id} className="space-y-1.5">
                               <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                                 <span className="text-slate-400">{sub.name}</span>
                                 <span className="text-blue-600">60%</span>
                               </div>
                               <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                                 <div className="h-full bg-blue-400 w-[60%]" />
                               </div>
                             </div>
                           ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Attention Required List */}
                  <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500" />
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Atención Requerida: Evidencias Pendientes</h3>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modelo CACES 2024</span>
                    </div>
                    <div className="divide-y divide-slate-50">
                      {MOCK_DATA[0].criteria.flatMap(c => c.subCriteria.flatMap(s => s.indicators)).filter(i => i.status === 'Pendiente').slice(0, 5).map(ind => (
                        <div 
                          key={ind.code} 
                          onClick={() => handleIndicatorSelect(ind)}
                          className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-400 text-xs group-hover:bg-blue-100 group-hover:text-blue-600 transition-all">
                              {ind.code}
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-700">{ind.name}</p>
                               <div className="flex gap-2 mt-1">
                                 {ind.requirements.slice(0, 2).map(r => (
                                   <span key={r.id} className="text-[9px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded italic">Falta: {r.label}</span>
                                 ))}
                               </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 transition-all" />
                        </div>
                      ))}
                    </div>
                <div className="p-4 bg-slate-50/50 text-center border-t border-slate-50">
                       <button 
                        onClick={() => setViewMode('checklist')}
                        className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors"
                      >
                        Visualizar todos los requerimientos
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : viewMode === 'checklist' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-6xl mx-auto space-y-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">Checklist Geral de Cumplimiento</h2>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Mapa de Evidencias CACES 2024</p>
                  </div>
                  <button 
                    onClick={() => setViewMode('dashboard')}
                    className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    Volver al Dashboard
                  </button>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100">
                      <tr>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Cod / Indicador</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidencias Requeridas</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Progreso</th>
                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {MOCK_DATA[0].criteria.flatMap(c => c.subCriteria.flatMap(s => s.indicators)).map(ind => (
                        <tr key={ind.code} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6 align-top">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-black text-slate-800">{ind.code}</span>
                              <span className="text-sm font-bold text-slate-600 line-clamp-1">{ind.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-2">
                              {ind.requirements.map(req => (
                                <div key={req.id} className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${req.status === 'Validado' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                  <span className={`text-[11px] font-medium ${req.status === 'Validado' ? 'text-emerald-700' : 'text-slate-400'}`}>{req.label}</span>
                                </div>
                              ))}
                              {ind.requirements.length === 0 && <span className="text-[10px] text-slate-300 italic font-medium tracking-wide">Sin documentos base definidos</span>}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-center align-top">
                             <div className="inline-flex items-center gap-3 px-3 py-1 bg-slate-100 rounded-lg">
                                <CheckCircle2 className={`w-3.5 h-3.5 ${ind.status === 'Validado' ? 'text-emerald-500' : 'text-slate-300'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${ind.status === 'Validado' ? 'text-emerald-700' : 'text-slate-400'}`}>
                                  {ind.status}
                                </span>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-right align-top">
                            <button 
                              onClick={() => handleIndicatorSelect(ind)}
                              className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key={selectedIndicator.code}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="max-w-5xl mx-auto space-y-6"
              >
                {/* Ficha Técnica del Indicador */}
                <div className="indicator-card flex flex-col overflow-hidden">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex gap-6">
                      <div className="w-16 h-16 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-slate-900/10">
                        {selectedIndicator.code}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <StatusBadge status={selectedIndicator.status} />
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Criterio {selectedIndicator.code.split('.')[0]}</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                          {selectedIndicator.name}
                        </h2>
                        <p className="text-slate-500 text-sm mt-2 max-w-2xl leading-relaxed">
                          {selectedIndicator.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                          <Filter className="w-3.5 h-3.5" />
                          Exportar Reporte
                        </button>
                        {isAdmin && (
                          <button className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 active:scale-95">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Validar Todo
                          </button>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                          <div className={`h-full bg-blue-600 transition-all duration-1000`} style={{ width: selectedIndicator.status === 'Validado' ? '100%' : '30%' }} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                          Progreso: {selectedIndicator.status === 'Validado' ? '100' : '30'}% Completado
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-8 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Folder className="w-4 h-4 text-blue-600" />
                        Evidencias Requeridas por el CACES
                      </h3>
                      <span className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest">Modelo de Evaluación v.2024</span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-white/50 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
                            <th className="px-8 py-4">Requerimiento Específico</th>
                            <th className="px-8 py-4">Obs.</th>
                            <th className="px-8 py-4 text-center">Estado</th>
                            <th className="px-8 py-4 text-center">IA</th>
                            <th className="px-8 py-4 text-right">Acción</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                          {selectedIndicator.requirements.map((req) => (
                            <tr key={req.id} className="group hover:bg-slate-50/80 transition-colors">
                              <td className="px-8 py-5">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-slate-700 leading-tight">{req.label}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Referencia: Art. {selectedIndicator.code}.{req.id}</p>
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase tracking-wider">PDF / XLSX</span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center justify-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    req.status === 'Validado' ? 'bg-emerald-500 animate-pulse' : 
                                    req.status === 'Observado' ? 'bg-rose-500' : 
                                    req.status === 'Cargado' ? 'bg-blue-500' : 'bg-amber-400'
                                  }`} />
                                  <span className={`text-[11px] font-bold uppercase tracking-wider ${
                                    req.status === 'Validado' ? 'text-emerald-600' : 
                                    req.status === 'Observado' ? 'text-rose-600' : 
                                    req.status === 'Cargado' ? 'text-blue-600' : 'text-amber-600'
                                  }`}>
                                    {req.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <div className="flex justify-center">
                                  <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                                    {req.isAI ? '✓' : ''}
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <label 
                                  className={`evidence-btn inline-flex items-center gap-2 cursor-pointer ${!canWrite || isGenerating ? 'opacity-30 cursor-not-allowed grayscale' : ''}`}
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                  {isGenerating ? 'Subiendo...' : 'Subir Archivo'}
                                  <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleFileUpload} 
                                    disabled={!canWrite || isGenerating}
                                  />
                                </label>
                              </td>
                            </tr>
                          ))}
                          
                          {/* Generated Docs Row */}
                          {filteredDocs.map((doc) => (
                            <tr key={doc.id} className="group bg-blue-50/20 hover:bg-blue-50 transition-colors">
                              <td className="px-8 py-5">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-blue-900 leading-tight">
                                    {doc.label || `[IA] ${TEMPLATES.find(t => t.id === doc.templateId)?.label}`}
                                  </p>
                                  <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">SIG-EV-{doc.indicatorCode}-2025 • {doc.timestamp}</p>
                                  {doc.isUpload && <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">{doc.fileSize} • {doc.fileType}</p>}
                                </div>
                              </td>
                              <td className="px-8 py-5">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${doc.isUpload ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                  {doc.isUpload ? 'Archivo Subido' : 'IA / Markdown'}
                                </span>
                              </td>
                              <td className="px-8 py-5">
                                <div className="flex items-center justify-center gap-2">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                                    {doc.isUpload ? 'Validado' : 'Generado'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <div className="flex justify-center font-bold text-blue-500 text-xs text-center">
                                  {doc.isUpload ? <Upload className="w-3.5 h-3.5" /> : 'IA'}
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex justify-end gap-2">
                                  {!doc.isUpload && (
                                    <button 
                                      onClick={() => exportToPDF(doc)}
                                      className="p-2.5 bg-slate-50 text-slate-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                      title="Exportar PDF"
                                    >
                                      <FileText className="w-4 h-4" />
                                    </button>
                                  )}
                                  <button 
                                    onClick={() => {
                                      EvidenceService.delete(doc.id);
                                      setGeneratedDocs(EvidenceService.getAll());
                                      NotificationService.add({
                                        title: 'Evidencia Eliminada',
                                        message: `Se ha borrado el documento ${doc.label}.`,
                                        type: 'warning'
                                      });
                                      refreshNotifications();
                                    }}
                                    className="p-2.5 bg-slate-50 text-slate-400 hover:bg-rose-500 hover:text-white rounded-xl transition-all shadow-sm"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sugerencias de Plantillas */}
                  <div className="px-8 pt-4 pb-0 flex items-center gap-4">
                    <span className="flex items-center gap-2 text-amber-500">
                      <HelpCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Plantillas Sugeridas</span>
                    </span>
                    <div className="flex gap-2">
                       {TEMPLATES.slice(0, 3).map(t => (
                         <button 
                          key={t.id}
                          onClick={() => setSelectedTemplate(t.id)}
                          className={`px-4 py-1.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-2 ${
                            selectedTemplate === t.id 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                         >
                           <FileText className="w-3.5 h-3.5" />
                           {t.label}
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* IA Assistant Section */}
                  <div className="p-8 pb-4">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 transition-all shadow-inner">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Settings className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mentor de Calidad IA</span>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-bold text-slate-800">Guía para: {TEMPLATES.find(t => t.id === selectedTemplate)?.label}</h3>
                              {!aiResponse && <span className="text-[10px] text-amber-500 font-bold">● Esperando Consulta</span>}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button 
                             onClick={() => handleGenerateAI(false)}
                             disabled={isGenerating || !canWrite}
                             className={`flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl text-[10px] font-black transition-all ${isGenerating ? 'animate-pulse opacity-50' : ''} ${!canWrite && 'opacity-30 cursor-not-allowed'}`}
                          >
                            <Settings className={`w-3.5 h-3.5 rotate-active ${isGenerating ? 'animate-spin' : ''}`} />
                            {isGenerating ? "Consultando..." : "Solicitar Guía IA"}
                          </button>
                          <button 
                             onClick={onSaveClick}
                             disabled={!aiResponse || !canWrite}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:border-slate-800 rounded-xl text-[10px] font-black transition-all disabled:opacity-30"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Guardar Guía
                          </button>
                          <button 
                             onClick={() => {
                               const template = TEMPLATES.find(t => t.id === selectedTemplate);
                               if (template && aiResponse && selectedIndicator) {
                                 const tempDoc: GeneratedDoc = {
                                   id: 'temp',
                                   indicatorCode: selectedIndicator.code,
                                   templateId: template.id,
                                   content: aiResponse,
                                   timestamp: new Date().toLocaleString(),
                                   label: `GUIA_${selectedIndicator.code}_2025`
                                 };
                                 exportToPDF(tempDoc);
                               }
                             }}
                             className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-xl text-[10px] font-black hover:bg-slate-50 transition-all text-nowrap"
                          >
                             <LayoutDashboard className="w-3.5 h-3.5" />
                             Exportar PDF
                          </button>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-8 min-h-[300px] max-h-[500px] overflow-y-auto">
                        {aiResponse ? (
                           <div className="prose prose-slate prose-sm max-w-none prose-p:leading-relaxed">
                             <ReactMarkdown>{aiResponse}</ReactMarkdown>
                           </div>
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                              <Lightbulb className="w-6 h-6" />
                            </div>
                            <p className="text-xs text-slate-400 font-medium max-w-xs uppercase tracking-wider">
                              Selecciona una plantilla y solicita la guía para saber cómo preparar esta evidencia según CACES.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Última modificación: hace 2 horas por p_mora
                    </div>
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-600"></div> Acceso Público</span>
                      <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Validado</span>
                    </div>
                  </div>
                </div>

                {/* Footer with actions */}
                <div className="flex justify-between items-center py-4 border-t border-slate-200">
                  <div className="flex items-center gap-4 text-xs font-medium text-slate-400 uppercase tracking-widest">
                    <span>Última modificación: hace 2 horas</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span>Usuario: p_mora</span>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
                      Descargar Resumen
                    </button>
                    <button className="px-6 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                      Historial de Cambios
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
