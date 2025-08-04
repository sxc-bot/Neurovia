import React, { useState, useEffect } from 'react';
import { TrendingUp, Brain, Target, Flame, Heart } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useLocalJournal } from '../hooks/useLocalJournal';
import { useLocalRyffReport } from '../hooks/useLocalRyffReport';

const Dashboard: React.FC = () => {
  const { getCurrentStreak, entries } = useLocalJournal();
  const { reports, loading: reportsLoading } = useLocalRyffReport();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Sync language state with localStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedLanguage = localStorage.getItem('language') || 'en';
      setLanguage(storedLanguage);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, []);

  // Generate sentiment data from actual journal entries for the last 7 days
  const getSentimentData = () => {
    const now = new Date();
    const dailyData: { score: any; }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      targetDate.setHours(0, 0, 0, 0);
      
      // Find entries for this specific day
      const dayEntries = entries.filter(entry => {
        const entryDate = new Date(entry.created_at);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === targetDate.getTime();
      });
      
      // Calculate average sentiment for the day, or use previous day's value if no entries
      let dayScore = null;
      if (dayEntries.length > 0) {
        dayScore = Math.round(dayEntries.reduce((sum, entry) => sum + entry.sentiment_score, 0) / dayEntries.length);
      } else if (dailyData.length > 0) {
        // Use previous day's score to maintain curve continuity
        dayScore = dailyData[dailyData.length - 1].score;
      } else {
        // Default neutral score for first day if no data
        dayScore = 50;
      }
      
      // Get day abbreviation based on language
      const dayNames = language === 'id' 
        ? ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
        : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      dailyData.push({
        day: dayNames[targetDate.getDay()],
        score: dayScore,
        hasData: dayEntries.length > 0
      });
    }
    
    return dailyData;
  };

  const sentimentData = getSentimentData();

  // Get Ryff data from the latest report
  const getRyffData = () => {
    if (reports.length === 0) return [];
    
    const latestReport = reports[0];
    const idealScores = {
      autonomy: 90,
      environmentalMastery: 85,
      personalGrowth: 95,
      positiveRelations: 90,
      purposeInLife: 88,
      selfAcceptance: 92
    };
    
    return [
      { 
        dimension: language === 'id' ? 'Otonomi' : 'Autonomy', 
        current: latestReport.scores.autonomy, 
        ideal: idealScores.autonomy 
      },
      { 
        dimension: language === 'id' ? 'Penguasaan Lingkungan' : 'Environmental Mastery', 
        current: latestReport.scores.environmentalMastery, 
        ideal: idealScores.environmentalMastery 
      },
      { 
        dimension: language === 'id' ? 'Pertumbuhan Pribadi' : 'Personal Growth', 
        current: latestReport.scores.personalGrowth, 
        ideal: idealScores.personalGrowth 
      },
      { 
        dimension: language === 'id' ? 'Hubungan Positif' : 'Positive Relations', 
        current: latestReport.scores.positiveRelations, 
        ideal: idealScores.positiveRelations 
      },
      { 
        dimension: language === 'id' ? 'Tujuan Hidup' : 'Purpose in Life', 
        current: latestReport.scores.purposeInLife, 
        ideal: idealScores.purposeInLife 
      },
      { 
        dimension: language === 'id' ? 'Penerimaan Diri' : 'Self-Acceptance', 
        current: latestReport.scores.selfAcceptance, 
        ideal: idealScores.selfAcceptance 
      },
    ];
  };
  
  // Only use real data, no mockup data
  const ryffData = reports.length > 0 ? getRyffData() : [];

  // AI summary text from latest report if available
  const aiSummary = reports.length > 0 && reports[0].summary ? reports[0].summary : '';

  const getContent = () => {
    if (language === 'id') {
      return {
        stats: {
          currentSentiment: 'Sentimen Saat Ini',
          wellbeingScore: 'Skor Kesejahteraan',
          growthProgress: 'Laporan yang Dihasilkan',
          currentStreak: 'Streak Jurnal',
          fromYesterday: 'dari sebelumnya',
          thisWeek: 'dari sebelumnya',
          thisMonth: 'bulan ini',
          days: 'hari'
        },
        sections: {
          sentimentTrend: 'Tren Sentimen',
          personalizedRecommendations: 'Rekomendasi Personal',
          ryffDimensions: 'Dimensi Kesejahteraan Ryff',
          aiInsights: 'Wawasan yang Dihasilkan AI',
          todaysInsight: 'Wawasan Hari Ini',
          growthTracker: 'Pelacak Pertumbuhan',
          wellbeingTip: 'Tips Kesejahteraan'
        },
        timeframes: {
          last7days: '7 hari terakhir',
          last30days: '30 hari terakhir',
          last90days: '90 hari terakhir'
        },
        recommendations: [
          {
            category: 'Kesadaran',
            action: 'Praktikkan meditasi harian selama 10 menit',
            impact: 'Tinggi',
            timeframe: 'Harian',
          },
          {
            category: 'Koneksi Sosial',
            action: 'Jadwalkan kegiatan sosial mingguan',
            impact: 'Sedang',
            timeframe: 'Mingguan',
          },
          {
            category: 'Penetapan Tujuan',
            action: 'Tinjau dan sesuaikan tujuan hidup secara triwulan',
            impact: 'Tinggi',
            timeframe: 'Triwulan',
          },
        ],
        insights: {
          todaysInsight: "Ketahanan emosional Anda telah meningkat 15% minggu ini. Pertimbangkan untuk menulis jurnal tentang pengalaman positif Anda baru-baru ini.",
          growthTracker: "Anda membuat kemajuan luar biasa dalam pertumbuhan pribadi. Terus fokus pada praktik mindfulness.",
          wellbeingTip: "Pertimbangkan untuk menjadwalkan lebih banyak aktivitas sosial. Skor hubungan positif Anda dapat diuntungkan dari peningkatan interaksi."
        },
        quote: {
          text: "Revolusi terbesar dari generasi kita adalah penemuan bahwa manusia, dengan mengubah sikap batin pikiran mereka, dapat mengubah aspek luar kehidupan mereka.",
          author: "— William James"
        }
      };
    } else {
      return {
        stats: {
          currentSentiment: 'Current Sentiment',
          wellbeingScore: 'Wellbeing Score',
          growthProgress: 'Reports Generated',
          currentStreak: 'Journal Streak',
          fromYesterday: 'from previous',
          thisWeek: 'from previous',
          thisMonth: 'this month',
          days: 'days'
        },
        sections: {
          sentimentTrend: 'Sentiment Trend',
          personalizedRecommendations: 'Personalized Recommendations',
          ryffDimensions: 'Ryff Wellbeing Dimensions',
          aiInsights: 'AI-Generated Insights',
          todaysInsight: "Today's Insight",
          growthTracker: 'Growth Tracker',
          wellbeingTip: 'Wellbeing Tip'
        },
        timeframes: {
          last7days: 'Last 7 days',
          last30days: 'Last 30 days',
          last90days: 'Last 90 days'
        },
        recommendations: [
          {
            category: 'Mindfulness',
            action: 'Practice daily meditation for 10 minutes',
            impact: 'High',
            timeframe: 'Daily',
          },
          {
            category: 'Social Connection',
            action: 'Schedule weekly social activities',
            impact: 'Medium',
            timeframe: 'Weekly',
          },
          {
            category: 'Goal Setting',
            action: 'Review and adjust life goals quarterly',
            impact: 'High',
            timeframe: 'Quarterly',
          },
        ],
        insights: {
          todaysInsight: "Your emotional resilience has improved by 15% this week. Consider journaling about your recent positive experiences.",
          growthTracker: "You're making excellent progress in personal growth. Keep focusing on mindfulness practices.",
          wellbeingTip: "Consider scheduling more social activities. Your positive relations score could benefit from increased interaction."
        },
        quote: {
          text: "The greatest revolution of our generation is the discovery that human beings, by changing the inner attitudes of their minds, can change the outer aspects of their lives.",
          author: "— William James"
        }
      };
    }
  };

  const content = getContent();

  // Dynamically build recommendations from the latest available Ryff report that contains advices
  const latestReportWithAdvices = reports.find(r => r.advices && Object.keys(r.advices).length > 0) || (reports.length > 0 ? reports[0] : undefined);
  const recommendations = latestReportWithAdvices ? (() => {
    const entries = Object.entries(latestReportWithAdvices.scores)
      .sort((a, b) => a[1] - b[1]) // Ascending by score (lowest first)
      .slice(0, 3); // Take lowest three

    const dimensionNames: Record<string, string> = {
      autonomy: language === 'id' ? 'Otonomi' : 'Autonomy',
      environmentalMastery: language === 'id' ? 'Penguasaan Lingkungan' : 'Environmental Mastery',
      personalGrowth: language === 'id' ? 'Pertumbuhan Pribadi' : 'Personal Growth',
      positiveRelations: language === 'id' ? 'Relasi Positif' : 'Positive Relations',
      purposeInLife: language === 'id' ? 'Tujuan Hidup' : 'Purpose in Life',
      selfAcceptance: language === 'id' ? 'Penerimaan Diri' : 'Self Acceptance',
    };

    return entries.map(([key, score]) => {
      const rawAdvice = latestReportWithAdvices.advices && latestReportWithAdvices.advices[key] ? latestReportWithAdvices.advices[key] : '';
      const [headerLine] = rawAdvice.split('\n');
      const adviceSummary = headerLine?.replace(/\*\*/g, '') || '';

      let colorClass = '';
      let impactLabel = '';
      if (score < 50) {
        colorClass = 'text-red-600 dark:text-red-400 bg-red-50/50 dark:bg-red-900/20';
        impactLabel = language === 'id' ? 'Risiko Tinggi' : 'High Risk';
      } else if (score < 70) {
        colorClass = 'text-yellow-600 dark:text-yellow-400 bg-yellow-50/50 dark:bg-yellow-900/20';
        impactLabel = language === 'id' ? 'Risiko Sedang' : 'Medium Risk';
      } else {
        colorClass = 'text-green-600 dark:text-green-400 bg-green-50/50 dark:bg-green-900/20';
        impactLabel = language === 'id' ? 'Risiko Rendah' : 'Low Risk';
      }

      return {
        category: dimensionNames[key] || key,
        action: adviceSummary,
        impactLabel,
        colorClass,
      };
    });
  })() : [];

  // Get the current streak
  const currentStreak = getCurrentStreak();

  // Calculate current sentiment from latest entry
  const getCurrentSentiment = () => {
    if (entries.length === 0) return null;
    
    const latestEntry = entries[0]; // entries are already sorted by date desc
    const previousEntry = entries[1];
    
    let changeFromYesterday = previousEntry && previousEntry.sentiment_score !== 0 ? Math.round((((latestEntry.sentiment_score - previousEntry.sentiment_score) / previousEntry.sentiment_score) * 100)) : 0;
    
    return {
      score: latestEntry.sentiment_score,
      change: changeFromYesterday,
      hasData: true
    };
  };

  const currentSentiment = getCurrentSentiment();

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{content.stats.currentSentiment}</p>
              {currentSentiment ? (
                <>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{currentSentiment.score}%</p>
                  <p className={`text-sm flex items-center mt-1 ${
                    currentSentiment.change >= 0 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${currentSentiment.change < 0 ? 'rotate-180' : ''}`} />
                    {currentSentiment.change >= 0 ? '+' : ''}{Math.round(currentSentiment.change)}% {content.stats.fromYesterday}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-400 dark:text-slate-500">--</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    {language === 'id' ? 'Belum ada data' : 'No data yet'}
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{content.stats.wellbeingScore}</p>
              {reports.length > 0 ? (
                <>
                  <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {(Object.values(reports[0].scores).reduce((a, b) => a + b, 0) / Object.keys(reports[0].scores).length).toFixed(1)}%
                  </p>
                  {reports.length > 1 && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {(() => {
                        const currentScore = Object.values(reports[0].scores).reduce((a, b) => a + b, 0) / Object.keys(reports[0].scores).length;
                        const previousScore = Object.values(reports[1].scores).reduce((a, b) => a + b, 0) / Object.keys(reports[1].scores).length;
                        const change = previousScore !== 0 ? (((currentScore - previousScore) / previousScore) * 100).toFixed(1) : '0';
                        return `${change >= 0 ? '+' : ''}${change}%`;
                      })()} {content.stats.thisWeek}
                    </p>
                  )}
                </>
              ) : (
                <>
                  <p className="text-3xl font-bold text-slate-400 dark:text-slate-500">--</p>
                  <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                    {language === 'id' ? 'Belum ada data' : 'No data yet'}
                  </p>
                </>
              )}
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{content.stats.currentStreak}</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{currentStreak}</p>
              <p className={`text-sm flex items-center mt-1 ${
                currentStreak > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'
              }`}>
                <Flame className="w-4 h-4 mr-1" />
                {currentStreak === 0 
                  ? (language === 'id' ? 'Mulai streak baru!' : 'Start a new streak!') 
                  : `${currentStreak} ${content.stats.days}`
                }
              </p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              currentStreak > 0 
                ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                : 'bg-gradient-to-br from-slate-400 to-slate-500'
            }`}>
              <Flame className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{content.stats.growthProgress}</p>
              <p className="text-3xl font-bold text-slate-800 dark:text-slate-100">{reports.length}</p>
              
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sentiment Trend */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.sections.sentimentTrend}</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" />
                <YAxis stroke="#64748b" domain={[0, 100]} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#gradient)"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.sections.personalizedRecommendations}</h3>
            <Target className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="space-y-4">
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{rec.category}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${rec.colorClass}`}>{rec.impactLabel}</span>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-100">{rec.action}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {language === 'id' ? 'Buat laporan pertama Anda untuk mendapatkan rekomendasi personal.' : 'Generate your first report to obtain personalized recommendations.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Ryff Dimensions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ryff Dimensions */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-6">{content.sections.ryffDimensions}</h3>
          <div className="h-64">
            {reports.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={ryffData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400 dark:text-slate-500">
                  {language === 'id' ? 'Belum ada data dimensi Ryff' : 'No Ryff dimension data yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AI Summary Panel */}
        <div className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-md rounded-2xl p-6 border border-blue-200/50 dark:border-blue-500/30 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{language === 'id' ? 'Ringkasan AI' : 'AI Summary'}</h3>
          </div>
          {aiSummary ? (
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
            {aiSummary}
          </p>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {language === 'id'
                ? 'Lengkapi umpan balik Anda untuk mendapatkan ringkasan.'
                : 'Complete your feedback to obtain a summary.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;