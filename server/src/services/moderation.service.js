import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const MODEL = "gemini-flash-latest";

const SPAM_KEYWORDS = [
  "buy now",
  "click here",
  "free gift",
  "win prize",
  "limited offer",
  "discount code",
  "sign up",
  "make money fast",
  "cash prize",
  "lottery",
  "viagra",
  "casino",
  "gambling",
];

const URL_PATTERN = /(https?:\/\/|www\.)[^\s]+/i;

const SPAM_CATEGORIES = [
  "irrelevant",
  "promotional",
  "scam",
  "abusive",
  "duplicate",
  "fake",
];

const PROFANITY_PATTERN =
  /\b(ass\b|f\*?ck|s\*?hit|d\*?mn|b\*?tch|d\*?ck|whore|bastard|crap|bull\*?s\*?hit|mother\*?f\*?cker)\b/i;

const gibberishRatio = (text) => {
  const letters = text.replace(/\s+/g, "");
  if (letters.length < 10) return 0;
  let repeated = 0;
  for (let i = 2; i < letters.length; i++) {
    if (
      letters[i] === letters[i - 1] &&
      letters[i] === letters[i - 2]
    ) {
      repeated++;
    }
  }
  return repeated / letters.length;
};

const uppercaseRatio = (text) => {
  const letters = text.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 10) return 0;
  const upper = text.replace(/[^A-Z]/g, "").length;
  return upper / letters.length;
};

const heuristicClassification = ({ title = "", comment = "" }) => {
  const text = `${title} ${comment}`;
  const scoreParts = [];

  if (URL_PATTERN.test(text)) scoreParts.push(0.6);
  if (SPAM_KEYWORDS.some((kw) => text.toLowerCase().includes(kw)))
    scoreParts.push(0.7);
  if (PROFANITY_PATTERN.test(text)) scoreParts.push(0.7);
  if (gibberishRatio(text) > 0.3) scoreParts.push(0.8);
  if (uppercaseRatio(text) > 0.6) scoreParts.push(0.5);

  if (scoreParts.length === 0) {
    return {
      isSpam: false,
      score: 0,
      categories: [],
      reason: "",
      method: "heuristic",
    };
  }

  const score = Math.min(1, Math.max(...scoreParts));
  return {
    isSpam: score >= 0.7,
    score: Math.round(score * 100) / 100,
    categories: ["spam"],
    reason: "Matched heuristic spam signals",
    method: "heuristic",
  };
};

const geminiClassification = async (content) => {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: MODEL });

  const prompt = `You are a content moderator for an e-commerce website called RigCraft.
Classify whether the following user-generated review content is SPAM or legitimate.

A review is SPAM if it is: promotional/advertising, a scam, gibberish, unrelated to the product or website experience, a repeated duplicate, abusive, or contains spam links.

Return a JSON object ONLY (no markdown) with exactly this shape:
{
  "isSpam": boolean,
  "score": number between 0 and 1,
  "categories": ["one or more of: ${SPAM_CATEGORIES.join(", ")}"],
  "reason": "short explanation"
}

Review content:
Title: ${content.title || "(none)"}
Comment: ${content.comment}
`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0,
    },
  });

  const text = result.response.text();
  const parsed = JSON.parse(text);
  return {
    isSpam: !!parsed.isSpam,
    score: Math.min(1, Math.max(0, Number(parsed.score) || 0)),
    categories: Array.isArray(parsed.categories) ? parsed.categories : [],
    reason: parsed.reason || "",
    method: "gemini",
  };
};

export const AUTO_REJECT_THRESHOLD = 0.7;
export const FLAG_THRESHOLD = 0.4;

export const moderateReview = async (content) => {
  let result;

  if (GEMINI_API_KEY) {
    try {
      result = await geminiClassification(content);
    } catch {
      result = heuristicClassification(content);
    }
  } else {
    result = heuristicClassification(content);
  }

  const { score, categories, reason } = result;

  const verdict = {
    spamFlagged: score >= FLAG_THRESHOLD,
    spamScore: score,
    spamReason: reason || (categories.length ? categories.join(", ") : ""),
    categories,
    method: result.method,
  };

  if (score >= AUTO_REJECT_THRESHOLD) {
    verdict.status = "rejected";
  } else {
    verdict.status = null;
  }

  return verdict;
};
