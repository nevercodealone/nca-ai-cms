import { GoogleGenerativeAI } from '@google/generative-ai';
import { A as Article } from '../../chunks/Article_dOm2z5B6.mjs';
import TurndownService from 'turndown';
export { renderers } from '../../renderers.mjs';

class Source {
  url;
  domain;
  constructor(url) {
    if (!Source.isValidUrl(url)) {
      throw new Error(`Invalid URL: ${url}`);
    }
    if (!url.startsWith("https://")) {
      throw new Error("Only HTTPS URLs are allowed");
    }
    this.url = url;
    this.domain = Source.extractDomain(url);
  }
  static isValidUrl(url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
  static extractDomain(url) {
    const parsed = new URL(url);
    return parsed.hostname;
  }
  isMDN() {
    return this.domain === "developer.mozilla.org";
  }
  isW3C() {
    return this.domain.includes("w3.org");
  }
  toString() {
    return this.url;
  }
}

class ContentFetcher {
  turndown;
  constructor() {
    this.turndown = new TurndownService({
      headingStyle: "atx",
      codeBlockStyle: "fenced",
      bulletListMarker: "-"
    });
    this.turndown.remove(["script", "style", "nav", "footer", "aside", "noscript"]);
  }
  async fetch(source) {
    const response = await fetch(source.url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "de-DE,de;q=0.9,en;q=0.8"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch ${source.url}: ${response.status}`);
    }
    const html = await response.text();
    const title = this.extractTitle(html);
    const content = this.htmlToMarkdown(html);
    return {
      title,
      content,
      url: source.url
    };
  }
  extractTitle(html) {
    const ogMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]+)"/i);
    if (ogMatch?.[1]) return ogMatch[1].trim();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch?.[1]?.trim() ?? "Untitled";
  }
  htmlToMarkdown(html) {
    let content = html;
    const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || content.match(/<article[^>]*>([\s\S]*?)<\/article>/i) || content.match(/<div[^>]*class="[^"]*(?:content|article|post|entry)[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (mainMatch?.[1]) {
      content = mainMatch[1];
    }
    const markdown = this.turndown.turndown(content);
    return markdown.replace(/\n{3,}/g, "\n\n").trim();
  }
}

const CONTACT_URL = "https://nevercodealone.de/de/landingpages/barrierefreies-webdesign";
const CTAS = [
  `Sie möchten Ihre Website barrierefrei gestalten? [Vereinbaren Sie jetzt ein kostenloses Erstgespräch](${CONTACT_URL}) mit unseren Accessibility-Experten.`,
  `Brauchen Sie Unterstützung bei WCAG-Konformität? [Kontaktieren Sie Never Code Alone](${CONTACT_URL}) für eine professionelle Beratung.`,
  `Maximieren Sie Ihre Reichweite durch barrierefreies Webdesign. [Jetzt unverbindlich anfragen](${CONTACT_URL}) und mehr erfahren.`,
  `Inklusion beginnt digital. [Lassen Sie sich von unseren Experten beraten](${CONTACT_URL}) – kostenlos und unverbindlich.`,
  `Performance, SEO und Barrierefreiheit in einem? [Sprechen Sie mit Never Code Alone](${CONTACT_URL}) über Ihre Möglichkeiten.`,
  `Accessibility-Audit gefällig? [Fordern Sie jetzt Ihre kostenlose Erstberatung an](${CONTACT_URL}) und machen Sie Ihre Website zugänglich.`,
  `Barrierefreies Webdesign ist kein Luxus, sondern Notwendigkeit. [Starten Sie jetzt mit Never Code Alone](${CONTACT_URL}).`,
  `Sie wollen alle Nutzer erreichen? [Erfahren Sie mehr über barrierefreies Webdesign](${CONTACT_URL}) in einem persönlichen Gespräch.`,
  `WCAG, BITV, Screenreader-Kompatibilität – wir helfen Ihnen. [Jetzt Kontakt aufnehmen](${CONTACT_URL}) für Ihr Accessibility-Projekt.`,
  `Machen Sie Ihre digitale Präsenz inklusiv. [Buchen Sie ein kostenloses Beratungsgespräch](${CONTACT_URL}) bei Never Code Alone.`
];
const CORE_TAGS = ["Semantik", "HTML", "Barrierefrei"];
class ContentGenerator {
  client;
  model;
  fetcher;
  constructor(config) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || "gemini-2.5-flash";
    this.fetcher = new ContentFetcher();
  }
  async generateFromUrl(sourceUrl) {
    const source = new Source(sourceUrl);
    const fetchedContent = await this.fetcher.fetch(source);
    const analysis = await this.analyzeSource(fetchedContent);
    const generated = await this.generateContent(analysis);
    const props = {
      title: generated.title,
      description: generated.description,
      content: generated.content,
      date: /* @__PURE__ */ new Date(),
      tags: generated.tags
    };
    return new Article(props);
  }
  async generateFromKeywords(keywords) {
    const analysis = await this.researchKeywords(keywords);
    const generated = await this.generateContent(analysis);
    const props = {
      title: generated.title,
      description: generated.description,
      content: generated.content,
      date: /* @__PURE__ */ new Date(),
      tags: generated.tags
    };
    return new Article(props);
  }
  async analyzeSource(fetched) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Das Hauptthema des Artikels in 2-5 Wörtern"
            },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              description: "Die wichtigsten Kernaussagen (3-5 Punkte)"
            },
            uniqueInsights: {
              type: "array",
              items: { type: "string" },
              description: "Besondere/einzigartige Erkenntnisse oder Tipps aus dem Artikel"
            },
            codeExamples: {
              type: "array",
              items: { type: "string" },
              description: "Wichtige Code-Beispiele oder Patterns aus dem Artikel"
            }
          },
          required: ["topic", "keyPoints", "uniqueInsights", "codeExamples"]
        }
      }
    });
    const prompt = `Analysiere diesen Web-Artikel und extrahiere die wichtigsten Informationen.

Titel: ${fetched.title}
URL: ${fetched.url}

Inhalt:
${fetched.content.slice(0, 12e3)}

Identifiziere:
1. Das Hauptthema (fokussiert auf Web-Entwicklung/Barrierefreiheit)
2. Die wichtigsten Kernaussagen
3. Besondere Erkenntnisse oder einzigartige Tipps
4. Relevante Code-Beispiele oder Patterns`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  }
  async researchKeywords(keywords) {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            topic: {
              type: "string",
              description: "Das Hauptthema basierend auf den Keywords in 2-5 Wörtern"
            },
            keyPoints: {
              type: "array",
              items: { type: "string" },
              description: "Die wichtigsten Fakten und Best Practices zum Thema (5-7 Punkte)"
            },
            uniqueInsights: {
              type: "array",
              items: { type: "string" },
              description: "Weniger bekannte aber wichtige Erkenntnisse oder Experten-Tipps"
            },
            codeExamples: {
              type: "array",
              items: { type: "string" },
              description: "Relevante Code-Patterns oder Beispiele für das Thema"
            }
          },
          required: ["topic", "keyPoints", "uniqueInsights", "codeExamples"]
        }
      }
    });
    const prompt = `Du bist ein Experte für Web-Accessibility und barrierefreie Webentwicklung.

Recherchiere zum Thema: "${keywords}"

Nutze dein Fachwissen um:
1. Das Hauptthema klar zu definieren (Bezug zu Barrierefreiheit/Web-Accessibility)
2. Die wichtigsten Fakten, Best Practices und WCAG-Richtlinien zusammenzufassen
3. Weniger bekannte aber wichtige Tipps und Erkenntnisse zu identifizieren
4. Praktische Code-Beispiele oder Patterns vorzuschlagen

Fokussiere auf aktuelle Standards und praktische Anwendbarkeit.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  }
  async generateContent(analysis) {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(analysis);
    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "SEO-optimierter Titel, max 60 Zeichen"
            },
            description: {
              type: "string",
              description: "Meta-Description, max 155 Zeichen"
            },
            tags: {
              type: "array",
              items: { type: "string" },
              description: "Relevante Tags für den Artikel"
            },
            content: {
              type: "string",
              description: "Vollständiger Markdown-Inhalt. MUSS mit H1 (# Titel) beginnen, dann H2/H3 Hierarchie. Keine HTML-Tags."
            }
          },
          required: ["title", "description", "tags", "content"]
        }
      }
    });
    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const data = JSON.parse(text);
    return {
      title: data.title,
      description: data.description,
      content: data.content,
      tags: [.../* @__PURE__ */ new Set([...CORE_TAGS, ...data.tags])]
    };
  }
  buildSystemPrompt() {
    const ctaIndex = (/* @__PURE__ */ new Date()).getMinutes() % CTAS.length;
    const cta = CTAS[ctaIndex];
    return `Du bist ein erfahrener technischer Content-Writer für Web-Entwicklung.
Deine Aufgabe ist es, hochwertige deutsche Fachartikel zu erstellen.

Zielgruppe: Content-Marketing-Professionals und Frontend-Entwickler
Tonalität: Professionell, aber zugänglich. Technisch korrekt, nicht übermäßig akademisch.

KRITISCH - 100% Originalität:
- Schreibe einen KOMPLETT EIGENSTÄNDIGEN Artikel
- KEINE Sätze, Formulierungen oder Strukturen aus externen Quellen übernehmen
- KEINE Hinweise auf Quellen, Referenzen oder Inspiration im Text
- Nutze ausschließlich DEIN Expertenwissen zur Barrierefreiheit
- Jeder Satz muss NEU formuliert sein - wie von einem Experten geschrieben
- Der Artikel muss wirken als käme er aus eigener Fachkenntnis

Regeln:
- Schreibe auf Deutsch
- Mindestens 800 Wörter
- Verwende praktische Codebeispiele (eigene Beispiele, nicht kopiert)
- WICHTIG: Content MUSS mit einer H1-Überschrift (# Titel) beginnen
- Danach H2 (##) und H3 (###) Hierarchie ohne Sprünge
- WICHTIG: Nur Markdown, KEINE HTML-Tags wie <p>, <div>, <span> etc.
- WICHTIG: Integriere die Keywords "Semantik", "HTML" und "Barrierefrei" natürlich in den Text
- WICHTIG: Beende den Artikel mit genau diesem Call-to-Action:

${cta}

Titel-Regeln:
- Das Hauptthema/Keyword MUSS im Titel vorkommen
- Nutze Zahlen wenn möglich (z.B. "5 Tipps", "3 Fehler")
- Zeige den Nutzen/Benefit (z.B. "So vermeidest du...", "Warum X wichtig ist")
- Wecke Neugier oder löse ein Problem`;
  }
  buildUserPrompt(analysis) {
    return `Schreibe als Accessibility-Experte einen deutschen Fachartikel zum Thema: ${analysis.topic}

Behandle diese Aspekte aus deinem Fachwissen:
${analysis.keyPoints.map((p) => `- ${p}`).join("\n")}
${analysis.uniqueInsights.map((p) => `- ${p}`).join("\n")}

${analysis.codeExamples.length > 0 ? `Zeige praktische Code-Beispiele für:
${analysis.codeExamples.map((c) => `- ${c}`).join("\n")}` : ""}

Wichtig: Schreibe komplett eigenständig aus deiner Expertise heraus.`;
  }
}

const POST = async ({ request }) => {
  try {
    const { url, keywords } = await request.json();
    if (!url && !keywords) {
      return new Response(JSON.stringify({ error: "URL or keywords required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "GOOGLE_GEMINI_API_KEY not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" }
        }
      );
    }
    const generator = new ContentGenerator({ apiKey });
    const article = url ? await generator.generateFromUrl(url) : await generator.generateFromKeywords(keywords);
    return new Response(
      JSON.stringify({
        title: article.title,
        description: article.description,
        content: article.content,
        filepath: article.filepath,
        tags: article.tags,
        date: article.date.toISOString()
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Generation error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Generation failed"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
