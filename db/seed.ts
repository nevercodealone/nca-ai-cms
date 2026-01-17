import { db, SiteSettings, Prompts } from 'astro:db';

export default async function seed() {
  // ============================================
  // SITE SETTINGS
  // ============================================

  // Hero Section
  await db.insert(SiteSettings).values([
    {
      key: 'hero_kicker',
      value: 'Web Accessibility Expertise',
      updatedAt: new Date(),
    },
    {
      key: 'hero_title',
      value: 'NCA Content',
      updatedAt: new Date(),
    },
    {
      key: 'hero_title_accent',
      value: 'Marketing',
      updatedAt: new Date(),
    },
    {
      key: 'hero_description',
      value:
        'Fachartikel für barrierefreie Webentwicklung und digitale Inklusion',
      updatedAt: new Date(),
    },
  ]);

  // CTA Configuration
  await db.insert(SiteSettings).values([
    {
      key: 'cta_url',
      value:
        'https://nevercodealone.de/de/landingpages/barrierefreies-webdesign',
      updatedAt: new Date(),
    },
    {
      key: 'cta_style',
      value:
        'Professionell, einladend, mit klarem Nutzenversprechen. Deutsche Sprache. Fokus auf kostenlose Erstberatung und Accessibility-Expertise.',
      updatedAt: new Date(),
    },
  ]);

  // Impressum Content (single markdown text)
  await db.insert(SiteSettings).values({
    key: 'imprint_content',
    value: `## Proof of Concept Projekt

Bei NCA Content handelt es sich um ein **Proof of Concept (POC)** Projekt zur Demonstration von KI-gestütztem Content Marketing. Diese Anwendung dient ausschließlich zu Demonstrations- und Entwicklungszwecken.

## Betreiber

Dieses Projekt wird entwickelt und betrieben von **Never Code Alone**, einer Initiative für barrierefreie Webentwicklung und Open-Source-Software.

Das vollständige Impressum mit allen rechtlich erforderlichen Angaben finden Sie unter:
[nevercodealone.de/de/impressum](https://nevercodealone.de/de/impressum)

## Kontakt

Bei Fragen zu diesem Projekt oder Interesse an einer Zusammenarbeit kontaktieren Sie uns bitte über die Kontaktmöglichkeiten auf der Never Code Alone Website.

[Kontakt aufnehmen](https://nevercodealone.de/de/landingpages/barrierefreies-webdesign)

## Haftungsausschluss

Die durch KI generierten Inhalte auf dieser Plattform dienen zu Demonstrationszwecken. Für die Richtigkeit, Vollständigkeit und Aktualität der automatisch erstellten Texte und Bilder wird keine Gewähr übernommen.`,
    updatedAt: new Date(),
  });

  // Core Tags
  await db.insert(SiteSettings).values({
    key: 'core_tags',
    value: JSON.stringify(['Semantik', 'HTML', 'Barrierefrei']),
    updatedAt: new Date(),
  });

  // ============================================
  // AI PROMPTS
  // ============================================

  // System Prompt for Article Generation
  await db.insert(Prompts).values({
    id: 'system_prompt',
    name: 'Article System Prompt',
    category: 'content',
    promptText: `Du bist ein erfahrener technischer Content-Writer für Web-Entwicklung.
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

Titel-Regeln:
- Das Hauptthema/Keyword MUSS im Titel vorkommen
- Nutze Zahlen wenn möglich (z.B. "5 Tipps", "3 Fehler")
- Zeige den Nutzen/Benefit (z.B. "So vermeidest du...", "Warum X wichtig ist")
- Wecke Neugier oder löse ein Problem`,
    updatedAt: new Date(),
  });

  // CTA Generation Prompt
  await db.insert(Prompts).values({
    id: 'cta_prompt',
    name: 'CTA Generation Prompt',
    category: 'content',
    promptText: `Generiere einen einzigartigen Call-to-Action am Ende des Artikels:
- Thematisch passend zum Artikelinhalt
- Erwähne den konkreten Nutzen einer Beratung zum Thema
- Verwende einen Markdown-Link mit dem bereitgestellten URL
- Stil: Einladend, nicht aufdringlich, professionell
- Max 2 Sätze
- Variiere die Formulierung - keine Standardphrasen`,
    updatedAt: new Date(),
  });

  // Source Analysis Prompt
  await db.insert(Prompts).values({
    id: 'source_analysis',
    name: 'Source Analysis Prompt',
    category: 'analysis',
    promptText: `Analysiere diesen Web-Artikel und extrahiere die wichtigsten Informationen.

Identifiziere:
1. Das Hauptthema (fokussiert auf Web-Entwicklung/Barrierefreiheit)
2. Die wichtigsten Kernaussagen
3. Besondere Erkenntnisse oder einzigartige Tipps
4. Relevante Code-Beispiele oder Patterns`,
    updatedAt: new Date(),
  });

  // Keyword Research Prompt
  await db.insert(Prompts).values({
    id: 'keyword_research',
    name: 'Keyword Research Prompt',
    category: 'analysis',
    promptText: `Du bist ein Experte für Web-Accessibility und barrierefreie Webentwicklung.

Nutze dein Fachwissen um:
1. Das Hauptthema klar zu definieren (Bezug zu Barrierefreiheit/Web-Accessibility)
2. Die wichtigsten Fakten, Best Practices und WCAG-Richtlinien zusammenzufassen
3. Weniger bekannte aber wichtige Tipps und Erkenntnisse zu identifizieren
4. Praktische Code-Beispiele oder Patterns vorzuschlagen

Fokussiere auf aktuelle Standards und praktische Anwendbarkeit.`,
    updatedAt: new Date(),
  });

  // User Prompt Template
  await db.insert(Prompts).values({
    id: 'user_prompt_template',
    name: 'User Prompt Template',
    category: 'content',
    promptText: `Schreibe als Accessibility-Experte einen deutschen Fachartikel zum Thema: {topic}

Behandle diese Aspekte aus deinem Fachwissen:
{keyPoints}
{uniqueInsights}

{codeExamplesSection}

Wichtig: Schreibe komplett eigenständig aus deiner Expertise heraus.`,
    updatedAt: new Date(),
  });

  // Image Generation Prompt
  await db.insert(Prompts).values({
    id: 'image_prompt',
    name: 'Image Generation Prompt',
    category: 'image',
    promptText: `Blog header image about "{title}" for a web accessibility article. Minimal Precisionism style inspired by Charles Sheeler: clean geometric shapes, sharp focus, smooth surfaces, no people, no text.`,
    updatedAt: new Date(),
  });

  // Image Filename Prompt
  await db.insert(Prompts).values({
    id: 'filename_prompt',
    name: 'Filename Generation Prompt',
    category: 'image',
    promptText: `Generate a single SEO-optimized filename for an image about web accessibility article titled "{title}".
Requirements:
- German and English keywords mixed
- Lowercase, words separated by hyphens
- Max 5-6 words
- No file extension
- Focus on: barrierefreiheit, accessibility, web, and the topic
- Return ONLY the filename, nothing else

Example for topic "Forms": barrierefreiheit-formulare-accessible-forms`,
    updatedAt: new Date(),
  });

  // Alt Text Template
  await db.insert(Prompts).values({
    id: 'alt_text_template',
    name: 'Alt Text Template',
    category: 'image',
    promptText: `Illustration zum Thema {title} - Barrierefreiheit im Web`,
    updatedAt: new Date(),
  });

  console.log('Seed data inserted successfully!');
}
