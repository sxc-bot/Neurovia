interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface SentimentAnalysis {
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
  insights: string;
}

// Retrieve Gemini API key dynamically: prefer user-saved key, fallback to env variable
const getGeminiApiKey = () => (typeof window !== 'undefined' ? localStorage.getItem('geminiKey') : null) || import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Get user's language preference
const getUserLanguage = (): string => {
  return localStorage.getItem('language') || 'en';
};

// Language-specific prompts and responses
const getLanguageContent = (language: string) => {
  if (language === 'id') {
    return {
      analysisPrompt: `
Analisis entri jurnal berikut untuk sentimen dan emosi. Berikan respons JSON dengan struktur berikut:

{
  "sentiment_score": angka (0-100, dimana 0 sangat negatif, 50 netral, 100 sangat positif),
  "sentiment_label": "positive" | "neutral" | "negative",
  "emotions": {
    "joy": angka (0-100),
    "confidence": angka (0-100),
    "gratitude": angka (0-100),
    "sadness": angka (0-100),
    "anger": angka (0-100),
    "fear": angka (0-100)
  },
  "insights": "Wawasan singkat dan mendorong tentang keadaan emosional *kamu* dan saran untuk kesejahteraan *kamu* (2-3 kalimat), langsung menyapa pengguna sebagai 'kamu'."
}

Entri jurnal untuk dianalisis:
"__JOURNAL_ENTRY_CONTENT__"

Harap respons hanya dengan objek JSON, tanpa teks tambahan. Pastikan semua respons dalam Bahasa Indonesia.
`,
      insightsPrompt: `
Berdasarkan entri jurnal terbaru *kamu*, berikan wawasan singkat dan mendorong tentang pola emosional *kamu* dan tren kesejahteraan. Tetap positif dan suportif, tawarkan saran praktis untuk pertumbuhan *kamu* yang berkelanjutan. Langsung sapa pengguna sebagai 'kamu'.

Ringkasan entri terbaru:
- Jumlah entri: __NUM_ENTRIES__
- Skor sentimen rata-rata: __AVG_SCORE__/100
- Rentang tanggal: __START_DATE__ hingga __END_DATE__

Kutipan entri terbaru:
__RECENT_EXCERPTS__

Berikan wawasan 2-3 kalimat yang mendorong dan menawarkan saran kesejahteraan praktis, fokus pada 'kamu'. Respons dalam Bahasa Indonesia.
`,
      fallbackInsights: {
        positive: 'Keadaan positif kamu adalah kekuatan yang luar biasa! Terus pelihara pikiran dan pengalaman yang mengangkat ini untuk melanjutkan pertumbuhan kamu.',
        negative: 'Sepertinya kamu sedang menavigasi beberapa emosi yang menantang saat ini. Ingatlah bahwa tidak apa-apa merasakan hal ini, dan perasaan ini adalah bagian dari perjalanan kamu menuju pertumbuhan. kamu melakukan hal yang hebat dengan mengakuinya.',
        neutral: 'Keadaan emosional kamu tampak seimbang, dan itu adalah fondasi yang bagus! Terus refleksikan pengalaman kamu untuk mempertahankan keseimbangan ini dan memperdalam pemahaman diri kamu.'
      },
      defaultInsight: 'Entri jurnal kamu telah dianalisis dengan sukses. Terus lakukan pekerjaan yang hebat!',
      journeyInsight: 'Terus menulis jurnal untuk menerima wawasan AI yang dipersonalisasi tentang pola emosional dan kesejahteraan kamu. Perjalanan penemuan diri kamu baru saja dimulai!',
      consistentPractice: 'Praktik jurnal yang konsisten kamu membangun kecerdasan emosional yang luar biasa. Terus jelajahi pikiran dan perasaan kamu, kamu berada di jalur yang fantastis!'
    };
  } else {
    return {
      analysisPrompt: `
Analyze the following journal entry for sentiment and emotions. Provide a JSON response with the following structure:

{
  "sentiment_score": number (0-100, where 0 is very negative, 50 is neutral, 100 is very positive),
  "sentiment_label": "positive" | "neutral" | "negative",
  "emotions": {
    "joy": number (0-100),
    "confidence": number (0-100),
    "gratitude": number (0-100),
    "sadness": number (0-100),
    "anger": number (0-100),
    "fear": number (0-100)
  },
  "insights": "A brief, encouraging insight about *your* emotional state and suggestions for *your* wellbeing (2-3 sentences), directly addressing the user as 'you'."
}

Journal entry to analyze:
"__JOURNAL_ENTRY_CONTENT__"

Please respond with only the JSON object, no additional text. Ensure all responses are in English.
`,
      insightsPrompt: `
Based on *your* recent journal entries, provide a brief, encouraging insight about *your* emotional patterns and wellbeing trends. Keep it positive and supportive, offering practical suggestions for *your* continued growth. Directly address the user as 'you'.

Recent entries summary:
- Number of entries: __NUM_ENTRIES__
- Average sentiment score: __AVG_SCORE__/100
- Date range: __START_DATE__ to __END_DATE__

Recent entry excerpts:
__RECENT_EXCERPTS__

Provide a 2-3 sentence insight that is encouraging and offers practical wellbeing advice, focusing on 'you'. Respond in English.
`,
      fallbackInsights: {
        positive: 'Your positive outlook is a wonderful strength! Keep nurturing these uplifting thoughts and experiences to continue your growth.',
        negative: 'It seems like you\'re navigating some challenging emotions right now. Remember that it\'s okay to feel this way, and these feelings are a part of your journey towards growth. You\'re doing great by acknowledging them.',
        neutral: 'Your emotional state appears balanced, and that\'s a great foundation! Continue reflecting on your experiences to maintain this equilibrium and deepen your self-understanding.'
      },
      defaultInsight: 'Your journal entry has been analyzed successfully. Keep up the great work!',
      journeyInsight: 'Continue journaling to receive personalized AI insights about your emotional patterns and wellbeing. Your journey of self-discovery is just beginning!',
      consistentPractice: 'Your consistent journaling practice is building incredible emotional intelligence. Keep exploring your thoughts and feelings, you\'re on a fantastic path!'
    };
  }
};

export const analyzeWithGemini = async (text: string): Promise<SentimentAnalysis> => {
  const language = getUserLanguage();
  const content = getLanguageContent(language);
  
  const prompt = content.analysisPrompt.replace('__JOURNAL_ENTRY_CONTENT__', text);

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': getGeminiApiKey(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text;

    if (!generatedText) {
      throw new Error('No response from Gemini API');
    }

    // Clean the response by removing markdown code block delimiters
    let cleanedText = generatedText.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\s*/, '');
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.replace(/\s*```$/, '');
    }
    // Also handle cases where it might just start with ```
    if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\s*/, '');
    }

    // Parse the JSON response from Gemini
    const analysisResult = JSON.parse(cleanedText);
    
    return {
      sentiment_score: Math.max(0, Math.min(100, analysisResult.sentiment_score)),
      sentiment_label: analysisResult.sentiment_label,
      emotions: {
        joy: Math.max(0, Math.min(100, analysisResult.emotions.joy)),
        confidence: Math.max(0, Math.min(100, analysisResult.emotions.confidence)),
        gratitude: Math.max(0, Math.min(100, analysisResult.emotions.gratitude)),
        sadness: Math.max(0, Math.min(100, analysisResult.emotions.sadness)),
        anger: Math.max(0, Math.min(100, analysisResult.emotions.anger)),
        fear: Math.max(0, Math.min(100, analysisResult.emotions.fear)),
      },
      insights: analysisResult.insights || content.defaultInsight
    };
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback to local analysis if API fails
    return fallbackAnalysis(text);
  }
}

export const getDimensionAdvice = async (dimension: string, score: number, language: string = getUserLanguage()): Promise<string> => {
  const content = getLanguageContent(language);
  
  const scoreDescription = score < 40 ? 'needs improvement' : score < 70 ? 'is average' : 'is strong';

  const prompt = `
Provide specific, actionable advice on how to maintain or improve the score for the following wellbeing dimension. The user's current score is ${score}/100, which ${scoreDescription}. Address the user directly as 'you'.

Dimension: "${dimension}"

- For low scores (under 50), give a simple, foundational tip.
- For average scores (50-69), suggest a way to build consistency or a new habit.
- For high scores (70+), offer a way to deepen the practice or a more advanced concept.

Format your response as: **Bold Header Text** followed by the body content (2-3 sentences). Be encouraging but direct. Ensure the response is in ${language === 'id' ? 'id-ID | Bahasa Indonesia' : 'en-US | English'}. If Bahasa applied address with 'kamu'

Your response MUST be only the formatted advice, with no preamble.
`;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': getGeminiApiKey(),
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (response.status === 503 && retries > 1) {
        console.warn(`Gemini API unavailable (503), retrying in ${delay / 1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        retries--;
        delay *= 2; // Exponential backoff
        continue;
      }

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      const generatedText = data.candidates[0]?.content?.parts[0]?.text?.trim() || '';

      return generatedText || content.defaultInsight;
    } catch (error) {
      console.error('Error calling Gemini for dimension advice:', error);
      retries = 0; // Stop retrying on other errors
    }
  }

  // Fallback if all retries fail
  return language === 'id' 
    ? `Untuk ${dimension}, dengan skor ${score}, terus pertahankan praktik baikmu. Coba tambahkan aktivitas yang mendukung pertumbuhan di area ini.` 
    : `For ${dimension}, with score ${score}, keep up your good practices. Try adding activities that support growth in this area.`;
};

// Fallback analysis function (your existing local analysis)
const fallbackAnalysis = (text: string): SentimentAnalysis => {
  const language = getUserLanguage();
  const content = getLanguageContent(language);
  
  const positiveWords = ['happy', 'joy', 'love', 'great', 'amazing', 'wonderful', 'excellent', 'fantastic', 'good', 'beautiful', 'perfect', 'awesome', 'brilliant', 'grateful', 'thankful', 'blessed', 'excited', 'proud', 'confident', 'peaceful', 'calm', 'relaxed', 'content', 'satisfied', 'accomplished', 'successful', 'optimistic', 'hopeful', 'inspired', 'motivated', 'senang', 'gembira', 'bahagia', 'luar biasa', 'hebat', 'indah', 'sempurna', 'bersyukur', 'bangga', 'percaya diri', 'tenang', 'puas'];
  const negativeWords = ['sad', 'angry', 'hate', 'terrible', 'awful', 'horrible', 'bad', 'worst', 'depressed', 'anxious', 'worried', 'stressed', 'frustrated', 'disappointed', 'upset', 'hurt', 'pain', 'difficult', 'hard', 'struggle', 'problem', 'issue', 'concern', 'fear', 'scared', 'nervous', 'tired', 'exhausted', 'overwhelmed', 'sedih', 'marah', 'benci', 'buruk', 'mengerikan', 'depresi', 'cemas', 'khawatir', 'stres', 'frustrasi', 'kecewa', 'sakit', 'sulit', 'masalah', 'takut', 'lelah'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  let score = 50;
  let label: 'positive' | 'neutral' | 'negative' = 'neutral';
  
  if (totalSentimentWords > 0) {
    const positiveRatio = positiveCount / totalSentimentWords;
    score = Math.round(30 + (positiveRatio * 40));
    
    if (score >= 60) label = 'positive';
    else if (score <= 40) label = 'negative';
    else label = 'neutral';
  }

  // Generate emotions based on sentiment
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

  const emotions = generateEmotions(score, label);

  return {
    sentiment_score: score,
    sentiment_label: label,
    emotions: {
      joy: Math.round(emotions.joy),
      confidence: Math.round(emotions.confidence),
      gratitude: Math.round(emotions.gratitude),
      sadness: Math.round(emotions.sadness),
      anger: Math.round(emotions.anger),
      fear: Math.round(emotions.fear),
    },
    insights: content.fallbackInsights[label]
  };
};

export const generateAIInsights = async (entries: Array<{ content: string; sentiment_score: number; created_at: string }>): Promise<string> => {
  const language = getUserLanguage();
  const content = getLanguageContent(language);
  
  if (entries.length === 0) {
    return content.journeyInsight;
  }

  const recentEntries = entries.slice(0, 5);
  const averageScore = recentEntries.reduce((sum, entry) => sum + entry.sentiment_score, 0) / recentEntries.length;
  
  const prompt = content.insightsPrompt
    .replace('__NUM_ENTRIES__', recentEntries.length.toString())
    .replace('__AVG_SCORE__', averageScore.toFixed(1))
    .replace('__START_DATE__', recentEntries[recentEntries.length - 1]?.created_at || '')
    .replace('__END_DATE__', recentEntries[0]?.created_at || '')
    .replace('__RECENT_EXCERPTS__', 
      recentEntries.map((entry, index) => `${index + 1}. "${entry.content.substring(0, 100)}..."`).join('\n'));

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': getGeminiApiKey(),
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data: GeminiResponse = await response.json();
    const insight = data.candidates[0]?.content?.parts[0]?.text;

    return insight || (language === 'id' 
      ? 'Perjalanan jurnal kamu menunjukkan kesadaran diri yang luar biasa, dan kamu melakukan pekerjaan yang menakjubkan dalam merefleksikan pengalaman kamu untuk terus tumbuh.'
      : 'Your journaling journey shows great self-awareness, and you\'re doing an amazing job reflecting on your experiences to continue growing.');
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return content.consistentPractice;
  }
};

export const generateReportSummary = async (
  scores: { [key: string]: number },
  feedbacks: { [key: string]: string },
  language: string = getUserLanguage()
): Promise<string> => {
  const dimLines = Object.keys(scores)
    .map((key) => `${key}: ${scores[key]}/100\nUser feedback: ${feedbacks[key] || '-'}`)
    .join('\n\n');

  const prompt = `Based on the following wellbeing dimension scores and the user's feedback for each, craft a concise summary (max 180 words). Weight your analysis according to the score (lower scores receive greater focus) while integrating the qualitative feedback. Write the analysis in ${language === 'id' ? 'Bahasa Indonesia (id-ID)' : 'English (en-US)'}. When referring to dimensions, ALWAYS use their human-readable labels:
Autonomy, Environmental Mastery, Personal Growth, Positive Relations, Purpose in Life, and Self-Acceptance (or their Bahasa equivalents). NEVER use the camelCase property keys such as personalGrowth. Do not mention each dimension term TWICE. Do not state the language being used. Address the user directly as 'you' or 'kamu' if Bahasa is applied. \n\n${dimLines}`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': getGeminiApiKey(),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

    const data: GeminiResponse = await response.json();
    const summary = data.candidates[0]?.content?.parts[0]?.text?.trim() || '';
    return summary;
  } catch (err) {
    console.error('Error generating summary:', err);
    return language === 'id'
      ? 'Ringkasan tidak tersedia saat ini.'
      : 'Summary unavailable at the moment.';
  }
};