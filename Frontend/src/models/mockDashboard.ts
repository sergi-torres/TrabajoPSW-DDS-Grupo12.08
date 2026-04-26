// src/data/mockDashboard.ts
// Datos mock para el dashboard del organizador — reemplazar con API calls cuando el backend esté listo

export interface MockEventInfo {
  name: string;
  phase: string;
  isLive: boolean;
  initialTime: number;
}

export const mockEventInfo: MockEventInfo = {
  name: "Hackathon Innova 2026",
  phase: "Fase de Votación",
  isLive: true,
  initialTime: 0, // segundos restantes (0 = tiempo agotado en el mock)
};

export interface MockStat {
  id: string;
  label: string;
  value: string | number;
  total: number | null;
  icon: string;
  color: string;
}

export const mockStats: MockStat[] = [
  {
    id: "projects",
    label: "Proyectos Subidos",
    value: 24,
    total: 25,
    icon: "FileText",
    color: "org",
  },
  {
    id: "participants",
    label: "Participantes Conectados",
    value: 150,
    total: null,
    icon: "Users",
    color: "part",
  },
  {
    id: "jury_votes",
    label: "Votos Jurado",
    value: "85%",
    total: null,
    icon: "CheckSquare",
    color: "jur",
  },
  {
    id: "public_votes",
    label: "Votos Público",
    value: "3.420",
    total: null,
    icon: "Heart",
    color: "pub",
  },
];

export interface MockRankingEntry {
  id: number;
  position: number;
  name: string;
  team: string;
  score: number;
  juryScore: number;
  publicScore: number;
  trend: "up" | "down" | "stable";
}

export const mockRanking: MockRankingEntry[] = [
  {
    id: 1,
    position: 1,
    name: "EcoTrack AI",
    team: "Team Green",
    score: 87,
    juryScore: 89,
    publicScore: 85,
    trend: "up",
  },
  {
    id: 2,
    position: 2,
    name: "HealthSync",
    team: "MedTech",
    score: 78,
    juryScore: 76,
    publicScore: 80,
    trend: "stable",
  },
  {
    id: 3,
    position: 3,
    name: "UrbanFlow",
    team: "Urban Developers",
    score: 70,
    juryScore: 72,
    publicScore: 68,
    trend: "up",
  },
  {
    id: 4,
    position: 4,
    name: "EduVerse",
    team: "LearnLab",
    score: 62,
    juryScore: 65,
    publicScore: 59,
    trend: "down",
  },
  {
    id: 5,
    position: 5,
    name: "FinSmart",
    team: "FinTech Crew",
    score: 55,
    juryScore: 58,
    publicScore: 52,
    trend: "stable",
  },
];

export interface MockFeedEntry {
  id: number;
  type: string;
  title: string;
  team: string;
  minutesAgo: number;
  status: "ready" | "pending" | "reviewing";
}

export const mockFeed: MockFeedEntry[] = [
  {
    id: 1,
    type: "pdf",
    title: "Plan de Negocios - EcoTrack",
    team: "Team Green",
    minutesAgo: 2,
    status: "ready",
  },
  {
    id: 2,
    type: "video",
    title: "Demo Pitch Video",
    team: "HealthSync",
    minutesAgo: 5,
    status: "ready",
  },
  {
    id: 3,
    type: "mockup",
    title: "Mockup UI - UrbanFlow",
    team: "Urban Developers",
    minutesAgo: 8,
    status: "ready",
  },
  {
    id: 4,
    type: "pdf",
    title: "Memoria Técnica - EduVerse",
    team: "LearnLab",
    minutesAgo: 15,
    status: "pending",
  },
  {
    id: 5,
    type: "video",
    title: "Demo - FinSmart",
    team: "FinTech Crew",
    minutesAgo: 22,
    status: "reviewing",
  },
];
