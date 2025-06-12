export interface BonsaiSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  family: string;
  characteristics: string[];
  careLevel: 'beginner' | 'intermediate' | 'advanced';
  growthRate: 'slow' | 'medium' | 'fast';
  lightRequirements: 'low' | 'medium' | 'high';
  wateringFrequency: string;
  optimalTemperature: {
    min: number;
    max: number;
  };
  optimalHumidity: {
    min: number;
    max: number;
  };
  soilType: string;
  fertilizer: string;
  pruningSeasons: string[];
  commonIssues: string[];
  tips: string[];
}

export interface IdentificationResult {
  species: string;
  confidence: number;
  characteristics: string;
  matchedFeatures: string[];
  alternativeSpecies?: {
    species: string;
    confidence: number;
  }[];
}

export interface PruningSession {
  id: string;
  date: Date;
  species: string;
  goals: string;
  branchesCut: string[];
  beforePhoto?: string;
  afterPhoto?: string;
  notes: string;
  nextPruningDate?: Date;
}

export interface CareReminder {
  id: string;
  type: 'watering' | 'fertilizing' | 'pruning' | 'repotting' | 'inspection';
  title: string;
  description: string;
  dueDate: Date;
  frequency: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'yearly';
  isCompleted: boolean;
  bonsaiId?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  conditions: string;
  uvIndex: number;
  windSpeed: number;
  pressure: number;
  forecast: {
    date: Date;
    temperature: {
      min: number;
      max: number;
    };
    conditions: string;
    humidity: number;
  }[];
}

export interface BonsaiProfile {
  id: string;
  name: string;
  species: string;
  age: number;
  acquisitionDate: Date;
  photos: {
    id: string;
    url: string;
    date: Date;
    type: 'progress' | 'before_pruning' | 'after_pruning' | 'seasonal';
  }[];
  careHistory: {
    date: Date;
    action: string;
    notes: string;
  }[];
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  lastWatered: Date;
  lastFertilized: Date;
  lastPruned: Date;
  nextCareDate: Date;
  location: 'indoor' | 'outdoor' | 'greenhouse';
  potSize: string;
  soilLastChanged: Date;
}

export interface UserPreferences {
  notifications: {
    watering: boolean;
    fertilizing: boolean;
    pruning: boolean;
    weather: boolean;
  };
  units: {
    temperature: 'celsius' | 'fahrenheit';
    measurement: 'metric' | 'imperial';
  };
  language: string;
  theme: 'light' | 'dark' | 'auto';
  location: {
    city: string;
    country: string;
    timezone: string;
  };
}

export interface AIAnalysis {
  healthAssessment: {
    overall: number; // 0-100
    foliage: number;
    trunk: number;
    roots: number;
    issues: string[];
    recommendations: string[];
  };
  growthPrediction: {
    nextMonths: {
      month: number;
      expectedGrowth: string;
      careNeeded: string[];
    }[];
  };
  styleRecommendations: {
    currentStyle: string;
    suggestedStyles: string[];
    reasoning: string;
  };
}

export interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  steps: {
    title: string;
    description: string;
    image?: string;
    video?: string;
    tips: string[];
  }[];
  tools: string[];
  category: 'pruning' | 'watering' | 'repotting' | 'styling' | 'care';
}

export interface CommunityPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  title: string;
  content: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  createdAt: Date;
  category: 'showcase' | 'help' | 'tutorial' | 'discussion';
}