import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(helmet({
  contentSecurityPolicy: false, // Turn off CSP to avoid blocking iframe view mode
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Initialize Local JSON Database
const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure database directory and file exist
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const INITIAL_PROFILE = {
  name: '',
  dailyLimit: 400,
  weight: 70,
  sensitivity: 'Medium',
  onboarded: false,
  sleepGoal: 8,
  streak: 0,
  theme: 'light',
  bedtime: '23:00',
  lifestyle: 'Office',
  lastLogDate: null
};

const INITIAL_GOALS = [
  { id: 'sleep', title: 'Sleep First', description: 'Avoid caffeine 8 hours before bedtime', target: 5, current: 0, icon: 'Moon', isCompleted: false },
  { id: 'limit', title: 'Smart Balancer', description: 'Stay under your daily limit', target: 7, current: 0, icon: 'Zap', isCompleted: false },
  { id: 'water', title: 'Hydration Hero', description: 'Drink water after each coffee', target: 10, current: 0, icon: 'Droplets', isCompleted: false },
];

interface DBState {
  profile: typeof INITIAL_PROFILE;
  logs: any[];
  goals: typeof INITIAL_GOALS;
  customDrinks: any[];
  notifications: any[];
}

const getInitialDBState = (): DBState => ({
  profile: { ...INITIAL_PROFILE },
  logs: [],
  goals: [ ...INITIAL_GOALS ],
  customDrinks: [],
  notifications: []
});

function readDatabase(): DBState {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading index file db.json, returning initial state.', err);
  }
  const initialState = getInitialDBState();
  writeDatabase(initialState);
  return initialState;
}

function writeDatabase(state: DBState) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing index database db.json', err);
  }
}

// Global caching/instances for Gemini client
let ai: GoogleGenAI | null = null;

function isGeminiApiKeyValid(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (!trimmed) return false;
  
  // Exclude common tutorial placeholders or stringified empty states
  const lower = trimmed.toLowerCase();
  if (
    lower === 'your_api_key_here' || 
    lower === 'your_api_key' || 
    lower === 'undefined' || 
    lower === 'null' ||
    lower.includes('placeholder')
  ) {
    return false;
  }
  
  // Standard Google API keys start with 'AIzaSy'
  if (!trimmed.startsWith('AIzaSy')) {
    return false;
  }
  
  // Check typical length (Google API keys are usually around 39 characters)
  if (trimmed.length < 30) {
    return false;
  }
  
  return true;
}

function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !isGeminiApiKeyValid(key)) {
    return null;
  }
  
  if (!ai) {
    ai = new GoogleGenAI({
      apiKey: key.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return ai;
}

// API Routes

// Retrieve full application state for client syncing
app.get('/api/state', (req, res) => {
  const state = readDatabase();
  res.json(state);
});

// Update profile State
app.post('/api/profile', (req, res) => {
  const state = readDatabase();
  state.profile = { ...state.profile, ...req.body };
  writeDatabase(state);
  res.json(state.profile);
});

// Get context logs
app.get('/api/logs', (req, res) => {
  const state = readDatabase();
  res.json(state.logs);
});

// Create brand new log
app.post('/api/logs', (req, res) => {
  const state = readDatabase();
  const newLog = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    ...req.body
  };
  state.logs.unshift(newLog);
  writeDatabase(state);
  res.json(newLog);
});

// Delete specific log
app.delete('/api/logs/:id', (req, res) => {
  const state = readDatabase();
  state.logs = state.logs.filter((log) => log.id !== req.params.id);
  writeDatabase(state);
  res.json({ success: true });
});

// Maintain custom beverage recipes
app.get('/api/custom-drinks', (req, res) => {
  const state = readDatabase();
  res.json(state.customDrinks);
});

app.post('/api/custom-drinks', (req, res) => {
  const state = readDatabase();
  const d = {
    id: Math.random().toString(36).substr(2, 9),
    ...req.body
  };
  state.customDrinks.push(d);
  writeDatabase(state);
  res.json(d);
});

app.delete('/api/custom-drinks/:id', (req, res) => {
  const state = readDatabase();
  state.customDrinks = state.customDrinks.filter((d) => d.id !== req.params.id);
  writeDatabase(state);
  res.json({ success: true });
});

// System alerts / notifications
app.get('/api/notifications', (req, res) => {
  const state = readDatabase();
  res.json(state.notifications);
});

app.post('/api/notifications', (req, res) => {
  const state = readDatabase();
  const inputId = req.body.id;
  if (inputId && state.notifications.some(n => n.id === inputId)) {
    // Avoid double logging for exactly same custom ID notification
    return res.json(state.notifications.find(n => n.id === inputId));
  }
  const newNotification = {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
    ...req.body
  };
  state.notifications.unshift(newNotification);
  writeDatabase(state);
  res.json(newNotification);
});

app.post('/api/notifications/read-all', (req, res) => {
  const state = readDatabase();
  state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
  writeDatabase(state);
  res.json(state.notifications);
});

// Update Goal progress
app.get('/api/goals', (req, res) => {
  const state = readDatabase();
  res.json(state.goals);
});

app.post('/api/goals', (req, res) => {
  const state = readDatabase();
  state.goals = req.body;
  writeDatabase(state);
  res.json(state.goals);
});

// Reset Database completely
app.post('/api/reset', (req, res) => {
  const freshState = getInitialDBState();
  writeDatabase(freshState);
  res.json(freshState);
});

const FALLBACK_INSIGHTS = {
  metabolismText: "Using standardized biological averages: Caffeine has a biological half-life of 5 to 6 hours.",
  halfLifeWarning: "Avoid consuming high-caffeine doses after 2:00 PM to protect deep REM sleep architectures.",
  optimizedRoutine: "Hydrate actively. Swap later options for green teas or warm chamomile to soothe sleep cycles.",
  insights: [
    "Caffeine blocks adenosine receptors, meaning fatigue is temporarily masked rather than eliminated.",
    "High doses can double sleep-onset latency, leading to lighter, more fragmented sleep overall.",
    "Ensure you drink plenty of pure clean water. Hydration helps support natural metabolic clearance."
  ]
};

// Gemini AI Insights Endpoint for smart feedback and deep health statistics
app.post('/api/ai/insights', async (req, res) => {
  try {
    const { profile, logs } = req.body;
    const client = getGeminiClient();

    if (!client) {
      // Fallback response with helpful medical/sleep tips if API key is not yet configured or missing.
      return res.json(FALLBACK_INSIGHTS);
    }

    const prompt = `
      You are the ultimate Caffeine & Sleep optimization medical advisor built for a user's health tracker dashboard.
      Analyze the current user profile and consumption history logs to provide structured recommendations.

      --- USER PROFILE ---
      - Name: ${profile.name || 'User'}
      - Weight: ${profile.weight} kg
      - Sensitivity to Caffeine: ${profile.sensitivity}
      - Usual Bedtime: ${profile.bedtime || '23:00'}
      - Sleeping Hours Goal: ${profile.sleepGoal} hours
      - Daily Limit Threshold: ${profile.dailyLimit} mg
      - Lifestyle Profile: ${profile.lifestyle || 'Active'}

      --- TODAY'S CONSUMPTION LOGS ---
      ${JSON.stringify(logs)}

      Please return a clean JSON object containing the exact properties specified below with concise and expert health feedback.
      Your recommendations should be customized according to their weight, caffeine sensitivity, lifestyle habits, and bedtime.

      JSON Format required:
      {
        "metabolismText": "Explanation of caffeine metabolism, clearance timelines, and remaining mg at bedtime based on physical half-life averages.",
        "halfLifeWarning": "Specific warning or encouraging message regarding current consumption levels and sleep cycles.",
        "optimizedRoutine": "One action-oriented tip to fine-tune energy drops or focus blocks.",
        "insights": [
          "Fact 1 regarding biological impact of caffeine.",
          "Fact 2 concerning performance, crash management, or active clearance.",
          "Fact 3 highlighting custom recommendations based on user life habits."
        ]
      }
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: any) {
    // Log a concise notice rather than outputting raw Google API exception chains to stop console.warn noise.
    const errString = err.message || JSON.stringify(err) || '';
    const isApiKeyError = errString.includes('API key') || errString.includes('API_KEY_INVALID') || errString.includes('400');
    const isQuotaError = errString.includes('quota') || errString.includes('RESOURCE_EXHAUSTED') || errString.includes('429');
    
    if (isApiKeyError) {
      console.log('Caffeine Tracker [AI Advisory]: Provided Gemini API key was rejected by Google servers. Utilizing safe biological fallback curves.');
    } else if (isQuotaError) {
      console.log('Caffeine Tracker [AI Advisory]: Gemini API rate limit or quota exceeded (Free tier 20 reqs/day count). Utilizing safe biological fallback curves.');
    } else {
      console.log('Caffeine Tracker [AI Advisory]: Dynamic generation bypassed (Service unavailable / busy). Utilizing safe biological fallback curves.');
    }
    res.json(FALLBACK_INSIGHTS);
  }
});

// Serve frontend assets & configure Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Caffeine Tracker] Production Ready backend active on http://localhost:${PORT}`);
  });
}

startServer();
