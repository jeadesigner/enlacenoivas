import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  MessageSquare,
  Calendar,
  Compass,
  ShieldCheck,
  Heart,
  User,
  Clock,
  Phone,
  MapPin,
  ChevronRight,
  Menu,
  X,
  Star,
  ArrowRight,
  ArrowLeft,
  Send,
  CheckCircle2,
  RotateCcw,
  Copy,
  Info,
  ChevronDown,
  ExternalLink,
  Award,
  Scissors
} from "lucide-react";
import { DRESSES, QUIZ_QUESTIONS, TESTIMONIALS, FAQS, IMAGES } from "./data";
import { Dress, ChatMessage, BookingData, QuizResult } from "./types";

export default function App() {
  // Navigation & Page Tabs
  const [activeTab, setActiveTab] = useState<"home" | "collections" | "quiz" | "stylist" | "booking" | "faq" | "history">("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Collections States
  const [selectedCategory, setSelectedCategory] = useState<"noivas" | "festas" | "debutantes" | "trajes">("noivas");
  const [selectedDress, setSelectedDress] = useState<Dress | null>(null);

  // Quiz States
  const [quizStep, setQuizStep] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // AI Stylist States
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Olá, querida noiva! Sou Helena, sua consultora de estilo pessoal da Enlace Noivas. Estou aqui para ajudar você a encontrar o vestido perfeito para o dia mais feliz da sua vida, ou o traje ideal para o seu evento especial. Me conte: onde e quando será o casamento? Ou você já tem alguma silhueta em mente?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Booking States
  const [bookingForm, setBookingForm] = useState<BookingData>({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    category: "Noivas",
    notes: "",
  });
  const [bookingSuccessData, setBookingSuccessData] = useState<any | null>(null);
  const [isBookingLoading, setIsBookingLoading] = useState(false);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Testimonial State
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);

  // Scroll chat bottom when messages update
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Rotate testimonials automatically every 8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  // Handler for Quiz options
  const handleQuizAnswer = (questionId: number, optionValue: string) => {
    const updatedAnswers = { ...quizAnswers, [questionId]: optionValue };
    setQuizAnswers(updatedAnswers);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Calculate Results
      // Count major styles chosen
      const counts: Record<string, number> = {};
      Object.values(updatedAnswers).forEach((val) => {
        const styleKey = val as string;
        counts[styleKey] = (counts[styleKey] || 0) + 1;
      });

      // Find the most answered style
      let primaryStyle = "classico";
      let maxCount = 0;
      Object.entries(counts).forEach(([style, count]) => {
        if (count > maxCount) {
          maxCount = count;
          primaryStyle = style;
        }
      });

      // Formulate styling results
      let silhouette = "Princesa Realeza ou Sereia Sublime";
      let fabric = "Renda Francesa Floral com Tule de Seda";
      let theme = "Casamento Clássico em Catedral";

      if (primaryStyle === "boho") {
        silhouette = "Evasê Fluido, Alças Finas e Decote Costas";
        fabric = "Renda Renascença de Algodão e Crepe Georgette";
        theme = "Casamento ao Ar Livre, Praia ou Campo Rústico Chic";
      } else if (primaryStyle === "moderno") {
        silhouette = "Sereia Esculpido ou Minimalista Geométrico";
        fabric = "Cetim Zibelina Estruturado ou Crepe Silk";
        theme = "Cerimônia Urbana, Mini-Wedding ou Rooftop Lounge";
      } else if (primaryStyle === "minimalista") {
        silhouette = "Reto Fluido, Evasê Minimalista, Sem Volume Extra";
        fabric = "Crepe de Seda Puro, Cetim Duchese Fosco";
        theme = "Casamento Íntimo, Elegância Contemporânea, Menos é Mais";
      }

      // Filter dresses matching recommended style
      const recommended = DRESSES.filter((d) => d.style === primaryStyle || d.style === "luxo").map((d) => d.id);

      setQuizResult({
        silhouette,
        fabric,
        theme,
        recommendedDresses: recommended,
      });
      setQuizStep(QUIZ_QUESTIONS.length); // Results step
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
  };

  // AI Stylist Message Handler
  const handleSendMessage = async (textToSend?: string) => {
    const prompt = textToSend || userInput;
    if (!prompt.trim()) return;

    const newUserMessage: ChatMessage = {
      id: "msg-" + Date.now(),
      role: "user",
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updatedMessages = [...chatMessages, newUserMessage];
    setChatMessages(updatedMessages);
    setUserInput("");
    setIsAiLoading(true);

    try {
      // Send message history to our server API
      const response = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setChatMessages((prev) => [
          ...prev,
          {
            id: "reply-" + Date.now(),
            role: "assistant",
            content: data.content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error(data.error || "Ocorreu um erro no servidor.");
      }
    } catch (err: any) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        {
          id: "error-" + Date.now(),
          role: "assistant",
          content: "Querida noiva, tive um pequeno imprevisto técnico ao conectar com o catálogo de tecidos. Pode me perguntar novamente, ou se preferir, agende uma visita diretamente na aba de Agendamento!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Booking Form Submission Handler
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.email || !bookingForm.phone || !bookingForm.date || !bookingForm.time) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setIsBookingLoading(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setBookingSuccessData(data.booking);
        // Add a simulated positive chat styling response about their booking
        setChatMessages((prev) => [
          ...prev,
          {
            id: "booking-notif-" + Date.now(),
            role: "assistant",
            content: `Maravilhoso! Vi que você agendou uma Prova dos Sonhos para o dia ${new Date(bookingForm.date).toLocaleDateString("pt-BR")} às ${bookingForm.time}. Já deixei nossa suíte VIP reservada com a consultora ${data.booking.consultant}. Que tal conversarmos mais sobre o modelo que você gostaria de experimentar no dia?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }
        ]);
      } else {
        alert(data.error || "Erro ao agendar.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro ao enviar formulário. Tente novamente.");
    } finally {
      setIsBookingLoading(false);
    }
  };

  const resetBooking = () => {
    setBookingSuccessData(null);
    setBookingForm({
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
      category: "Noivas",
      notes: "",
    });
  };

  // Pre-seed Stylist with a direct prompt from the quiz or catalog
  const talkToStylistAboutDress = (dressName: string) => {
    setActiveTab("stylist");
    const customPrompt = `Gostaria de saber mais sobre o modelo de alta-costura "${dressName}" e se ele ficaria bem para o meu casamento.`;
    handleSendMessage(customPrompt);
  };

  const startQuizConsultation = () => {
    if (!quizResult) return;
    setActiveTab("stylist");
    const quizSummaryPrompt = `Olá Helena! Fiz o quiz de estilo e meu resultado ideal foi: Silhueta de "${quizResult.silhouette}", em tecidos de "${quizResult.fabric}", para um "${quizResult.theme}". Quais opções do acervo Enlace Noivas você me recomenda baseada nisso?`;
    handleSendMessage(quizSummaryPrompt);
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-gold-200 selection:text-gold-900">
      {/* Dynamic Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gold-100 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => { setActiveTab("home"); window.scrollTo(0,0); }}>
              <div className="w-10 h-10 rounded-full border border-gold-300 flex items-center justify-center bg-gold-50">
                <Sparkles className="w-5 h-5 text-gold-500" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl tracking-[0.2em] font-bold text-luxury-slate">ENLACE</span>
                <span className="text-[9px] tracking-[0.4em] uppercase text-gold-500 font-semibold -mt-1">Noivas & Festas</span>
              </div>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-6 xl:space-x-8">
              {[
                { id: "home", label: "Início" },
                { id: "history", label: "Nossa História" },
                { id: "collections", label: "Coleções" },
                { id: "quiz", label: "Buscador de Estilo" },
                { id: "stylist", label: "Helena Estilista IA", highlight: true },
                { id: "booking", label: "Agendamento VIP" },
                { id: "faq", label: "Perguntas" }
              ].map((navItem) => (
                <button
                  key={navItem.id}
                  id={`nav-${navItem.id}`}
                  onClick={() => {
                    setActiveTab(navItem.id as any);
                    window.scrollTo(0, 0);
                  }}
                  className={`text-sm tracking-wide transition-all duration-300 relative py-2 px-1 ${
                    activeTab === navItem.id
                      ? navItem.highlight 
                        ? "text-gold-500 font-semibold"
                        : "text-luxury-slate font-semibold"
                      : "text-gray-500 hover:text-luxury-slate"
                  }`}
                >
                  {navItem.label}
                  {activeTab === navItem.id && (
                    <motion.div
                      layoutId="navUnderline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-400"
                    />
                  )}
                  {navItem.highlight && (
                    <span className="absolute -top-1 -right-4 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-500"></span>
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Header Booking Action Button */}
            <div className="hidden md:flex items-center">
              <button
                id="header-booking-btn"
                onClick={() => { setActiveTab("booking"); window.scrollTo(0,0); }}
                className="bg-gold-500 text-white hover:bg-gold-600 transition-all duration-300 px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase shadow-sm border border-gold-400 flex items-center space-x-2"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Prova dos Sonhos</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-luxury-slate hover:text-gold-500 p-2"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Panel */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gold-100 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-3">
                {[
                  { id: "home", label: "Início" },
                  { id: "history", label: "Nossa História" },
                  { id: "collections", label: "Coleções de Gala" },
                  { id: "quiz", label: "Buscador de Estilo" },
                  { id: "stylist", label: "Helena Estilista IA ⭐" },
                  { id: "booking", label: "Agendamento VIP" },
                  { id: "faq", label: "Perguntas Frequentes" }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className={`block w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === item.id
                        ? "bg-gold-50 text-gold-600 font-semibold"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setActiveTab("booking");
                      setMobileMenuOpen(false);
                      window.scrollTo(0, 0);
                    }}
                    className="w-full bg-gold-500 text-white text-center py-3 rounded-full text-xs font-semibold tracking-wider uppercase"
                  >
                    Agendar Prova dos Sonhos
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Container */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {/* HOME TAB */}
          {activeTab === "home" && (
            <motion.div
              key="home-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-20 pb-20"
            >
              {/* Splendid Hero Section with split screen */}
              <section className="relative min-h-[calc(100vh-80px)] flex items-center bg-luxury-champagne/30 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                  {/* Left content column */}
                  <div className="space-y-8 max-w-xl z-10">
                    <div className="inline-flex items-center space-x-2 bg-white border border-gold-200 px-4 py-1.5 rounded-full shadow-sm">
                      <Sparkles className="w-4 h-4 text-gold-500" />
                      <span className="text-xs uppercase tracking-[0.15em] text-gold-600 font-semibold font-sans">Alta-Costura Exclusiva</span>
                    </div>

                    <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-luxury-slate leading-tight tracking-tight">
                      Onde os <span className="italic text-gold-500 font-normal">Sonhos</span> se Vestem de <span className="relative">Amor</span>
                    </h1>

                    <p className="text-gray-600 text-base sm:text-lg leading-relaxed font-sans">
                      Na Enlace Noivas, cada ponto celebra a sua história. Viva a experiência inesquecível de escolher o seu vestido perfeito de noiva, debutante ou festa, em suítes de atendimento privativas e com ajustes sob medida artesanais.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      <button
                        onClick={() => setActiveTab("booking")}
                        className="bg-gold-500 text-white hover:bg-gold-600 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 shadow-md hover:translate-y-[-1px] active:translate-y-[1px] flex items-center justify-center space-x-2"
                      >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Prova VIP</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("quiz")}
                        className="bg-white border border-gold-300 text-gold-600 hover:bg-gold-50 px-8 py-4 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 flex items-center justify-center space-x-2"
                      >
                        <Compass className="w-4 h-4 text-gold-400" />
                        <span>Descobrir Meu Estilo</span>
                      </button>
                    </div>

                    {/* Features badges on Hero */}
                    <div className="grid grid-cols-3 gap-4 border-t border-gold-200/60 pt-8">
                      <div>
                        <p className="font-serif text-2xl font-bold text-luxury-slate">Suítes</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-sans">Privativas VIP</p>
                      </div>
                      <div>
                        <p className="font-serif text-2xl font-bold text-luxury-slate">Ajustes</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-sans">Artesanais</p>
                      </div>
                      <div>
                        <p className="font-serif text-2xl font-bold text-luxury-slate">AI Stylist</p>
                        <p className="text-xs text-gold-500 uppercase tracking-wider font-semibold font-sans">Atendimento 24h</p>
                      </div>
                    </div>
                  </div>

                  {/* Right visual column with generated image */}
                  <div className="relative h-[350px] sm:h-[450px] md:h-[550px] rounded-2xl overflow-hidden shadow-2xl border border-gold-100 group">
                    <img
                      src={IMAGES.hero}
                      alt="Coleção Vestido de Noiva Luxo"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Floating Luxury Tag */}
                    <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-xl border border-gold-200/50 shadow-lg flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gold-600 uppercase tracking-widest font-semibold">Destaque do Acervo</p>
                        <h4 className="font-serif text-lg text-luxury-slate font-bold">Maison de l'Amour</h4>
                      </div>
                      <button
                        onClick={() => { setActiveTab("collections"); setSelectedCategory("noivas"); }}
                        className="text-xs text-gold-500 hover:text-gold-600 font-bold uppercase tracking-wider flex items-center space-x-1"
                      >
                        <span>Ver Coleções</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Unique Value Propositions - Bento Grid Concept */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-2xl mx-auto space-y-3">
                  <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">A Experiência Enlace</span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-luxury-slate">Por que as Noivas Escolhem Nossos Vestidos?</h2>
                  <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Card 1 */}
                  <div className="bg-white border border-gold-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-gold-200 space-y-5">
                    <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center border border-gold-200">
                      <User className="w-6 h-6 text-gold-500" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-luxury-slate">Suítes Exclusivas de Atendimento</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Desfrute de um ambiente totalmente privativo para você e seus acompanhantes, com espelhos panorâmicos, iluminação ajustável para simular o altar e brinde com espumante de cortesia.
                    </p>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white border border-gold-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-gold-200 space-y-5">
                    <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center border border-gold-200">
                      <Scissors className="w-6 h-6 text-gold-500" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-luxury-slate">Costura & Ajustes sob Medida</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Nossas rendeiras e costureiras tradicionais realizam modificações personalizadas, bordados adicionais e garantem um caimento impecável desenhado exclusivamente para o seu corpo.
                    </p>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white border border-gold-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:border-gold-200 space-y-5">
                    <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center border border-gold-200">
                      <Award className="w-6 h-6 text-gold-500" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-luxury-slate">Curadoria de Alta-Costura</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      Navegue por um acervo premium que une vestidos importados, criações nacionais sofisticadas e as últimas tendências das passarelas de Milão e Paris adaptadas para o casamento brasileiro.
                    </p>
                  </div>
                </div>
              </section>

              {/* Special Spotlight: AI Stylist Teaser */}
              <section className="bg-luxury-slate text-white py-16 overflow-hidden relative">
                {/* Visual background sparkles */}
                <div className="absolute top-10 right-10 opacity-10">
                  <Sparkles className="w-64 h-64 text-gold-200" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      <span className="text-xs uppercase tracking-[0.2em] text-gold-300 font-bold flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Inovação em Alta-Costura
                      </span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-white leading-tight">
                        Converse Agora com Helena, nossa Consultora de Noivas Inteligente
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        Tem dúvidas sobre qual silhueta valoriza seu corpo? Quer saber qual tecido se comporta melhor no calor da praia? Helena, nossa inteligência artificial treinada em alta-costura de casamentos, está pronta para uma consultoria sob medida de forma instantânea.
                      </p>
                      <button
                        onClick={() => setActiveTab("stylist")}
                        className="bg-gold-400 hover:bg-gold-500 text-luxury-slate font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 inline-flex items-center space-x-2"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Falar com Helena IA</span>
                      </button>
                    </div>

                    {/* Predefined prompts mock container */}
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-4">
                      <p className="text-xs text-gold-300 uppercase tracking-widest font-bold">Pergunte à Helena:</p>
                      {[
                        "Qual o decote ideal para um casamento clássico à noite?",
                        "Quero casar no campo. Qual tecido é mais leve e elegante?",
                        "Como combinar o terno do noivo com meu vestido Boho?"
                      ].map((prompt, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setActiveTab("stylist");
                            handleSendMessage(prompt);
                          }}
                          className="w-full text-left bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm p-3.5 rounded-xl border border-white/5 transition-all duration-300 flex items-center justify-between group"
                        >
                          <span className="text-gray-200 group-hover:text-white transition-colors">{prompt}</span>
                          <ChevronRight className="w-4 h-4 text-gold-400 group-hover:translate-x-1 transition-transform" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              {/* Collections Showcase Slider / Grid Promo */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
                  <div className="space-y-2">
                    <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Nosso Acervo Exclusivo</span>
                    <h2 className="font-serif text-3xl text-luxury-slate">Explore as Coleções da Enlace</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab("collections")}
                    className="text-sm text-gold-500 hover:text-gold-600 font-bold uppercase tracking-wider flex items-center space-x-1 self-start"
                  >
                    <span>Ver catálogo completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Cards split */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Noivas Clássicas & Modernas", img: IMAGES.classic, count: "50+ modelos", cat: "noivas" },
                    { title: "Casamento no Campo & Boho", img: IMAGES.boho, count: "30+ modelos", cat: "noivas" },
                    { title: "Madrinhas & Vestidos de Festa", img: IMAGES.party, count: "80+ modelos", cat: "festas" },
                    { title: "Trajes de Gala & Noivos", img: IMAGES.groom, count: "40+ modelos", cat: "trajes" }
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-gold-100/50 hover:shadow-xl transition-all duration-300"
                      onClick={() => {
                        setActiveTab("collections");
                        setSelectedCategory(item.cat as any);
                      }}
                    >
                      <div className="relative h-64 overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                        <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-luxury-slate text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-gold-100">
                          {item.count}
                        </span>
                      </div>
                      <div className="p-5 space-y-1">
                        <h3 className="font-serif text-lg text-luxury-slate group-hover:text-gold-500 transition-colors font-bold">{item.title}</h3>
                        <p className="text-xs text-gray-400">Ver acervo selecionado</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Cinematic History / Legacy Teaser Section */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="bg-luxury-champagne/30 rounded-3xl border border-gold-200/50 p-8 md:p-16 relative overflow-hidden shadow-sm">
                  {/* Absolute vintage watermark */}
                  <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 opacity-[0.03] select-none pointer-events-none">
                    <span className="font-serif text-[180px] font-bold text-luxury-slate">1988</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
                    {/* Left: Vintage Frame */}
                    <div className="lg:col-span-5 relative">
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border-4 border-white relative group">
                        <img
                          src={IMAGES.boho}
                          alt="Ateliê Enlace Noivas"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                      
                      {/* Decorative Badge */}
                      <div className="absolute -bottom-6 -left-6 bg-white shadow-lg px-5 py-4 rounded-xl border border-gold-100 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gold-50 rounded-lg flex items-center justify-center border border-gold-200">
                          <Heart className="w-5 h-5 text-gold-500 fill-current" />
                        </div>
                        <div>
                          <p className="font-serif text-lg font-bold text-luxury-slate">Desde 1988</p>
                          <p className="text-[9px] uppercase tracking-wider text-gold-600 font-semibold font-sans">Amor & Legado de Família</p>
                        </div>
                      </div>
                    </div>

                    {/* Right: Text Content */}
                    <div className="lg:col-span-7 space-y-6">
                      <span className="text-xs uppercase tracking-[0.2em] text-gold-600 font-bold block">Nossa Essência & Legado</span>
                      <h2 className="font-serif text-3xl sm:text-4xl text-luxury-slate leading-tight font-bold">
                        Uma Jornada de Amor que se Entrelaça com a sua História
                      </h2>
                      <div className="w-12 h-[2px] bg-gold-400" />
                      
                      <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans">
                        A história da Enlace Noivas começou em 1988, quando <strong>Fernando Ribeiro Damasceno</strong> e <strong>Geni Damasceno</strong>, movidos pela paixão de transformar sonhos em realidade, decidiram abrir uma casa de noivas. Não era apenas um negócio; era a concretização de um sonho compartilhado que se entrelaçaria com a história de incontáveis casais.
                      </p>
                      
                      <p className="text-gray-600 text-sm leading-relaxed hidden sm:block font-sans">
                        Thaísa Sena cresceu observando o trabalho incansável de seus pais, compreendendo o peso e a beleza de cada detalhe. Quando Fernando e Geni decidiram passar o bastão, Thaísa, ao lado de seu esposo, assumiu o legado de honrá-los, mantendo viva a alma calorosa da Enlace, enquanto a reinventava com inovação e modernidade para os novos tempos.
                      </p>
                      
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setActiveTab("history");
                            window.scrollTo(0, 0);
                          }}
                          className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center space-x-2"
                        >
                          <span>Conhecer Nossa História Completa</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Testimonials Slideshow */}
              <section className="bg-gold-50/50 py-16 border-y border-gold-100">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="flex space-x-1 text-gold-400">
                      {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonialIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="space-y-6"
                    >
                      <p className="font-serif text-xl sm:text-2xl text-luxury-slate italic leading-relaxed">
                        "{TESTIMONIALS[currentTestimonialIndex].text}"
                      </p>
                      <div>
                        <h4 className="font-sans text-sm font-bold text-luxury-slate uppercase tracking-wider">
                          {TESTIMONIALS[currentTestimonialIndex].bride}
                        </h4>
                        <p className="text-xs text-gold-600 mt-1">
                          {TESTIMONIALS[currentTestimonialIndex].date} • <span className="italic">{TESTIMONIALS[currentTestimonialIndex].tag}</span>
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Bullet Navigation */}
                  <div className="flex justify-center space-x-2 pt-4">
                    {TESTIMONIALS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentTestimonialIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          currentTestimonialIndex === i ? "bg-gold-500 w-6" : "bg-gold-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* OUR HISTORY TAB */}
          {activeTab === "history" && (
            <motion.div
              key="history-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-16 pb-24"
            >
              {/* Header Title with subtle floral/lux look */}
              <section className="bg-luxury-champagne/20 border-b border-gold-100/50 py-16 sm:py-20">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
                  <div className="inline-flex items-center space-x-2 bg-white border border-gold-200 px-4 py-1.5 rounded-full shadow-xs">
                    <Heart className="w-3.5 h-3.5 text-gold-500 fill-current" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-gold-600 font-bold font-sans">Nossa Jornada de Amor</span>
                  </div>
                  <h1 className="font-serif text-3xl sm:text-5xl text-luxury-slate leading-tight font-bold">
                    A História da Enlace Noivas
                  </h1>
                  <p className="text-gray-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                    Um legado de tradição, carinho e magia que atravessa gerações e se perpetua em cada altar.
                  </p>
                  <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
                </div>
              </section>

              {/* Founder & Family Section - Split screen */}
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  <div className="space-y-6">
                    <span className="text-xs uppercase tracking-widest text-gold-600 font-bold">Como Tudo Começou em 1988</span>
                    <h2 className="font-serif text-3xl text-luxury-slate font-bold leading-tight">
                      Fernando & Geni Damasceno
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base leading-relaxed font-sans">
                      A história da Enlace Noivas começou em 1988, quando <strong>Fernando Ribeiro Damasceno</strong> e <strong>Geni Damasceno</strong>, movidos pela paixão de transformar sonhos em realidade, decidiram abrir uma casa de noivas. Não era apenas um negócio; era a concretização de um sonho compartilhado, o início de uma história de vida que se entrelaçaria com as histórias de incontáveis casais.
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans">
                      Fernando e Geni, com os corações cheios de esperança, dedicaram-se a criar um lugar onde cada detalhe fosse perfeito, onde cada noiva que cruzasse as portas da Enlace se sentisse acolhida, compreendida e especial.
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed font-sans">
                      Ao longo dos anos, a Enlace Noivas se tornou um símbolo de tradição, uma segunda casa para as noivas que desejavam mais do que um vestido, mas sim uma peça que refletisse seus sonhos, suas personalidades e seus futuros.
                    </p>
                  </div>

                  {/* Visual block */}
                  <div className="relative h-[350px] sm:h-[450px] rounded-2xl overflow-hidden shadow-xl border border-gold-100 group">
                    <img
                      src={IMAGES.classic}
                      alt="Fundação da Enlace Noivas"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    <div className="absolute bottom-6 left-6 text-white space-y-1">
                      <p className="text-[10px] uppercase tracking-widest font-semibold text-gold-300">Fundado em 1988</p>
                      <h4 className="font-serif text-xl font-bold">O Berço de Grandes Sonhos</h4>
                    </div>
                  </div>
                </div>
              </section>

              {/* The Handover / The Legacy transition Section */}
              <section className="bg-luxury-slate text-white py-16 sm:py-20 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Visual block */}
                    <div className="relative h-[350px] sm:h-[450px] rounded-2xl overflow-hidden shadow-xl border border-white/10 group lg:order-last">
                      <img
                        src={IMAGES.boho}
                        alt="Transição de Legado"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      <div className="absolute bottom-6 left-6 text-white space-y-1">
                        <p className="text-[10px] uppercase tracking-widest font-semibold text-gold-300">A Segunda Geração</p>
                        <h4 className="font-serif text-xl font-bold">Tradição & Modernidade</h4>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <span className="text-xs uppercase tracking-widest text-gold-300 font-bold">A Nova Geração & Inovação</span>
                      <h2 className="font-serif text-3xl text-white font-bold leading-tight">
                        Thaísa Sena: Honrando o Passado, Abraçando o Futuro
                      </h2>
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed font-sans">
                        Nesse ambiente de ternura e profissionalismo, <strong>Thaísa Sena</strong> cresceu, observando o trabalho incansável de seus pais e sentindo de perto o peso e a imensa beleza de cada história de amor que nascia ali dentro do ateliê.
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed font-sans">
                        Quando Fernando e Geni decidiram que era hora de passar o bastão, não foi uma simples transferência de responsabilidades comerciais. Foi um ato sublime de confiança e fé no futuro. Thaísa, agora com o precioso legado dos pais em mãos, decidiu honrá-los da melhor forma possível: mantendo viva a essência acolhedora da Enlace Noivas, enquanto a reinventava para os novos tempos.
                      </p>
                      <p className="text-gray-300 text-sm leading-relaxed font-sans">
                        Com um coração transbordando gratidão e determinação, ela, juntamente com seu esposo, trouxe modernidade, tecnologia inteligente e processos de ponta, sem nunca perder o toque de magia, acolhimento e carinho que sempre foi a marca registrada da casa.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Staggered Timeline Section */}
              <section className="max-w-4xl mx-auto px-4 sm:px-6">
                <div className="text-center space-y-3 mb-16">
                  <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Nossa Linha do Tempo</span>
                  <h2 className="font-serif text-2xl sm:text-3xl text-luxury-slate font-bold">Marcos de Amor & Conquistas</h2>
                  <div className="w-12 h-[2px] bg-gold-300 mx-auto" />
                </div>

                <div className="relative border-l-2 border-gold-200 pl-6 sm:pl-10 space-y-12">
                  {/* Timeline point 1 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gold-500 border-4 border-white shadow-xs" />
                    <div className="space-y-2 bg-white border border-gold-100 p-6 rounded-2xl shadow-xs">
                      <span className="inline-block bg-gold-50 text-gold-600 text-xs font-bold px-3 py-1 rounded-full border border-gold-200">1988</span>
                      <h3 className="font-serif text-lg font-bold text-luxury-slate">A Fundação da Casa dos Sonhos</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
                        Fernando Ribeiro Damasceno e Geni Damasceno abrem as portas da Enlace Noivas, dedicando-se com ternura para acolher e compreender cada noiva de forma única e inesquecível.
                      </p>
                    </div>
                  </div>

                  {/* Timeline point 2 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gold-500 border-4 border-white shadow-xs" />
                    <div className="space-y-2 bg-white border border-gold-100 p-6 rounded-2xl shadow-xs">
                      <span className="inline-block bg-gold-50 text-gold-600 text-xs font-bold px-3 py-1 rounded-full border border-gold-200">Anos 90 - 2000</span>
                      <h3 className="font-serif text-lg font-bold text-luxury-slate">O Símbolo de Tradição e Confiança</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
                        A marca Enlace consolida-se como referência máxima de alta-costura, tecidos finos e ajustes impecáveis. Na infância e juventude, Thaísa Sena cresce aprendendo a beleza de cada história e o valor da alfaiataria artesanal.
                      </p>
                    </div>
                  </div>

                  {/* Timeline point 3 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gold-500 border-4 border-white shadow-xs" />
                    <div className="space-y-2 bg-white border border-gold-100 p-6 rounded-2xl shadow-xs">
                      <span className="inline-block bg-gold-50 text-gold-600 text-xs font-bold px-3 py-1 rounded-full border border-gold-200">A Transição</span>
                      <h3 className="font-serif text-lg font-bold text-luxury-slate">Passagem de Bastão & Confiança</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
                        Com fé e admiração pelo trabalho da filha, Fernando e Geni confiam o legado da marca a Thaísa Sena. Ela assume com a missão sagrada de manter a essência viva, enquanto projeta a boutique para o futuro.
                      </p>
                    </div>
                  </div>

                  {/* Timeline point 4 */}
                  <div className="relative">
                    <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-4 sm:w-5 h-4 sm:h-5 rounded-full bg-gold-500 border-4 border-white shadow-xs" />
                    <div className="space-y-2 bg-white border border-gold-100 p-6 rounded-2xl shadow-xs">
                      <span className="inline-block bg-gold-50 text-gold-600 text-xs font-bold px-3 py-1 rounded-full border border-gold-200">Hoje</span>
                      <h3 className="font-serif text-lg font-bold text-luxury-slate">Um Templo de Inovação e Afeto</h3>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-sans">
                        Ao lado de seu esposo, Thaísa sela o casamento entre a alta-costura e a tecnologia de ponta. Nasce a Helena (Consultora IA), as suítes de atendimento VIP automatizadas, mantendo o aconchego e afeto que começaram em 1988.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Inspiring Quote Box */}
              <section className="bg-gold-50/50 py-12 sm:py-16 border-y border-gold-100 max-w-5xl mx-auto rounded-3xl text-center px-6">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="flex justify-center">
                    <Heart className="w-8 h-8 text-gold-400 fill-current" />
                  </div>
                  <p className="font-serif text-xl sm:text-2xl text-luxury-slate italic leading-relaxed">
                    "Honrar o legado de dedicação e amor dos meus pais é manter viva a alma de cada vestido, oferecendo um porto seguro de ternura para as noivas, enquanto construímos uma ponte de modernidade e elegância para os novos tempos."
                  </p>
                  <div>
                    <h4 className="font-sans text-sm font-bold text-luxury-slate uppercase tracking-widest">Thaísa Sena</h4>
                    <p className="text-xs text-gold-600 mt-1">Diretora Criativa & Sucessora Enlace Noivas</p>
                  </div>
                </div>
              </section>

              {/* Call To Action */}
              <section className="max-w-4xl mx-auto px-4 text-center space-y-8">
                <div className="space-y-3">
                  <h3 className="font-serif text-2xl sm:text-3xl text-luxury-slate font-bold">Venha Fazer Parte da Nossa História</h3>
                  <p className="text-gray-500 text-sm max-w-lg mx-auto leading-relaxed">
                    Marque um horário para vivenciar a Prova dos Sonhos em nossas suítes VIP privativas com atendimento personalizado e exclusivo.
                  </p>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setActiveTab("booking");
                      window.scrollTo(0, 0);
                    }}
                    className="bg-gold-500 hover:bg-gold-600 text-white font-bold px-10 py-4 rounded-full text-xs uppercase tracking-widest shadow-md transition-all flex items-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reservar Minha Prova VIP</span>
                  </button>
                </div>
              </section>
            </motion.div>
          )}

          {/* COLLECTIONS CATALOG TAB */}
          {activeTab === "collections" && (
            <motion.div
              key="collections-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-24"
            >
              {/* Header Title */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Acervo dos Sonhos</span>
                <h1 className="font-serif text-3xl sm:text-4xl text-luxury-slate">Coleções Exclusivas</h1>
                <p className="text-gray-500 text-sm">Navegue por nossa curadoria premium de trajes para casamentos, debutantes e eventos de alta gala.</p>
                <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
              </div>

              {/* Dynamic Categories Selector */}
              <div className="flex justify-center flex-wrap gap-2 sm:gap-4 border-b border-gold-100 pb-2">
                {[
                  { id: "noivas", label: "Vestidos de Noiva" },
                  { id: "festas", label: "Vestidos de Festa & Madrinhas" },
                  { id: "debutantes", label: "Debutantes (15 Anos)" },
                  { id: "trajes", label: "Trajes Masculinos & Grooms" }
                ].map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id as any)}
                    className={`px-5 py-3 rounded-t-xl text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all duration-300 border-b-2 ${
                      selectedCategory === category.id
                        ? "border-gold-500 text-gold-600 bg-gold-50/40"
                        : "border-transparent text-gray-500 hover:text-luxury-slate"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Grid of Dresses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {DRESSES.filter((d) => d.category === selectedCategory).map((dress) => (
                  <motion.div
                    key={dress.id}
                    layout
                    className="bg-white border border-gold-100/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
                  >
                    <div className="relative h-80 overflow-hidden bg-gray-50">
                      <img
                        src={dress.imageUrl}
                        alt={dress.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Floating Style Indicator */}
                      <span className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest text-gold-600 px-3 py-1.5 rounded-full shadow-sm border border-gold-200/40">
                        {dress.style}
                      </span>
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-serif text-lg font-bold text-luxury-slate group-hover:text-gold-500 transition-colors">
                          {dress.name}
                        </h3>
                        <p className="text-xs text-gray-400 line-clamp-2">{dress.description}</p>
                      </div>

                      <div className="border-t border-gold-100/50 pt-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-gold-600 uppercase tracking-wider">{dress.price}</span>
                        <button
                          onClick={() => setSelectedDress(dress)}
                          className="bg-gold-50 text-gold-600 hover:bg-gold-500 hover:text-white border border-gold-200/50 rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all duration-300"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Empty state if any */}
              {DRESSES.filter((d) => d.category === selectedCategory).length === 0 && (
                <div className="text-center py-16 space-y-4">
                  <Info className="w-12 h-12 text-gold-300 mx-auto" />
                  <p className="text-gray-500">Nenhum modelo disponível para esta categoria no momento.</p>
                </div>
              )}

              {/* Dress Detail Modal */}
              <AnimatePresence>
                {selectedDress && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gold-200/30 flex flex-col md:flex-row relative"
                    >
                      {/* Close button */}
                      <button
                        onClick={() => setSelectedDress(null)}
                        className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white backdrop-blur-sm rounded-full p-2 text-luxury-slate shadow-md hover:text-gold-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>

                      {/* Left: Image */}
                      <div className="w-full md:w-1/2 h-80 md:h-auto min-h-[300px] relative bg-gray-50">
                        <img
                          src={selectedDress.imageUrl}
                          alt={selectedDress.name}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      {/* Right: Info */}
                      <div className="w-full md:w-1/2 p-6 sm:p-8 space-y-6 flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold">{selectedDress.category} • Estilo {selectedDress.style}</span>
                            <h2 className="font-serif text-2xl sm:text-3xl text-luxury-slate font-bold">{selectedDress.name}</h2>
                          </div>

                          <p className="text-gray-600 text-sm leading-relaxed">{selectedDress.description}</p>

                          <div className="space-y-2">
                            <h4 className="text-xs font-bold uppercase text-luxury-slate tracking-wider">Principais Atributos:</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedDress.features.map((feature, i) => (
                                <span key={i} className="bg-gold-50 text-gold-700 text-[10px] px-3 py-1 rounded-full border border-gold-100 font-medium">
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100 space-y-1">
                            <p className="text-[11px] text-gray-500 uppercase tracking-widest font-semibold">Incluso no Aluguel Premium:</p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                              Provas de ajuste sob medida ilimitadas, lavagem cirúrgica pós-evento, capa de transporte de alta proteção e assessoria completa no dia de retirada.
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gold-100">
                          <button
                            onClick={() => {
                              talkToStylistAboutDress(selectedDress.name);
                              setSelectedDress(null);
                            }}
                            className="flex-1 bg-white border border-gold-400 text-gold-600 hover:bg-gold-50 py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-1.5"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                            <span>Perguntar para Helena IA</span>
                          </button>

                          <button
                            onClick={() => {
                              setActiveTab("booking");
                              setSelectedDress(null);
                              setBookingForm((prev) => ({ ...prev, notes: `Gostaria de provar o modelo "${selectedDress.name}".` }));
                            }}
                            className="flex-1 bg-gold-500 hover:bg-gold-600 text-white py-3 rounded-full text-xs font-bold tracking-widest uppercase transition-all duration-300 flex items-center justify-center space-x-1.5 shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            <span>Reservar Data VIP</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* QUIZ TAB */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 pb-24"
            >
              {/* Header Title */}
              <div className="text-center space-y-3">
                <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Descobridor Inteligente</span>
                <h1 className="font-serif text-3xl text-luxury-slate">Encontre o Vestido Ideal</h1>
                <p className="text-gray-500 text-sm max-w-xl mx-auto">Responda a 4 perguntas simples sobre sua personalidade e sua cerimônia para receber uma recomendação completa de modelagem e tecido elaborada pela Helena.</p>
                <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
              </div>

              {/* Progress Bar */}
              {quizStep < QUIZ_QUESTIONS.length && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-400 uppercase tracking-widest">
                    <span>Pergunta {quizStep + 1} de {QUIZ_QUESTIONS.length}</span>
                    <span>{Math.round(((quizStep + 1) / QUIZ_QUESTIONS.length) * 100)}% concluído</span>
                  </div>
                  <div className="w-full bg-gold-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gold-400 h-full transition-all duration-500"
                      style={{ width: `${((quizStep) / QUIZ_QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Question Screen */}
              {quizStep < QUIZ_QUESTIONS.length ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={quizStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gold-100 rounded-2xl p-6 sm:p-10 shadow-lg space-y-8"
                  >
                    <h2 className="font-serif text-xl sm:text-2xl text-luxury-slate font-bold leading-snug">
                      {QUIZ_QUESTIONS[quizStep].text}
                    </h2>

                    <div className="grid grid-cols-1 gap-4">
                      {QUIZ_QUESTIONS[quizStep].options.map((option, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[quizStep].id, option.value)}
                          className="w-full text-left p-5 rounded-xl border border-gold-100 hover:border-gold-300 hover:bg-gold-50/20 transition-all duration-300 group flex items-start space-x-4 cursor-pointer"
                        >
                          <div className="w-6 h-6 rounded-full border border-gold-300 flex items-center justify-center text-xs text-gold-600 group-hover:bg-gold-500 group-hover:text-white group-hover:border-gold-500 font-bold transition-all shrink-0 mt-0.5">
                            {String.fromCharCode(65 + index)}
                          </div>
                          <div>
                            <p className="font-bold text-sm sm:text-base text-luxury-slate group-hover:text-gold-700 transition-colors">{option.text}</p>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">{option.description}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    {quizStep > 0 && (
                      <button
                        onClick={() => setQuizStep(quizStep - 1)}
                        className="text-xs text-gray-400 hover:text-luxury-slate flex items-center space-x-1 uppercase tracking-wider"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar pergunta anterior</span>
                      </button>
                    )}
                  </motion.div>
                </AnimatePresence>
              ) : (
                /* Results Screen */
                quizResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-gold-100 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8"
                  >
                    <div className="text-center space-y-2">
                      <div className="w-14 h-14 bg-gold-50 rounded-full flex items-center justify-center mx-auto border border-gold-200">
                        <Sparkles className="w-6 h-6 text-gold-500 animate-pulse" />
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gold-500 font-bold">Resultado da sua Análise de Estilo</span>
                      <h2 className="font-serif text-2xl sm:text-3xl text-luxury-slate font-bold">O Seu Estilo dos Sonhos</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-y border-gold-100 py-6">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-gray-400 tracking-wider font-sans">Silhueta Recomendada:</span>
                        <p className="font-serif text-base text-luxury-slate font-bold">{quizResult.silhouette}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-gray-400 tracking-wider font-sans">Tecidos Recomendados:</span>
                        <p className="font-serif text-base text-luxury-slate font-bold">{quizResult.fabric}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase text-gray-400 tracking-wider font-sans">Tema da Cerimônia Ideal:</span>
                        <p className="font-serif text-base text-luxury-slate font-bold">{quizResult.theme}</p>
                      </div>
                    </div>

                    {/* Show suggested dress from our inventory */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-luxury-slate">Nossas Sugestões do Acervo para Você:</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {DRESSES.filter((d) => quizResult.recommendedDresses.includes(d.id)).slice(0, 2).map((dress) => (
                          <div key={dress.id} className="border border-gold-100 rounded-xl p-4 flex items-center space-x-4 bg-gold-50/10">
                            <img
                              src={dress.imageUrl}
                              alt={dress.name}
                              className="w-16 h-20 object-cover rounded-md"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1 flex-grow">
                              <h4 className="font-serif text-sm font-bold text-luxury-slate">{dress.name}</h4>
                              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{dress.style}</p>
                              <button
                                onClick={() => setSelectedDress(dress)}
                                className="text-[10px] text-gold-600 font-bold uppercase tracking-wider hover:underline block"
                              >
                                Ver Detalhes
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                      <button
                        onClick={resetQuiz}
                        className="bg-white border border-gold-200 text-gray-500 hover:text-luxury-slate py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Refazer Quiz</span>
                      </button>

                      <button
                        onClick={startQuizConsultation}
                        className="flex-1 bg-gold-500 hover:bg-gold-600 text-white py-3.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5 shadow-md transition-transform duration-300 hover:scale-[1.01]"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Discussão com Helena IA</span>
                      </button>
                    </div>
                  </motion.div>
                )
              )}
            </motion.div>
          )}

          {/* AI STYLIST CHAT TAB */}
          {activeTab === "stylist" && (
            <motion.div
              key="stylist-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-220px)] min-h-[550px]">
                {/* Left panel: Info & Prompts */}
                <div className="bg-white border border-gold-100 rounded-2xl p-6 space-y-6 flex flex-col justify-between hidden lg:flex">
                  <div className="space-y-5">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gold-50 flex items-center justify-center border border-gold-200 text-gold-600">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-serif text-lg font-bold text-luxury-slate">Helena Prado</h2>
                        <p className="text-[10px] text-gold-500 uppercase tracking-wider font-bold">Estilista de Casamento IA</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-sans">
                      Helena foi desenvolvida com base no catálogo histórico de vestidos, tecidos e ajustes da Enlace Noivas. Ela analisa sua preferência estética para recomendar decotes, véus e tecidos ideais.
                    </p>

                    <div className="border-t border-gold-100/50 pt-4 space-y-3">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-luxury-slate">Sugestões de Perguntas:</h4>
                      {[
                        "Qual o vestido ideal para noivas baixinhas?",
                        "Quais os melhores acessórios para vestido estilo Boho?",
                        "Qual a diferença do cetim zibelina para organza?"
                      ].map((item, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(item)}
                          disabled={isAiLoading}
                          className="w-full text-left text-xs bg-gold-50/30 hover:bg-gold-50 border border-gold-100/50 p-3 rounded-lg text-gray-600 hover:text-gold-700 transition-all font-sans"
                        >
                          "{item}"
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gold-50/50 p-4 rounded-xl border border-gold-100">
                    <p className="text-[10px] text-gold-700 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Atendimento Privado
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1">Suas conversas de consultoria com a Helena IA são 100% confidenciais.</p>
                  </div>
                </div>

                {/* Right panel: Chat UI */}
                <div className="lg:col-span-2 bg-white border border-gold-100 rounded-2xl flex flex-col h-full overflow-hidden shadow-lg">
                  {/* Chat Header */}
                  <div className="bg-gold-50/40 px-6 py-4 border-b border-gold-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-9 h-9 rounded-full bg-gold-100 flex items-center justify-center font-serif text-gold-700 font-bold border border-gold-300">
                          HP
                        </div>
                        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-luxury-slate">Consultoria Virtual Enlace</h3>
                        <p className="text-[9px] text-gray-400 uppercase tracking-widest font-sans flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Atendimento Ativo 24h
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm("Tem certeza que deseja reiniciar o histórico da conversa?")) {
                          setChatMessages([
                            {
                              id: "welcome",
                              role: "assistant",
                              content: "Olá! Sou Helena, sua estilista de IA na Enlace Noivas. Que tal conversarmos sobre como você deseja se vestir no dia mais memorável de sua vida?",
                              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                            }
                          ]);
                        }
                      }}
                      className="text-gray-400 hover:text-gold-500 p-2 text-xs flex items-center space-x-1 uppercase tracking-widest font-sans transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Limpar Chat</span>
                    </button>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                            msg.role === "user"
                              ? "bg-gold-500 text-white rounded-br-none"
                              : "bg-gray-50 text-luxury-slate border border-gold-100/50 rounded-bl-none"
                          }`}
                        >
                          {/* Parse newlines into <p> */}
                          {msg.content.split("\n").map((para, i) => (
                            <p key={i} className={i > 0 ? "mt-2" : ""}>{para}</p>
                          ))}
                          <span
                            className={`block text-[9px] mt-2 text-right ${
                              msg.role === "user" ? "text-gold-100" : "text-gray-400"
                            }`}
                          >
                            {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isAiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-50 border border-gold-100/50 rounded-2xl rounded-bl-none p-4 max-w-[80%] flex items-center space-x-2">
                          <span className="text-xs text-gray-400">Helena está analisando tecidos</span>
                          <span className="flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                            <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                          </span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-gold-100 bg-gold-50/10">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        disabled={isAiLoading}
                        placeholder="Ex: Qual vestido combina com casamento no pôr do sol?"
                        className="flex-grow bg-white border border-gold-200 hover:border-gold-300 focus:border-gold-400 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-0 text-luxury-slate transition-colors"
                      />
                      <button
                        onClick={() => handleSendMessage()}
                        disabled={isAiLoading || !userInput.trim()}
                        className="bg-gold-500 hover:bg-gold-600 disabled:bg-gray-200 disabled:text-gray-400 text-white rounded-full p-3.5 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 text-center mt-2 font-sans">
                      A consultoria virtual auxilia na pré-seleção. Agende um teste físico na suíte VIP para decisão final.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* AGENDAMENTO VIP TAB */}
          {activeTab === "booking" && (
            <motion.div
              key="booking-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8"
            >
              {/* Header Title */}
              <div className="text-center space-y-3">
                <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Reserva Exclusiva</span>
                <h1 className="font-serif text-3xl text-luxury-slate">Prova dos Sonhos</h1>
                <p className="text-gray-500 text-sm max-w-xl mx-auto">Agende um horário exclusivo na nossa Suíte VIP. Nossa equipe entrará em contato para alinhar os detalhes e selecionar previamente seus modelos favoritos.</p>
                <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
              </div>

              {!bookingSuccessData ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                  {/* Left: benefits */}
                  <div className="md:col-span-1 bg-gold-50/50 rounded-2xl p-6 border border-gold-100 space-y-6">
                    <h3 className="font-serif text-lg font-bold text-luxury-slate">Sua Visita VIP inclui:</h3>
                    
                    <ul className="space-y-4">
                      {[
                        { title: "Sessão de 2 Horas", desc: "Tempo de sobra para experimentar até 6 vestidos com calma." },
                        { title: "Consultora Dedicada", desc: "Helena ou outra especialista te acompanha com exclusividade." },
                        { title: "Sua Entourage", desc: "Traga até 4 convidados especiais na nossa luxuosa suíte." },
                        { title: "Brinde Especial", desc: "Espumante e doces franceses para celebrar o momento." }
                      ].map((benefit, i) => (
                        <li key={i} className="flex items-start space-x-3 text-xs">
                          <CheckCircle2 className="w-4.5 h-4.5 text-gold-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-luxury-slate uppercase tracking-wider">{benefit.title}</p>
                            <p className="text-gray-500 mt-0.5">{benefit.desc}</p>
                          </div>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-gold-200/50 pt-4 text-center">
                      <p className="text-[10px] text-gray-400">Precisa mudar de data depois?</p>
                      <p className="text-xs text-gold-600 font-bold mt-1">Reagendamento gratuito em até 48h</p>
                    </div>
                  </div>

                  {/* Right: Form */}
                  <div className="md:col-span-2 bg-white border border-gold-100 rounded-2xl p-6 sm:p-8 shadow-lg">
                    <form onSubmit={handleBookingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">Seu Nome Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ex: Mariana Silva"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          />
                        </div>

                        {/* Email */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">E-mail de Contato *</label>
                          <input
                            type="email"
                            required
                            placeholder="marianasilva@email.com"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          />
                        </div>

                        {/* Phone */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">Telefone / WhatsApp *</label>
                          <input
                            type="tel"
                            required
                            placeholder="(14) 99999-9999"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          />
                        </div>

                        {/* Event Category */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">O que você está buscando?</label>
                          <select
                            value={bookingForm.category}
                            onChange={(e) => setBookingForm({ ...bookingForm, category: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          >
                            <option value="Noivas">Vestidos de Noiva</option>
                            <option value="Festas">Madrinhas / Festas</option>
                            <option value="Debutantes">Debutante (15 Anos)</option>
                            <option value="Trajes">Trajes Masculinos (Ternos/Smoking)</option>
                          </select>
                        </div>

                        {/* Date */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">Data Preferencial *</label>
                          <input
                            type="date"
                            required
                            min={new Date().toISOString().split("T")[0]}
                            value={bookingForm.date}
                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          />
                        </div>

                        {/* Time */}
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">Horário Desejado *</label>
                          <select
                            required
                            value={bookingForm.time}
                            onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                            className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate"
                          >
                            <option value="">Selecione um horário</option>
                            <option value="09:00">09:00</option>
                            <option value="11:00">11:00</option>
                            <option value="14:00">14:00</option>
                            <option value="16:00">16:00</option>
                            <option value="18:00">18:00</option>
                          </select>
                        </div>
                      </div>

                      {/* Notes / Prefs */}
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-luxury-slate uppercase tracking-wider">Preferências Estéticas ou Notas Especiais</label>
                        <textarea
                          rows={4}
                          placeholder="Mencione detalhes adicionais: data do casamento, local do evento, silhuetas de preferência ou se gostou de algum modelo específico do acervo."
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                          className="w-full bg-luxury-cream border border-gold-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold-400 transition-colors text-luxury-slate resize-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isBookingLoading}
                        className="w-full bg-gold-500 hover:bg-gold-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                      >
                        {isBookingLoading ? (
                          <span>Enviando solicitação...</span>
                        ) : (
                          <>
                            <Calendar className="w-4 h-4" />
                            <span>Solicitar Reserva de Horário VIP</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              ) : (
                /* Booking Success Ticket design */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="max-w-xl mx-auto bg-white border-2 border-dashed border-gold-300 rounded-2xl p-8 shadow-xl text-center space-y-6"
                >
                  <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto border border-green-200 text-green-500">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs uppercase text-green-600 font-bold tracking-widest">Pré-Confirmação Efetuada com Sucesso!</p>
                    <h2 className="font-serif text-2xl text-luxury-slate font-bold">Seu Ticket Suíte VIP Enlace</h2>
                  </div>

                  {/* Digital Pass Details */}
                  <div className="bg-gold-50/50 rounded-xl p-6 border border-gold-100 text-left space-y-4">
                    <div className="flex justify-between items-center border-b border-gold-100 pb-3">
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">ID da Reserva:</span>
                      <span className="font-mono text-xs font-bold text-luxury-slate">{bookingSuccessData.id}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Convidada Principal:</span>
                        <span className="font-bold text-luxury-slate">{bookingSuccessData.name}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Categoria de Atendimento:</span>
                        <span className="font-bold text-luxury-slate">{bookingSuccessData.category}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Data Agendada:</span>
                        <span className="font-bold text-luxury-slate">
                          {new Date(bookingSuccessData.date).toLocaleDateString("pt-BR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Horário:</span>
                        <span className="font-bold text-luxury-slate">{bookingSuccessData.time}h</span>
                      </div>
                    </div>

                    <div className="border-t border-gold-100 pt-3">
                      <span className="text-[9px] text-gray-400 uppercase tracking-wider block">Consultora Oficial Designada:</span>
                      <span className="font-bold text-gold-600 flex items-center gap-1 mt-0.5">
                        <Sparkles className="w-3.5 h-3.5" /> {bookingSuccessData.consultant}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 leading-relaxed max-w-sm mx-auto">
                    Nossa assessoria de agendamento ligará no seu WhatsApp em até 2 horas para confirmar e enviar as orientações de roupas íntimas recomendadas para a prova.
                  </p>

                  <div className="flex justify-center space-x-4 pt-4">
                    <button
                      onClick={resetBooking}
                      className="bg-white border border-gold-200 text-gray-500 hover:text-luxury-slate py-2.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest transition-colors"
                    >
                      Agendar Outro Horário
                    </button>

                    <button
                      onClick={() => setActiveTab("stylist")}
                      className="bg-gold-500 hover:bg-gold-600 text-white py-2.5 px-6 rounded-full text-xs font-bold uppercase tracking-widest shadow-md transition-all flex items-center space-x-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Falar com Helena IA</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* FAQ TAB */}
          {activeTab === "faq" && (
            <motion.div
              key="faq-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 pb-24"
            >
              {/* Header Title */}
              <div className="text-center space-y-3">
                <span className="text-xs uppercase tracking-widest text-gold-500 font-bold">Suporte ao Cliente</span>
                <h1 className="font-serif text-3xl text-luxury-slate">Perguntas Frequentes</h1>
                <p className="text-gray-500 text-sm">Tem dúvidas sobre aluguel, ajustes e acompanhamento? Reunimos as principais dúvidas das nossas noivas.</p>
                <div className="w-16 h-[2px] bg-gold-300 mx-auto mt-4" />
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-4 bg-white border border-gold-100 rounded-2xl p-6 shadow-md">
                {FAQS.map((faq, index) => (
                  <div key={index} className="border-b border-gold-100 last:border-none pb-4 last:pb-0 pt-4 first:pt-0">
                    <button
                      onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                      className="w-full flex justify-between items-center text-left py-2 font-serif text-base font-bold text-luxury-slate hover:text-gold-500 transition-colors cursor-pointer"
                    >
                      <span>{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-gold-400 transition-transform duration-300 ${
                          openFaqIndex === index ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    <AnimatePresence initial={false}>
                      {openFaqIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mt-2 pl-1">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* CTA footer for FAQ */}
              <div className="bg-gold-50/40 border border-gold-100 rounded-2xl p-6 sm:p-8 text-center space-y-4">
                <h3 className="font-serif text-lg font-bold text-luxury-slate">Ainda tem dúvidas ou prefere falar com um humano?</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
                  Nosso time de consultoras reais e especialistas em costura está pronto para te atender diretamente pelo WhatsApp ou por telefone fixo na loja.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <a
                    href="https://wa.me/5514999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-6 rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4 fill-current" />
                    <span>WhatsApp Enlace</span>
                  </a>
                  <button
                    onClick={() => setActiveTab("booking")}
                    className="bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-6 rounded-full text-xs uppercase tracking-widest transition-colors flex items-center justify-center space-x-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Reservar Suíte Privativa</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Exquisite Luxury Footer */}
      <footer className="bg-luxury-slate text-white border-t border-gold-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Col 1: About & Logo */}
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-full border border-gold-300 flex items-center justify-center bg-white/5">
                <Sparkles className="w-4 h-4 text-gold-400" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg tracking-[0.2em] font-bold text-white">ENLACE</span>
                <span className="text-[8px] tracking-[0.4em] uppercase text-gold-400 font-semibold -mt-1">Noivas & Festas</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Desde 1988 traduzindo sentimentos em silhuetas e rendas. Uma jornada de amor, dedicação e legado iniciada por Fernando Ribeiro Damasceno e Geni Damasceno, hoje honrada por Thaísa Sena e seu esposo com modernidade e carinho.
            </p>
            <div className="flex space-x-4">
              {/* Simulated Socials */}
              {["Instagram", "Facebook", "Pinterest"].map((social, i) => (
                <a key={i} href="#" className="text-gray-400 hover:text-gold-400 text-xs tracking-wider transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Fast Links */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-gold-300 uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <button onClick={() => { setActiveTab("home"); window.scrollTo(0,0); }} className="hover:text-gold-400 transition-colors">
                  Início
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("history"); window.scrollTo(0,0); }} className="hover:text-gold-400 transition-colors">
                  Nossa História (Desde 1988)
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("collections"); window.scrollTo(0,0); }} className="hover:text-gold-400 transition-colors">
                  Coleções de Noivas & Festas
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("quiz"); window.scrollTo(0,0); }} className="hover:text-gold-400 transition-colors">
                  Buscador de Estilos de Vestido
                </button>
              </li>
              <li>
                <button onClick={() => { setActiveTab("stylist"); window.scrollTo(0,0); }} className="hover:text-gold-400 transition-colors">
                  Helena Estilista IA (Chatbot 24h)
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Hours & Location */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-gold-300 uppercase tracking-widest">Atendimento</h4>
            <ul className="space-y-3.5 text-xs text-gray-400">
              <li className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-gray-200">Segunda a Sexta:</p>
                  <p className="mt-0.5">09h às 18h (Com agendamento)</p>
                  <p className="font-bold text-gray-200 mt-2">Sábados:</p>
                  <p className="mt-0.5">09h às 13h (Altamente concorrido)</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
                <span>Av. Sete de Setembro, 1234 • Centro • Jaú - SP</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact Call */}
          <div className="space-y-4">
            <h4 className="font-serif text-sm font-bold text-gold-300 uppercase tracking-widest">Fale Conosco</h4>
            <p className="text-xs text-gray-400 leading-relaxed font-sans">
              Quer tirar dúvidas imediatas sobre preços de locação ou disponibilidade de datas para aluguel?
            </p>
            <div className="space-y-2">
              <a
                href="tel:+551436214545"
                className="block text-sm font-bold text-white hover:text-gold-400 transition-colors flex items-center space-x-2"
              >
                <Phone className="w-4 h-4 text-gold-400" />
                <span>(14) 3621-4545</span>
              </a>
              <a
                href="https://wa.me/5514999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-bold text-white hover:text-gold-400 transition-colors flex items-center space-x-2"
              >
                <MessageSquare className="w-4 h-4 text-gold-400" />
                <span>(14) 99999-9999 (WhatsApp)</span>
              </a>
            </div>
            <p className="text-[10px] text-gray-500">CNPJ: 12.345.678/0001-90</p>
          </div>
        </div>

        {/* Copy & Legal lines */}
        <div className="border-t border-gray-800 py-6 text-center text-xs text-gray-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} Enlace Noivas & Festas. Todos os direitos reservados.</p>
            <p className="flex items-center gap-1">
              <span>Modernizado com Alta Tecnologia & IA</span>
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            </p>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.5, type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end space-y-2 group"
      >
        {/* Help tooltip message */}
        <div className="bg-white text-luxury-slate px-4 py-2 rounded-2xl shadow-xl border border-gold-200 text-xs font-sans font-medium hidden md:block max-w-xs transition-all duration-300 transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 pointer-events-none">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Fale com Leon Designer</span>
          </div>
        </div>

        {/* Floating Trigger */}
        <a
          href="https://wa.me/5531971667389?text=Esse%20projeto%20%C3%A9%20sua%20cara%20vamos%20come%C3%A7ar"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Fale conosco no WhatsApp"
          className="relative flex items-center justify-center w-14 h-14 bg-emerald-500 hover:bg-emerald-600 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95"
        >
          {/* Pulsing ring around button */}
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 animate-ping -z-10" />
          
          <svg className="w-7 h-7 text-white fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.703 1.458h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
          </svg>
        </a>
      </motion.div>
    </div>
  );
}
