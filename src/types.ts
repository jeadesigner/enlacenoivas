export interface Dress {
  id: string;
  name: string;
  category: "noivas" | "festas" | "debutantes" | "trajes";
  style: "classico" | "boho" | "moderno" | "minimalista" | "luxo";
  price: string; // "Aluguel sob consulta" or structured
  description: string;
  imageUrl: string;
  features: string[];
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: {
    text: string;
    value: string;
    description: string;
  }[];
}

export interface QuizResult {
  silhouette: string;
  fabric: string;
  theme: string;
  recommendedDresses: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BookingData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  category: string;
  notes: string;
}
