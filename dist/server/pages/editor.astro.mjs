import { c as createComponent, r as renderComponent, b as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BJX1LJQr.mjs';
import 'piccolore';
import { $ as $$Layout } from '../chunks/Layout_D1TlOTe7.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

function Editor() {
  const [input, setInput] = useState("");
  const [error, setError] = useState(null);
  const [article, setArticle] = useState(null);
  const [image, setImage] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [regeneratingImage, setRegeneratingImage] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const handleInputChange = (value) => {
    setInput(value);
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };
  const isUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };
  const getInputType = () => {
    if (!input.trim()) return "empty";
    return isUrl(input.trim()) ? "url" : "keywords";
  };
  const canGenerate = () => {
    return input.trim().length > 0;
  };
  const generateText = async () => {
    const type = getInputType();
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        type === "url" ? { url: input.trim() } : { keywords: input.trim() }
      )
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Text generation failed");
    }
    return response.json();
  };
  const generateImage = async (title) => {
    const response = await fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Image generation failed");
    }
    return response.json();
  };
  const handleGenerateAll = async () => {
    if (!canGenerate()) return;
    setGenerating(true);
    setError(null);
    setArticle(null);
    setImage(null);
    try {
      const textData = await generateText();
      setArticle(textData);
      if (textData?.title) {
        const imageData = await generateImage(textData.title);
        setImage(imageData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };
  const handleRegenerateText = async () => {
    if (!canGenerate()) return;
    setRegeneratingText(true);
    setError(null);
    try {
      const data = await generateText();
      setArticle(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Text generation failed");
    } finally {
      setRegeneratingText(false);
    }
  };
  const handleRegenerateImage = async () => {
    if (!article?.title) return;
    setRegeneratingImage(true);
    setError(null);
    try {
      const data = await generateImage(article.title);
      setImage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image generation failed");
    } finally {
      setRegeneratingImage(false);
    }
  };
  const handlePublish = async () => {
    if (!article || !image) return;
    setPublishing(true);
    setError(null);
    try {
      const imageResponse = await fetch("/api/save-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(image)
      });
      if (!imageResponse.ok) {
        const data = await imageResponse.json();
        throw new Error(data.error || "Image save failed");
      }
      const articleData = {
        ...article,
        image: image.filepath.replace("public", ""),
        imageAlt: image.alt
      };
      const articleResponse = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(articleData)
      });
      if (!articleResponse.ok) {
        const data = await articleResponse.json();
        throw new Error(data.error || "Article save failed");
      }
      setPublished(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed");
    } finally {
      setPublishing(false);
    }
  };
  const handleCreateNew = () => {
    setInput("");
    setArticle(null);
    setImage(null);
    setPublished(false);
    setError(null);
  };
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };
  const hasContent = article !== null;
  const isLoading = generating || regeneratingText || regeneratingImage || publishing;
  return /* @__PURE__ */ jsxs("div", { style: styles.container, children: [
    /* @__PURE__ */ jsxs("div", { style: styles.panel, children: [
      /* @__PURE__ */ jsxs("div", { style: styles.headerRow, children: [
        /* @__PURE__ */ jsx("h2", { style: styles.heading, children: "Content Generator" }),
        /* @__PURE__ */ jsx("button", { onClick: handleLogout, style: styles.logoutButton, children: "Logout" })
      ] }),
      published ? /* @__PURE__ */ jsxs("div", { style: styles.successBox, children: [
        /* @__PURE__ */ jsx("div", { style: styles.successIcon, children: /* @__PURE__ */ jsxs("svg", { width: "48", height: "48", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
          /* @__PURE__ */ jsx("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          /* @__PURE__ */ jsx("polyline", { points: "22 4 12 14.01 9 11.01" })
        ] }) }),
        /* @__PURE__ */ jsx("h3", { style: styles.successTitle, children: "Artikel veröffentlicht!" }),
        /* @__PURE__ */ jsx("p", { style: styles.successPath, children: article?.filepath }),
        /* @__PURE__ */ jsx("button", { onClick: handleCreateNew, style: styles.newButton, children: "Neuen Artikel erstellen" })
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { style: styles.field, children: [
          /* @__PURE__ */ jsx("label", { style: styles.label, children: "URL oder Thema" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              value: input,
              onChange: (e) => handleInputChange(e.target.value),
              placeholder: "https://... oder Keywords eingeben",
              style: styles.input,
              disabled: isLoading
            }
          ),
          /* @__PURE__ */ jsx("span", { style: styles.hint, children: getInputType() === "url" ? "URL erkannt – Inhalt wird analysiert" : getInputType() === "keywords" ? "Keywords erkannt – Recherche wird durchgeführt" : "URL für Analyse oder Keywords für Recherche" })
        ] }),
        canGenerate() && !hasContent && /* @__PURE__ */ jsx(
          "button",
          {
            onClick: handleGenerateAll,
            disabled: generating,
            style: {
              ...styles.button,
              ...styles.generateButton,
              opacity: generating ? 0.6 : 1,
              cursor: generating ? "not-allowed" : "pointer"
            },
            children: generating ? /* @__PURE__ */ jsxs("span", { style: styles.buttonContent, children: [
              /* @__PURE__ */ jsx("span", { style: styles.spinner }),
              "Generiere Bild & Text..."
            ] }) : "Generieren"
          }
        ),
        hasContent && /* @__PURE__ */ jsxs("div", { style: styles.actionSection, children: [
          /* @__PURE__ */ jsxs("div", { style: styles.regenerateRow, children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleRegenerateImage,
                disabled: isLoading,
                style: {
                  ...styles.button,
                  ...styles.secondaryButton,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer"
                },
                children: regeneratingImage ? "Generiere..." : "Bild neu"
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                onClick: handleRegenerateText,
                disabled: isLoading,
                style: {
                  ...styles.button,
                  ...styles.secondaryButton,
                  opacity: isLoading ? 0.6 : 1,
                  cursor: isLoading ? "not-allowed" : "pointer"
                },
                children: regeneratingText ? "Generiere..." : "Text neu"
              }
            )
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handlePublish,
              disabled: publishing || !image,
              style: {
                ...styles.button,
                ...styles.publishButton,
                opacity: publishing || !image ? 0.6 : 1,
                cursor: publishing || !image ? "not-allowed" : "pointer"
              },
              children: publishing ? /* @__PURE__ */ jsxs("span", { style: styles.buttonContent, children: [
                /* @__PURE__ */ jsx("span", { style: styles.spinner }),
                "Veröffentliche..."
              ] }) : "Veröffentlichen"
            }
          )
        ] })
      ] }),
      error && /* @__PURE__ */ jsx("div", { style: styles.error, children: error })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: styles.previewArea, children: [
      image && /* @__PURE__ */ jsxs("div", { style: { ...styles.preview, ...published ? styles.publishedPreview : {} }, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.previewHeader, children: [
          /* @__PURE__ */ jsxs("h3", { style: styles.previewTitle, children: [
            /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }),
              /* @__PURE__ */ jsx("circle", { cx: "8.5", cy: "8.5", r: "1.5" }),
              /* @__PURE__ */ jsx("polyline", { points: "21 15 16 10 5 21" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: "Bild" }),
            published && /* @__PURE__ */ jsx("span", { style: styles.publishedBadge, children: "Veröffentlicht" })
          ] }),
          /* @__PURE__ */ jsx("span", { style: styles.filepath, children: image.filepath })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.imagePreview, children: [
          /* @__PURE__ */ jsx("img", { src: image.url, alt: image.alt, style: styles.image }),
          /* @__PURE__ */ jsx("p", { style: styles.imageAlt, children: image.alt })
        ] })
      ] }),
      article && /* @__PURE__ */ jsxs("div", { style: { ...styles.preview, ...published ? styles.publishedPreview : {} }, children: [
        /* @__PURE__ */ jsxs("div", { style: styles.previewHeader, children: [
          /* @__PURE__ */ jsxs("h3", { style: styles.previewTitle, children: [
            /* @__PURE__ */ jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [
              /* @__PURE__ */ jsx("path", { d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" }),
              /* @__PURE__ */ jsx("polyline", { points: "14 2 14 8 20 8" }),
              /* @__PURE__ */ jsx("line", { x1: "16", y1: "13", x2: "8", y2: "13" }),
              /* @__PURE__ */ jsx("line", { x1: "16", y1: "17", x2: "8", y2: "17" })
            ] }),
            /* @__PURE__ */ jsx("span", { children: "Text" }),
            published && /* @__PURE__ */ jsx("span", { style: styles.publishedBadge, children: "Veröffentlicht" })
          ] }),
          /* @__PURE__ */ jsx("span", { style: styles.filepath, children: article.filepath })
        ] }),
        /* @__PURE__ */ jsxs("div", { style: styles.frontmatter, children: [
          /* @__PURE__ */ jsxs("div", { style: styles.frontmatterRow, children: [
            /* @__PURE__ */ jsx("span", { style: styles.frontmatterLabel, children: "Titel" }),
            /* @__PURE__ */ jsx("span", { style: styles.frontmatterValue, children: article.title })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: styles.frontmatterRow, children: [
            /* @__PURE__ */ jsx("span", { style: styles.frontmatterLabel, children: "Beschreibung" }),
            /* @__PURE__ */ jsx("span", { style: styles.frontmatterValue, children: article.description })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { style: styles.content, children: /* @__PURE__ */ jsx("pre", { style: styles.markdown, children: article.content }) })
      ] })
    ] })
  ] });
}
const styles = {
  container: {
    display: "grid",
    gap: "2rem",
    gridTemplateColumns: "380px 1fr"
  },
  panel: {
    background: "var(--color-surface, #141416)",
    borderRadius: "16px",
    padding: "2rem",
    height: "fit-content",
    border: "1px solid var(--color-border, #2a2a2e)"
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    paddingBottom: "1.5rem",
    borderBottom: "1px solid var(--color-border, #2a2a2e)"
  },
  heading: {
    fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
    fontSize: "1.5rem",
    fontWeight: 600,
    letterSpacing: "-0.02em",
    margin: 0,
    color: "var(--color-text, #faf9f7)"
  },
  logoutButton: {
    padding: "0.5rem 1rem",
    background: "transparent",
    border: "1px solid var(--color-border-accent, #3a3a40)",
    borderRadius: "6px",
    color: "var(--color-text-muted, #706d68)",
    cursor: "pointer",
    fontSize: "0.75rem",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition: "all 0.2s ease"
  },
  field: {
    marginBottom: "1.5rem"
  },
  label: {
    display: "block",
    marginBottom: "0.75rem",
    color: "var(--color-text-muted, #706d68)",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.12em"
  },
  input: {
    width: "100%",
    padding: "1rem",
    background: "var(--color-bg, #0a0a0b)",
    border: "1px solid var(--color-border, #2a2a2e)",
    borderRadius: "8px",
    color: "var(--color-text, #faf9f7)",
    fontSize: "1rem",
    transition: "border-color 0.2s ease"
  },
  hint: {
    display: "block",
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: "var(--color-text-muted, #706d68)"
  },
  button: {
    padding: "1rem 1.25rem",
    background: "var(--color-surface-elevated, #1a1a1d)",
    border: "none",
    borderRadius: "8px",
    color: "var(--color-text, #faf9f7)",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    transition: "all 0.2s ease"
  },
  generateButton: {
    background: "var(--color-primary, #e63946)",
    width: "100%",
    padding: "1.25rem",
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    boxShadow: "0 4px 20px rgba(230, 57, 70, 0.3)"
  },
  buttonContent: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.75rem"
  },
  spinner: {
    width: "18px",
    height: "18px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite"
  },
  actionSection: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem"
  },
  regenerateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem"
  },
  secondaryButton: {
    background: "var(--color-surface-accent, #222226)",
    fontSize: "0.875rem",
    padding: "1rem"
  },
  publishButton: {
    background: "var(--color-success, #4ade80)",
    color: "#000",
    width: "100%",
    padding: "1.25rem",
    fontSize: "1rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    boxShadow: "0 4px 20px rgba(74, 222, 128, 0.3)"
  },
  successBox: {
    textAlign: "center",
    padding: "3rem 1.5rem",
    background: "var(--color-success-muted, rgba(74, 222, 128, 0.12))",
    borderRadius: "12px",
    border: "1px solid rgba(74, 222, 128, 0.3)"
  },
  successIcon: {
    color: "var(--color-success, #4ade80)",
    marginBottom: "1.5rem",
    display: "flex",
    justifyContent: "center"
  },
  successTitle: {
    fontFamily: 'var(--font-display, "Playfair Display", Georgia, serif)',
    fontSize: "1.5rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: "var(--color-text, #faf9f7)"
  },
  successPath: {
    color: "var(--color-text-muted, #706d68)",
    fontSize: "0.875rem",
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    marginBottom: "2rem",
    wordBreak: "break-all"
  },
  newButton: {
    padding: "1rem 2rem",
    background: "var(--color-primary, #e63946)",
    border: "none",
    borderRadius: "8px",
    color: "#fff",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: 600,
    boxShadow: "0 4px 20px rgba(230, 57, 70, 0.3)"
  },
  error: {
    marginTop: "1.5rem",
    padding: "1rem",
    background: "var(--color-error-muted, rgba(248, 113, 113, 0.12))",
    border: "1px solid rgba(248, 113, 113, 0.3)",
    borderRadius: "8px",
    color: "var(--color-error, #f87171)",
    fontSize: "0.9rem"
  },
  previewArea: {
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem"
  },
  preview: {
    background: "var(--color-surface, #141416)",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid var(--color-border, #2a2a2e)"
  },
  publishedPreview: {
    borderColor: "var(--color-success, #4ade80)",
    boxShadow: "0 0 24px rgba(74, 222, 128, 0.15)"
  },
  previewHeader: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--color-border, #2a2a2e)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "var(--color-surface-elevated, #1a1a1d)"
  },
  previewTitle: {
    fontSize: "0.875rem",
    fontWeight: 600,
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    color: "var(--color-text, #faf9f7)"
  },
  publishedBadge: {
    background: "var(--color-success, #4ade80)",
    color: "#000",
    padding: "0.25rem 0.625rem",
    borderRadius: "9999px",
    fontSize: "0.65rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  filepath: {
    color: "var(--color-text-muted, #706d68)",
    fontSize: "0.75rem",
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)'
  },
  frontmatter: {
    padding: "1.25rem 1.5rem",
    borderBottom: "1px solid var(--color-border, #2a2a2e)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem"
  },
  frontmatterRow: {
    display: "flex",
    flexDirection: "column",
    gap: "0.25rem"
  },
  frontmatterLabel: {
    fontSize: "0.7rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: "var(--color-text-muted, #706d68)"
  },
  frontmatterValue: {
    fontSize: "0.9rem",
    color: "var(--color-text-accent, #e8e6e1)"
  },
  content: {
    padding: "1.5rem",
    maxHeight: "450px",
    overflow: "auto",
    background: "var(--color-bg, #0a0a0b)"
  },
  markdown: {
    fontFamily: 'var(--font-mono, "JetBrains Mono", monospace)',
    fontSize: "0.85rem",
    whiteSpace: "pre-wrap",
    margin: 0,
    color: "var(--color-text-accent, #e8e6e1)",
    lineHeight: 1.7
  },
  imagePreview: {
    padding: "1.5rem",
    textAlign: "center",
    background: "var(--color-bg, #0a0a0b)"
  },
  image: {
    maxWidth: "100%",
    maxHeight: "350px",
    borderRadius: "8px",
    boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.5)"
  },
  imageAlt: {
    marginTop: "0.75rem",
    color: "var(--color-text-muted, #706d68)",
    fontSize: "0.875rem",
    fontStyle: "italic"
  }
};

const $$Editor = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Editor" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="container"> <h1 style="font-size: 2rem; margin-bottom: 2rem;">Content Editor</h1> ${renderComponent($$result2, "EditorComponent", Editor, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/home/rolandgolla/development/nca/nca-astro-content/src/components/Editor", "client:component-export": "default" })} </div> ` })}`;
}, "/home/rolandgolla/development/nca/nca-astro-content/src/pages/editor.astro", void 0);

const $$file = "/home/rolandgolla/development/nca/nca-astro-content/src/pages/editor.astro";
const $$url = "/editor";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Editor,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
