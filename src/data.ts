import { Dress, QuizQuestion } from "./types";

import bohoCollection from "./assets/images/boho_collection_1784589447666.jpg";
import classicCollection from "./assets/images/classic_collection_1784589459008.jpg";
import groomCollection from "./assets/images/groom_collection_1784589479329.jpg";
import partyCollection from "./assets/images/party_collection_1784589470410.jpg";
import bridalHero from "./assets/images/bridal_hero_1784589436152.jpg";

export const IMAGES = {
  hero: bridalHero,
  boho: bohoCollection,
  classic: classicCollection,
  groom: groomCollection,
  party: partyCollection,
};

export const DRESSES: Dress[] = [
  {
    id: "noiva-1",
    name: "Aura do Enlace",
    category: "noivas",
    style: "classico",
    price: "Aluguel sob consulta",
    description: "Um clássico majestoso vestido estilo princesa com renda francesa floral bordada à mão no corpo e saia volumosa em tule de seda. Apresenta decote coração e um brilho sutil celestial sob a luz.",
    imageUrl: classicCollection,
    features: ["Saia Princesa Volumosa", "Renda Francesa Floral", "Aplicações de Pérolas", "Decote Coração"],
  },
  {
    id: "noiva-2",
    name: "Boho Romance",
    category: "noivas",
    style: "boho",
    price: "Aluguel sob consulta",
    description: "Para casamentos ao ar livre ou na praia. Vestido com modelagem fluida de crepe de seda leve e renda renascença vazada na cintura, alças finas e decote nas costas de tirar o fôlego.",
    imageUrl: bohoCollection,
    features: ["Silhueta Fluida Evasê", "Renda Renascença de Algodão", "Costas Descobertas", "Fluidez incomparável"],
  },
  {
    id: "noiva-3",
    name: "Sereia Imperial",
    category: "noivas",
    style: "moderno",
    price: "Aluguel sob consulta",
    description: "A epítome da sofisticação urbana. Vestido com silhueta sereia esculpida em cetim zibelina premium estruturado, drapeado geométrico no decote ombro a ombro e cauda removível de alta costura.",
    imageUrl: classicCollection, // Fallback to classic if needed, but styled elegantly
    features: ["Silhueta Sereia Estruturada", "Cetim Zibelina Premium", "Ombro a Ombro Drapeado", "Cauda Removível"],
  },
  {
    id: "festa-1",
    name: "Sinfonia Rose",
    category: "festas",
    style: "minimalista",
    price: "Aluguel sob consulta",
    description: "Vestido ideal para madrinhas ou mães dos noivos. Chiffon drapeado fluido no tom rosé quartzo com fenda lateral elegante e corpete plissado de forma artística que valoriza a silhueta.",
    imageUrl: partyCollection,
    features: ["Cor Rosé Quartz", "Chiffon de Seda Drapeado", "Fenda Elegante", "Amarração Versátil"],
  },
  {
    id: "festa-2",
    name: "Esmeralda Imperial",
    category: "festas",
    style: "luxo",
    price: "Aluguel sob consulta",
    description: "Um modelo dramático e luxuoso em crepe acetinado verde esmeralda. Mangas longas bufantes transparentes com punhos bordados em vidrilho e decote em V trespassado nas costas.",
    imageUrl: partyCollection,
    features: ["Crepe Acetinado de Seda", "Mangas Bufantes Transparentes", "Decote em V Costas", "Bordado de Pedraria"],
  },
  {
    id: "debutante-1",
    name: "Cinderela Glitz",
    category: "debutantes",
    style: "luxo",
    price: "Aluguel sob consulta",
    description: "O vestido de 15 anos perfeito. Corpete estruturado cravejado de cristais Swarovski que brilham intensamente, sobreposto a uma imponente saia de tule azul pó com aplicações brilhantes de estrelas e brilhos.",
    imageUrl: classicCollection, // Uses the princess look
    features: ["Azul Pó / Cinderela", "Cristais Swarovski Genuínos", "Saia Super Volumosa", "Corselete Ajustável"],
  },
  {
    id: "traje-1",
    name: "Tuxedo Classic Noir",
    category: "trajes",
    style: "classico",
    price: "Aluguel sob consulta",
    description: "Traje completo de gala masculina. Smoking em lã fria italiana super 120, lapelas de cetim de seda puro, calça de alfaiataria perfeita com faixa lateral fina e colete ajustado.",
    imageUrl: groomCollection,
    features: ["Lã Fria Italiana Super 120", "Lapelas Lapel Peak de Cetim", "Modelagem Slim Fit", "Colete Incluso"],
  },
  {
    id: "traje-2",
    name: "Navy Elegance",
    category: "trajes",
    style: "moderno",
    price: "Aluguel sob consulta",
    description: "Costume de três peças em tom azul marinho profundo (navy) perfeito para casamentos de dia ou ao entardecer. Alfaiataria desestruturada moderna com abotoamento duplo no colete.",
    imageUrl: groomCollection,
    features: ["Azul Navy Profundo", "Colete Abotoamento Duplo", "Tecido Respirável Tech", "Corte Italiano Moderno"],
  }
];

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: "Onde será a sua cerimônia de casamento dos sonhos?",
    options: [
      { text: "Catedral ou Igreja Tradicional", value: "classico", description: "Um altar majestoso, tapete vermelho longo e atmosfera imponente." },
      { text: "Praia com os pés na areia", value: "boho", description: "Brisa do mar, barulho das ondas, pôr do sol e informalidade sofisticada." },
      { text: "Campo, Fazenda ou Jardim ao ar livre", value: "boho", description: "Natureza, flores silvestres, luzes suspensas e clima rústico chic." },
      { text: "Salão Moderno, Galpão Industrial ou Rooftop", value: "moderno", description: "Decoração contemporânea, linhas retas, clima urbano e fashion." }
    ]
  },
  {
    id: 2,
    text: "Qual destas palavras melhor define o seu estilo pessoal?",
    options: [
      { text: "Romântica & Tradicional", value: "classico", description: "Aprecio vestidos volumosos, caudas longas, véus e rituais clássicos." },
      { text: "Livre, Leve & Conectada à Natureza", value: "boho", description: "Prefiro tecidos que se movem com o vento, rendas artesanais e conforto." },
      { text: "Moderna, Marcante & Ousada", value: "moderno", description: "Gosto de fendas, decotes profundos, silhuetas ajustadas e design inovador." },
      { text: "Minimalista & Elegante", value: "minimalista", description: "O menos é mais. Prefiro tecidos lisos estruturados, cortes perfeitos e sem excessos." }
    ]
  },
  {
    id: 3,
    text: "Qual tipo de silhueta mais acelera o seu coração?",
    options: [
      { text: "Princesa (Saia bem armada e cintura marcada)", value: "classico", description: "O visual clássico de contos de fadas com volume e presença marcante." },
      { text: "Evasê / Linha A (Abre suavemente a partir do quadril)", value: "boho", description: "Elegante e democrático, une leveza e delicadeza para qualquer corpo." },
      { text: "Sereia (Ajustado ao corpo até os joelhos)", value: "moderno", description: "Sensual, desenha as curvas e transmite poder e autoconfiança no altar." },
      { text: "Fluido / Reto (Cai reto com tecidos leves)", value: "minimalista", description: "Extrema leveza, sem volume artificial, permitindo movimentar-se livremente." }
    ]
  },
  {
    id: 4,
    text: "Qual o detalhe do vestido que você considera indispensável?",
    options: [
      { text: "Renda floral delicada bordada à mão", value: "classico", description: "A atemporalidade da renda que confere sofisticação eterna ao modelo." },
      { text: "Transparências, tules leves e costas abertas", value: "boho", description: "A leveza de ver a pele de forma artística, unindo romantismo e frescor." },
      { text: "Brilho sutil ou cristais imponentes", value: "luxo", description: "Luz própria! Brilho que capta os flashes e destaca cada movimento." },
      { text: "Tecido liso, fosco e caimento impecável", value: "minimalista", description: "A beleza do tecido puro (zibelina, crepe de seda) brilhando por si só." }
    ]
  }
];

export const TESTIMONIALS = [
  {
    id: "dep-1",
    bride: "Mariana & Carlos",
    text: "Encontrar meu vestido na Enlace Noivas foi mágico! Desde o primeiro momento, a Helena me entendeu perfeitamente. O modelo Aurora parecia ter sido desenhado no meu corpo. O aluguel foi super descomplicado e as costureiras fizeram ajustes milimétricos incríveis. Me senti a noiva mais linda do mundo!",
    date: "Casamento em Outubro de 2025",
    rating: 5,
    tag: "Noiva Clássica",
  },
  {
    id: "dep-2",
    bride: "Beatriz & Henrique",
    text: "Queríamos algo leve para nossa cerimônia na praia e o terno do Henrique e meu vestido boho foram alugados lá. Todo mundo elogiou a fluidez do tecido e o corte do terno dele. A equipe é de um carinho espetacular, indico de olhos fechados!",
    date: "Casamento em Março de 2026",
    rating: 5,
    tag: "Noivos Boho Beach",
  },
  {
    id: "dep-3",
    bride: "Juliana & Roberto",
    text: "O atendimento de debutante da minha filha foi impecável! Ela alugou o Cinderela Glitz e brilhou a noite toda. A qualidade dos tecidos e dos cristais se destaca de qualquer outra loja que visitamos na região. Muito obrigado por tornarem esse sonho realidade!",
    date: "Festa de 15 Anos em Junho de 2026",
    rating: 5,
    tag: "Mãe de Debutante",
  }
];

export const FAQS = [
  {
    question: "Como funciona o processo de aluguel na Enlace Noivas?",
    answer: "Nosso processo é desenhado para sua tranquilidade: 1) Você agenda uma Prova dos Sonhos; 2) Sua consultora te auxilia a provar modelos e encontrar o ideal; 3) Fazemos a reserva da data; 4) Semanas antes, agendamos as provas de ajuste com nossas costureiras de alta-costura; 5) Você retira o vestido lavado e passado em cabide especial na véspera; 6) Devolve após o evento, nós cuidamos da lavagem especializada."
  },
  {
    question: "Com quanta antecedência devo procurar o vestido?",
    answer: "Para noivas, recomendamos iniciar a busca de 6 a 10 meses antes do casamento. Isso garante maior disponibilidade do nosso acervo na sua data e tempo de sobra para os ajustes manuais. Para festas e debutantes, 3 a 5 meses de antecedência é o ideal."
  },
  {
    question: "Os vestidos vêm com acessórios inclusos?",
    answer: "Oferecemos pacotes de aluguel completos! Você pode alugar somente o vestido ou incluir o véu/mantilha, tiara, coroas e terço. Temos uma linha exclusiva de sapatos de noiva ultraconfortáveis para aluguel ou compra também."
  },
  {
    question: "Vocês fazem ajustes no vestido alugado?",
    answer: "Sim! Todos os nossos aluguéis de noiva incluem ajustes sob medida (bainha, busto, cintura, fixação de cauda) executados por nosso time de costureiras de alta-costura. O vestido é entregue sob medida e passará por prova final de validação dias antes do casamento."
  }
];
