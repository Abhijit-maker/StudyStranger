// Telegram Response Formatter, Sanitizer & Mathematical Unicode Formatter
// Converts complex LaTeX math, matrices, chemical formulas, and Markdown into pristine, readable Telegram HTML

export class TelegramFormatter {
  /**
   * Escape HTML special characters for Telegram HTML mode
   */
  public static escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /**
   * Map standard numbers/letters to Unicode Superscripts and Subscripts
   */
  private static toSuperscript(str: string): string {
    const map: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵',
      '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻',
      '=': '⁼', '(': '⁽', ')': '⁾', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 't': 'ᵗ'
    };
    return str.split('').map(c => map[c] || c).join('');
  }

  private static toSubscript(str: string): string {
    const map: Record<string, string> = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅',
      '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋',
      '=': '₌', '(': '₍', ')': '₎', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ',
      'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ',
      'p': 'ₚ', 's': 'ₛ', 't': 'ₜ'
    };
    return str.split('').map(c => map[c] || c).join('');
  }

  /**
   * Convert raw LaTeX expressions into crisp, human-readable Unicode math
   */
  public static formatMathToUnicode(mathStr: string): string {
    if (!mathStr) return '';
    let res = mathStr.trim();

    // Remove bounding dollar signs or bracket delimiters
    res = res.replace(/^\$\$|\$\$$|^\\\[|\\\]$|^\$|\$$/g, '').trim();

    // 1. Fractions: \frac{a}{b} or \dfrac{a}{b}
    let prev = '';
    while (prev !== res) {
      prev = res;
      res = res.replace(/\\(?:d?frac)\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 / $2)');
    }

    // 2. Square roots & n-th roots: \sqrt[n]{x} -> ⁿ√(x), \sqrt{x} -> √(x)
    res = res.replace(/\\sqrt\[([0-9a-zA-Z]+)\]\{([^{}]+)\}/g, (_m, n, inner) => `${this.toSuperscript(n)}√(${inner})`);
    res = res.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
    res = res.replace(/\\sqrt\s*([0-9a-zA-Z]+)/g, '√$1');

    // 3. Greek Letters
    const greek: Record<string, string> = {
      '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\Delta': 'Δ',
      '\\epsilon': 'ε', '\\varepsilon': 'ε', '\\zeta': 'ζ', '\\eta': 'η', '\\theta': 'θ',
      '\\Theta': 'Θ', '\\iota': 'ι', '\\kappa': 'κ', '\\lambda': 'λ', '\\Lambda': 'Λ',
      '\\mu': 'μ', '\\nu': 'ν', '\\xi': 'ξ', '\\Xi': 'Ξ', '\\pi': 'π', '\\Pi': 'Π',
      '\\rho': 'ρ', '\\sigma': 'σ', '\\Sigma': 'Σ', '\\tau': 'τ', '\\upsilon': 'υ',
      '\\phi': 'φ', '\\Phi': 'Φ', '\\chi': 'χ', '\\psi': 'ψ', '\\Psi': 'Ψ',
      '\\omega': 'ω', '\\Omega': 'Ω'
    };
    for (const [k, v] of Object.entries(greek)) {
      res = res.split(k).join(v);
    }

    // 4. Mathematical Operators and Symbols
    const symbols: Record<string, string> = {
      '\\pm': '±', '\\mp': '∓', '\\times': '×', '\\cdot': '·', '\\div': '÷',
      '\\neq': '≠', '\\le': '≤', '\\leq': '≤', '\\ge': '≥', '\\geq': '≥',
      '\\approx': '≈', '\\equiv': '≡', '\\propto': '∝', '\\infty': '∞',
      '\\partial': '∂', '\\nabla': '∇', '\\in': '∈', '\\notin': '∉',
      '\\subset': '⊂', '\\subseteq': '⊆', '\\cup': '∪', '\\cap': '∩',
      '\\forall': '∀', '\\exists': '∃', '\\therefore': '∴', '\\because': '∵',
      '\\rightarrow': '→', '\\to': '→', '\\leftarrow': '←', '\\gets': '←',
      '\\Rightarrow': '⇒', '\\Leftarrow': '⇐', '\\leftrightarrow': '↔', '\\Leftrightarrow': '⇔',
      '\\int': '∫', '\\iint': '∬', '\\iiint': '∭', '\\oint': '∮',
      '\\sum': '∑', '\\prod': '∏', '\\deg': '°', '\\circ': '°',
      '\\angle': '∠', '\\perp': '⊥', '\\parallel': '∥'
    };
    for (const [k, v] of Object.entries(symbols)) {
      res = res.split(k).join(v);
    }

    // 5. Calculus & Notation: \lim_{x \to a} -> lim(x → a), \int_{a}^{b} -> ∫[a → b]
    res = res.replace(/\\lim_\{([^}]+)\}/g, 'lim($1)');
    res = res.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫[$1 to $2]');
    res = res.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑[$1 to $2]');

    // 6. Text in math: \text{...} or \mathrm{...}
    res = res.replace(/\\(?:text|mathrm|mathbf|mathit)\{([^{}]+)\}/g, '$1');

    // 7. Superscripts and Subscripts
    // ^{abc} -> ᵃᵇᶜ, ^2 -> ²
    res = res.replace(/\^\{([^{}]+)\}/g, (_m, inner) => this.toSuperscript(inner));
    res = res.replace(/\^([0-9a-zA-Z+\-=()])/g, (_m, char) => this.toSuperscript(char));
    // _{abc} -> ₐᵦ꜀, _2 -> ₂
    res = res.replace(/_\{([^{}]+)\}/g, (_m, inner) => this.toSubscript(inner));
    res = res.replace(/_([0-9a-zA-Z+\-=()])/g, (_m, char) => this.toSubscript(char));

    // 8. Clean leftover LaTeX brackets, backslashes, and spacing
    res = res.replace(/\\,/g, ' ');
    res = res.replace(/\\;/g, ' ');
    res = res.replace(/\\quad/g, '   ');
    res = res.replace(/\\qquad/g, '      ');
    res = res.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
    res = res.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
    res = res.replace(/\\left\{/g, '{').replace(/\\right\}/g, '}');
    res = res.replace(/\\left\|/g, '|').replace(/\\right\|/g, '|');
    res = res.replace(/\\([a-zA-Z]+)/g, '$1'); // Strip remaining isolated backslashes

    return res.trim();
  }

  /**
   * Format standard markdown and mathematical formulas into safe, beautiful Telegram HTML
   */
  public static toTelegramHtml(markdown: string): string {
    if (!markdown) return '';

    let formatted = markdown;

    // 1. Math block display: $$ math $$ or \[ math \]
    formatted = formatted.replace(/\$\$([\s\S]*?)\$\$/g, (_match, math) => {
      const cleanMath = this.formatMathToUnicode(math);
      return `\n<code>📐 ${this.escapeHtml(cleanMath)}</code>\n`;
    });
    formatted = formatted.replace(/\\\[([\s\S]*?)\\\]/g, (_match, math) => {
      const cleanMath = this.formatMathToUnicode(math);
      return `\n<code>📐 ${this.escapeHtml(cleanMath)}</code>\n`;
    });

    // 2. Inline math: $ math $ or \( math \)
    formatted = formatted.replace(/\$([^\$\n]+)\$/g, (_match, math) => {
      const cleanMath = this.formatMathToUnicode(math);
      return `<code>${this.escapeHtml(cleanMath)}</code>`;
    });
    formatted = formatted.replace(/\\\((.*?)\\\)/g, (_match, math) => {
      const cleanMath = this.formatMathToUnicode(math);
      return `<code>${this.escapeHtml(cleanMath)}</code>`;
    });

    // 3. Code blocks (```lang ... ```)
    formatted = formatted.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (_match, _lang, code) => {
      return `<pre><code>${this.escapeHtml(code.trim())}</code></pre>`;
    });

    // 4. Inline code (`code`)
    formatted = formatted.replace(/`([^`]+)`/g, (_match, code) => {
      return `<code>${this.escapeHtml(code)}</code>`;
    });

    // 5. Bold (**text** or __text__)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
    formatted = formatted.replace(/__([^_]+)__/g, '<b>$1</b>');

    // 6. Headings (# Heading) -> <b>Heading</b>
    formatted = formatted.replace(/^#{1,6}\s*(.+)$/gm, '<b>📌 $1</b>');

    // 7. Bullet lists (* or -)
    formatted = formatted.replace(/^\s*[-*]\s+/gm, '• ');

    // 8. Italic (*text* or _text_)
    formatted = formatted.replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<i>$1</i>');
    formatted = formatted.replace(/(?<!_)_([^_\n]+)_(?!_)/g, '<i>$1</i>');

    // 9. Strike (~text~)
    formatted = formatted.replace(/~([^~]+)~/g, '<s>$1</s>');

    // 10. Truncate cleanly if exceeding Telegram message limit (4096 chars)
    if (formatted.length > 4000) {
      formatted = formatted.slice(0, 3950) + '\n\n<i>...(সম্পূর্ণ দেখতে Web App ওপেন করুন)</i>';
    }

    return formatted;
  }

  /**
   * Format Photo Question Solver Answer for Telegram
   */
  public static formatPhotoSolution(data: {
    subject?: string;
    topic?: string;
    given?: string;
    formula?: string;
    solution: string;
    finalAnswer: string;
  }): string {
    const formattedFormula = data.formula ? this.formatMathToUnicode(data.formula) : '';
    const formattedFinal = this.formatMathToUnicode(data.finalAnswer);

    return `📸 <b>প্রশ্নটির নির্ভুল সমাধান (Problem Solved)</b>\n\n` +
      (data.subject ? `📌 <b>বিষয়:</b> ${this.escapeHtml(data.subject)}\n` : '') +
      (data.topic ? `🏷️ <b>টপিক:</b> ${this.escapeHtml(data.topic)}\n\n` : '\n') +
      (data.given ? `📋 <b>প্রদত্ত তথ্য (Given):</b>\n${this.escapeHtml(data.given)}\n\n` : '') +
      (formattedFormula ? `📐 <b>মূল সূত্র (Formula):</b>\n<code>${this.escapeHtml(formattedFormula)}</code>\n\n` : '') +
      `💡 <b>ধাপে ধাপে বিস্তারিত সমাধান:</b>\n${this.toTelegramHtml(data.solution)}\n\n` +
      `✅ <b>চূড়ান্ত উত্তর (Final Answer):</b>\n<code><b>${this.escapeHtml(formattedFinal)}</b></code>`;
  }

  /**
   * Format Progress Report for Telegram
   */
  public static formatProgress(stats: {
    name: string;
    streak: number;
    questionsSolved: number;
    quizzesCompleted: number;
    accuracy: number;
    xp: number;
    level: number;
    strongTopics: string[];
    revisionTopics: string[];
  }): string {
    return `📊 <b>STUDY STRANGER LIVE PROGRESS — ${this.escapeHtml(stats.name)}</b>\n\n` +
      `🔥 <b>অবিচ্ছিন্ন স্টাডি স্ট্রিক:</b> ${stats.streak} Days\n` +
      `⭐ <b>মোট অর্জিত XP:</b> ${stats.xp} | 🏆 <b>লেভেল:</b> Level ${stats.level}\n` +
      `📚 <b>সমাধানকৃত প্রশ্ন:</b> ${stats.questionsSolved}\n` +
      `🧠 <b>সম্পন্ন মক টেস্ট/কুইজ:</b> ${stats.quizzesCompleted}\n` +
      `🎯 <b>সামগ্রিক নির্ভুলতা:</b> ${stats.accuracy}%\n\n` +
      `💪 <b>শক্তিশালী অধ্যায়সমূহ:</b>\n${stats.strongTopics.map(t => `  • ✅ ${this.escapeHtml(t)}`).join('\n') || '  • নিয়মিত কুইজ সমাধান করে তালিকা দেখুন'}\n\n` +
      `⚠️ <b>পুনরাবৃত্তি প্রয়োজন (Weak Areas):</b>\n${stats.revisionTopics.map(t => `  • ⚠️ ${this.escapeHtml(t)}`).join('\n') || '  • সমস্ত অধ্যায় আপ-টু-ডেট রয়েছে!'}\n\n` +
      `💡 <i>পরামর্শ: দুর্বল বিষয়ে দখল বাড়াতে টেলিগ্রামে /quiz অথবা সরাসরি যেকোনো প্রশ্ন লিখে পাঠান! 🚀</i>`;
  }
}
