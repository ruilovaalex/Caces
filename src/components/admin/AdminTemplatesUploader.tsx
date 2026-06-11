import React, { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Link as LinkIcon } from 'lucide-react';
import { FileContentService } from '../../services/fileContentService';
import { MOCK_DATA } from '../../data/cacesMockData';

interface OfficialTemplate {
  id: string;
  name: string;
  description: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  linkedRequirements: string[];
}

export const AdminTemplatesUploader = () => {
  const [templates, setTemplates] = useState<OfficialTemplate[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [linkedReqs, setLinkedReqs] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // For the requirement selector
  const availableRequirements = MOCK_DATA.flatMap(y => 
    y.criteria.flatMap(c => 
      c.subCriteria.flatMap(s => 
        s.indicators.flatMap(i => 
          i.requirements.map(r => ({ id: r.id, label: r.label, ind: i.code }))
        )
      )
    )
  );

  useEffect(() => {
    const saved = localStorage.getItem('edusudamericano_official_templates_v1');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !name.trim()) return;

    setIsUploading(true);
    const newId = `tpl-${Date.now()}`;
    const newTemplate: OfficialTemplate = {
      id: newId,
      name,
      description,
      fileName: selectedFile.name,
      fileType: selectedFile.name.split('.').pop()?.toUpperCase() || 'UNKNOWN',
      uploadDate: new Date().toLocaleString(),
      linkedRequirements: linkedReqs
    };

    try {
      // Save content to IndexedDB
      await FileContentService.save(`official_template_${newId}`, selectedFile);
      
      // Save metadata to localStorage
      const updated = [newTemplate, ...templates];
      setTemplates(updated);
      localStorage.setItem('edusudamericano_official_templates_v1', JSON.stringify(updated));
      
      // Reset form
      setSelectedFile(null);
      setName('');
      setDescription('');
      setLinkedReqs([]);
      const fileInput = document.getElementById('template-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error al subir la plantilla', error);
      alert('Error al subir la plantilla');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta plantilla oficial?')) return;
    
    try {
      await FileContentService.remove(`official_template_${id}`);
      const updated = templates.filter(t => t.id !== id);
      setTemplates(updated);
      localStorage.setItem('edusudamericano_official_templates_v1', JSON.stringify(updated));
    } catch (error) {
      console.error('Error al eliminar', error);
    }
  };

  const toggleReq = (reqId: string) => {
    setLinkedReqs(prev => prev.includes(reqId) ? prev.filter(id => id !== reqId) : [...prev, reqId]);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
          <Upload className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Plantillas Oficiales</h1>
          <p className="text-slate-500">Sube formatos oficiales que los docentes y coordinadores podrán descargar.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="font-bold text-slate-800 border-b pb-2">Subir Nueva Plantilla</h2>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Archivo (PDF, DOCX, XLSX...)</label>
              <input
                id="template-upload"
                type="file"
                onChange={handleFileChange}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre de la Plantilla</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ej. Formato Sílabo 2025"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-20"
                placeholder="Breve descripción del propósito de la plantilla..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Vincular a Requerimientos (Opcional)</label>
              <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg p-2 space-y-1 bg-slate-50">
                {availableRequirements.slice(0, 50).map(req => ( // Limiting to 50 for performance in this UI snippet, a real search is better
                  <label key={req.id} className="flex items-start gap-2 text-xs p-1 hover:bg-slate-100 rounded cursor-pointer">
                    <input type="checkbox" checked={linkedReqs.includes(req.id)} onChange={() => toggleReq(req.id)} className="mt-0.5" />
                    <span className="leading-tight"><span className="font-bold text-indigo-600">{req.ind}</span> {req.label}</span>
                  </label>
                ))}
                {availableRequirements.length > 50 && <p className="text-xs text-center text-slate-400 p-1">Mostrando los primeros 50... Usa la gestión de criterios para vínculos específicos.</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-400 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              {isUploading ? 'Subiendo...' : 'Subir Plantilla'}
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map(template => (
              <div key={template.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-600">{template.fileType}</span>
                    </div>
                    <button onClick={() => handleDelete(template.id)} className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{template.description}</p>
                  
                  {template.linkedRequirements.length > 0 && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded w-fit">
                      <LinkIcon className="w-3 h-3" />
                      {template.linkedRequirements.length} requerimientos vinculados
                    </div>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[10px] text-slate-400 truncate">Archivo: {template.fileName}</p>
                  <p className="text-[10px] text-slate-400">Subido: {template.uploadDate}</p>
                </div>
              </div>
            ))}
            {templates.length === 0 && (
              <div className="col-span-2 py-12 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">No hay plantillas oficiales</p>
                <p className="text-xs text-slate-400 mt-1">Sube la primera plantilla usando el formulario.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
