import { jsPDF } from "jspdf";

export interface MathStepItem {
  step: string;
  explanation: string;
}

export interface MathQuestionItem {
  questionNumber: string;
  questionTitle: string;
  questionText?: string;
  analysis: string;
  steps: MathStepItem[];
  finalAnswer: string;
}

export interface MathFollowUpItem {
  q: string;
  a: string;
}

export interface MathPdfExportPayload {
  title?: string;
  subtitle?: string;
  userName?: string;
  problemText?: string;
  problemImageDataUrl?: string | null;
  questions: MathQuestionItem[];
  followUps?: MathFollowUpItem[];
  fileName?: string;
}

export interface RichDocumentSection {
  heading?: string;
  badge?: string;
  mathEquation?: string;
  body?: string;
  highlightBox?: string;
  accentColor?: "indigo" | "emerald" | "amber" | "rose" | "slate";
}

export interface RichDocumentPdfPayload {
  title: string;
  subtitle?: string;
  subject?: string;
  userName?: string;
  headerImageDataUrl?: string | null;
  sections: RichDocumentSection[];
  fileName?: string;
}

// ============================================================================
// 1. LATEX AST PARSER & 2D CANVAS MATHEMATICAL TYPESETTER
// ============================================================================

type MathNode =
  | { type: "row"; children: MathNode[] }
  | { type: "frac"; num: MathNode; den: MathNode }
  | { type: "sqrt"; degree?: MathNode; radicand: MathNode }
  | {
      type: "supsub";
      base: MathNode;
      sup?: MathNode;
      sub?: MathNode;
      limitsBelowAbove?: boolean;
    }
  | { type: "accent"; kind: "vec" | "bar" | "hat" | "dot"; base: MathNode }
  | { type: "delim"; left: string; right: string; inner: MathNode }
  | {
      type: "matrix";
      bracket: "p" | "b" | "v" | "B" | "cases" | "none";
      rows: MathNode[][];
    }
  | { type: "text"; content: string; bold?: boolean }
  | { type: "op"; symbol: string; isFunction?: boolean; isLarge?: boolean; pad?: number }
  | { type: "sym"; text: string; italic?: boolean }
  | { type: "space"; widthEm: number };

interface MathBoxMetrics {
  width: number;
  ascent: number; // height above mathematical baseline
  descent: number; // depth below mathematical baseline
  draw: (ctx: CanvasRenderingContext2D, x: number, baselineY: number, color: string) => void;
}

const LATEX_SYMBOLS: Record<string, string> = {
  alpha: "α",
  beta: "β",
  gamma: "γ",
  Gamma: "Γ",
  delta: "δ",
  Delta: "Δ",
  epsilon: "ϵ",
  varepsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  Theta: "Θ",
  vartheta: "ϑ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  Lambda: "Λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  Xi: "Ξ",
  pi: "π",
  Pi: "Π",
  rho: "ρ",
  sigma: "σ",
  Sigma: "Σ",
  tau: "τ",
  upsilon: "υ",
  phi: "ϕ",
  Phi: "Φ",
  varphi: "φ",
  chi: "χ",
  psi: "ψ",
  Psi: "Ψ",
  omega: "ω",
  Omega: "Ω",
  infty: "∞",
  partial: "∂",
  nabla: "∇",
  hbar: "ℏ",
  ell: "ℓ",
  wp: "℘",
  Re: "ℜ",
  Im: "ℑ",
  forall: "∀",
  exists: "∃",
  nexists: "∄",
  emptyset: "∅",
  varnothing: "∅",
  in: "∈",
  notin: "∉",
  ni: "∋",
  subset: "⊂",
  supset: "⊃",
  subseteq: "⊆",
  supseteq: "⊇",
  cup: "∪",
  cap: "∩",
  setminus: "∖",
  pm: "±",
  mp: "∓",
  times: "×",
  div: "÷",
  cdot: "·",
  ast: "∗",
  star: "⋆",
  circ: "∘",
  bullet: "•",
  oplus: "⊕",
  ominus: "⊖",
  otimes: "⊗",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  neq: "≠",
  ne: "≠",
  approx: "≈",
  equiv: "≡",
  cong: "≅",
  sim: "∼",
  simeq: "≃",
  propto: "∝",
  ll: "≪",
  gg: "≫",
  rightarrow: "→",
  to: "→",
  leftarrow: "←",
  gets: "←",
  leftrightarrow: "↔",
  Rightarrow: "⇒",
  implies: "⇒",
  Leftarrow: "⇐",
  Leftrightarrow: "⇔",
  iff: "⇔",
  mapsto: "↦",
  uparrow: "↑",
  downarrow: "↓",
  therefore: "∴",
  because: "∵",
  angle: "∠",
  measuredangle: "∡",
  triangle: "△",
  perp: "⊥",
  parallel: "∥",
  mid: "∣",
  nmid: "∤",
  prime: "′",
  dots: "…",
  ldots: "…",
  cdots: "⋯",
  vdots: "⋮",
  ddots: "⋱",
  degree: "°",
};

const LARGE_OPERATORS: Record<string, string> = {
  int: "∫",
  iint: "∬",
  iiint: "∭",
  oint: "∮",
  sum: "∑",
  prod: "∏",
  coprod: "∐",
  bigcup: "⋃",
  bigcap: "⋂",
};

const FUNCTION_NAMES = new Set([
  "sin",
  "cos",
  "tan",
  "cot",
  "sec",
  "csc",
  "arcsin",
  "arccos",
  "arctan",
  "sinh",
  "cosh",
  "tanh",
  "coth",
  "log",
  "ln",
  "lg",
  "exp",
  "lim",
  "sup",
  "inf",
  "max",
  "min",
  "det",
  "dim",
  "ker",
  "deg",
  "gcd",
  "lcm",
  "mod",
  "arg",
]);

const BINARY_OR_REL_OPS = new Set([
  "+",
  "-",
  "−",
  "=",
  "±",
  "∓",
  "×",
  "÷",
  "·",
  "≤",
  "≥",
  "≠",
  "≈",
  "≡",
  "≅",
  "∼",
  "∝",
  "→",
  "←",
  "↔",
  "⇒",
  "⇐",
  "⇔",
  "↦",
  "∈",
  "∉",
  "⊂",
  "⊃",
  "⊆",
  "⊇",
  "∪",
  "∩",
  "∴",
  "∵",
]);

const FONT_BENGALI_SANS =
  '"Hind Siliguri", "Noto Sans Bengali", "Kohinoor Bangla", "Nirmala UI", system-ui, -apple-system, sans-serif';
const FONT_MATH_SERIF =
  '"Cambria Math", "STIX Two Math", "Latin Modern Math", "Times New Roman", Georgia, serif';

export function stripOuterMathDelimiters(raw: string): string {
  if (!raw) return "";
  let s = raw.trim();
  // Remove leading/trailing $$ or $ or \[ \] or \( \)
  if (s.startsWith("$$") && s.endsWith("$$") && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("\\[") && s.endsWith("\\]") && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("\\(") && s.endsWith("\\)") && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith("$") && s.endsWith("$") && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Recursive descent parser for LaTeX mathematical strings
 */
export function parseLatexToAst(latexInput: string): MathNode {
  const s = stripOuterMathDelimiters(latexInput)
    .replace(/\\\\(?=[a-zA-Z])/g, "\\") // normalize double-escaped commands if any
    .trim();
  let pos = 0;

  const peek = () => (pos < s.length ? s[pos] : "");
  const skipWhitespace = () => {
    while (pos < s.length && /\s/.test(s[pos])) pos++;
  };

  const readBracedGroup = (): string => {
    skipWhitespace();
    if (peek() !== "{") {
      // Single token or char
      if (peek() === "\\") {
        let cmd = "\\";
        pos++;
        if (pos < s.length && !/[a-zA-Z]/.test(s[pos])) {
          cmd += s[pos++];
          return cmd;
        }
        while (pos < s.length && /[a-zA-Z]/.test(s[pos])) {
          cmd += s[pos++];
        }
        return cmd;
      }
      return pos < s.length ? s[pos++] : "";
    }
    pos++; // skip '{'
    let depth = 1;
    let out = "";
    while (pos < s.length && depth > 0) {
      const ch = s[pos++];
      if (ch === "\\" && pos < s.length) {
        out += ch + s[pos++];
        continue;
      }
      if (ch === "{") depth++;
      else if (ch === "}") depth--;
      if (depth > 0) out += ch;
    }
    return out;
  };

  const readBracketGroup = (): string | undefined => {
    skipWhitespace();
    if (peek() !== "[") return undefined;
    pos++; // skip '['
    let depth = 1;
    let out = "";
    while (pos < s.length && depth > 0) {
      const ch = s[pos++];
      if (ch === "[") depth++;
      else if (ch === "]") depth--;
      if (depth > 0) out += ch;
    }
    return out;
  };

  const parseAtom = (): MathNode | null => {
    skipWhitespace();
    if (pos >= s.length) return null;

    const ch = s[pos];
    if (ch === "}") return null;

    if (ch === "{") {
      const groupContent = readBracedGroup();
      return parseLatexToAst(groupContent);
    }

    if (ch === "\\") {
      pos++;
      if (pos >= s.length) return null;

      // Escaped punctuation/spacing
      const first = s[pos];
      if (!/[a-zA-Z]/.test(first)) {
        pos++;
        if (first === "," || first === ";" || first === ":" || first === " ") {
          return { type: "space", widthEm: 0.28 };
        }
        if (first === "!") {
          return { type: "space", widthEm: -0.1 };
        }
        if (first === "{" || first === "}" || first === "%" || first === "_" || first === "&") {
          return { type: "sym", text: first, italic: false };
        }
        if (first === "\\") {
          return { type: "space", widthEm: 0.5 };
        }
        return { type: "sym", text: first, italic: false };
      }

      let cmd = "";
      while (pos < s.length && /[a-zA-Z]/.test(s[pos])) {
        cmd += s[pos++];
      }

      if (cmd === "frac" || cmd === "dfrac" || cmd === "tfrac" || cmd === "cfrac") {
        const numStr = readBracedGroup();
        const denStr = readBracedGroup();
        return {
          type: "frac",
          num: parseLatexToAst(numStr),
          den: parseLatexToAst(denStr),
        };
      }

      if (cmd === "sqrt") {
        const degStr = readBracketGroup();
        const radStr = readBracedGroup();
        return {
          type: "sqrt",
          degree: degStr ? parseLatexToAst(degStr) : undefined,
          radicand: parseLatexToAst(radStr),
        };
      }

      if (
        cmd === "text" ||
        cmd === "textrm" ||
        cmd === "mathrm" ||
        cmd === "textbf" ||
        cmd === "mathbf" ||
        cmd === "mbox" ||
        cmd === "operatorname"
      ) {
        const txt = readBracedGroup();
        return {
          type: "text",
          content: txt,
          bold: cmd === "textbf" || cmd === "mathbf",
        };
      }

      if (cmd === "vec" || cmd === "overrightarrow") {
        const inner = readBracedGroup();
        return { type: "accent", kind: "vec", base: parseLatexToAst(inner) };
      }
      if (cmd === "bar" || cmd === "overline") {
        const inner = readBracedGroup();
        return { type: "accent", kind: "bar", base: parseLatexToAst(inner) };
      }
      if (cmd === "hat" || cmd === "widehat") {
        const inner = readBracedGroup();
        return { type: "accent", kind: "hat", base: parseLatexToAst(inner) };
      }
      if (cmd === "dot") {
        const inner = readBracedGroup();
        return { type: "accent", kind: "dot", base: parseLatexToAst(inner) };
      }

      if (cmd === "left") {
        skipWhitespace();
        let leftDelim = "(";
        if (pos < s.length) {
          if (s[pos] === "\\") {
            pos++;
            let dCmd = "";
            while (pos < s.length && /[a-zA-Z{}|]/.test(s[pos])) {
              dCmd += s[pos++];
              if (dCmd === "{" || dCmd === "}" || dCmd === "|") break;
            }
            leftDelim =
              dCmd === "lbrace" || dCmd === "{"
                ? "{"
                : dCmd === "langle"
                ? "⟨"
                : dCmd === "lvert" || dCmd === "|"
                ? "|"
                : "(";
          } else {
            leftDelim = s[pos++];
          }
        }
        // Find matching \right
        let depth = 1;
        let innerStr = "";
        let rightDelim = ")";
        while (pos < s.length && depth > 0) {
          if (s.slice(pos).startsWith("\\left")) {
            depth++;
            innerStr += "\\left";
            pos += 5;
          } else if (s.slice(pos).startsWith("\\right")) {
            depth--;
            pos += 6;
            if (depth === 0) {
              skipWhitespace();
              if (pos < s.length) {
                if (s[pos] === "\\") {
                  pos++;
                  let dCmd = "";
                  while (pos < s.length && /[a-zA-Z{}|]/.test(s[pos])) {
                    dCmd += s[pos++];
                    if (dCmd === "{" || dCmd === "}" || dCmd === "|") break;
                  }
                  rightDelim =
                    dCmd === "rbrace" || dCmd === "}"
                      ? "}"
                      : dCmd === "rangle"
                      ? "⟩"
                      : dCmd === "rvert" || dCmd === "|"
                      ? "|"
                      : ")";
                } else {
                  rightDelim = s[pos++];
                }
              }
              break;
            } else {
              innerStr += "\\right";
            }
          } else {
            innerStr += s[pos++];
          }
        }
        return {
          type: "delim",
          left: leftDelim === "." ? "" : leftDelim,
          right: rightDelim === "." ? "" : rightDelim,
          inner: parseLatexToAst(innerStr),
        };
      }

      if (cmd === "begin") {
        const envName = readBracedGroup().trim();
        const endTag = `\\end{${envName}}`;
        const endIdx = s.indexOf(endTag, pos);
        let body = "";
        if (endIdx !== -1) {
          body = s.slice(pos, endIdx);
          pos = endIdx + endTag.length;
        } else {
          body = s.slice(pos);
          pos = s.length;
        }

        if (envName.includes("matrix") || envName === "cases" || envName === "array") {
          const rawRows = body
            .split(/\\\\/)
            .map((r) => r.trim())
            .filter(Boolean);
          const rows: MathNode[][] = rawRows.map((r) =>
            r.split("&").map((cell) => parseLatexToAst(cell.trim()))
          );
          const bracket =
            envName === "pmatrix"
              ? "p"
              : envName === "bmatrix"
              ? "b"
              : envName === "vmatrix"
              ? "v"
              : envName === "Bmatrix"
              ? "B"
              : envName === "cases"
              ? "cases"
              : "none";
          return { type: "matrix", bracket, rows };
        }
        return parseLatexToAst(body.replace(/\\\\/g, " , ").replace(/&/g, " "));
      }

      if (cmd === "quad" || cmd === "qquad") {
        return { type: "space", widthEm: cmd === "qquad" ? 1.2 : 0.7 };
      }

      if (LARGE_OPERATORS[cmd]) {
        return {
          type: "op",
          symbol: LARGE_OPERATORS[cmd],
          isLarge: true,
        };
      }

      if (FUNCTION_NAMES.has(cmd)) {
        return {
          type: "op",
          symbol: cmd,
          isFunction: true,
        };
      }

      if (LATEX_SYMBOLS[cmd]) {
        const sym = LATEX_SYMBOLS[cmd];
        if (BINARY_OR_REL_OPS.has(sym)) {
          return { type: "op", symbol: sym, pad: 0.22 };
        }
        const isGreekLower = /^[α-ωϵϑϕϖϱvarsigma]$/.test(sym);
        return { type: "sym", text: sym, italic: isGreekLower };
      }

      // Unknown command fallback: render command name as upright text
      return { type: "text", content: cmd };
    }

    // Handle numbers (grouped together)
    if (/[0-9]/.test(ch)) {
      let numStr = "";
      while (pos < s.length && /[0-9.]/.test(s[pos])) {
        numStr += s[pos++];
      }
      return { type: "sym", text: numStr, italic: false };
    }

    // Handle Bengali characters or words inside math mode
    if (/[\u0980-\u09FF]/.test(ch)) {
      let bnStr = "";
      while (pos < s.length && /[\u0980-\u09FF\s،।]/.test(s[pos])) {
        bnStr += s[pos++];
      }
      return { type: "text", content: bnStr.trim() };
    }

    // Handle standard operators
    if (ch === "+" || ch === "-" || ch === "=" || ch === "<" || ch === ">") {
      pos++;
      const displayOp = ch === "-" ? "−" : ch;
      return { type: "op", symbol: displayOp, pad: 0.22 };
    }

    // Punctuation or brackets
    if ("()[],:;!/|'".includes(ch)) {
      pos++;
      return { type: "sym", text: ch, italic: false };
    }

    // Single Latin letter -> italic variable
    if (/[a-zA-Z]/.test(ch)) {
      pos++;
      return { type: "sym", text: ch, italic: true };
    }

    // Any other Unicode symbol
    pos++;
    if (BINARY_OR_REL_OPS.has(ch)) {
      return { type: "op", symbol: ch, pad: 0.22 };
    }
    return { type: "sym", text: ch, italic: false };
  };

  const nodes: MathNode[] = [];
  while (pos < s.length) {
    skipWhitespace();
    if (pos >= s.length || s[pos] === "}") break;

    let base = parseAtom();
    if (!base) break;

    // Check for ^ or _ superscripts/subscripts
    skipWhitespace();
    let sup: MathNode | undefined;
    let sub: MathNode | undefined;

    while (pos < s.length && (s[pos] === "^" || s[pos] === "_" || s[pos] === "'")) {
      if (s[pos] === "'") {
        pos++;
        const primeNode: MathNode = { type: "sym", text: "′", italic: false };
        sup = sup ? { type: "row", children: [sup, primeNode] } : primeNode;
      } else if (s[pos] === "^") {
        pos++;
        const grp = readBracedGroup();
        sup = parseLatexToAst(grp);
      } else if (s[pos] === "_") {
        pos++;
        const grp = readBracedGroup();
        sub = parseLatexToAst(grp);
      }
      skipWhitespace();
    }

    if (sup || sub) {
      const isLim =
        base.type === "op" &&
        (base.symbol === "lim" || base.symbol === "∑" || base.symbol === "∏");
      base = {
        type: "supsub",
        base,
        sup,
        sub,
        limitsBelowAbove: isLim,
      };
    }

    nodes.push(base);
  }

  if (nodes.length === 1) return nodes[0];
  return { type: "row", children: nodes };
}

/**
 * Measures and builds draw closures for a MathNode tree on a 2D Canvas
 */
export function layoutMathNode(
  ctx: CanvasRenderingContext2D,
  node: MathNode,
  fontSize: number
): MathBoxMetrics {
  const mathAxisOffset = fontSize * 0.26; // height of minus/fraction bar above baseline

  switch (node.type) {
    case "space": {
      const w = Math.max(0, node.widthEm * fontSize);
      return {
        width: w,
        ascent: fontSize * 0.7,
        descent: fontSize * 0.2,
        draw: () => {},
      };
    }

    case "text": {
      const isBn = /[\u0980-\u09FF]/.test(node.content);
      const fontSpec = `${node.bold ? "700" : "600"} ${Math.round(fontSize * (isBn ? 0.96 : 0.92))}px ${FONT_BENGALI_SANS}`;
      ctx.save();
      ctx.font = fontSpec;
      const w = ctx.measureText(node.content).width + fontSize * 0.12;
      ctx.restore();
      return {
        width: w,
        ascent: fontSize * 0.78,
        descent: fontSize * 0.24,
        draw: (c, x, baselineY, color) => {
          c.save();
          c.font = fontSpec;
          c.fillStyle = color;
          c.fillText(node.content, x + fontSize * 0.06, baselineY);
          c.restore();
        },
      };
    }

    case "sym": {
      const fontSpec = `${node.italic ? "italic " : ""}600 ${Math.round(fontSize)}px ${FONT_MATH_SERIF}`;
      ctx.save();
      ctx.font = fontSpec;
      const w = ctx.measureText(node.text).width + (node.italic ? fontSize * 0.05 : 0);
      ctx.restore();
      return {
        width: w,
        ascent: fontSize * 0.76,
        descent: fontSize * 0.22,
        draw: (c, x, baselineY, color) => {
          c.save();
          c.font = fontSpec;
          c.fillStyle = color;
          c.fillText(node.text, x, baselineY);
          c.restore();
        },
      };
    }

    case "op": {
      if (node.isLarge) {
        const largeSize = Math.round(fontSize * 1.45);
        const fontSpec = `600 ${largeSize}px ${FONT_MATH_SERIF}`;
        ctx.save();
        ctx.font = fontSpec;
        const w = ctx.measureText(node.symbol).width + fontSize * 0.16;
        ctx.restore();
        return {
          width: w,
          ascent: fontSize * 1.05,
          descent: fontSize * 0.45,
          draw: (c, x, baselineY, color) => {
            c.save();
            c.font = fontSpec;
            c.fillStyle = color;
            c.fillText(node.symbol, x + fontSize * 0.05, baselineY + fontSize * 0.14);
            c.restore();
          },
        };
      }

      if (node.isFunction) {
        const fontSpec = `600 ${Math.round(fontSize * 0.95)}px ${FONT_MATH_SERIF}`;
        ctx.save();
        ctx.font = fontSpec;
        const w = ctx.measureText(node.symbol).width + fontSize * 0.16;
        ctx.restore();
        return {
          width: w,
          ascent: fontSize * 0.76,
          descent: fontSize * 0.2,
          draw: (c, x, baselineY, color) => {
            c.save();
            c.font = fontSpec;
            c.fillStyle = color;
            c.fillText(node.symbol, x + fontSize * 0.04, baselineY);
            c.restore();
          },
        };
      }

      const pad = (node.pad ?? 0.18) * fontSize;
      const fontSpec = `600 ${Math.round(fontSize)}px ${FONT_MATH_SERIF}`;
      ctx.save();
      ctx.font = fontSpec;
      const glyphW = ctx.measureText(node.symbol).width;
      ctx.restore();
      return {
        width: glyphW + pad * 2,
        ascent: fontSize * 0.75,
        descent: fontSize * 0.22,
        draw: (c, x, baselineY, color) => {
          c.save();
          c.font = fontSpec;
          c.fillStyle = color;
          c.fillText(node.symbol, x + pad, baselineY);
          c.restore();
        },
      };
    }

    case "row": {
      const childMetrics = node.children.map((ch) => layoutMathNode(ctx, ch, fontSize));
      const totalWidth = childMetrics.reduce((acc, m) => acc + m.width, 0);
      const maxAscent = childMetrics.reduce((acc, m) => Math.max(acc, m.ascent), fontSize * 0.75);
      const maxDescent = childMetrics.reduce((acc, m) => Math.max(acc, m.descent), fontSize * 0.22);

      return {
        width: totalWidth,
        ascent: maxAscent,
        descent: maxDescent,
        draw: (c, x, baselineY, color) => {
          let curX = x;
          for (const m of childMetrics) {
            m.draw(c, curX, baselineY, color);
            curX += m.width;
          }
        },
      };
    }

    case "frac": {
      const childSize = Math.max(12, Math.round(fontSize * 0.84));
      const numM = layoutMathNode(ctx, node.num, childSize);
      const denM = layoutMathNode(ctx, node.den, childSize);
      const padX = fontSize * 0.24;
      const barWidth = Math.max(numM.width, denM.width) + padX * 2;
      const gap = Math.max(3, fontSize * 0.15);

      const numBaselineOffset = mathAxisOffset + gap + numM.descent;
      const denBaselineOffset = -mathAxisOffset + gap + denM.ascent;

      const ascent = numBaselineOffset + numM.ascent + 2;
      const descent = denBaselineOffset + denM.descent + 2;

      return {
        width: barWidth + fontSize * 0.16,
        ascent,
        descent,
        draw: (c, x, baselineY, color) => {
          const startX = x + fontSize * 0.08;
          const barY = baselineY - mathAxisOffset;

          // Numerator centered above bar
          const numX = startX + (barWidth - numM.width) / 2;
          const numBaseY = barY - gap - numM.descent;
          numM.draw(c, numX, numBaseY, color);

          // Fraction vinculum bar
          c.save();
          c.strokeStyle = color;
          c.lineWidth = Math.max(1.4, fontSize * 0.065);
          c.beginPath();
          c.moveTo(startX, barY);
          c.lineTo(startX + barWidth, barY);
          c.stroke();
          c.restore();

          // Denominator centered below bar
          const denX = startX + (barWidth - denM.width) / 2;
          const denBaseY = barY + gap + denM.ascent;
          denM.draw(c, denX, denBaseY, color);
        },
      };
    }

    case "sqrt": {
      const radM = layoutMathNode(ctx, node.radicand, fontSize);
      const degM = node.degree
        ? layoutMathNode(ctx, node.degree, Math.max(10, Math.round(fontSize * 0.62)))
        : null;

      const topPad = Math.max(3, fontSize * 0.14);
      const hookWidth = fontSize * 0.58;
      const degWidth = degM ? Math.max(0, degM.width - hookWidth * 0.35) : 0;
      const rightPad = fontSize * 0.14;

      const totalWidth = degWidth + hookWidth + radM.width + rightPad;
      const ascent = radM.ascent + topPad + 3;
      const descent = radM.descent + 2;

      return {
        width: totalWidth,
        ascent,
        descent,
        draw: (c, x, baselineY, color) => {
          const hookStartX = x + degWidth;
          const radStartX = hookStartX + hookWidth;
          const topBarY = baselineY - radM.ascent - topPad;
          const bottomHookY = baselineY + radM.descent * 0.75;
          const midHookY = baselineY - radM.ascent * 0.25;

          if (degM) {
            degM.draw(c, x + 1, midHookY - 2, color);
          }

          c.save();
          c.strokeStyle = color;
          c.lineWidth = Math.max(1.5, fontSize * 0.068);
          c.lineCap = "round";
          c.lineJoin = "round";
          c.beginPath();
          // Small left tick of radical
          c.moveTo(hookStartX + 1, midHookY + 3);
          c.lineTo(hookStartX + hookWidth * 0.22, midHookY);
          // Down to bottom V apex
          c.lineTo(hookStartX + hookWidth * 0.52, bottomHookY);
          // Up to top-left of radicand
          c.lineTo(radStartX - 1, topBarY);
          // Horizontal vinculum bar across entire radicand
          c.lineTo(radStartX + radM.width + rightPad * 0.6, topBarY);
          c.stroke();
          c.restore();

          radM.draw(c, radStartX, baselineY, color);
        },
      };
    }

    case "supsub": {
      const baseM = layoutMathNode(ctx, node.base, fontSize);
      const scriptSize = Math.max(10, Math.round(fontSize * 0.68));
      const supM = node.sup ? layoutMathNode(ctx, node.sup, scriptSize) : null;
      const subM = node.sub ? layoutMathNode(ctx, node.sub, scriptSize) : null;

      if (node.limitsBelowAbove) {
        const maxW = Math.max(baseM.width, supM?.width || 0, subM?.width || 0) + 4;
        const supHeight = supM ? supM.ascent + supM.descent + 2 : 0;
        const subHeight = subM ? subM.ascent + subM.descent + 2 : 0;
        return {
          width: maxW,
          ascent: baseM.ascent + supHeight,
          descent: baseM.descent + subHeight,
          draw: (c, x, baselineY, color) => {
            const bx = x + (maxW - baseM.width) / 2;
            baseM.draw(c, bx, baselineY, color);
            if (supM) {
              const sx = x + (maxW - supM.width) / 2;
              supM.draw(c, sx, baselineY - baseM.ascent - supM.descent - 1, color);
            }
            if (subM) {
              const sbx = x + (maxW - subM.width) / 2;
              subM.draw(c, sbx, baselineY + baseM.descent + subM.ascent + 2, color);
            }
          },
        };
      }

      const scriptW = Math.max(supM?.width || 0, subM?.width || 0);
      const supShiftUp = Math.max(fontSize * 0.38, baseM.ascent - scriptSize * 0.32);
      const subShiftDown = Math.max(fontSize * 0.24, baseM.descent + scriptSize * 0.25);

      const ascent = Math.max(baseM.ascent, supM ? supShiftUp + supM.ascent : 0);
      const descent = Math.max(baseM.descent, subM ? subShiftDown + subM.descent : 0);

      return {
        width: baseM.width + scriptW + fontSize * 0.06,
        ascent,
        descent,
        draw: (c, x, baselineY, color) => {
          baseM.draw(c, x, baselineY, color);
          const sx = x + baseM.width + 1;
          if (supM) {
            supM.draw(c, sx, baselineY - supShiftUp, color);
          }
          if (subM) {
            subM.draw(c, sx, baselineY + subShiftDown, color);
          }
        },
      };
    }

    case "accent": {
      const baseM = layoutMathNode(ctx, node.base, fontSize);
      const extraTop = fontSize * 0.28;
      return {
        width: baseM.width + 2,
        ascent: baseM.ascent + extraTop,
        descent: baseM.descent,
        draw: (c, x, baselineY, color) => {
          baseM.draw(c, x, baselineY, color);
          const topY = baselineY - baseM.ascent - 3;
          c.save();
          c.strokeStyle = color;
          c.fillStyle = color;
          c.lineWidth = Math.max(1.3, fontSize * 0.06);

          if (node.kind === "vec") {
            const x1 = x + 1;
            const x2 = x + Math.max(8, baseM.width - 1);
            c.beginPath();
            c.moveTo(x1, topY);
            c.lineTo(x2, topY);
            c.lineTo(x2 - 4, topY - 3);
            c.moveTo(x2, topY);
            c.lineTo(x2 - 4, topY + 3);
            c.stroke();
          } else if (node.kind === "bar") {
            c.beginPath();
            c.moveTo(x + 1, topY);
            c.lineTo(x + baseM.width - 1, topY);
            c.stroke();
          } else if (node.kind === "hat") {
            const mid = x + baseM.width / 2;
            c.beginPath();
            c.moveTo(x + 2, topY + 2);
            c.lineTo(mid, topY - 3);
            c.lineTo(x + baseM.width - 2, topY + 2);
            c.stroke();
          } else if (node.kind === "dot") {
            c.beginPath();
            c.arc(x + baseM.width / 2, topY, Math.max(1.5, fontSize * 0.06), 0, Math.PI * 2);
            c.fill();
          }
          c.restore();
        },
      };
    }

    case "delim": {
      const innerM = layoutMathNode(ctx, node.inner, fontSize);
      const bracketW = fontSize * 0.36;
      const pad = 2;
      const totalW =
        (node.left ? bracketW : 0) + innerM.width + (node.right ? bracketW : 0) + pad * 2;
      const ascent = Math.max(innerM.ascent + 3, fontSize * 0.8);
      const descent = Math.max(innerM.descent + 3, fontSize * 0.25);

      return {
        width: totalW,
        ascent,
        descent,
        draw: (c, x, baselineY, color) => {
          const topY = baselineY - ascent + 2;
          const botY = baselineY + descent - 2;
          const midY = (topY + botY) / 2;

          c.save();
          c.strokeStyle = color;
          c.lineWidth = Math.max(1.5, fontSize * 0.065);

          let curX = x + pad;
          if (node.left) {
            drawDelimiterGlyph(c, node.left, curX, topY, botY, midY, bracketW, true);
            curX += bracketW;
          }

          innerM.draw(c, curX, baselineY, color);
          curX += innerM.width;

          if (node.right) {
            drawDelimiterGlyph(c, node.right, curX, topY, botY, midY, bracketW, false);
          }
          c.restore();
        },
      };
    }

    case "matrix": {
      const cellSize = Math.max(12, Math.round(fontSize * 0.88));
      const numRows = node.rows.length;
      const numCols = node.rows.reduce((max, r) => Math.max(max, r.length), 0);
      if (numRows === 0 || numCols === 0) {
        return { width: 0, ascent: fontSize * 0.7, descent: fontSize * 0.2, draw: () => {} };
      }

      const cellMetrics: MathBoxMetrics[][] = node.rows.map((r) =>
        r.map((cell) => layoutMathNode(ctx, cell, cellSize))
      );

      const colWidths = new Array(numCols).fill(0);
      const rowAscents = new Array(numRows).fill(cellSize * 0.75);
      const rowDescents = new Array(numRows).fill(cellSize * 0.25);

      for (let r = 0; r < numRows; r++) {
        for (let col = 0; col < cellMetrics[r].length; col++) {
          const m = cellMetrics[r][col];
          colWidths[col] = Math.max(colWidths[col], m.width);
          rowAscents[r] = Math.max(rowAscents[r], m.ascent);
          rowDescents[r] = Math.max(rowDescents[r], m.descent);
        }
      }

      const colGap = fontSize * 0.55;
      const rowGap = fontSize * 0.32;
      const gridWidth =
        colWidths.reduce((a, b) => a + b, 0) + Math.max(0, numCols - 1) * colGap;
      const gridHeight =
        rowAscents.reduce((a, b) => a + b, 0) +
        rowDescents.reduce((a, b) => a + b, 0) +
        Math.max(0, numRows - 1) * rowGap;

      const bracketW = node.bracket === "none" ? 0 : fontSize * 0.42;
      const rightBracketW =
        node.bracket === "none" || node.bracket === "cases" ? 0 : fontSize * 0.42;
      const totalW = bracketW + gridWidth + rightBracketW + 8;

      const ascent = gridHeight / 2 + mathAxisOffset + 4;
      const descent = gridHeight / 2 - mathAxisOffset + 4;

      return {
        width: totalW,
        ascent,
        descent,
        draw: (c, x, baselineY, color) => {
          const topY = baselineY - ascent + 3;
          const botY = baselineY + descent - 3;
          const midY = (topY + botY) / 2;

          c.save();
          c.strokeStyle = color;
          c.lineWidth = Math.max(1.5, fontSize * 0.065);

          if (node.bracket !== "none") {
            const leftChar =
              node.bracket === "p"
                ? "("
                : node.bracket === "b"
                ? "["
                : node.bracket === "v"
                ? "|"
                : "{";
            drawDelimiterGlyph(c, leftChar, x + 2, topY, botY, midY, bracketW, true);
          }

          let curY = topY + 2;
          for (let r = 0; r < numRows; r++) {
            const rowBaseY = curY + rowAscents[r];
            let curX = x + bracketW + 4;
            for (let col = 0; col < cellMetrics[r].length; col++) {
              const cellM = cellMetrics[r][col];
              const cellX =
                node.bracket === "cases"
                  ? curX
                  : curX + (colWidths[col] - cellM.width) / 2;
              cellM.draw(c, cellX, rowBaseY, color);
              curX += colWidths[col] + colGap;
            }
            curY += rowAscents[r] + rowDescents[r] + rowGap;
          }

          if (node.bracket !== "none" && node.bracket !== "cases") {
            const rightChar =
              node.bracket === "p"
                ? ")"
                : node.bracket === "b"
                ? "]"
                : node.bracket === "v"
                ? "|"
                : "}";
            drawDelimiterGlyph(
              c,
              rightChar,
              x + bracketW + gridWidth + 4,
              topY,
              botY,
              midY,
              rightBracketW,
              false
            );
          }
          c.restore();
        },
      };
    }
  }
}

function drawDelimiterGlyph(
  ctx: CanvasRenderingContext2D,
  delim: string,
  x: number,
  topY: number,
  botY: number,
  midY: number,
  w: number,
  isLeft: boolean
) {
  ctx.beginPath();
  if (delim === "(" || delim === ")") {
    const edgeX = isLeft ? x + w * 0.85 : x + w * 0.15;
    const curveX = isLeft ? x + w * 0.05 : x + w * 0.95;
    ctx.moveTo(edgeX, topY);
    ctx.quadraticCurveTo(curveX, midY, edgeX, botY);
  } else if (delim === "[" || delim === "]") {
    const spineX = isLeft ? x + w * 0.25 : x + w * 0.75;
    const tipX = isLeft ? x + w * 0.85 : x + w * 0.15;
    ctx.moveTo(tipX, topY);
    ctx.lineTo(spineX, topY);
    ctx.lineTo(spineX, botY);
    ctx.lineTo(tipX, botY);
  } else if (delim === "|") {
    const midX = x + w * 0.5;
    ctx.moveTo(midX, topY);
    ctx.lineTo(midX, botY);
  } else if (delim === "{" || delim === "}") {
    const tipX = isLeft ? x + w * 0.85 : x + w * 0.15;
    const spineX = x + w * 0.5;
    const pointX = isLeft ? x + w * 0.15 : x + w * 0.85;
    ctx.moveTo(tipX, topY);
    ctx.quadraticCurveTo(spineX, topY, spineX, topY + 6);
    ctx.lineTo(spineX, midY - 5);
    ctx.lineTo(pointX, midY);
    ctx.lineTo(spineX, midY + 5);
    ctx.lineTo(spineX, botY - 6);
    ctx.quadraticCurveTo(spineX, botY, tipX, botY);
  }
  ctx.stroke();
}

// ============================================================================
// 2. MIXED BENGALI + INLINE MATH WORD-WRAPPING LAYOUT ENGINE
// ============================================================================

type InlineToken =
  | { kind: "word"; text: string; isBold?: boolean }
  | { kind: "math"; latex: string }
  | { kind: "newline" };

/**
 * Splits a rich Bengali/English paragraph containing $...$ or $$...$$ or raw LaTeX into inline tokens
 */
function tokenizeMixedParagraph(rawText: string): InlineToken[] {
  if (!rawText) return [];
  const normalized = rawText
    .replace(/\r\n/g, "\n")
    .replace(/\\\[([\s\S]*?)\\\]/g, "$$$1$$")
    .replace(/\\\(([\s\S]*?)\\\)/g, "$$$1$$");

  // Split by $$...$$ or $...$
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g;
  const parts = normalized.split(mathRegex);
  const tokens: InlineToken[] = [];

  for (const part of parts) {
    if (!part) continue;
    if (
      (part.startsWith("$$") && part.endsWith("$$")) ||
      (part.startsWith("$") && part.endsWith("$"))
    ) {
      const inner = stripOuterMathDelimiters(part);
      if (inner) {
        tokens.push({ kind: "math", latex: inner });
      }
      continue;
    }

    // If a plain segment itself has heavy raw LaTeX commands without $ delimiters
    if (/\\(?:frac|dfrac|sqrt|int|sum|lim|vec|rightarrow|times|alpha|beta|theta)\b/.test(part)) {
      tokens.push({ kind: "math", latex: part.trim() });
      continue;
    }

    const lines = part.split("\n");
    lines.forEach((line, lineIdx) => {
      if (lineIdx > 0) tokens.push({ kind: "newline" });
      const cleanLine = line.replace(/\*\*(.*?)\*\*/g, "$1");
      const words = cleanLine.split(/(\s+)/);
      for (const w of words) {
        if (!w) continue;
        tokens.push({ kind: "word", text: w });
      }
    });
  }

  return tokens;
}

interface WrappedLineItem {
  x: number;
  width: number;
  ascent: number;
  descent: number;
  draw: (ctx: CanvasRenderingContext2D, baseX: number, baselineY: number, color: string) => void;
}

interface WrappedLine {
  items: WrappedLineItem[];
  width: number;
  ascent: number;
  descent: number;
}

export function layoutMixedParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: "500" | "600" | "700" = "500"
): {
  lines: WrappedLine[];
  totalHeight: number;
  draw: (ctx: CanvasRenderingContext2D, x: number, topY: number, color: string) => void;
} {
  const tokens = tokenizeMixedParagraph(text);
  const lines: WrappedLine[] = [];

  let currentItems: WrappedLineItem[] = [];
  let curX = 0;
  let lineAscent = fontSize * 0.85;
  let lineDescent = fontSize * 0.3;

  const flushLine = () => {
    lines.push({
      items: currentItems,
      width: curX,
      ascent: lineAscent,
      descent: lineDescent,
    });
    currentItems = [];
    curX = 0;
    lineAscent = fontSize * 0.85;
    lineDescent = fontSize * 0.3;
  };

  const fontSpec = `${fontWeight} ${fontSize}px ${FONT_BENGALI_SANS}`;

  for (const tok of tokens) {
    if (tok.kind === "newline") {
      flushLine();
      continue;
    }

    if (tok.kind === "word") {
      // Skip leading whitespace at the start of a wrapped line
      if (curX === 0 && /^\s+$/.test(tok.text)) continue;

      ctx.save();
      ctx.font = fontSpec;
      const w = ctx.measureText(tok.text).width;
      ctx.restore();

      if (curX + w > maxWidth && curX > 0 && !/^\s+$/.test(tok.text)) {
        flushLine();
      }

      const itemX = curX;
      const wordText = tok.text;
      currentItems.push({
        x: itemX,
        width: w,
        ascent: fontSize * 0.85,
        descent: fontSize * 0.28,
        draw: (c, baseX, baselineY, color) => {
          c.save();
          c.font = fontSpec;
          c.fillStyle = color;
          c.fillText(wordText, baseX + itemX, baselineY);
          c.restore();
        },
      });
      curX += w;
    } else if (tok.kind === "math") {
      const ast = parseLatexToAst(tok.latex);
      let mathBox = layoutMathNode(ctx, ast, Math.round(fontSize * 1.05));

      // Scale down inline math if wider than maxWidth
      if (mathBox.width > maxWidth - 8) {
        const scale = (maxWidth - 12) / mathBox.width;
        mathBox = layoutMathNode(ctx, ast, Math.max(11, Math.round(fontSize * scale)));
      }

      if (curX + mathBox.width + 6 > maxWidth && curX > 0) {
        flushLine();
      }

      const itemX = curX + 3;
      const capturedBox = mathBox;
      currentItems.push({
        x: itemX,
        width: capturedBox.width + 6,
        ascent: capturedBox.ascent + 2,
        descent: capturedBox.descent + 2,
        draw: (c, baseX, baselineY, color) => {
          capturedBox.draw(c, baseX + itemX, baselineY, color);
        },
      });
      curX += capturedBox.width + 6;
      lineAscent = Math.max(lineAscent, capturedBox.ascent + 3);
      lineDescent = Math.max(lineDescent, capturedBox.descent + 3);
    }
  }

  if (currentItems.length > 0 || lines.length === 0) {
    flushLine();
  }

  const lineGap = Math.round(fontSize * 0.34);
  let totalHeight = 0;
  lines.forEach((ln, idx) => {
    totalHeight += ln.ascent + ln.descent + (idx < lines.length - 1 ? lineGap : 0);
  });

  return {
    lines,
    totalHeight,
    draw: (c, x, topY, color) => {
      let y = topY;
      lines.forEach((ln) => {
        const baselineY = y + ln.ascent;
        for (const item of ln.items) {
          item.draw(c, x, baselineY, color);
        }
        y += ln.ascent + ln.descent + lineGap;
      });
    },
  };
}

/**
 * Layouts a standalone display equation block (centered or left-aligned, auto-wrapping if very long)
 */
function layoutDisplayEquation(
  ctx: CanvasRenderingContext2D,
  latexRaw: string,
  maxWidth: number,
  baseFontSize = 24
): {
  height: number;
  width: number;
  draw: (c: CanvasRenderingContext2D, x: number, topY: number, color: string) => void;
} {
  const clean = stripOuterMathDelimiters(latexRaw);
  const ast = parseLatexToAst(clean);
  let box = layoutMathNode(ctx, ast, baseFontSize);

  if (box.width > maxWidth - 24 && box.width > 0) {
    const scaledFont = Math.max(13, Math.floor((baseFontSize * (maxWidth - 24)) / box.width));
    box = layoutMathNode(ctx, ast, scaledFont);
  }

  const height = box.ascent + box.descent + 12;
  return {
    height,
    width: Math.min(maxWidth, box.width),
    draw: (c, x, topY, color) => {
      const baselineY = topY + 6 + box.ascent;
      box.draw(c, x, baselineY, color);
    },
  };
}

// ============================================================================
// 3. MULTI-PAGE A4 CANVAS DOCUMENT BUILDER & GUARANTEED PDF DOWNLOADER
// ============================================================================

const PAGE_W = 1240; // A4 width at 150 DPI
const PAGE_H = 1754; // A4 height at 150 DPI
const MARGIN_X = 64;
const CONTENT_W = PAGE_W - MARGIN_X * 2;
const PAGE_TOP_START = 148;
const PAGE_BOTTOM_LIMIT = PAGE_H - 92;

function createBlankA4PageCanvas(
  docTitle: string,
  docBadge: string
): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext("2d")!;

  // Crisp Warm-White Paper Background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);

  // Subtle Page Border
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, PAGE_W - 48, PAGE_H - 48);

  // Top Header Strip
  ctx.fillStyle = "#0F172A";
  ctx.fillRect(24, 24, PAGE_W - 48, 86);

  // Accent Gold/Orange Line under Header
  ctx.fillStyle = "#F97316";
  ctx.fillRect(24, 110, PAGE_W - 48, 5);

  // Brand Title
  ctx.fillStyle = "#FEF08A";
  ctx.font = `800 16px ${FONT_BENGALI_SANS}`;
  ctx.fillText("STUDY STRANGER PRO  •  WBCHSE CLASS 12 OFFICIAL ACADEMIC SHEET", MARGIN_X, 58);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 22px ${FONT_BENGALI_SANS}`;
  ctx.fillText(docTitle.slice(0, 68), MARGIN_X, 92);

  // Right Date & Badge
  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  ctx.font = `700 15px ${FONT_BENGALI_SANS}`;
  ctx.fillStyle = "#CBD5E1";
  const rightText = `${docBadge}  |  ${dateStr}`;
  const rw = ctx.measureText(rightText).width;
  ctx.fillText(rightText, PAGE_W - MARGIN_X - rw, 58);

  return { canvas, ctx };
}

function stampPageFooters(pages: HTMLCanvasElement[], footerLabel: string) {
  const total = pages.length;
  pages.forEach((canvas, idx) => {
    const ctx = canvas.getContext("2d")!;
    const footerY = PAGE_H - 48;

    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(MARGIN_X, footerY - 22);
    ctx.lineTo(PAGE_W - MARGIN_X, footerY - 22);
    ctx.stroke();

    ctx.fillStyle = "#64748B";
    ctx.font = `600 15px ${FONT_BENGALI_SANS}`;
    ctx.fillText(footerLabel, MARGIN_X, footerY);

    const pageStr = `Page ${idx + 1} of ${total}`;
    const pw = ctx.measureText(pageStr).width;
    ctx.fillStyle = "#0F172A";
    ctx.font = `700 15px ${FONT_BENGALI_SANS}`;
    ctx.fillText(pageStr, PAGE_W - MARGIN_X - pw, footerY);
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string,
  stroke?: string,
  lineWidth = 2
) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

async function loadImageElement(src: string): Promise<HTMLImageElement | null> {
  if (!src) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Converts rendered A4 canvases into a high-resolution PDF Blob & DataURL and triggers download
 */
export function buildAndDownloadPdfFromCanvases(
  pages: HTMLCanvasElement[],
  fileName: string,
  triggerDownload = true
): { blob: Blob; dataUrl: string } {
  const cleanFileName = fileName.toLowerCase().endsWith(".pdf") ? fileName : `${fileName}.pdf`;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
    compress: true,
  });

  const pdfW = pdf.internal.pageSize.getWidth(); // 595.28 pt
  const pdfH = pdf.internal.pageSize.getHeight(); // 841.89 pt

  pages.forEach((canvas, idx) => {
    if (idx > 0) pdf.addPage();
    const pageJpeg = canvas.toDataURL("image/jpeg", 0.96);
    pdf.addImage(pageJpeg, "JPEG", 0, 0, pdfW, pdfH, undefined, "FAST");
  });

  const arrayBuffer = pdf.output("arraybuffer");
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const dataUrl = pdf.output("datauristring");

  if (triggerDownload && typeof window !== "undefined") {
    forceBrowserBlobDownload(blob, cleanFileName);
  }

  return { blob, dataUrl };
}

/**
 * Guaranteed cross-browser & sandboxed-iframe safe Blob download helper
 */
export function forceBrowserBlobDownload(blob: Blob, fileName: string) {
  try {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      try {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      } catch {}
    }, 60000);
  } catch (err) {
    console.error("Blob download error:", err);
  }
}

// ============================================================================
// 4. MATH LAB STEP-BY-STEP SOLUTION PDF & PNG EXPORTER
// ============================================================================

export async function renderMathSolutionPages(
  payload: MathPdfExportPayload
): Promise<HTMLCanvasElement[]> {
  if (typeof document !== "undefined" && (document as any).fonts?.ready) {
    try {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((r) => setTimeout(r, 800)),
      ]);
    } catch {}
  }

  const docTitle = payload.title || "WBCHSE Class 12 Sem 4 — Math Lab Master Solution";
  const docBadge = payload.subtitle || `Student: ${payload.userName || "Student"}`;

  const pages: HTMLCanvasElement[] = [];
  let { canvas: curCanvas, ctx } = createBlankA4PageCanvas(docTitle, docBadge);
  pages.push(curCanvas);
  let cursorY = PAGE_TOP_START;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > PAGE_BOTTOM_LIMIT && cursorY > PAGE_TOP_START + 20) {
      const next = createBlankA4PageCanvas(docTitle, docBadge);
      curCanvas = next.canvas;
      ctx = next.ctx;
      pages.push(curCanvas);
      cursorY = PAGE_TOP_START;
    }
  };

  // Optional Uploaded Problem Image
  if (payload.problemImageDataUrl) {
    const imgEl = await loadImageElement(payload.problemImageDataUrl);
    if (imgEl && imgEl.width > 0 && imgEl.height > 0) {
      const maxImgW = CONTENT_W - 48;
      const maxImgH = 280;
      const scale = Math.min(1, maxImgW / imgEl.width, maxImgH / imgEl.height);
      const drawW = Math.round(imgEl.width * scale);
      const drawH = Math.round(imgEl.height * scale);
      const cardH = drawH + 58;

      ensureSpace(cardH);
      drawRoundedRect(ctx, MARGIN_X, cursorY, CONTENT_W, cardH, 16, "#F8FAFC", "#CBD5E1", 2);
      ctx.fillStyle = "#475569";
      ctx.font = `700 16px ${FONT_BENGALI_SANS}`;
      ctx.fillText("📸 প্রদত্ত প্রশ্নের ছবি (Uploaded Problem Sheet):", MARGIN_X + 22, cursorY + 30);
      ctx.drawImage(imgEl, MARGIN_X + 24, cursorY + 42, drawW, drawH);
      cursorY += cardH + 22;
    }
  }

  // Render Each Question sequentially
  for (let qIdx = 0; qIdx < payload.questions.length; qIdx++) {
    const q = payload.questions[qIdx];

    // 1. Question Header & Statement Box
    const qTitle = q.questionTitle || `প্রশ্ন ${q.questionNumber || qIdx + 1} (Question ${qIdx + 1})`;
    const qStatement = q.questionText || payload.problemText || "";
    const qStmtLayout = qStatement
      ? layoutMixedParagraph(ctx, qStatement, CONTENT_W - 56, 22, "700")
      : null;

    const qHeaderH = 54 + (qStmtLayout ? qStmtLayout.totalHeight + 24 : 0);
    ensureSpace(qHeaderH);

    drawRoundedRect(ctx, MARGIN_X, cursorY, CONTENT_W, qHeaderH, 16, "#EEF2FF", "#6366F1", 2.5);
    ctx.fillStyle = "#312E81";
    ctx.font = `800 20px ${FONT_BENGALI_SANS}`;
    ctx.fillText(`📌 ${qTitle}`, MARGIN_X + 24, cursorY + 34);

    if (qStmtLayout) {
      qStmtLayout.draw(ctx, MARGIN_X + 28, cursorY + 50, "#0F172A");
    }
    cursorY += qHeaderH + 18;

    // 2. Analysis Card (প্রাথমিক বিশ্লেষণ ও সূত্র)
    if (q.analysis) {
      const analysisLayout = layoutMixedParagraph(ctx, q.analysis, CONTENT_W - 56, 20, "500");
      const analysisCardH = analysisLayout.totalHeight + 68;
      ensureSpace(analysisCardH);

      drawRoundedRect(
        ctx,
        MARGIN_X,
        cursorY,
        CONTENT_W,
        analysisCardH,
        16,
        "#FFFBEB",
        "#F59E0B",
        2
      );
      ctx.fillStyle = "#B45309";
      ctx.font = `800 17px ${FONT_BENGALI_SANS}`;
      ctx.fillText(
        "💡 প্রাথমিক বিশ্লেষণ ও ব্যবহৃত সূত্র (Concept & Formula Analysis):",
        MARGIN_X + 24,
        cursorY + 32
      );
      analysisLayout.draw(ctx, MARGIN_X + 28, cursorY + 48, "#1E293B");
      cursorY += analysisCardH + 20;
    }

    // 3. Step-by-Step Solution Cards
    for (let sIdx = 0; sIdx < q.steps.length; sIdx++) {
      const st = q.steps[sIdx];
      const eqLayout = layoutDisplayEquation(ctx, st.step, CONTENT_W - 88, 25);
      const expLayout = st.explanation
        ? layoutMixedParagraph(ctx, st.explanation, CONTENT_W - 64, 19, "500")
        : null;

      const eqBoxH = eqLayout.height + 24;
      const stepCardH =
        54 + eqBoxH + (expLayout ? expLayout.totalHeight + 28 : 14) + 16;

      ensureSpace(stepCardH);

      // Outer Step Card
      drawRoundedRect(
        ctx,
        MARGIN_X,
        cursorY,
        CONTENT_W,
        stepCardH,
        18,
        "#F8FAFC",
        "#CBD5E1",
        2
      );

      // Step Badge Pill
      drawRoundedRect(
        ctx,
        MARGIN_X + 22,
        cursorY + 14,
        165,
        30,
        10,
        "#4F46E5"
      );
      ctx.fillStyle = "#FFFFFF";
      ctx.font = `800 15px ${FONT_BENGALI_SANS}`;
      ctx.fillText(`ধাপ ${sIdx + 1}  •  STEP 0${sIdx + 1}`, MARGIN_X + 36, cursorY + 35);

      // White Equation Plate inside Step Card
      const eqBoxY = cursorY + 54;
      drawRoundedRect(
        ctx,
        MARGIN_X + 22,
        eqBoxY,
        CONTENT_W - 44,
        eqBoxH,
        14,
        "#FFFFFF",
        "#E2E8F0",
        1.5
      );
      eqLayout.draw(ctx, MARGIN_X + 44, eqBoxY + 12, "#0F172A");

      // Bengali Teacher Explanation below Equation
      if (expLayout) {
        const expY = eqBoxY + eqBoxH + 14;
        expLayout.draw(ctx, MARGIN_X + 28, expY, "#334155");
      }

      cursorY += stepCardH + 16;
    }

    // 4. Final Answer Card (চূড়ান্ত উত্তর)
    if (q.finalAnswer) {
      const ansEqLayout = layoutDisplayEquation(ctx, q.finalAnswer, CONTENT_W - 88, 28);
      const ansCardH = Math.max(96, ansEqLayout.height + 68);

      ensureSpace(ansCardH);

      drawRoundedRect(
        ctx,
        MARGIN_X,
        cursorY,
        CONTENT_W,
        ansCardH,
        18,
        "#ECFDF5",
        "#10B981",
        3
      );

      ctx.fillStyle = "#047857";
      ctx.font = `800 18px ${FONT_BENGALI_SANS}`;
      ctx.fillText("✅ চূড়ান্ত উত্তর (Verified Final Answer):", MARGIN_X + 26, cursorY + 34);

      ansEqLayout.draw(ctx, MARGIN_X + 34, cursorY + 46, "#064E3B");
      cursorY += ansCardH + 28;
    }
  }

  // 5. Optional Follow-up Doubts Section
  if (payload.followUps && payload.followUps.length > 0) {
    for (let fIdx = 0; fIdx < payload.followUps.length; fIdx++) {
      const f = payload.followUps[fIdx];
      const qLayout = layoutMixedParagraph(
        ctx,
        `প্রশ্ন: ${f.q}`,
        CONTENT_W - 56,
        19,
        "700"
      );
      const aLayout = layoutMixedParagraph(
        ctx,
        `উত্তর: ${f.a}`,
        CONTENT_W - 56,
        19,
        "500"
      );
      const fCardH = 52 + qLayout.totalHeight + aLayout.totalHeight + 32;

      ensureSpace(fCardH);
      drawRoundedRect(
        ctx,
        MARGIN_X,
        cursorY,
        CONTENT_W,
        fCardH,
        16,
        "#FAF5FF",
        "#A855F7",
        2
      );
      ctx.fillStyle = "#6B21A8";
      ctx.font = `800 16px ${FONT_BENGALI_SANS}`;
      ctx.fillText(
        `💬 অতিরিক্ত ডাউট ও ব্যাখ্যা (Follow-up Clarification #${fIdx + 1}):`,
        MARGIN_X + 24,
        cursorY + 30
      );
      qLayout.draw(ctx, MARGIN_X + 26, cursorY + 46, "#1E1B4B");
      aLayout.draw(ctx, MARGIN_X + 26, cursorY + 56 + qLayout.totalHeight, "#334155");
      cursorY += fCardH + 18;
    }
  }

  stampPageFooters(
    pages,
    "WBCHSE Semester IV Official Answer Key • High-Precision LaTeX & Bengali Typesetting"
  );
  return pages;
}

export async function exportMathSolutionToPdf(
  payload: MathPdfExportPayload,
  triggerDownload = true
): Promise<{ blob: Blob; dataUrl: string }> {
  const pages = await renderMathSolutionPages(payload);
  const fileName =
    payload.fileName || `StudyStranger_Sem4_Math_Solution_${Date.now().toString().slice(-5)}.pdf`;
  return buildAndDownloadPdfFromCanvases(pages, fileName, triggerDownload);
}

export async function exportMathSolutionToPng(payload: MathPdfExportPayload): Promise<void> {
  const pages = await renderMathSolutionPages(payload);
  if (pages.length === 0) return;

  // Combine pages vertically if multiple, or export single high-res PNG
  const totalH = pages.length * PAGE_H;
  const stitched = document.createElement("canvas");
  stitched.width = PAGE_W;
  stitched.height = totalH;
  const sCtx = stitched.getContext("2d")!;
  pages.forEach((p, idx) => {
    sCtx.drawImage(p, 0, idx * PAGE_H);
  });

  stitched.toBlob((blob) => {
    if (blob) {
      forceBrowserBlobDownload(
        blob,
        `StudyStranger_Math_Solution_${Date.now().toString().slice(-5)}.png`
      );
    }
  }, "image/png");
}

// ============================================================================
// 5. GENERAL BENGALI + MATH DOCUMENT EXPORTER (FOR DOUBT SOLVER, SCANNER, MOCK)
// ============================================================================

export async function exportRichDocumentToPdf(
  payload: RichDocumentPdfPayload,
  triggerDownload = true
): Promise<{ blob: Blob; dataUrl: string }> {
  if (typeof document !== "undefined" && (document as any).fonts?.ready) {
    try {
      await Promise.race([
        (document as any).fonts.ready,
        new Promise((r) => setTimeout(r, 800)),
      ]);
    } catch {}
  }

  const docTitle = payload.title || "WBCHSE Class 12 Academic Study Sheet";
  const docBadge = payload.subject || payload.subtitle || "WBCHSE Study Vault";

  const pages: HTMLCanvasElement[] = [];
  let { canvas: curCanvas, ctx } = createBlankA4PageCanvas(docTitle, docBadge);
  pages.push(curCanvas);
  let cursorY = PAGE_TOP_START;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > PAGE_BOTTOM_LIMIT && cursorY > PAGE_TOP_START + 20) {
      const next = createBlankA4PageCanvas(docTitle, docBadge);
      curCanvas = next.canvas;
      ctx = next.ctx;
      pages.push(curCanvas);
      cursorY = PAGE_TOP_START;
    }
  };

  if (payload.headerImageDataUrl) {
    const imgEl = await loadImageElement(payload.headerImageDataUrl);
    if (imgEl && imgEl.width > 0 && imgEl.height > 0) {
      const maxW = CONTENT_W - 48;
      const maxH = 260;
      const scale = Math.min(1, maxW / imgEl.width, maxH / imgEl.height);
      const dw = Math.round(imgEl.width * scale);
      const dh = Math.round(imgEl.height * scale);
      const cardH = dh + 48;
      ensureSpace(cardH);
      drawRoundedRect(ctx, MARGIN_X, cursorY, CONTENT_W, cardH, 16, "#F8FAFC", "#CBD5E1", 2);
      ctx.drawImage(imgEl, MARGIN_X + 24, cursorY + 24, dw, dh);
      cursorY += cardH + 20;
    }
  }

  const palette = {
    indigo: { bg: "#EEF2FF", border: "#6366F1", title: "#312E81" },
    emerald: { bg: "#ECFDF5", border: "#10B981", title: "#065F46" },
    amber: { bg: "#FFFBEB", border: "#F59E0B", title: "#92400E" },
    rose: { bg: "#FFF1F2", border: "#F43F5E", title: "#9F1239" },
    slate: { bg: "#F8FAFC", border: "#CBD5E1", title: "#0F172A" },
  };

  for (const sec of payload.sections) {
    const colors = palette[sec.accentColor || "slate"];
    const paragraphs = (sec.body || "").split(/\n{2,}/);

    // If section is short enough to fit in a single card, render as a unified card;
    // if very long, split paragraphs across cards so it never overflows a page.
    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const paraText = paragraphs[pIdx].trim();
      const showHeader = pIdx === 0 && (sec.heading || sec.badge);
      const showEq = pIdx === 0 && sec.mathEquation;
      const showHighlight = pIdx === paragraphs.length - 1 && sec.highlightBox;

      const bodyLayout = paraText
        ? layoutMixedParagraph(ctx, paraText, CONTENT_W - 56, 20, "500")
        : null;
      const eqLayout = showEq
        ? layoutDisplayEquation(ctx, sec.mathEquation!, CONTENT_W - 80, 24)
        : null;
      const hiLayout = showHighlight
        ? layoutMixedParagraph(ctx, sec.highlightBox!, CONTENT_W - 72, 20, "700")
        : null;

      let cardH = 32;
      if (showHeader) cardH += 38;
      if (eqLayout) cardH += eqLayout.height + 28;
      if (bodyLayout) cardH += bodyLayout.totalHeight + 16;
      if (hiLayout) cardH += hiLayout.totalHeight + 36;

      ensureSpace(cardH);

      drawRoundedRect(
        ctx,
        MARGIN_X,
        cursorY,
        CONTENT_W,
        cardH,
        16,
        colors.bg,
        colors.border,
        2
      );

      let innerY = cursorY + 20;
      if (showHeader) {
        ctx.fillStyle = colors.title;
        ctx.font = `800 20px ${FONT_BENGALI_SANS}`;
        const hTitle = [sec.badge ? `[${sec.badge}]` : "", sec.heading || ""]
          .filter(Boolean)
          .join("  ");
        ctx.fillText(hTitle, MARGIN_X + 24, innerY + 18);
        innerY += 36;
      }

      if (eqLayout) {
        drawRoundedRect(
          ctx,
          MARGIN_X + 24,
          innerY,
          CONTENT_W - 48,
          eqLayout.height + 16,
          12,
          "#FFFFFF",
          "#E2E8F0",
          1.5
        );
        eqLayout.draw(ctx, MARGIN_X + 40, innerY + 8, "#0F172A");
        innerY += eqLayout.height + 28;
      }

      if (bodyLayout) {
        bodyLayout.draw(ctx, MARGIN_X + 28, innerY, "#1E293B");
        innerY += bodyLayout.totalHeight + 14;
      }

      if (hiLayout) {
        drawRoundedRect(
          ctx,
          MARGIN_X + 24,
          innerY,
          CONTENT_W - 48,
          hiLayout.totalHeight + 24,
          12,
          "#ECFDF5",
          "#10B981",
          2
        );
        hiLayout.draw(ctx, MARGIN_X + 36, innerY + 12, "#065F46");
      }

      cursorY += cardH + 16;
    }
  }

  stampPageFooters(
    pages,
    "Study Stranger Pro • Official WBCHSE Bengali & Mathematical PDF Document"
  );

  const fileName = payload.fileName || `StudyStranger_Document_${Date.now().toString().slice(-5)}.pdf`;
  return buildAndDownloadPdfFromCanvases(pages, fileName, triggerDownload);
}
