export interface Project {
  id: string;
  index: string;        // "01", "02"
  title: string;
  client: string;
  year: string;
  category: string;
  stack: string[];
  url: string;
  screenshot: string;   // public path
  video?: string;       // public path to mp4 (scroll-loop reel)
  videoWebm?: string;   // public path to webm (preferred when supported)
  blurb: string;        // 1-2 lines
  highlights: string[]; // bullets used in orbital gallery left column
}

export const projects: Project[] = [
  {
    id: "ladolcesosta",
    index: "01",
    title: "La Dolce Sosta",
    client: "Dimora · Castellana Grotte",
    year: "2026",
    category: "Hospitality · Brand site",
    stack: ["React", "Tailwind", "Astro"],
    url: "https://ladolcesostahome.com",
    screenshot: "/screens/ladolcesosta.png",
    video: "/videos/ladolcesosta.hq.mp4",
    videoWebm: "/videos/ladolcesosta.webm",
    blurb:
       "Uno spazio digitale caldo e cinematografico per una casa vacanze in Puglia: racconta la casa, valorizza il territorio e accompagna verso la prenotazione.",
    highlights: [
      "Percorso di prenotazione diretto verso Booking.com e Airbnb",
      "Attrazioni del territorio raccontate con schede interattive e mappe illustrate",
      "Recensioni reali in evidenza per creare fiducia prima del prezzo",
    ],
  },
  {
    id: "dedonato",
    index: "02",
    title: "Studio di Psicologia",
    client: "Psicologa Clinica · Polignano a Mare",
    year: "2026",
    category: "Personal brand · Professionale",
    stack: ["React", "Tailwind", "Astro"],
    url: "https://dedonatopsicologa.com",
    screenshot: "/screens/dedonatopsicologa.png",
    video: "/videos/dedonatopsicologa.hq.mp4",
    videoWebm: "/videos/dedonatopsicologa.webm",
    blurb:
      "Un sito professionale per una psicologa clinica, disegnato per comunicare calma, competenza e accessibilità, abbassando la fatica emotiva del primo contatto.",
    highlights: [
      "Tono visivo calmo: palette terrosa, tipografia umanista, ritmo lento",
      "Form di contatto orientato al tipo di consulenza richiesta",
      "Servizi raccontati con schede chiare e interattive",
    ],
  },
];
