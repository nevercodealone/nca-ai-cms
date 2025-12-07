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

  async generate(sourceUrl: string, topic?: string): Promise<Article> {
    const source = new Source(sourceUrl);
    const fetchedContent = await this.fetcher.fetch(source);
    const generated = await this.generateContent(fetchedContent, topic);

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

  private async generateContent(
    fetched: FetchedContent,
    topic?: string
  ): Promise<GeneratedContent> {
    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(fetched, topic);

    const model = this.client.getGenerativeModel({
      model: this.model,
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(userPrompt);
    const text = result.response.text();
    return this.parseResponse(text);
  }

  private buildSystemPrompt(): string {
    const ctaIndex = new Date().getMinutes() % CTAS.length;
    const cta = CTAS[ctaIndex];

    return `Du bist ein erfahrener technischer Content-Writer für Web-Entwicklung.
Deine Aufgabe ist es, hochwertige deutsche Fachartikel zu erstellen.

Zielgruppe: Content-Marketing-Professionals und Frontend-Entwickler
Tonalität: Professionell, aber zugänglich. Technisch korrekt, nicht übermäßig akademisch.

Regeln:
- Schreibe auf Deutsch
- Mindestens 800 Wörter
- Verwende praktische Codebeispiele
- Strukturiere mit H2 und H3 Überschriften (## und ###)
- Keine Plagiate - reformuliere die Quelle, kopiere nicht
- WICHTIG: Nur Markdown, KEINE HTML-Tags wie <p>, <div>, <span> etc.
- WICHTIG: Integriere die Keywords "Semantik", "HTML" und "Barrierefrei" natürlich in den Text
- WICHTIG: Beende den Artikel mit genau diesem Call-to-Action:

${cta}

Antworte IMMER in diesem EXAKTEN Format mit den Markern:

---TITLE---
SEO-optimierter Titel (max 60 Zeichen)
WICHTIG für den Titel:
- Das Hauptthema/Keyword MUSS im Titel vorkommen
- Nutze Zahlen wenn möglich (z.B. "5 Tipps", "3 Fehler")
- Zeige den Nutzen/Benefit (z.B. "So vermeidest du...", "Warum X wichtig ist")
- Wecke Neugier oder löse ein Problem
- SCHLECHT: "Barrierefreies HTML: Das Fundament für Inklusion" (zu generisch)
- GUT: "CAPTCHA barrierefrei gestalten: 5 Alternativen die funktionieren"
- GUT: "Warum barrierefreie Formulare mehr Conversions bringen"
---DESCRIPTION---
Meta-Description (max 155 Zeichen)
---TAGS---
tag1, tag2, tag3
---CONTENT---
Der vollständige Markdown-Inhalt hier...`;
  }

  private buildUserPrompt(fetched: FetchedContent, topic?: string): string {
    let prompt = `Erstelle einen deutschen Fachartikel basierend auf folgender Quelle:

Quelle: ${fetched.url}
Original-Titel: ${fetched.title}

Inhalt der Quelle:
${fetched.content.slice(0, 8000)}`;

    if (topic) {
      prompt += `\n\nFokussiere den Artikel auf das Thema: ${topic}`;
    }

    return prompt;
  }

  private parseResponse(text: string): GeneratedContent {
    try {
      const extractSection = (marker: string, nextMarker?: string): string => {
        const startPattern = new RegExp(`---${marker}---\\s*`);
        const startMatch = text.match(startPattern);
        if (!startMatch) return '';

        const startIndex = startMatch.index! + startMatch[0].length;
        let endIndex = text.length;

        if (nextMarker) {
          const endPattern = new RegExp(`---${nextMarker}---`);
          const endMatch = text.slice(startIndex).match(endPattern);
          if (endMatch) {
            endIndex = startIndex + endMatch.index!;
          }
        }

        return text.slice(startIndex, endIndex).trim();
      };

      const title = extractSection('TITLE', 'DESCRIPTION') || 'Untitled';
      const description = extractSection('DESCRIPTION', 'TAGS') || '';
      const tagsRaw = extractSection('TAGS', 'CONTENT') || '';
      const content = extractSection('CONTENT') || '';

      const generatedTags = tagsRaw
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Always include core tags, avoid duplicates
      const tags = [...new Set([...CORE_TAGS, ...generatedTags])];

      return { title, description, content, tags };
    } catch (error) {
      throw new Error(`Failed to parse AI response: ${error}`);
    }
  }
}
