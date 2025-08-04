import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Brain, CheckCircle } from 'lucide-react';
import { ryffQuestionsEN, ryffQuestionsID, calculateRyffScores } from '../lib/ryff';
import { useLocalRyffReport } from '../hooks/useLocalRyffReport';

const MindMetrics: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<typeof ryffQuestionsEN>([]);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Fisher-Yates shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  useEffect(() => {
    setCurrentQuestion(0);
    setAnswers({});
    setIsCompleted(false);
  }, []);

  useEffect(() => {
    const content = getContent();
    setShuffledQuestions(shuffleArray(content.questions));
  }, [language]);

  useEffect(() => {
    const content = getContent();
    setShuffledQuestions(shuffleArray(content.questions));
  }, []);

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
        title: 'Skala Kesejahteraan Psikologis Ryff',
        subtitle: 'Penilaian komprehensif kesejahteraan psikologis Anda',
        question: 'Pertanyaan',
        of: 'dari',
        complete: 'Selesai',
        surveyComplete: 'Survei Selesai!',
        thankYou: 'Terima kasih telah menyelesaikan Skala Kesejahteraan Psikologis Ryff. Tanggapan Anda telah dicatat dan akan dianalisis untuk memberikan wawasan tentang kesejahteraan psikologis Anda.',
        questionsAnswered: 'Pertanyaan Dijawab',
        completionRate: 'Tingkat Penyelesaian',
        submitSurvey: 'Kirim Survei & Buat Laporan',
        howMuchAgree: 'Seberapa setuju Anda dengan pernyataan ini?',
        previous: 'Sebelumnya',
        next: 'Selanjutnya',
        wellbeingDimensions: 'Dimensi Kesejahteraan',
        dimensions: {
          autonomy: 'Otonomi',
          environmentalMastery: 'Penguasaan Lingkungan',
          personalGrowth: 'Pertumbuhan Pribadi',
          positiveRelations: 'Hubungan Positif',
          purposeInLife: 'Tujuan Hidup',
          selfAcceptance: 'Penerimaan Diri',
        },
        questions: ryffQuestionsID,
        scaleLabels: [
          'Sangat Tidak Setuju',
          'Tidak Setuju',
          'Kurang Setuju',
          'Netral',
          'Agak Setuju',
          'Setuju',
          'Sangat Setuju',
        ]
      };
    } else {
      return {
        title: 'Ryff Psychological Wellbeing Scale',
        subtitle: 'A comprehensive assessment of your psychological wellbeing',
        question: 'Question',
        of: 'of',
        complete: 'Complete',
        surveyComplete: 'Survey Complete!',
        thankYou: 'Thank you for completing the Ryff Psychological Wellbeing Scale. Your responses have been recorded and will be analyzed to provide insights into your psychological wellbeing.',
        questionsAnswered: 'Questions Answered',
        completionRate: 'Completion Rate',
        submitSurvey: 'Submit Survey & Generate Report',
        howMuchAgree: 'How much do you agree with this statement?',
        previous: 'Previous',
        next: 'Next',
        wellbeingDimensions: 'Wellbeing Dimensions',
        dimensions: {
          autonomy: 'Autonomy',
          environmentalMastery: 'Environmental Mastery',
          personalGrowth: 'Personal Growth',
          positiveRelations: 'Positive Relations',
          purposeInLife: 'Purpose in Life',
          selfAcceptance: 'Self-Acceptance',
        },
        questions: ryffQuestionsEN,
        scaleLabels: [
          'Strongly Disagree',
          'Disagree',
          'Slightly Disagree',
          'Neutral',
          'Slightly Agree',
          'Agree',
          'Strongly Agree',
        ]
      };
    }
  };

  const content = getContent();

  const handleAnswer = (score: number) => {
    const questionId = shuffledQuestions[currentQuestion].id;
    setAnswers({ ...answers, [questionId]: score });
  };

  const handleRandomize = () => {
    const randomAnswers = shuffledQuestions.reduce((acc, q) => {
      acc[q.id] = Math.floor(Math.random() * 7) + 1;
      return acc;
    }, {} as Record<number, number>);
    setAnswers(randomAnswers);
    setIsCompleted(true);
  };

  const handleNext = () => {
    if (currentQuestion < shuffledQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (Object.keys(answers).length === shuffledQuestions.length) {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const { addReport } = useLocalRyffReport();
  const navigate = useNavigate();
  const handleSubmit = async () => {
    const scores = calculateRyffScores(answers);
    await addReport(scores);

    console.log('Ryff Scores:', scores);
    navigate('/ai-report');
  };

  const progress = shuffledQuestions.length > 0 ? ((currentQuestion + 1) / shuffledQuestions.length) * 100 : 0;

  if (shuffledQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">{content.surveyComplete}</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {content.thankYou}
          </p>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-sm text-blue-600 dark:text-blue-400">{content.questionsAnswered}</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{Object.keys(answers).length}</p>
            </div>
            <div className="p-4 bg-green-50/50 dark:bg-green-900/20 rounded-xl">
              <p className="text-sm text-green-600 dark:text-green-400">{content.completionRate}</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">100%</p>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
          >
            {content.submitSurvey}
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = shuffledQuestions[currentQuestion];
  const Icon = currentQuestionData.icon;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Survey Header */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">{content.title}</h1>
            <p className="text-slate-600 dark:text-slate-400">{content.subtitle}</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-2">
            <span>{content.question} {currentQuestion + 1} {content.of} {shuffledQuestions.length}</span>
            <span>{Math.round(progress)}% {content.complete}</span>
          </div>
          <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-100">{currentQuestionData.dimension}</span>
          </div>
          <h2 className="text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
            {currentQuestionData.question}
          </h2>
        </div>

        {/* Rating Scale */}
        <div className="space-y-4">
          <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
            {content.howMuchAgree}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {content.scaleLabels.map((label, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index + 1)}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  answers[currentQuestionData.id] === index + 1
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-slate-200/50 dark:border-slate-600/50 hover:border-slate-300/50 dark:hover:border-slate-500/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-center">
                  <div className="text-lg font-semibold mb-1">{index + 1}</div>
                  <div className="text-sm">{label}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8">
          {import.meta.env.DEV && (
          <button
            onClick={handleRandomize}
            className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 font-medium"
          >
            Randomize for Dev
          </button>
        )}

          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center space-x-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{content.previous}</span>
          </button>

          {/* Removed 42 navigation bullets */}

          <button
            onClick={handleNext}
            disabled={answers[currentQuestionData.id] === undefined}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span>{currentQuestion === shuffledQuestions.length - 1 ? content.complete : content.next}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Dimensions Overview */}
      <div className="bg-white/80 dark:bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-4">{content.wellbeingDimensions}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(content.dimensions).map(([key, label]) => {
            const dimQuestions = content.questions.filter(q => q.dimension === label);
            const answeredCount = dimQuestions.filter(q => answers[q.id] !== undefined).length;
            const progress = (answeredCount / dimQuestions.length) * 100;
            const isCurrent = dimQuestions.some(q => q.id === currentQuestionData.id);
            const isComplete = answeredCount === dimQuestions.length;

            return (
              <div
                key={key}
                className={`p-4 rounded-xl border transition-all duration-200 ${
                  isCurrent ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' :
                  isComplete ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20' :
                  'border-slate-200/50 dark:border-slate-600/50'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isCurrent ? 'bg-blue-500' :
                    isComplete ? 'bg-green-500' :
                    'bg-slate-400 dark:bg-slate-600'
                  }`}>
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
                </div>
                <div className="w-full bg-slate-200/50 dark:bg-slate-700/50 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {answeredCount} / {dimQuestions.length} {content.complete}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MindMetrics;