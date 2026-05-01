export interface Project {
  id: string;
  index: string;
  title: string;
  tagline: string;
  client: string;
  year: string;
  category: string;
  stack: string[];
  url: string;
  screenshot: string;
  poster: string;
  video?: string;
  blurb: string;
  accent: string;
  glow: string;
  panel: string;
  orbitDirection: 1 | -1;
  // --- Contenuto esteso galleria ---
  objective: string;          // Cosa voleva il cliente
  results: string[];          // Risultati misurabili (2-3 bullet)
  process: string;            // Scelte tecniche e approccio
  testimonial?: {
    quote: string;
    author: string;
  };
}

export const projects: Project[] = [
  {
    id: "ladolcesosta",
    index: "01",
    title: "La Dolce Sosta",
    tagline: "Un soggiorno che inizia ancora prima della prenotazione.",
    client: "Casa vacanze · Castellana Grotte",
    year: "2026",
    category: "Hospitality · Brand site",
    stack: ["Astro", "Tailwind", "React"],
    url: "https://ladolcesostahome.com",
    screenshot: "/screens/ladolcesosta.png",
    poster: "/screens/ladolcesosta.png",
    video: "/screens/ladolcesosta.mp4",
    blurb:
      "Un brand site caldo e cinematografico per una casa vacanze in Puglia: racconta la casa, mette in scena il territorio e accompagna con naturalezza verso la prenotazione.",
    accent: "rgba(200, 169, 110, 0.92)",
    glow: "rgba(184, 129, 54, 0.34)",
    panel: "rgba(38, 27, 18, 0.56)",
    orbitDirection: 1,
    objective:
      "Il proprietario voleva un sito che facesse percepire subito il calore autentico della Puglia, evitando l'estetica impersonale dei portali e portando l'utente alla prenotazione in modo semplice e spontaneo.",
    results: [
      "8 attrazioni del territorio raccontate con schede interattive",
      "Percorso di prenotazione diretto verso Booking.com e Airbnb",
      "Recensioni reali in evidenza per creare fiducia prima del prezzo",
    ],
    process:
      "Ho costruito una direzione visiva calda e materica, fatta di beige, sabbia e ocra, per trasformare il sito in un invito al soggiorno. La casa e il territorio vengono raccontati come un'esperienza unica: fotografie, attrazioni vicine, recensioni e punti di accesso alla prenotazione lavorano insieme come una narrazione commerciale ma mai aggressiva.",
    testimonial: {
      quote:
        "Casa bellissima e pulitissima, posto strategico, proprietario gentilissimo e disponibile. Consigliata vivamente, tutto perfetto.",
      author: "Francesco, ospite · 10/10 su Booking.com",
    },
  },
  {
    id: "dedonato",
    index: "02",
    title: "Monica De Donato",
    tagline: "Una presenza online che rassicura prima ancora del primo incontro.",
    client: "Psicologa · Polignano a Mare",
    year: "2026",
    category: "Personal brand · Professionisti",
    stack: ["Astro", "Tailwind", "React"],
    url: "https://dedonatopsicologa.com",
    screenshot: "/screens/dedonatopsicologa.png",
    poster: "/screens/dedonatopsicologa.png",
    video: "/screens/dedonatopsicologa.mp4",
    blurb:
      "Un sito professionale per una psicologa clinica, disegnato per comunicare calma, competenza e accessibilita', abbassando la fatica emotiva del primo contatto.",
    accent: "rgba(149, 190, 161, 0.92)",
    glow: "rgba(113, 169, 135, 0.28)",
    panel: "rgba(20, 33, 28, 0.58)",
    orbitDirection: 1,
    objective:
      "La dottoressa aveva bisogno di una presenza digitale capace di trasmettere autorevolezza e cura nello stesso momento, mettendo a proprio agio chi arriva sul sito in una fase personale delicata.",
    results: [
      "6 servizi raccontati con schede chiare e interattive",
      "Form di contatto orientato al tipo di consulenza richiesta",
      "Prima consulenza gratuita sempre presente come invito concreto al primo passo",
    ],
    process:
      "La direzione visiva ruota attorno a verdi tenui, luce diffusa e tipografia morbida, per far percepire il sito come un luogo sicuro e non come un'interfaccia clinica. Ho semplificato il racconto dei servizi, spiegato il percorso terapeutico in 4 fasi e mantenuto il primo contatto sempre vicino, cosi' l'utente capisce subito chi ha davanti e come iniziare.",
    testimonial: {
      quote:
        "I pazienti mi dicono che il sito li ha messi a loro agio prima ancora di incontrarmi.",
      author: "Monica De Donato, psicologa",
    },
  },
];
