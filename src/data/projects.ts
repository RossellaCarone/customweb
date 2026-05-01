export interface Project {
  id: string;
  index: string;
  title: string;
  client: string;
  year: string;
  category: string;
  stack: string[];
  url: string;
  screenshot: string;
  video?: string;
  blurb: string;
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
    client: "Casa vacanze · Castellana Grotte",
    year: "2026",
    category: "Hospitality · Brand site",
    stack: ["Astro", "Tailwind", "React"],
    url: "https://ladolcesostahome.com",
    screenshot: "/screens/ladolcesosta.png",
    video: "/screens/ladolcesosta.mp4",
    blurb: "Sito per una casa vacanze in Puglia che valorizza il territorio e accompagna gli ospiti nella scoperta dell’esperienza locale, facilitando la prenotazione del soggiorno",
    objective:
      "Il proprietario aveva bisogno di un sito che trasmettesse il calore autentico della Puglia — niente template anonimo — e che portasse i visitatori a prenotare su Booking.com e Airbnb in modo diretto e naturale.",
    results: [
      "Galleria fotografica e 8 schede interattive sulle attrazioni del territorio",
      "Collegamento diretto a Booking.com e Airbnb con un click",
      "Recensioni reali in evidenza per costruire fiducia immediata",
    ],
    process:
      "Ho scelto colori caldi ispirati alla terra pugliese — beige, sabbia, ocra — e ho curato ogni dettaglio visivo per far sentire il visitatore già lì. Le attrazioni del territorio sono presentate con schede che si aprono al click, per mostrare quanto è centrale la posizione della casa. Il sito funziona perfettamente da smartphone, dove avviene la maggior parte delle ricerche.",
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
    client: "Psicologa · Polignano a Mare",
    year: "2026",
    category: "Personal brand · Professionisti",
    stack: ["Astro", "Tailwind", "React"],
    url: "https://dedonatopsicologa.com",
    screenshot: "/screens/dedonatopsicologa.png",
    video: "/screens/dedonatopsicologa.mp4",
    blurb: "Sito professionale per una psicologa clinica, pensato per trasmettere fiducia e guidare alla prenotazione della prima consulenza gratuita.",
    objective:
      "La dottoressa aveva bisogno di una presenza online che trasmettesse competenza e allo stesso tempo mettesse a proprio agio chi cerca aiuto per la prima volta — abbassando al minimo la fatica del primo contatto.",
    results: [
      "6 servizi presentati con schede dettagliate che si aprono al click",
      "Form di contatto con selezione del tipo di consulenza desiderata",
      "Prima consulenza gratuita sempre visibile per ridurre la barriera d'ingresso",
    ],
    process:
      "Ho scelto una palette di verdi tenui e toni neutri per trasmettere calma e professionalità senza risultare fredda o clinica. Il percorso di lavoro è spiegato in 4 fasi chiare, per ridurre l'incertezza di chi non sa cosa aspettarsi da uno psicologo. Ogni parola e ogni scelta visiva è pensata per parlare alla persona in difficoltà, non all'addetto ai lavori.",
    testimonial: {
      quote:
        "I pazienti mi dicono che il sito li ha messi a loro agio prima ancora di incontrarmi.",
      author: "Monica De Donato, psicologa",
    },
  },
];
