import { Word, WordStatus } from "@/types/word";
import { createClient } from "./supabase/client";
import { isGuestMode, getGuestUserId } from "./guest";

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
    // 如果是游客模式，从 localStorage 读取
    if (isGuestMode()) {
      const guestUserId = getGuestUserId();
      const storedWords = localStorage.getItem(`guest_words_${guestUserId}`);
      if (storedWords) {
        return JSON.parse(storedWords);
      }
      return [];
    }

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
    // 如果是游客模式，保存到 localStorage
    if (isGuestMode()) {
      const guestUserId = getGuestUserId();
      const storedWords = localStorage.getItem(`guest_words_${guestUserId}`);
      let words: Word[] = storedWords ? JSON.parse(storedWords) : [];
      
      // 检查单词是否已存在
      const existingIndex = words.findIndex(w => w.word.toLowerCase() === word.word.toLowerCase());
      if (existingIndex >= 0) {
        // 单词已存在，不重复添加
        return;
      }
      
      // 添加新单词
      words.unshift(word); // 添加到开头（最新在前）
      localStorage.setItem(`guest_words_${guestUserId}`, JSON.stringify(words));
      return;
    }

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
    // 如果是游客模式，从 localStorage 删除
    if (isGuestMode()) {
      const guestUserId = getGuestUserId();
      const storedWords = localStorage.getItem(`guest_words_${guestUserId}`);
      if (storedWords) {
        let words: Word[] = JSON.parse(storedWords);
        words = words.filter(w => w.id !== wordId);
        localStorage.setItem(`guest_words_${guestUserId}`, JSON.stringify(words));
      }
      return;
    }

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
    // 如果是游客模式，更新 localStorage
    if (isGuestMode()) {
      const guestUserId = getGuestUserId();
      const storedWords = localStorage.getItem(`guest_words_${guestUserId}`);
      if (storedWords) {
        let words: Word[] = JSON.parse(storedWords);
        const wordIndex = words.findIndex(w => w.id === wordId);
        if (wordIndex >= 0) {
          words[wordIndex].status = status;
          localStorage.setItem(`guest_words_${guestUserId}`, JSON.stringify(words));
        }
      }
      return;
    }

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

// 迁移游客数据到用户账号
export async function migrateGuestWordsToUser(userId: string): Promise<void> {
  if (typeof window === "undefined") return;
  
  try {
    const guestUserId = getGuestUserId();
    const storedWords = localStorage.getItem(`guest_words_${guestUserId}`);
    
    if (!storedWords) {
      return; // 没有游客数据
    }
    
    const guestWords: Word[] = JSON.parse(storedWords);
    if (guestWords.length === 0) {
      return; // 没有单词需要迁移
    }
    
    const supabase = createClient();
    
    // 批量迁移单词到数据库
    for (const word of guestWords) {
      // 检查单词是否已存在
      const { data: existing } = await supabase
        .from("words")
        .select("id")
        .eq("user_id", userId)
        .eq("word", word.word.toLowerCase())
        .single();
      
      if (!existing) {
        // 插入新单词
        const dbWord = wordToDbWord(word, userId);
        await supabase.from("words").insert({
          ...dbWord,
          user_id: userId,
        });
      }
    }
    
    // 清除游客数据
    localStorage.removeItem(`guest_words_${guestUserId}`);
  } catch (error) {
    console.error("Error migrating guest words:", error);
    // 不抛出错误，避免影响注册流程
  }
}

