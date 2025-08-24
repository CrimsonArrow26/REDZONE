// Voice session templates for different languages and scenarios

export interface VoiceTemplate {
  id: string;
  name: string;
  description: string;
  language: string;
  keywords: string[];
  confidenceThreshold: number;
  icon: string;
  color: string;
}

export const VOICE_TEMPLATES: VoiceTemplate[] = [
  // English Templates
  {
    id: 'emergency-english',
    name: 'Emergency English',
    description: 'Standard emergency keywords in English',
    language: 'en-US',
    keywords: ['help', 'emergency', 'danger', 'accident', 'injured', 'trapped', 'fire', 'call police'],
    confidenceThreshold: 0.7,
    icon: '🇺🇸',
    color: '#ff4444'
  },
  {
    id: 'medical-english',
    name: 'Medical Emergency',
    description: 'Medical-specific emergency keywords',
    language: 'en-US',
    keywords: ['ambulance', 'heart attack', 'stroke', 'unconscious', 'bleeding', 'overdose', 'allergic reaction', 'chest pain'],
    confidenceThreshold: 0.75,
    icon: '🚑',
    color: '#ff6b6b'
  },
  {
    id: 'crime-english',
    name: 'Crime Alert',
    description: 'Crime-related emergency keywords',
    language: 'en-US',
    keywords: ['robbery', 'assault', 'attack', 'thief', 'stalker', 'kidnap', 'gun', 'knife', 'call police'],
    confidenceThreshold: 0.8,
    icon: '🚔',
    color: '#4169e1'
  },

  // Spanish Templates
  {
    id: 'emergency-spanish',
    name: 'Emergencia Español',
    description: 'Emergency keywords in Spanish',
    language: 'es-ES',
    keywords: ['socorro', 'ayuda', 'emergencia', 'peligro', 'accidente', 'herido', 'atrapado', 'fuego', 'policía'],
    confidenceThreshold: 0.7,
    icon: '🇪🇸',
    color: '#ff9800'
  },
  {
    id: 'medical-spanish',
    name: 'Emergencia Médica',
    description: 'Medical emergencies in Spanish',
    language: 'es-ES',
    keywords: ['ambulancia', 'infarto', 'derrame', 'inconsciente', 'sangrado', 'sobredosis', 'alergia', 'dolor pecho'],
    confidenceThreshold: 0.75,
    icon: '🏥',
    color: '#ff7043'
  },

  // French Templates
  {
    id: 'emergency-french',
    name: 'Urgence Français',
    description: 'Emergency keywords in French',
    language: 'fr-FR',
    keywords: ['aide', 'urgence', 'danger', 'accident', 'blessé', 'piégé', 'feu', 'police', 'secours'],
    confidenceThreshold: 0.7,
    icon: '🇫🇷',
    color: '#2196f3'
  },

  // German Templates
  {
    id: 'emergency-german',
    name: 'Notfall Deutsch',
    description: 'Emergency keywords in German',
    language: 'de-DE',
    keywords: ['hilfe', 'notfall', 'gefahr', 'unfall', 'verletzt', 'gefangen', 'feuer', 'polizei', 'rettung'],
    confidenceThreshold: 0.7,
    icon: '🇩🇪',
    color: '#9c27b0'
  },

  // Italian Templates
  {
    id: 'emergency-italian',
    name: 'Emergenza Italiano',
    description: 'Emergency keywords in Italian',
    language: 'it-IT',
    keywords: ['aiuto', 'emergenza', 'pericolo', 'incidente', 'ferito', 'intrappolato', 'fuoco', 'polizia', 'soccorso'],
    confidenceThreshold: 0.7,
    icon: '🇮🇹',
    color: '#4caf50'
  },

  // Portuguese Templates
  {
    id: 'emergency-portuguese',
    name: 'Emergência Português',
    description: 'Emergency keywords in Portuguese',
    language: 'pt-PT',
    keywords: ['socorro', 'ajuda', 'emergência', 'perigo', 'acidente', 'ferido', 'preso', 'fogo', 'polícia'],
    confidenceThreshold: 0.7,
    icon: '🇵🇹',
    color: '#ff5722'
  },

  // Specialized Templates
  {
    id: 'domestic-violence',
    name: 'Domestic Safety',
    description: 'Keywords for domestic violence situations',
    language: 'en-US',
    keywords: ['abuse', 'domestic violence', 'hit me', 'hurt me', 'scared', 'threatening', 'wont let me leave'],
    confidenceThreshold: 0.8,
    icon: '🏠',
    color: '#795548'
  },
  {
    id: 'child-emergency',
    name: 'Child Safety',
    description: 'Emergency keywords for child-related incidents',
    language: 'en-US',
    keywords: ['child missing', 'lost child', 'stranger', 'inappropriate touch', 'scared adult', 'bad person', 'dont feel safe'],
    confidenceThreshold: 0.8,
    icon: '👶',
    color: '#e91e63'
  },
  {
    id: 'mental-health',
    name: 'Mental Health Crisis',
    description: 'Keywords for mental health emergencies',
    language: 'en-US',
    keywords: ['suicide', 'want to die', 'end it all', 'cant take it', 'mental breakdown', 'panic attack', 'self harm'],
    confidenceThreshold: 0.85,
    icon: '🧠',
    color: '#673ab7'
  },
  {
    id: 'elderly-emergency',
    name: 'Senior Safety',
    description: 'Emergency keywords for elderly individuals',
    language: 'en-US',
    keywords: ['fallen', 'cant get up', 'chest pain', 'dizzy', 'confused', 'medication', 'breathing problem', 'weak'],
    confidenceThreshold: 0.75,
    icon: '👴',
    color: '#607d8b'
  },

  // Environmental Emergencies
  {
    id: 'natural-disaster',
    name: 'Natural Disaster',
    description: 'Keywords for natural disasters',
    language: 'en-US',
    keywords: ['earthquake', 'flood', 'tornado', 'hurricane', 'wildfire', 'landslide', 'tsunami', 'evacuation'],
    confidenceThreshold: 0.8,
    icon: '🌪️',
    color: '#ff6f00'
  },

  // Multi-language template
  {
    id: 'multilingual-basic',
    name: 'Multi-Language Basic',
    description: 'Basic emergency words in multiple languages',
    language: 'en-US',
    keywords: [
      // English
      'help', 'emergency', 'danger',
      // Spanish  
      'socorro', 'ayuda', 'emergencia',
      // French
      'aide', 'urgence', 'danger',
      // German
      'hilfe', 'notfall', 'gefahr',
      // Italian
      'aiuto', 'emergenza', 'pericolo'
    ],
    confidenceThreshold: 0.7,
    icon: '🌍',
    color: '#00bcd4'
  }
];

// Quick access to templates by category
export const TEMPLATE_CATEGORIES = {
  EMERGENCY: ['emergency-english', 'emergency-spanish', 'emergency-french', 'emergency-german', 'emergency-italian', 'emergency-portuguese'],
  MEDICAL: ['medical-english', 'medical-spanish'],
  SAFETY: ['crime-english', 'domestic-violence', 'child-emergency'],
  MENTAL_HEALTH: ['mental-health'],
  SPECIALIZED: ['elderly-emergency', 'natural-disaster'],
  MULTILINGUAL: ['multilingual-basic']
};

// Get template by ID
export function getTemplate(id: string): VoiceTemplate | undefined {
  return VOICE_TEMPLATES.find(template => template.id === id);
}

// Get templates by language
export function getTemplatesByLanguage(language: string): VoiceTemplate[] {
  return VOICE_TEMPLATES.filter(template => template.language === language);
}

// Get templates by category
export function getTemplatesByCategory(category: keyof typeof TEMPLATE_CATEGORIES): VoiceTemplate[] {
  const templateIds = TEMPLATE_CATEGORIES[category] || [];
  return templateIds.map(id => getTemplate(id)).filter(Boolean) as VoiceTemplate[];
}

// Create a custom template
export function createCustomTemplate(
  name: string,
  keywords: string[],
  language: string = 'en-US',
  description?: string,
  confidenceThreshold: number = 0.7
): VoiceTemplate {
  return {
    id: `custom-${Date.now()}`,
    name,
    description: description || `Custom template: ${name}`,
    language,
    keywords,
    confidenceThreshold,
    icon: '🎯',
    color: '#607d8b'
  };
}

// Merge multiple templates
export function mergeTemplates(templateIds: string[], customName?: string): VoiceTemplate {
  const templates = templateIds.map(id => getTemplate(id)).filter(Boolean) as VoiceTemplate[];
  
  const mergedKeywords = [...new Set(templates.flatMap(t => t.keywords))];
  const avgConfidence = templates.reduce((sum, t) => sum + t.confidenceThreshold, 0) / templates.length;
  
  return {
    id: `merged-${Date.now()}`,
    name: customName || `Merged Template (${templates.length} templates)`,
    description: `Merged from: ${templates.map(t => t.name).join(', ')}`,
    language: templates[0]?.language || 'en-US',
    keywords: mergedKeywords,
    confidenceThreshold: avgConfidence,
    icon: '🔄',
    color: '#4caf50'
  };
}

// Get popular templates (most commonly used)
export function getPopularTemplates(): VoiceTemplate[] {
  return [
    'emergency-english',
    'emergency-spanish',
    'medical-english',
    'crime-english',
    'multilingual-basic'
  ].map(id => getTemplate(id)).filter(Boolean) as VoiceTemplate[];
}

// Template validation
export function validateTemplate(template: VoiceTemplate): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!template.name || template.name.trim().length === 0) {
    errors.push('Template name is required');
  }
  
  if (!template.keywords || template.keywords.length === 0) {
    errors.push('At least one keyword is required');
  }
  
  if (template.keywords.some(k => k.trim().length === 0)) {
    errors.push('Keywords cannot be empty');
  }
  
  if (template.confidenceThreshold < 0 || template.confidenceThreshold > 1) {
    errors.push('Confidence threshold must be between 0 and 1');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}