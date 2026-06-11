import { useState, useCallback } from 'react';

export const useFileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [observation, setObservation] = useState("");
  const [folderId, setFolderId] = useState("");

  const reset = useCallback(() => {
    setFile(null);
    setObservation("");
    setFolderId("");
  }, []);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
  }, []);

  return {
    file,
    observation,
    folderId,
    setFile,
    setObservation,
    setFolderId,
    onFileChange,
    reset
  };
};
