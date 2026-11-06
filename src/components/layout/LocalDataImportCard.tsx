import React, { useMemo, useState } from 'react';
import { HardDriveUpload } from 'lucide-react';
import { UserRole } from '../../types';
import { EvidenceService } from '../../services/evidenceService';
import { FileContentService } from '../../services/fileContentService';
import { PresentialVerificationService } from '../../services/presentialVerificationService';
import { IndicatorAssessmentService } from '../../services/indicatorAssessmentService';
import { EvaluationApi, EvidenceApi } from '../../services/api/cacesApi';
import { describeError, isApiMode } from '../../services/api/apiClient';

interface LocalDataImportCardProps {
  userRole: UserRole;
  periodCode: string;
  periodLabel: string;
  onImported: () => void;
}

interface ImportSummary {
  imported: number;
  skipped: number;
  failed: string[];
}

const HIDE_KEY = 'caces_hide_local_import';
const readHidden = () => { try { return localStorage.getItem(HIDE_KEY) === '1'; } catch { return false; } };

// Copia al servidor los datos guardados en este navegador. No borra nada local y se puede repetir sin duplicar.
export const LocalDataImportCard = ({ userRole, periodCode, periodLabel, onImported }: LocalDataImportCardProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  // Quien no necesita importar (por ejemplo, datos de una demostracion) puede ocultar el aviso en este navegador.
  const [isHidden, setIsHidden] = useState(readHidden);

  const localData = useMemo(() => ({
    evidences: userRole === 'COORDINADOR' ? EvidenceService.getAll() : [],
    verifications: userRole === 'EVALUADOR' ? PresentialVerificationService.getAll() : [],
    assessments: userRole === 'EVALUADOR' ? IndicatorAssessmentService.getAll() : [],
  }), [userRole]);

  const total = localData.evidences.length + localData.verifications.length + localData.assessments.length;
  if (!isApiMode || total === 0 || isHidden) return null;

  const hide = () => {
    try { localStorage.setItem(HIDE_KEY, '1'); } catch { /* sin almacenamiento: se oculta solo en esta visita */ }
    setIsHidden(true);
  };

  const runImport = async () => {
    const confirmed = window.confirm(
      `Se copiarán ${total} registros de este navegador al periodo "${periodLabel}". Los datos locales no se borran. ¿Continuar?`,
    );
    if (!confirmed) return;

    setIsImporting(true);
    const result: ImportSummary = { imported: 0, skipped: 0, failed: [] };
    const track = async (label: string, action: () => Promise<{ outcome: 'imported' | 'skipped' }>) => {
      try {
        const { outcome } = await action();
        if (outcome === 'imported') result.imported += 1;
        else result.skipped += 1;
      } catch (error) {
        result.failed.push(`${label}: ${describeError(error)}`);
      }
    };

    // Las versiones se envian en orden para conservar su secuencia en cada evidencia.
    const evidences = [...localData.evidences].sort((a, b) =>
      a.indicatorCode.localeCompare(b.indicatorCode, undefined, { numeric: true })
      || Number(a.requirementId) - Number(b.requirementId)
      || a.version - b.version);
    for (const evidence of evidences) {
      await track(`${evidence.indicatorCode} #${evidence.requirementId} v${evidence.version}`, async () => {
        const blob = await FileContentService.get(evidence.id);
        if (!blob) throw new Error('el contenido del archivo no está en este navegador');
        return EvidenceApi.importLocal(periodCode, evidence, blob);
      });
    }
    for (const verification of localData.verifications) {
      await track(`Verificación ${verification.indicatorCode} #${verification.requirementId}`, () =>
        EvaluationApi.importVerification(periodCode, verification));
    }
    for (const assessment of localData.assessments) {
      await track(`Valoración ${assessment.indicatorCode}`, () => EvaluationApi.importAssessment(periodCode, assessment));
    }

    setSummary(result);
    setIsImporting(false);
    onImported();
  };

  return (
    <div className="premium-card bg-white p-5 rounded-lg border border-[#e2e8f0]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <HardDriveUpload className="mt-0.5 w-5 h-5 text-slate-500" />
          <div>
            <h3 className="text-sm font-black text-slate-800">Datos guardados en este navegador</h3>
            <p className="mt-1 text-xs text-slate-500">
              {localData.evidences.length > 0 && `${localData.evidences.length} ${localData.evidences.length === 1 ? "versión" : "versiones"} de evidencias. `}
              {localData.verifications.length > 0 && `${localData.verifications.length} ${localData.verifications.length === 1 ? "verificación presencial" : "verificaciones presenciales"}. `}
              {localData.assessments.length > 0 && `${localData.assessments.length} ${localData.assessments.length === 1 ? "valoración" : "valoraciones"}. `}
              Se importan al periodo seleccionado y quedan pendientes de revisión; los datos locales se conservan.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={hide}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 px-4 text-xs font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50"
        >
          Ocultar aviso
        </button>
        <button
          type="button"
          onClick={() => void runImport()}
          disabled={isImporting}
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-black uppercase tracking-widest text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {isImporting ? 'Importando...' : `Importar a ${periodLabel}`}
        </button>
        </div>
      </div>
      {summary && (
        <div className="mt-3 text-xs text-slate-600">
          <p className="font-bold">
            {summary.imported} importados · {summary.skipped} ya existían en el servidor · {summary.failed.length} con error
          </p>
          {summary.failed.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-[#dc2626]">
              {summary.failed.slice(0, 10).map(item => <li key={item}>{item}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
