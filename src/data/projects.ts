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
  blurb: string;        // 1-2 lines
}

export const projects: Project[] = [
  {
    id: "ladolcesosta",
    index: "01",
    title: "La Dolce Sosta",
    client: "Dimora · Castellana Grotte",
    year: "2025",
    category: "Hospitality · Brand site",
    stack: ["React", "Tailwind", "CMS", "i18n"],
    url: "https://ladolcesostahome.com",
    screenshot: "/screens/ladolcesosta.png",
    blurb: "Un rifugio esclusivo nel cuore della Puglia, raccontato con eleganza editoriale.",
  },
  {
    id: "dedonato",
    index: "02",
    title: "Monica De Donato",
    client: "Psicologa Clinica · Polignano",
    year: "2025",
    category: "Personal brand · Booking",
    stack: ["React", "Tailwind", "Calendar API"],
    url: "https://dedonatopsicologa.com",
    screenshot: "/screens/dedonatopsicologa.png",
    blurb: "Un percorso visivo verso il benessere — calmo, professionale, accessibile.",
  },
];
