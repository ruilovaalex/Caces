import { useEffect, useState } from 'react';
import { PublishedTemplate } from '../types';
import { TEMPLATE_LIBRARY_UPDATED_EVENT, TemplateService } from '../services/templateService';

export const useTemplateLibrary = () => {
  const [customTemplates, setCustomTemplates] = useState<PublishedTemplate[]>(() => TemplateService.getCustomTemplates());

  const refreshCustomTemplates = () => {
    setCustomTemplates(TemplateService.getCustomTemplates());
  };

  useEffect(() => {
    const handleUpdate = () => refreshCustomTemplates();

    window.addEventListener(TEMPLATE_LIBRARY_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(TEMPLATE_LIBRARY_UPDATED_EVENT, handleUpdate);
  }, []);

  return {
    customTemplates,
    refreshCustomTemplates,
  };
};
