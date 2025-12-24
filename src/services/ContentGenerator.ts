import { GoogleGenerativeAI } from '@google/generative-ai';
import { Source } from '../domain/entities/Source';
import { Article, type ArticleProps } from '../domain/entities/Article';
import { ContentFetcher, type FetchedContent } from './ContentFetcher';

export interface GeneratedContent {
  title: string;
  description: string;
  content: string;
  tags: string[];
}

export interface ContentGeneratorConfig {
  apiKey: string;
  model?: string;
}

interface SourceAnalysis {
  topic: string;
  keyPoints: string[];
  uniqueInsights: string[];
  codeExamples: string[];
}

const CONTACT_URL =
  'https://nevercodealone.de/de/landingpages/barrierefreies-webdesign';

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
  `Machen Sie Ihre digitale Präsenz inklusiv. [Buchen Sie ein kostenloses Beratungsgespräch](${CONTACT_URL}) bei Never Code Alone.`,
];

const CORE_TAGS = ['Semantik', 'HTML', 'Barrierefrei'];

export class ContentGenerator {
  private client: GoogleGenerativeAI;
  private model: string;
  private fetcher: ContentFetcher;

  constructor(config: ContentGeneratorConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-2.5-flash';
    this.fetcher = new ContentFetcher();
  }

  async generateFromUrl(sourceUrl: string): Promise<Article> {
    const source = new Source(sourceUrl);
    const fetchedContent = await this.fetcher.fetch(source);

    // Step 1: Analyze source to detect topic and extract insights
    const analysis = await this.analyzeSource(fetchedContent);

    // Step 2: Generate article based on analysis
    const generated = await this.generateContent(analysis);

    const props: ArticleProps = {
      title: generated.title,
      description: generated.description,
      content: generated.content,
      date: new Date(),
      tags: generated.tags,
      source: sourceUrl,
    };

    return new Article(props);
  }

  async generateFromKeywords(keywords: string): Promise<Article> {
    // Research the keywords using AI
    const analysis = await this.researchKeywords(keywords);

    // Generate article based on research
    const generated = await this.generateContent(analysis);

    const props: ArticleProps = {
      title: generated.title,
      description: generated.description,
      content: generated.content,
      date: new Date(),
      tags: generated.tags,
      source: `Recherche: ${keywords}`,
    };

    return new Article(props);
  }

  private async analyzeSource(fetched: FetchedContent): Promise<SourceAnalysis> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Das Hauptthema des Artikels in 2-5 Wörtern',
            },
            keyPoints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Die wichtigsten Kernaussagen (3-5 Punkte)',
            },
            uniqueInsights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Besondere/einzigartige Erkenntnisse oder Tipps aus dem Artikel',
            },
            codeExamples: {
              type: 'array',
              items: { type: 'string' },
              description: 'Wichtige Code-Beispiele oder Patterns aus dem Artikel',
            },
          },
          required: ['topic', 'keyPoints', 'uniqueInsights', 'codeExamples'],
        },
      },
    });

    const prompt = `Analysiere diesen Web-Artikel und extrahiere die wichtigsten Informationen.

Titel: ${fetched.title}
URL: ${fetched.url}

Inhalt:
${fetched.content.slice(0, 12000)}

Identifiziere:
1. Das Hauptthema (fokussiert auf Web-Entwicklung/Barrierefreiheit)
2. Die wichtigsten Kernaussagen
3. Besondere Erkenntnisse oder einzigartige Tipps
4. Relevante Code-Beispiele oder Patterns`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  }

  private async researchKeywords(keywords: string): Promise<SourceAnalysis> {
    const model = this.client.getGenerativeModel({
      model: this.model,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Das Hauptthema basierend auf den Keywords in 2-5 Wörtern',
            },
            keyPoints: {
              type: 'array',
              items: { type: 'string' },
              description: 'Die wichtigsten Fakten und Best Practices zum Thema (5-7 Punkte)',
            },
            uniqueInsights: {
              type: 'array',
              items: { type: 'string' },
              description: 'Weniger bekannte aber wichtige Erkenntnisse oder Experten-Tipps',
            },
            codeExamples: {
              type: 'array',
              items: { type: 'string' },
              description: 'Relevante Code-Patterns oder Beispiele für das Thema',
            },
          },
          required: ['topic', 'keyPoints', 'uniqueInsights', 'codeExamples'],
        },
      },
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

  private async generateContent(
    analysis: SourceAnalysis
  ): Promise<GeneratedContent> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(analysis);

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'SEO-optimierter Titel, max 60 Zeichen',
            },
            description: {
              type: 'string',
              description: 'Meta-Description, max 155 Zeichen',
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              description: 'Relevante Tags für den Artikel',
            },
            content: {
              type: 'string',
              description:
                'Vollständiger Markdown-Inhalt. MUSS mit H1 (# Titel) beginnen, dann H2/H3 Hierarchie. Keine HTML-Tags.',
            },
          },
          required: ['title', 'description', 'tags', 'content'],
        },
      },
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      title: data.title,
      description: data.description,
      content: data.content,
      tags: [...new Set([...CORE_TAGS, ...data.tags])],
    };
  }

  private buildSystemPrompt(): string {
    const ctaIndex = new Date().getMinutes() % CTAS.length;
    const cta = CTAS[ctaIndex];

    return `Du bist ein erfahrener technischer Content-Writer für Web-Entwicklung.
Deine Aufgabe ist es, hochwertige deutsche Fachartikel zu erstellen.

Zielgruppe: Content-Marketing-Professionals und Frontend-Entwickler
Tonalität: Professionell, aber zugänglich. Technisch korrekt, nicht übermäßig akademisch.

WICHTIG - Originalität:
- Schreibe einen KOMPLETT NEUEN Artikel basierend auf den Erkenntnissen
- Kopiere KEINE Sätze oder Formulierungen aus der Quelle
- Der Leser darf NICHT erkennen können, welche Quelle verwendet wurde
- Nutze die Erkenntnisse als Inspiration, formuliere alles neu und eigenständig

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

  private buildUserPrompt(analysis: SourceAnalysis): string {
    return `Erstelle einen deutschen Fachartikel zum Thema: ${analysis.topic}

Nutze folgende Erkenntnisse als Grundlage (NICHT kopieren, sondern neu formulieren):

Kernpunkte:
${analysis.keyPoints.map((p) => `- ${p}`).join('\n')}

Besondere Erkenntnisse:
${analysis.uniqueInsights.map((p) => `- ${p}`).join('\n')}

${analysis.codeExamples.length > 0 ? `Code-Patterns zur Inspiration:\n${analysis.codeExamples.map((c) => `- ${c}`).join('\n')}` : ''}

Schreibe einen vollständig originalen Artikel, der diese Erkenntnisse verarbeitet.`;
  }
}
