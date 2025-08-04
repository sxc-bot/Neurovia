import React, { useState, useEffect } from 'react';
import { Send, TrendingUp, Calendar, Smile, Meh, Frown, BarChart3, Plus, Edit, Trash2, Lightbulb, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLocalJournal, type JournalEntry } from '../hooks/useLocalJournal';
import JournalEntryModal from '../components/JournalEntryModal';

const Journal: React.FC = () => {
  const [journalEntry, setJournalEntry] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [sentimentTimeframe, setSentimentTimeframe] = useState<'day' | 'week' | 'month'>('day');
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 5;
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const { entries, loading, addEntry, updateEntry, deleteEntry } = useLocalJournal();

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

  const getContent = () => {
    if (language === 'id') {
      return {
        title: 'Entri Jurnal Hari Ini',
        placeholder: 'Bagaimana perasaan Anda hari ini? Bagikan pemikiran, pengalaman, dan emosi Anda...',
        analyzing: 'Menganalisis...',
        analyzeEntry: 'Analisis Entri',
        saveEntry: 'Simpan Entri',
        newEntry: 'Entri Baru',
        currentAnalysis: 'Analisis Saat Ini',
        sentimentTrend: 'Tren Sentimen',
        emotionDistribution: 'Distribusi Emosi',
        recentEntries: 'Entri Terbaru',
        noEntries: 'Belum ada entri jurnal. Mulai dengan menulis entri pertama Anda!',
        edit: 'Edit',
        delete: 'Hapus',
        day: 'Hari',
        week: 'Minggu',
        month: 'Bulan',
        previous: 'Sebelumnya',
        next: 'Selanjutnya',
        page: 'Halaman',
        of: 'dari',
        characters: 'karakter',
        words: 'kata',
        emotions: {
          positive: 'Positif',
          neutral: 'Netral',
          negative: 'Negatif',
          joy: 'Kegembiraan',
          confidence: 'Kepercayaan Diri',
          gratitude: 'Rasa Syukur'
        },
      };
    } else {
      return {
        title: "Today's Journal Entry",
        placeholder: 'How are you feeling today? Share your thoughts, experiences, and emotions...',
        analyzing: 'Analyzing...',
        analyzeEntry: 'Analyze Entry',
        saveEntry: 'Save Entry',
        newEntry: 'New Entry',
        edit: 'Edit',
        delete: 'Delete',
        currentAnalysis: 'Current Analysis',
        sentimentTrend: 'Sentiment Trend',
        emotionDistribution: 'Emotion Distribution',
        recentEntries: 'Recent Entries',
        noEntries: 'No journal entries yet. Start by writing your first entry!',
        characters: 'characters',
        words: 'words',
        day: 'Day',
        week: 'Week',
        month: 'Month',
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
        emotions: {
          positive: 'Positive',
          neutral: 'Neutral',
          negative: 'Negative',
          joy: 'Joy',
          confidence: 'Confidence',
          gratitude: 'Gratitude'
        },
      };
    }
  };

  const content = getContent();

  // Calculate sentiment history based on timeframe
  const getSentimentHistory = () => {
    const now = new Date();
    let filteredEntries = [...entries];
    let dataPoints = 7; 
    let dateFormat: Intl.DateTimeFormatOptions = { weekday: 'short' };
    
    if (sentimentTimeframe === 'week') {
      // Last 4 weeks
      const fourWeeksAgo = new Date(now.getTime() - (4 * 7 * 24 * 60 * 60 * 1000));
      filteredEntries = entries.filter(entry => new Date(entry.created_at) >= fourWeeksAgo);
      dataPoints = 4;
      dateFormat = { month: 'short', day: 'numeric' };
    } else if (sentimentTimeframe === 'month') {
      // Last 6 months
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      filteredEntries = entries.filter(entry => new Date(entry.created_at) >= sixMonthsAgo);
      dataPoints = 6;
      dateFormat = { month: 'short' };
    } else {
      // Last 7 days - ensure we always have 7 data points for proper curve
      const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      filteredEntries = entries.filter(entry => new Date(entry.created_at) >= sevenDaysAgo);
    }

    if (sentimentTimeframe === 'day') {
      // For daily view, create data points for each of the last 7 days
      const dailyData = [];
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
        targetDate.setHours(0, 0, 0, 0);
        
        // Find entries for this specific day
        const dayEntries = filteredEntries.filter(entry => {
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
        
        dailyData.push({
          date: targetDate.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', dateFormat),
          score: dayScore,
          emotion: dayScore >= 60 ? content.emotions.positive :
                  dayScore <= 40 ? content.emotions.negative : content.emotions.neutral,
          hasData: dayEntries.length > 0
        });
      }
      
      return dailyData;
    }

    // For week and month views, use the existing grouping logic
    const groupedData: { [key: string]: { scores: number[], date: Date } } = {};
    
    filteredEntries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      let groupKey = '';
      
      if (sentimentTimeframe === 'week') {
        // Group by week
        const weekStart = new Date(entryDate);
        weekStart.setDate(entryDate.getDate() - entryDate.getDay());
        groupKey = weekStart.toDateString();
      } else {
        // Group by month
        groupKey = `${entryDate.getFullYear()}-${entryDate.getMonth()}`;
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = { scores: [], date: entryDate };
      }
      groupedData[groupKey].scores.push(entry.sentiment_score);
    });

    // Convert to chart data
    const chartData = Object.entries(groupedData)
      .map(([key, data]) => ({
        date: data.date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', dateFormat),
        score: Math.round(data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length),
        emotion: data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length >= 60 ? content.emotions.positive :
                data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length <= 40 ? content.emotions.negative : content.emotions.neutral,
        hasData: true
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-dataPoints);

    return chartData;
  };

  const sentimentHistory = getSentimentHistory();

  // Calculate emotion distribution from actual entries
  const emotionDistribution = entries.length > 0 ? [
    { 
      name: content.emotions.positive, 
      value: Math.round((entries.filter(e => e.sentiment_label === 'positive').length / entries.length) * 100), 
      color: '#10b981' 
    },
    { 
      name: content.emotions.neutral, 
      value: Math.round((entries.filter(e => e.sentiment_label === 'neutral').length / entries.length) * 100), 
      color: '#f59e0b' 
    },
    { 
      name: content.emotions.negative, 
      value: Math.round((entries.filter(e => e.sentiment_label === 'negative').length / entries.length) * 100), 
      color: '#ef4444' 
    },
  ] : [
    { name: content.emotions.positive, value: 65, color: '#10b981' },
    { name: content.emotions.neutral, value: 25, color: '#f59e0b' },
    { name: content.emotions.negative, value: 10, color: '#ef4444' },
  ];

  // Get current analysis from latest entry or default values
  const latestEntry = entries[0];
  const currentAnalysis = latestEntry ? {
    sentiment: latestEntry.sentiment_label,
    score: latestEntry.sentiment_score,
    emotions: latestEntry.emotions
  } : null;

  // Pagination logic for recent entries
  const totalPages = Math.ceil(entries.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = startIndex + entriesPerPage;
  const paginatedEntries = entries.slice(startIndex, endIndex);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // Simulate API call
    setTimeout(() => {
      setIsAnalyzing(false);
    }, 2000);
  };

  const handleSaveEntry = async () => {
    if (!journalEntry.trim()) return;
    
    try {
      await addEntry(journalEntry);
      setJournalEntry('');
    } catch (error) {
      console.error('Failed to save entry:', error);
    }
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleModalSave = async (content: string) => {
    if (editingEntry) {
      await updateEntry(editingEntry.id, content);
    } else {
      await addEntry(content);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEntry(null);
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'positif':
        return <Smile className="w-5 h-5 text-green-500" />;
      case 'neutral':
      case 'netral':
        return <Meh className="w-5 h-5 text-yellow-500" />;
      case 'negative':
      case 'negatif':
        return <Frown className="w-5 h-5 text-red-500" />;
      default:
        return <Meh className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Journal Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Journal Entry */}
        <div className="lg:col-span-2 bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.title}</h3>
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>{content.newEntry}</span>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder={content.placeholder}
              className="w-full h-64 p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 focus:ring-2 focus:ring-blue-500/50 focus:border-transparent outline-none resize-none text-slate-700 dark:text-slate-300 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
                <span>{journalEntry.length} {content.characters}</span>
                <span>•</span>
                <span>{journalEntry.split(' ').filter(word => word.length > 0).length} {content.words}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAnalyze}
                  disabled={!journalEntry.trim() || isAnalyzing}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{content.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      <span>{content.analyzeEntry}</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSaveEntry}
                  disabled={!journalEntry.trim() || loading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                  <span>{content.saveEntry}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Current Sentiment Analysis */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.currentAnalysis}</h3>
          
          {currentAnalysis ? (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-200/50 dark:border-green-500/30">
                <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                  {getSentimentIcon(currentAnalysis.sentiment)}
                </div>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {currentAnalysis.sentiment === 'positive' ? content.emotions.positive :
                   currentAnalysis.sentiment === 'negative' ? content.emotions.negative : content.emotions.neutral}
                </p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{currentAnalysis.score}%</p>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>{content.emotions.joy}</span>
                    <span>{currentAnalysis.emotions.joy}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: `${currentAnalysis.emotions.joy}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>{content.emotions.confidence}</span>
                    <span>{currentAnalysis.emotions.confidence}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" style={{ width: `${currentAnalysis.emotions.confidence}%` }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                    <span>{content.emotions.gratitude}</span>
                    <span>{currentAnalysis.emotions.gratitude}%</span>
                  </div>
                  <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                    <div className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full" style={{ width: `${currentAnalysis.emotions.gratitude}%` }}></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                {language === 'id' ? 'Belum ada analisis' : 'No analysis yet'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {language === 'id' ? 'Tulis entri jurnal pertama Anda untuk melihat analisis sentimen' : 'Write your first journal entry to see sentiment analysis'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sentiment Trends and Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Trend */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.sentimentTrend}</h3>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1 bg-slate-100/50 dark:bg-slate-700/50 rounded-lg p-1">
                {(['day', 'week', 'month'] as const).map((timeframe) => (
                  <button
                    key={timeframe}
                    onClick={() => setSentimentTimeframe(timeframe)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      sentimentTimeframe === timeframe
                        ? 'bg-blue-500 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {content[timeframe]}
                  </button>
                ))}
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sentimentHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
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

        {/* Emotion Distribution */}
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.emotionDistribution}</h3>
          
          {entries.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={emotionDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {emotionDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-slate-500 dark:text-slate-400 mb-2">
                {language === 'id' ? 'Belum ada distribusi emosi' : 'No emotion distribution yet'}
              </p>
              <p className="text-sm text-slate-400 dark:text-slate-500">
                {language === 'id' ? 'Mulai menulis jurnal untuk melihat distribusi emosi Anda' : 'Start journaling to see your emotion distribution'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Entries */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{content.recentEntries}</h3>
          {entries.length > entriesPerPage && (
            <div className="flex items-center space-x-2 text-sm text-slate-500 dark:text-slate-400">
              <span>{content.page} {currentPage} {content.of} {totalPages}</span>
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-slate-500 dark:text-slate-400">Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{content.noEntries}</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{content.newEntry}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {paginatedEntries.map((entry) => (
              <div key={entry.id} className="p-4 bg-slate-50/50 dark:bg-slate-700/50 rounded-xl border border-slate-200/50 dark:border-slate-600/50 hover:bg-slate-100/50 dark:hover:bg-slate-600/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {new Date(entry.created_at).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US')}
                      </span>
                      <div className="flex items-center space-x-1">
                        {getSentimentIcon(entry.sentiment_label)}
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                          {entry.sentiment_label === 'positive' ? content.emotions.positive :
                           entry.sentiment_label === 'negative' ? content.emotions.negative : content.emotions.neutral}
                        </span>
                      </div>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{entry.sentiment_score}%</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {entry.content.length > 150 ? `${entry.content.substring(0, 150)}...` : entry.content}
                    </p>
                    {entry.ai_insights && (
                      <div className="mt-2 p-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-500/30">
                        <div className="flex items-start space-x-2">
                          <Lightbulb className="w-3 h-3 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-blue-700 dark:text-blue-300">{entry.ai_insights}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEditEntry(entry)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title={content.edit}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50/50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title={content.delete}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {entries.length > entriesPerPage && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-600/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{content.previous}</span>
            </button>
            
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-700/50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{content.next}</span>
            </button>
          </div>
        )}
      </div>

      {/* Journal Entry Modal */}
      <JournalEntryModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        entry={editingEntry}
        onSave={handleModalSave}
        onDelete={deleteEntry}
        language={language}
      />
    </div>
  );
};

export default Journal;