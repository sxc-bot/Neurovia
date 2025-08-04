import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, Share2, TrendingUp, AlertCircle, CheckCircle, Target, Users, Home, Sparkles, Trash2, Brain } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useLocalRyffReport } from '../hooks/useLocalRyffReport';
import { getDimensionAdvice, generateReportSummary } from '../lib/gemini';
import { useMemo } from 'react';

const AIReport: React.FC = () => {
  const [advices, setAdvices] = useState<{ [key: string]: string }>({});
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({});
  const [tempFeedback, setTempFeedback] = useState<{ [key: string]: string }>({});
  const [summary, setSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingAdvices, setLoadingAdvices] = useState(false);
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const { reports, deleteReport, loading, updateReport } = useLocalRyffReport();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');
  const navigate = useNavigate();

  const selectedReport = useMemo(() => reports.find(r => r.id === selectedReportId) || null, [reports, selectedReportId]);

  useEffect(() => {
    const handleStorageChange = () => {
      setLanguage(localStorage.getItem('language') || 'en');
    };
    window.addEventListener('localStorageChange', handleStorageChange);
    return () => window.removeEventListener('localStorageChange', handleStorageChange);
  }, []);

  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  useEffect(() => {
    if (selectedReport?.advices) {
      setAdvices(selectedReport.advices);
    }
    if (selectedReport?.feedbacks) {
      setFeedbacks(selectedReport.feedbacks);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (!selectedReport) return;

    // If report already contains summary, load it
    if (selectedReport.summary) {
      setSummary(selectedReport.summary);
    }

    const dimensionsCount = Object.keys(selectedReport.scores).length;
    const allSubmitted = Object.keys(feedbacks).length === dimensionsCount &&
      Object.values(feedbacks).every(v => v && v.trim() !== '');

    if (allSubmitted && !selectedReport.summary && !loadingSummary) {
      (async () => {
        setLoadingSummary(true);
        const generated = await generateReportSummary(selectedReport.scores, feedbacks, language);
        setSummary(generated);
        updateReport(selectedReport.id, { summary: generated });
        setLoadingSummary(false);
      })();
    }
  }, [feedbacks, language, selectedReport]);

  const handleToggleAdvice = async (dimensionKey: string, score: number) => {
    const isExpanded = expanded[dimensionKey];
    setExpanded(prev => ({ ...prev, [dimensionKey]: !isExpanded }));

    if (!isExpanded && !advices[dimensionKey]) {
      setLoadingAdvices(true);
      try {
        const advice = await getDimensionAdvice(dimensionKey, score, language);
        const newAdvices = { ...advices, [dimensionKey]: advice };
        setAdvices(newAdvices);
        if (selectedReport) {
          updateReport(selectedReport.id, { advices: newAdvices });
        }
      } catch (error) {
        const errorAdvice = { ...advices, [dimensionKey]: language === 'id' ? 'Gagal mendapatkan saran' : 'Failed to get advice' };
        setAdvices(errorAdvice);
      }
      setLoadingAdvices(false);
    }
  };

  const getContent = () => {
    if (language === 'id') {
      return {
        title: 'Laporan Kesejahteraan AI',
        subtitle: 'Analisis komprehensif kesejahteraan psikologis Anda',
        export: 'Ekspor',
        share: 'Bagikan',
        reportDate: 'Tanggal Laporan',
        overallScore: 'Skor Keseluruhan',
        progress: 'Kemajuan',
        status: 'Status',
        excellent: 'Sangat Baik',
        wellbeingDimensions: 'Dimensi Kesejahteraan',
        dimensionScores: 'Skor Dimensi',
        progressTrend: 'Tren Kemajuan',
        aiSummary: 'Ringkasan AI',
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
        dimensions: {
          autonomy: 'Otonomi',
          environmentalMastery: 'Penguasaan Lingkungan',
          personalGrowth: 'Pertumbuhan Pribadi',
          positiveRelations: 'Hubungan Positif',
          purposeInLife: 'Tujuan Hidup',
          selfAcceptance: 'Penerimaan Diri',
        },
        reportHistory: [
          { id: 'latest', date: '2024-01-21', title: 'Analisis Kesejahteraan Komprehensif', status: 'Selesai' },
          { id: 'jan2024', date: '2024-01-15', title: 'Laporan Kemajuan Tengah Bulan', status: 'Selesai' },
          { id: 'dec2023', date: '2023-12-28', title: 'Ringkasan Kesejahteraan Akhir Tahun', status: 'Selesai' },
        ],
        feedbackPlaceholder: 'Bagikan pendapat Anda tentang analisis ini...',
        saveFeedback: 'Simpan Feedback',
        savedFeedback: 'Feedback Tersimpan'
      };
    } else {
      return {
        title: 'AI Wellbeing Report',
        subtitle: 'Comprehensive analysis of your psychological wellbeing',
        export: 'Export',
        share: 'Share',
        reportDate: 'Report Date',
        overallScore: 'Overall Score',
        progress: 'Progress',
        status: 'Status',
        excellent: 'Excellent',
        wellbeingDimensions: 'Wellbeing Dimensions',
        dimensionScores: 'Dimension Scores',
        progressTrend: 'Progress Trend',
        aiSummary: 'AI Summary',
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        dimensions: {
          autonomy: 'Autonomy',
          environmentalMastery: 'Environmental Mastery',
          personalGrowth: 'Personal Growth',
          positiveRelations: 'Positive Relations',
          purposeInLife: 'Purpose in Life',
          selfAcceptance: 'Self-Acceptance',
        },
        reportHistory: [
          { id: 'latest', date: '2024-01-21', title: 'Comprehensive Wellbeing Analysis', status: 'Complete' },
          { id: 'jan2024', date: '2024-01-15', title: 'Mid-Month Progress Report', status: 'Complete' },
          { id: 'dec2023', date: '2023-12-28', title: 'Year-End Wellbeing Summary', status: 'Complete' },
        ],
        feedbackPlaceholder: 'Share your thoughts on this analysis...',
        saveFeedback: 'Save Feedback',
        savedFeedback: 'Saved Feedback'
      };
    }
  };

  const content = getContent();

  const handleDelete = () => {
    if (selectedReportId) {
      deleteReport(selectedReportId);
      setSelectedReportId(reports.length > 1 ? reports.find(r => r.id !== selectedReportId)!.id : null);
    }
  };

  const reportDate = selectedReport ? new Date(selectedReport.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const previousReportIndex = reports.findIndex(r => r.id === selectedReportId) + 1;
  const previousReport = previousReportIndex < reports.length ? reports[previousReportIndex] : null;

  const overallScore = selectedReport ? (Object.values(selectedReport.scores).reduce((a, b) => a + b, 0) / Object.keys(selectedReport.scores).length).toFixed(1) : 'N/A';
const getStatus = (score: number, lang: string) => {
  if (score >= 90) return lang === 'id' ? 'Sangat Baik' : 'Excellent';
  if (score >= 80) return lang === 'id' ? 'Optimal' : 'Optimal';
  if (score >= 70) return lang === 'id' ? 'Baik' : 'Good';
  if (score >= 50) return lang === 'id' ? 'Cukup' : 'Fair';
  if (score >= 30) return lang === 'id' ? 'Rendah' : 'Low';
  return lang === 'id' ? 'Kritis' : 'Critical';
};
  const previousOverall = previousReport ? (Object.values(previousReport.scores).reduce((a, b) => a + b, 0) / Object.keys(previousReport.scores).length).toFixed(1) : null;
  const progress = previousOverall !== null && parseFloat(previousOverall) !== 0 ? (((parseFloat(overallScore) - parseFloat(previousOverall)) / parseFloat(previousOverall)) * 100).toFixed(1) : null;

  const localizedScores = selectedReport ? Object.entries(selectedReport.scores).map(([key, score]) => {
    const previousScore = previousReport ? previousReport.scores[key] : undefined;
    const iconMap = {
        autonomy: Target,
        environmentalMastery: Home,
        personalGrowth: Sparkles,
        positiveRelations: Users,
        purposeInLife: Target, 
        selfAcceptance: CheckCircle
    };
    return {
        dimensionKey: key,
        dimension: content.dimensions[key],
        score: score,
        previousScore: previousScore,
        icon: iconMap[key]
    };
  }) : [];

  const trendData = reports.length > 1 ? reports.map(r => ({
    date: new Date(r.date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { month: 'short', day: 'numeric' }),
    score: Math.round(Object.values(r.scores).reduce((a, b) => a + b, 0) / Object.keys(r.scores).length)
  })).reverse() : [];

  if (loading) {
    return <div className="flex justify-center items-center h-full">Loading reports...</div>;
  }

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center p-8">
        <div className="bg-white dark:bg-slate-800/50 p-8 rounded-full mb-6 shadow-lg">
          <FileText className="w-16 h-16 text-slate-500" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          {language === 'id' ? 'Tidak Ada Laporan Tersedia' : 'No Reports Available'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md">
          {language === 'id'
            ? 'Anda belum memiliki laporan AI. Selesaikan penilaian untuk membuat laporan pertama Anda.'
            : "You don't have any AI reports yet. Complete an assessment to generate your first one."}
        </p>
        <button
          onClick={() => navigate('/mind-metrics')}
          className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          {language === 'id' ? 'Mulai Penilaian' : 'Take Assessment'}
        </button>
      </div>
    );
  }

  const getInsightColor = (color: string) => {
    switch (color) {
      case 'green':
        return 'from-green-500/10 to-emerald-500/10 border-green-200/50 dark:border-green-500/30';
      case 'yellow':
        return 'from-yellow-500/10 to-amber-500/10 border-yellow-200/50 dark:border-yellow-500/30';
      case 'blue':
        return 'from-blue-500/10 to-indigo-500/10 border-blue-200/50 dark:border-blue-500/30';
      default:
        return 'from-slate-500/10 to-slate-500/10 border-slate-200/50 dark:border-slate-500/30';
    }
  };

  const getImpactColor = (impact: string) => {
    const isHigh = impact === 'High' || impact === 'Tinggi';
    const isMedium = impact === 'Medium' || impact === 'Sedang';
    
    if (isHigh) {
      return 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20';
    } else if (isMedium) {
      return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20';
    } else {
      return 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20';
    }
  };

  if (!selectedReport) {
    const noDataContent = language === 'id' ? {
      title: 'Tidak Ada Data Tersedia',
      message: 'Sepertinya Anda belum menyelesaikan kuesioner kesejahteraan. Silakan ikuti tes untuk menghasilkan laporan AI yang dipersonalisasi.',
      button: 'Ikuti Kuesioner'
    } : {
      title: 'No Data Available',
      message: 'It looks like you haven\'t completed the wellbeing questionnaire yet. Please take the test to generate your personalized AI report.',
      button: 'Take the Questionnaire'
    };

    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white/80 dark:bg-slate-800/90 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{noDataContent.title}</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-6">{noDataContent.message}</p>
        <button 
          onClick={() => navigate('/mind-metrics')} 
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <CheckCircle className="w-5 h-5" />
          <span>{noDataContent.button}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{content.title}</h1>
              <p className="text-slate-600 dark:text-slate-400">{content.subtitle}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-3">
            <select
              value={selectedReportId || ''}
              onChange={(e) => setSelectedReportId(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/50"
            >
              {reports.map((report) => (
                <option key={report.id} value={report.id}>
                  {new Date(report.date).toLocaleDateString()} - {language === 'id' ? 'Laporan' : 'Report'}
                </option>
              ))}
            </select>
            <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3 w-full md:w-auto">
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Download className="w-4 h-4" />
                <span>{content.export}</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Share2 className="w-4 h-4" />
                <span>{content.share}</span>
              </button>
              <button onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
                <span>{language === 'id' ? 'Hapus Laporan' : 'Delete Report'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{content.reportDate}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {reportDate}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{content.overallScore}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{overallScore}%</p>
          </div>
          {progress !== null && (
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{content.progress}</p>
            <p className={`text-lg font-semibold ${progress >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{progress >= 0 ? '+' : ''}{progress}%</p>
          </div>
        )}
          <div className="text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">{content.status}</p>
            <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{getStatus(parseFloat(overallScore), language)}</p>
          </div>
        </div>
      </div>



      {/* Ryff Dimensions Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.wellbeingDimensions}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={localizedScores}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#64748b' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                <Radar
                  name="Current"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                {previousReport && (
                <Radar
                  name="Previous"
                  dataKey="previousScore"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.1}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                />
              )}
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dimension Scores */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.dimensionScores}</h3>
          <div className="space-y-4">
            {localizedScores.map((dimension) => {
              const Icon = dimension.icon;
              const change = dimension.score - dimension.previousScore;
              return (
                <div key={dimension.dimension} className="p-3 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{dimension.dimension}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-slate-800 dark:text-slate-100">{dimension.score}%</span>
                      {dimension.previousScore !== undefined && (
                        <span className={`text-sm flex items-center ${
                          change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                        }`}>
                          <TrendingUp className="w-3 h-3 mr-1" />
                          {change >= 0 ? '+' : ''}{change}
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleAdvice(dimension.dimensionKey, dimension.score)}
                        className="ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {expanded[dimension.dimensionKey] ? '▲' : '▼'}
                      </button>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                      <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${dimension.score}%` }}></div>
                    </div>
                  </div>
                  {expanded[dimension.dimensionKey] && (
                    <div className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                      {loadingAdvices && !advices[dimension.dimensionKey] ? 'Loading advice...' : (
  advices[dimension.dimensionKey] ? (
    (() => {
      const [header, ...body] = advices[dimension.dimensionKey].split('\n');
      const cleanHeader = header.replace(/\*\*/g, '');
      return (
        <>
          <strong className="block mb-2">{cleanHeader}</strong>
          <p>{body.join('\n')}</p>
        </>
      );
    })()
  ) : 'Click to get advice'
)}
                      {advices[dimension.dimensionKey] && (
                        <div className="mt-4">
                          <textarea
                            className="w-full p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            placeholder={content.feedbackPlaceholder}
                            value={tempFeedback[dimension.dimensionKey] || feedbacks[dimension.dimensionKey] || ''}
                            onChange={(e) => setTempFeedback(prev => ({ ...prev, [dimension.dimensionKey]: e.target.value }))}
                          />
                          <button
                            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
                            onClick={() => {
                              const newFeedbacks = { ...feedbacks, [dimension.dimensionKey]: tempFeedback[dimension.dimensionKey] };
                              setFeedbacks(newFeedbacks);
                              if (selectedReport) {
                                updateReport(selectedReport.id, { feedbacks: newFeedbacks });
                              }
                              setTempFeedback(prev => ({ ...prev, [dimension.dimensionKey]: '' }));
                            }}
                          >
                            {content.saveFeedback}
                          </button>
                          {feedbacks[dimension.dimensionKey] && <p className="mt-2">{content.savedFeedback}: {feedbacks[dimension.dimensionKey]}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Trend */}
      {trendData && trendData.length > 0 && (
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.progressTrend}</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(4px)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(226, 232, 240, 0.5)',
                    color: '#334155'
                  }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}





      {/* AI Summary - generated after all feedback submitted */}
      {(loadingSummary || summary) && (
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/30 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.aiSummary}</h3>
        </div>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
          {loadingSummary ? (language === 'id' ? 'Menghasilkan ringkasan...' : 'Generating summary...') : summary}
        </p>
      </div>
      )}
    </div>
  );
};

export default AIReport;