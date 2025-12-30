export type WordStatus = "unlearned" | "learned";

export interface Word {
  id: string;
  word: string;
  phonetic?: string;
  meaning: string; // 简单释义（用于记忆卡片）
  example?: string;
  createdAt: number;
  status?: WordStatus; // 默认为 "unlearned"
  // 详细信息（用于首页展示）
  detailedInfo?: {
    partOfSpeech?: string; // 词性
    plural?: string; // 复数形式
    synonyms?: string[]; // 同义词
    root?: string; // 词根
    affix?: string; // 词缀
    detailedMeaning?: string; // 详细释义
  };
}

