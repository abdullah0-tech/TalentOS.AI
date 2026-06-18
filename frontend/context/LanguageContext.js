'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    dashboard: 'Dashboard',
    execDashboard: 'Exec Dashboard',
    workforceIntel: 'Workforce Intel',
    jobs: 'Jobs',
    candidates: 'Candidates',
    aiRanking: 'AI Ranking',
    interviewQA: 'Interview QA',
    employees: 'Employees',
    orgChart: 'Org Chart',
    onboarding: 'Onboarding',
    attendance: 'Time & Attendance',
    leaveTracker: 'Leave Tracker',
    payrollLedger: 'Payroll Ledger',
    performance: 'Performance Q1',
    goals: 'Goals & OKRs',
    training: 'LMS / Training',
    documents: 'Document Vault',
    automations: 'Automations',
    integrations: 'Integrations Hub',
    billing: 'SaaS Subscriptions',
    biReports: 'BI Reports',
    security: 'Security & MFA',
    whitelabel: 'White Labeling',
    knowledgeBase: 'Knowledge Base',
    emailAssistant: 'Email Assistant',
    emailSettings: 'Email Settings',
    gmailInbox: 'Gmail Inbox',
    settings: 'Workspace Settings',
    auditTrail: 'Audit Trail',
    aiAssistant: 'AI Assistant',
    signOut: 'Sign Out',
    searchPlaceholder: 'Quick search jobs or candidates...',
    
    // New keys
    executiveDashboard: 'Executive Dashboard',
    aiWorkforceInsights: 'AI Workforce Insights',
    candidatePipeline: 'Candidate Pipeline',
    aiResumeRanking: 'AI Resume Ranking',
    interviewManagement: 'Interview Management',
    careerPortal: 'Career Portal',
    offerManagement: 'Offer Management',
    employeeDirectory: 'Employee Directory',
    offboarding: 'Offboarding',
    employeeProfiles: 'Employee Profiles',
    payrollOverview: 'Payroll Overview',
    performanceReviews: 'Performance Reviews',
    trainingLms: 'Training & LMS',
    emailCenter: 'Email Center',
    automatedEmailWorkflows: 'Automated Email Workflows',
    interviewInvitations: 'Interview Invitations',
    employeeAnnouncements: 'Employee Announcements',
    meetingScheduler: 'Meeting Scheduler',
    notificationCenter: 'Notification Center',
    emailTemplates: 'Email Templates',
    gmailIntegration: 'Gmail Integration',
    googleCalendarIntegration: 'Google Calendar Integration',
    googleMeetIntegration: 'Google Meet Integration',
    googleWorkspaceIntegration: 'Google Workspace Integration',
    interviewScheduling: 'Interview Scheduling',
    employeeMeetings: 'Employee Meetings',
    teamMeetings: 'Team Meetings',
    googleMeetLinks: 'Google Meet Links',
    zoomIntegration: 'Zoom Integration',
    microsoftTeamsIntegration: 'Microsoft Teams Integration',
    calendarSync: 'Calendar Sync',
    aiResumeAnalyzer: 'AI Resume Analyzer',
    aiCandidateMatching: 'AI Candidate Matching',
    aiInterviewQuestions: 'AI Interview Questions',
    aiJobDescriptionGenerator: 'AI Job Description Generator',
    aiHrReports: 'AI HR Reports',
    aiCopilot: 'AI Copilot',
    offerLetters: 'Offer Letters',
    contracts: 'Contracts',
    employeeDocuments: 'Employee Documents',
    policies: 'Policies',
    certificates: 'Certificates',
    templates: 'Templates',
    hiringFunnel: 'Hiring Funnel',
    recruitmentPerformance: 'Recruitment Performance',
    employeeGrowth: 'Employee Growth',
    attendanceAnalytics: 'Attendance Analytics',
    leaveAnalytics: 'Leave Analytics',
    performanceMetrics: 'Performance Metrics',
    aiForecasting: 'AI Forecasting',
    workspaceSettings: 'Workspace Settings',
    rolesPermissions: 'Roles & Permissions',
    mfa: 'MFA',
    auditLogs: 'Audit Logs',
    apiKeys: 'API Keys',
    aiResumeAnalysis: 'AI Resume Analysis',
    automatedRecruitmentEmails: 'Automated Recruitment Emails',
    interviewAutomation: 'Interview Automation',
    employeeSelfServicePortal: 'Employee Self-Service Portal',
    attendanceTracking: 'Attendance Tracking',
    googleCalendarSync: 'Google Calendar Sync',
    gmailAutomation: 'Gmail Automation',
    aiWorkforceAnalytics: 'AI Workforce Analytics'
  },
  ur: {
    dashboard: 'ڈیش بورڈ',
    execDashboard: 'ایگزیکٹو ڈیش بورڈ',
    workforceIntel: 'افرادی قوت کی معلومات',
    jobs: 'نوکریاں',
    candidates: 'امیدوار',
    aiRanking: 'مصنوعی ذہانت کی درجہ بندی',
    interviewQA: 'انٹرویو سوالات',
    employees: 'ملازمین',
    orgChart: 'تنظیمی چارٹ',
    onboarding: 'آن بورڈنگ',
    attendance: 'وقت اور حاضری',
    leaveTracker: 'چھٹیوں کا ٹریکر',
    payrollLedger: 'تنخواہ کا کھاتہ',
    performance: 'کارکردگی کی جانچ',
    goals: 'اہداف اور OKRs',
    training: 'تربیت و تعلیم',
    documents: 'دستاویزات کا والٹ',
    automations: 'آٹومیشنز',
    integrations: 'انضمام مرکز',
    billing: 'بلنگ اور سبسکرپشنز',
    biReports: 'کاروباری رپورٹس',
    security: 'سیکیورٹی اور MFA',
    whitelabel: 'برانڈنگ کی ترتیبات',
    knowledgeBase: 'نالج بیس',
    emailAssistant: 'ای میل اسسٹنٹ',
    emailSettings: 'ای میل کی ترتیبات',
    gmailInbox: 'جی میل ان باکس',
    settings: 'ترتیبات',
    auditTrail: 'آڈٹ ٹریل',
    aiAssistant: 'مصنوعی ذہانت اسسٹنٹ',
    signOut: 'سائن آؤٹ',
    searchPlaceholder: 'نوکریوں یا امیدواروں کو تلاش کریں...'
  },
  ar: {
    dashboard: 'لوحة التحكم',
    execDashboard: 'لوحة القيادة التنفيذية',
    workforceIntel: 'ذكاء القوى العاملة',
    jobs: 'الوظائف',
    candidates: 'المرشحون',
    aiRanking: 'تصنيف الذكاء الاصطناعي',
    interviewQA: 'أسئلة المقابلات',
    employees: 'الموظفون',
    orgChart: 'الهيكل التنظيمي',
    onboarding: 'التهيئة والتدريب',
    attendance: 'الوقت والحضور',
    leaveTracker: 'تعقب الإجازات',
    payrollLedger: 'دفتر الرواتب',
    performance: 'تقييم الأداء',
    goals: 'الأهداف والنتائج الرئيسية',
    training: 'نظام إدارة التعلم',
    documents: 'خزنة المستندات',
    automations: 'الأتمتة والعمليات',
    integrations: 'مركز التكامل',
    billing: 'الاشتراكات والفوترة',
    biReports: 'تقارير ذكاء الأعمال',
    security: 'الأمان والتحقق الثنائي',
    whitelabel: 'إعدادات العلامة التجارية',
    knowledgeBase: 'قاعدة المعرفة',
    emailAssistant: 'مساعد البريد الإلكتروني',
    emailSettings: 'إعدادات البريد الإلكتروني',
    gmailInbox: 'بريد جي ميل',
    settings: 'الإعدادات',
    auditTrail: 'سجل التدقيق والمطابقة',
    aiAssistant: 'مساعد الذكاء الاصطناعي',
    signOut: 'تسجيل الخروج',
    searchPlaceholder: 'البحث السريع عن الوظائف أو المرشحين...'
  },
  fr: {
    dashboard: 'Tableau de bord',
    execDashboard: 'Tableau de bord exécutif',
    workforceIntel: 'Renseignements RH',
    jobs: 'Emplois',
    candidates: 'Candidats',
    aiRanking: 'Classement IA',
    interviewQA: 'Questions d’entretien',
    employees: 'Employés',
    orgChart: 'Organigramme',
    onboarding: 'Intégration',
    attendance: 'Temps & Présences',
    leaveTracker: 'Suivi des congés',
    payrollLedger: 'Registre de paie',
    performance: 'Évaluation de performance',
    goals: 'Objectifs & OKRs',
    training: 'LMS / Formation',
    documents: 'Coffre-fort documents',
    automations: 'Automatisations',
    integrations: 'Hub d’intégrations',
    billing: 'Facturation & Abonnements',
    biReports: 'Rapports BI',
    security: 'Sécurité & MFA',
    whitelabel: 'Marque blanche',
    knowledgeBase: 'Base de connaissances',
    emailAssistant: 'Assistant email',
    emailSettings: 'Paramètres email',
    gmailInbox: 'Boîte Gmail',
    settings: 'Paramètres',
    auditTrail: 'Piste d’audit',
    aiAssistant: 'Assistant IA',
    signOut: 'Déconnexion',
    searchPlaceholder: 'Rechercher des emplois ou candidats...'
  },
  es: {
    dashboard: 'Tablero',
    execDashboard: 'Tablero ejecutivo',
    workforceIntel: 'Inteligencia de Personal',
    jobs: 'Empleos',
    candidates: 'Candidatos',
    aiRanking: 'Clasificación IA',
    interviewQA: 'Preguntas de entrevista',
    employees: 'Empleados',
    orgChart: 'Organigrama',
    onboarding: 'Inducción',
    attendance: 'Tiempo y Asistencia',
    leaveTracker: 'Control de vacaciones',
    payrollLedger: 'Libro de nómina',
    performance: 'Evaluación de desempeño',
    goals: 'Objetivos y OKRs',
    training: 'Formación (LMS)',
    documents: 'Bóveda de documentos',
    automations: 'Automatizaciones',
    integrations: 'Hub de integraciones',
    billing: 'Facturación y Suscripciones',
    biReports: 'Informes BI',
    security: 'Seguridad y MFA',
    whitelabel: 'Marca blanca',
    knowledgeBase: 'Base de conocimientos',
    emailAssistant: 'Asistente de email',
    emailSettings: 'Configuración de email',
    gmailInbox: 'Bandeja Gmail',
    settings: 'Configuración',
    auditTrail: 'Registro de auditoría',
    aiAssistant: 'Asistente IA',
    signOut: 'Cerrar sesión',
    searchPlaceholder: 'Buscar trabajos o candidatos...'
  },
  de: {
    dashboard: 'Dashboard',
    execDashboard: 'Vorstands-Dashboard',
    workforceIntel: 'Personalanalysen',
    jobs: 'Jobs',
    candidates: 'Kandidaten',
    aiRanking: 'KI-Ranking',
    interviewQA: 'Interview-Fragen',
    employees: 'Mitarbeiter',
    orgChart: 'Organigramm',
    onboarding: 'Einarbeitung',
    attendance: 'Zeiterfassung',
    leaveTracker: 'Urlaubsplaner',
    payrollLedger: 'Gehaltsabrechnung',
    performance: 'Leistungsbeurteilung',
    goals: 'Ziele & OKRs',
    training: 'Fortbildung (LMS)',
    documents: 'Dokumenten-Tresor',
    automations: 'Automatisierung',
    integrations: 'Integrationszentrum',
    billing: 'Abrechnung & Abonnements',
    biReports: 'BI-Berichte',
    security: 'Sicherheit & MFA',
    whitelabel: 'White-Labeling',
    knowledgeBase: 'Wissensdatenbank',
    emailAssistant: 'E-Mail-Assistent',
    emailSettings: 'E-Mail-Einstellungen',
    gmailInbox: 'Gmail-Posteingang',
    settings: 'Einstellungen',
    auditTrail: 'Prüfpfad',
    aiAssistant: 'KI-Assistent',
    signOut: 'Abmelden',
    searchPlaceholder: 'Schnellsuche nach Jobs oder Kandidaten...'
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('hireflow_lang');
    if (saved) {
      setLang(saved);
      if (saved === 'ar' || saved === 'ur') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  }, []);

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('hireflow_lang', newLang);
    if (newLang === 'ar' || newLang === 'ur') {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
