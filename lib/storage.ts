import { Word, WordStatus } from "@/types/word";
import { createClient } from "./supabase/client";

// 数据库类型定义
interface DatabaseWord {
  id: string;
  user_id: string;
  word: string;
  definition: string;
  phonetic: string | null;
  example: string | null;
  status: WordStatus;
  detailed_info: any | null;
  created_at: string;
  updated_at: string;
}

// 将数据库记录转换为 Word 类型
function dbWordToWord(dbWord: DatabaseWord): Word {
  return {
    id: dbWord.id,
    word: dbWord.word,
    phonetic: dbWord.phonetic || undefined,
    meaning: dbWord.definition,
    example: dbWord.example || undefined,
    createdAt: new Date(dbWord.created_at).getTime(),
    status: dbWord.status || "unlearned",
    detailedInfo: dbWord.detailed_info || undefined,
  };
}

// 将 Word 类型转换为数据库记录
function wordToDbWord(word: Word, userId: string) {
  return {
    word: word.word,
    definition: word.meaning,
    phonetic: word.phonetic || null,
    example: word.example || null,
    status: (word.status || "unlearned") as WordStatus,
    detailed_info: word.detailedInfo || null,
  };
}

export async function getWords(): Promise<Word[]> {
  if (typeof window === "undefined") return [];
  
  try {
    const supabase = createClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return [];
    }

    // 从 Supabase 查询单词
    const { data, error } = await supabase
      .from("words")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching words from Supabase:", error);
      return [];
    }

    // 转换为 Word 类型
    return (data || []).map(dbWordToWord);
  } catch (error) {
    console.error("Error reading words from storage:", error);
    return [];
  }
}

export async function saveWord(word: Word): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const supabase = createClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("用户未登录");
    }

    // 检查单词是否已存在
    const { data: existing } = await supabase
      .from("words")
      .select("id")
      .eq("user_id", user.id)
      .eq("word", word.word.toLowerCase())
      .single();

    if (existing) {
      // 单词已存在，不重复添加
      return;
    }

    // 插入新单词
    const dbWord = wordToDbWord(word, user.id);
    const { error } = await supabase.from("words").insert({
      ...dbWord,
      user_id: user.id,
    });

    if (error) {
      console.error("Error saving word to Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error saving word:", error);
    throw error;
  }
}

export async function removeWord(wordId: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const supabase = createClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("用户未登录");
    }

    // 删除单词（RLS 会自动确保用户只能删除自己的单词）
    const { error } = await supabase
      .from("words")
      .delete()
      .eq("id", wordId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error removing word from Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error removing word:", error);
    throw error;
  }
}

export async function updateWordStatus(wordId: string, status: WordStatus): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const supabase = createClient();
    
    // 获取当前用户
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("用户未登录");
    }

    // 更新单词状态（RLS 会自动确保用户只能更新自己的单词）
    const { error } = await supabase
      .from("words")
      .update({ status })
      .eq("id", wordId)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error updating word status in Supabase:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error updating word status:", error);
    throw error;
  }
}

