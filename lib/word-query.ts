import { Word } from "@/types/word";
import { saveWord } from "./storage";

export async function queryWord(word: string): Promise<Word | null> {
  try {
    const response = await fetch(`/api/word?word=${encodeURIComponent(word.trim())}`);
    if (!response.ok) {
      throw new Error("查询失败");
    }
    const data = await response.json();
    
    const newWord: Word = {
      id: `${data.word}-${Date.now()}`,
      word: data.word,
      phonetic: data.phonetic,
      meaning: data.meaning,
      example: data.example,
      createdAt: Date.now(),
      detailedInfo: data.detailedInfo,
    };

    // 自动保存到生词本
    await saveWord(newWord);
    
    return newWord;
  } catch (error) {
    console.error("Error fetching word:", error);
    throw error;
  }
}

