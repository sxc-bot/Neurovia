import { useState, useEffect } from 'react';

export interface RyffScore {
  autonomy: number;
  environmentalMastery: number;
  personalGrowth: number;
  positiveRelations: number;
  purposeInLife: number;
  selfAcceptance: number;
}

export interface RyffReportEntry {
  summary: any;
  id: string;
  date: string;
  scores: RyffScore;
  advices?: { [key: string]: string };
  feedbacks?: { [key: string]: string };
+  summary?: string;
}

const STORAGE_KEY = 'ryff_report_history';

export const useLocalRyffReport = () => {
  const [reports, setReports] = useState<RyffReportEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedReports = JSON.parse(stored);
        setReports(parsedReports.sort((a: RyffReportEntry, b: RyffReportEntry) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading Ryff reports:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveToStorage = (newReports: RyffReportEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
    } catch (error) {
      console.error('Error saving Ryff reports:', error);
    }
  };

  const addReport = async (scores: RyffScore): Promise<RyffReportEntry> => {
    const newReport: RyffReportEntry = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      scores,
    };

    const updatedReports = [newReport, ...reports];
    // Optional: Limit history size
    if (updatedReports.length > 10) {
        updatedReports.pop(); 
    }

    setReports(updatedReports);
    saveToStorage(updatedReports);
    
    return newReport;
  };

  const deleteReport = async (id: string): Promise<void> => {
    const updatedReports = reports.filter(report => report.id !== id);
    setReports(updatedReports);
    saveToStorage(updatedReports);
  };

  const getLatestReport = (): RyffReportEntry | undefined => {
    return reports.length > 0 ? reports[0] : undefined;
  };

  const updateReport = (id: string, updates: Partial<RyffReportEntry>) => {
  const updatedReports = reports.map(report => 
    report.id === id ? { ...report, ...updates } : report
  );
  setReports(updatedReports);
  saveToStorage(updatedReports);
};

return {
    reports,
    loading,
    addReport,
    deleteReport,
    updateReport,
    getLatestReport,
  };
};