import { useState, useEffect } from 'react';
import { analyzeWithGemini } from '../lib/gemini';

export interface JournalEntry {
  id: string;
  content: string;
  sentiment_score: number;
  sentiment_label: 'positive' | 'neutral' | 'negative';
  emotions: {
    joy: number;
    confidence: number;
    gratitude: number;
    sadness: number;
    anger: number;
    fear: number;
  };
  word_count: number;
  character_count: number;
  created_at: string;
  updated_at: string;
  ai_insights?: string;
}

const STORAGE_KEY = 'journal_entries';

// Simple sentiment analysis function (fallback)
const analyzeSentiment = (text: string) => {
  const positiveWords = ['happy', 'joy', 'love', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'good', 'beautiful', 'perfect', 'awesome', 'brilliant', 'grateful', 'thankful', 'blessed', 'excited', 'proud', 'confident', 'peaceful', 'calm', 'relaxed', 'content', 'satisfied', 'accomplished', 'successful', 'optimistic', 'hopeful', 'inspired', 'motivated'];
  const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'depressed', 'anxious', 'worried', 'stressed', 'frustrated', 'disappointed', 'upset', 'hurt', 'pain', 'difficult', 'hard', 'struggle', 'problem', 'issue', 'concern', 'fear', 'scared', 'nervous', 'tired', 'exhausted', 'overwhelmed'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) {
    return { score: 50, label: 'neutral' as const };
  }
  
  const positiveRatio = positiveCount / totalSentimentWords;
  const score = Math.round(30 + (positiveRatio * 40)); // Scale to 30-70 range
  
  let label: 'positive' | 'neutral' | 'negative';
  if (score >= 60) label = 'positive';
  else if (score <= 40) label = 'negative';
  else label = 'neutral';
  
  return { score, label };
};

// Generate emotion scores based on sentiment
const generateEmotions = (sentimentScore: number, sentimentLabel: string) => {
  const base = sentimentScore;
  const variance = 15;
  
  if (sentimentLabel === 'positive') {
    return {
      joy: Math.min(100, base + Math.random() * variance),
      confidence: Math.min(100, base + Math.random() * variance - 5),
      gratitude: Math.min(100, base + Math.random() * variance + 5),
      sadness: Math.max(0, 20 - Math.random() * 15),
      anger: Math.max(0, 15 - Math.random() * 10),
      fear: Math.max(0, 10 - Math.random() * 8),
    };
  } else if (sentimentLabel === 'negative') {
    return {
      joy: Math.max(0, 30 - Math.random() * 20),
      confidence: Math.max(0, 25 - Math.random() * 15),
      gratitude: Math.max(0, 20 - Math.random() * 15),
      sadness: Math.min(100, 60 + Math.random() * 30),
      anger: Math.min(100, 50 + Math.random() * 25),
      fear: Math.min(100, 40 + Math.random() * 20),
    };
  } else {
    return {
      joy: 40 + Math.random() * 20,
      confidence: 35 + Math.random() * 20,
      gratitude: 45 + Math.random() * 20,
      sadness: 20 + Math.random() * 20,
      anger: 15 + Math.random() * 15,
      fear: 10 + Math.random() * 15,
    };
  }
};

export const useLocalJournal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedEntries = JSON.parse(stored);
        setEntries(parsedEntries.sort((a: JournalEntry, b: JournalEntry) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
      }
    } catch (error) {
      console.error('Error loading journal entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate current streak based on daily entries
  const calculateCurrentStreak = (entries: JournalEntry[]): number => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if there's an entry today or yesterday to start the streak
    const latestEntry = new Date(sortedEntries[0].created_at);
    latestEntry.setHours(0, 0, 0, 0);
    
    // If the latest entry is more than 1 day old, streak is 0
    if (latestEntry.getTime() < yesterday.getTime()) {
      return 0;
    }

    // Group entries by date (ignoring time)
    const entriesByDate = new Map<string, JournalEntry[]>();
    sortedEntries.forEach(entry => {
      const entryDate = new Date(entry.created_at);
      entryDate.setHours(0, 0, 0, 0);
      const dateKey = entryDate.toDateString();
      
      if (!entriesByDate.has(dateKey)) {
        entriesByDate.set(dateKey, []);
      }
      entriesByDate.get(dateKey)!.push(entry);
    });

    // Calculate consecutive days with entries
    let streak = 0;
    let currentDate = new Date(today);
    
    // If no entry today, start from yesterday
    if (!entriesByDate.has(today.toDateString())) {
      currentDate = new Date(yesterday);
    }

    while (entriesByDate.has(currentDate.toDateString())) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };

  // Get current streak
  const getCurrentStreak = (): number => {
    return calculateCurrentStreak(entries);
  };
  // Save entries to localStorage
  const saveToStorage = (newEntries: JournalEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
    } catch (error) {
      console.error('Error saving journal entries:', error);
    }
  };

  const addEntry = async (content: string): Promise<JournalEntry> => {
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const characterCount = content.length;
    
    try {
      // Try to use Gemini API for analysis
      const analysis = await analyzeWithGemini(content);
      
      const newEntry: JournalEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        sentiment_score: analysis.sentiment_score,
        sentiment_label: analysis.sentiment_label,
        emotions: analysis.emotions,
        word_count: wordCount,
        character_count: characterCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_insights: analysis.insights,
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      saveToStorage(updatedEntries);
      
      return newEntry;
    } catch (error) {
      console.error('Error with Gemini analysis, using fallback:', error);
      
      // Fallback to local analysis
      const sentiment = analyzeSentiment(content);
      const emotions = generateEmotions(sentiment.score, sentiment.label);
      
      const newEntry: JournalEntry = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        content,
        sentiment_score: sentiment.score,
        sentiment_label: sentiment.label,
        emotions: {
          joy: Math.round(emotions.joy),
          confidence: Math.round(emotions.confidence),
          gratitude: Math.round(emotions.gratitude),
          sadness: Math.round(emotions.sadness),
          anger: Math.round(emotions.anger),
          fear: Math.round(emotions.fear),
        },
        word_count: wordCount,
        character_count: characterCount,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      saveToStorage(updatedEntries);
      
      return newEntry;
    }
  };

  const updateEntry = async (id: string, content: string): Promise<JournalEntry> => {
    const wordCount = content.split(' ').filter(word => word.length > 0).length;
    const characterCount = content.length;
    
    try {
      // Try to use Gemini API for analysis
      const analysis = await analyzeWithGemini(content);
      
      const updatedEntries = entries.map(entry => {
        if (entry.id === id) {
          return {
            ...entry,
            content,
            sentiment_score: analysis.sentiment_score,
            sentiment_label: analysis.sentiment_label,
            emotions: analysis.emotions,
            word_count: wordCount,
            character_count: characterCount,
            updated_at: new Date().toISOString(),
            ai_insights: analysis.insights,
          };
        }
        return entry;
      });

      setEntries(updatedEntries);
      saveToStorage(updatedEntries);
      
      const updatedEntry = updatedEntries.find(entry => entry.id === id);
      if (!updatedEntry) throw new Error('Entry not found');
      
      return updatedEntry;
    } catch (error) {
      console.error('Error with Gemini analysis, using fallback:', error);
      
      // Fallback to local analysis
      const sentiment = analyzeSentiment(content);
      const emotions = generateEmotions(sentiment.score, sentiment.label);
      
      const updatedEntries = entries.map(entry => {
        if (entry.id === id) {
          return {
            ...entry,
            content,
            sentiment_score: sentiment.score,
            sentiment_label: sentiment.label,
            emotions: {
              joy: Math.round(emotions.joy),
              confidence: Math.round(emotions.confidence),
              gratitude: Math.round(emotions.gratitude),
              sadness: Math.round(emotions.sadness),
              anger: Math.round(emotions.anger),
              fear: Math.round(emotions.fear),
            },
            word_count: wordCount,
            character_count: characterCount,
            updated_at: new Date().toISOString(),
          };
        }
        return entry;
      });

      setEntries(updatedEntries);
      saveToStorage(updatedEntries);
      
      const updatedEntry = updatedEntries.find(entry => entry.id === id);
      if (!updatedEntry) throw new Error('Entry not found');
      
      return updatedEntry;
    }
  };

  const deleteEntry = async (id: string): Promise<void> => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    saveToStorage(updatedEntries);
  };

  return {
    entries,
    loading,
    getCurrentStreak,
    addEntry,
    updateEntry,
    deleteEntry,
  };
};