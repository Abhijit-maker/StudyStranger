import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text?: string | null;
  className?: string;
  block?: boolean;
}

/**
 * Normalizes raw mathematical / LaTeX expressions from AI responses.
 * Cleans escaped quotes, backslashes, markdown wrappers, control characters, and delimiters.
 */
function cleanLatexMath(raw: string): string {
  if (!raw) return "";
  let s = raw.trim();

  // Strip code blocks (e.g. ```latex ... ``` or ```math ... ``` or ``` ... ```)
  s = s.replace(/^```[a-zA-Z]*\s*/i, "").replace(/```$/i, "").trim();

  // Strip outer delimiters if present
  if (s.startsWith("$$") && s.endsWith("$$")) s = s.slice(2, -2).trim();
  else if (s.startsWith("$") && s.endsWith("$")) s = s.slice(1, -1).trim();
  else if (s.startsWith("\\[") && s.endsWith("\\]")) s = s.slice(2, -2).trim();
  else if (s.startsWith("\\(") && s.endsWith("\\)")) s = s.slice(2, -2).trim();

  // Restore any LaTeX commands that were accidentally parsed as control characters
  s = s
    .replace(/\u000crac/g, "\\frac")
    .replace(/\u0008eta/g, "\\beta")
    .replace(/\u0008ar/g, "\\bar")
    .replace(/\u0008egin/g, "\\begin")
    .replace(/\u0008inom/g, "\\binom")
    .replace(/\t(heta|ext|imes|au|an)/g, "\\$1")
    .replace(/\n(abla|eq)/g, "\\$1")
    .replace(/\r(ho|ight)/g, "\\$1");

  // Fix JSON serialization double-escaped backslashes (\\\\frac -> \frac)
  s = s.replace(/\\\\([a-zA-Z]+)/g, "\\$1");
  // Clean escaped dollar signs
  s = s.replace(/\\\$/g, "$");

  // Convert unicode math symbols to robust standard LaTeX equivalents
  s = s
    .replace(/×/g, " \\times ")
    .replace(/÷/g, " \\div ")
    .replace(/±/g, " \\pm ")
    .replace(/≠/g, " \\neq ")
    .replace(/≤/g, " \\le ")
    .replace(/≥/g, " \\ge ")
    .replace(/≈/g, " \\approx ")
    .replace(/≡/g, " \\equiv ")
    .replace(/∞/g, " \\infty ")
    .replace(/°/g, "^{\\circ}")
    .replace(/√/g, " \\sqrt ")
    .replace(/π/g, " \\pi ")
    .replace(/α/g, " \\alpha ")
    .replace(/β/g, " \\beta ")
    .replace(/γ/g, " \\gamma ")
    .replace(/θ/g, " \\theta ")
    .replace(/λ/g, " \\lambda ")
    .replace(/Δ/g, " \\Delta ")
    .replace(/μ/g, " \\mu ")
    .replace(/σ/g, " \\sigma ")
    .replace(/ω/g, " \\omega ")
    .replace(/∫/g, " \\int ")
    .replace(/∑/g, " \\sum ")
    .replace(/∂/g, " \\partial ")
    .replace(/→/g, " \\to ")
    .replace(/∈/g, " \\in ")
    .replace(/⊂/g, " \\subset ");

  // Protect unescaped percentage signs in math so they don't comment out the rest of formula
  s = s.replace(/(?<!\\)%/g, "\\%");

  // Ensure delimiters are balanced and correct
  // Basic heuristic: check if we have unclosed braces or brackets
  const openB = (s.match(/\{/g) || []).length;
  const closeB = (s.match(/\}/g) || []).length;
  if (openB > closeB) s += "}".repeat(openB - closeB);
  
  const openP = (s.match(/\(/g) || []).length;
  const closeP = (s.match(/\)/g) || []).length;
  if (openP > closeP) s += ")".repeat(openP - closeP);

  return s;
}

/**
 * Safely renders LaTeX to KaTeX HTML without throwing fatal component errors.
 */
function renderKaTeXSafe(mathStr: string, isBlock: boolean): string {
  const clean = cleanLatexMath(mathStr);
  if (!clean) return "";

  try {
    return katex.renderToString(clean, {
      displayMode: isBlock,
      throwOnError: false,
      errorColor: "#ef4444",
      strict: false,
      trust: true
    });
  } catch (err) {
    console.warn("KaTeX rendering warning:", err);
    return clean;
  }
}

/**
 * Tokenizes text containing both natural language (Bengali/English) and embedded math formulas.
 */
function tokenizeMixedContent(text: string): { type: "text" | "block" | "inline"; content: string }[] {
  if (!text) return [];

  // Normalize control characters & standardize bracket delimiters
  let s = text
    .replace(/\u000crac/g, "\\frac")
    .replace(/\u0008eta/g, "\\beta")
    .replace(/\u0008ar/g, "\\bar")
    .replace(/\u0008egin/g, "\\begin")
    .replace(/\u0008inom/g, "\\binom")
    .replace(/\t(heta|ext|imes|au|an)/g, "\\$1")
    .replace(/\n(abla|eq)/g, "\\$1")
    .replace(/\r(ho|ight)/g, "\\$1")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$");

  // Regex to match $$, $, \begin{env}...\end{env}, or raw LaTeX commands with arguments
  const regex = /(\$\$[\s\S]*?\$\$|\$[^\$\n]+?\$|\\begin\{[a-zA-Z*]+\}[\s\S]*?\\end\{[a-zA-Z*]+\}|\\(?:frac|dfrac|sqrt|sum|int|prod|lim|binom|log|ln|exp|sin|cos|tan|cot|sec|csc|arcsin|arccos|arctan|alpha|beta|gamma|delta|theta|pi|tau|lambda|mu|sigma|omega|Delta|nabla|partial|times|cdot|div|pm|mp|le|ge|ne|approx|equiv|in|subset|cup|cap|to|rightarrow|leftarrow|vec|hat|bar|text|mathbf|mathrm|mathbb|mathcal|infty)(?:\{[^{}]*\}|\[[^[\]]*\]|\^[a-zA-Z0-9{}]|\_[a-zA-Z0-9{}]|[a-zA-Z0-9\+\-\*\/=><\s.,()^_{}])*)/g;

  const tokens: { type: "text" | "block" | "inline"; content: string }[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(s)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: "text", content: s.slice(lastIndex, match.index) });
    }
    const tokenStr = match[0];
    if (tokenStr.startsWith("$$")) {
      tokens.push({ type: "block", content: tokenStr.slice(2, -2) });
    } else if (tokenStr.startsWith("$")) {
      tokens.push({ type: "inline", content: tokenStr.slice(1, -1) });
    } else {
      tokens.push({ type: "inline", content: tokenStr });
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < s.length) {
    tokens.push({ type: "text", content: s.slice(lastIndex) });
  }

  return tokens;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = "", block = false }) => {
  if (!text) return null;

  const trimmed = text.trim();
  const hasBengali = /[\u0980-\u09FF]/.test(trimmed);

  // 1. Pure block math equation (e.g. step or finalAnswer without Bengali prose)
  if (block && !hasBengali) {
    const html = renderKaTeXSafe(trimmed, true);
    return (
      <div 
        className={`math-block-container overflow-x-auto scrollbar-hide py-1 text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // 2. If entire string is wrapped in $$...$$ or is a pure equation
  if (!hasBengali && (
      (trimmed.startsWith("$$") && trimmed.endsWith("$$")) || 
      (trimmed.startsWith("\\[") && trimmed.endsWith("\\]")) ||
      (/^(\\frac|\\sqrt|\\int|\\sum|[a-zA-Z0-9\s\+\-\*\/\=\^\_\(\)\{\}\\]+)$/.test(trimmed) && trimmed.includes("=")))) {
    const html = renderKaTeXSafe(trimmed, block);
    return (
      <div 
        className={`math-block-container overflow-x-auto scrollbar-hide py-1 text-center ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  // 3. Mixed content (Bengali/English prose + LaTeX equations)
  const tokens = tokenizeMixedContent(trimmed);

  return (
    <span className={`math-text-inline leading-relaxed ${className}`}>
      {tokens.map((token, idx) => {
        if (token.type === "block") {
          const html = renderKaTeXSafe(token.content, true);
          return (
            <span
              key={`math-block-${idx}`}
              className="block my-2 overflow-x-auto scrollbar-hide text-center"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        if (token.type === "inline") {
          const html = renderKaTeXSafe(token.content, false);
          return (
            <span
              key={`math-inline-${idx}`}
              className="inline-block mx-0.5 align-middle"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return <React.Fragment key={`text-${idx}`}>{token.content}</React.Fragment>;
      })}
    </span>
  );
};
