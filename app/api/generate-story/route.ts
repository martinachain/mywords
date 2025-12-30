import { NextResponse } from "next/server";

interface GenerateStoryRequest {
  words: Array<{
    word: string;
    meaning: string;
  }>;
}

// ============================================
// DeepSeek API 配置
// 请在此处填写你的 DeepSeek API Key
// ============================================
const DEEPSEEK_API_KEY = "sk-40e5d2076d2b47218005e49fdc382fb5"; // 请替换为你的 API Key
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function POST(request: Request) {
  try {
    const body: GenerateStoryRequest = await request.json();
    const { words } = body;

    if (!words || words.length < 10 || words.length > 20) {
      return NextResponse.json(
        { error: "请选择 10-20 个单词" },
        { status: 400 }
      );
    }

    // 检查 API Key 是否已配置
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "请先配置 DeepSeek API Key" },
        { status: 500 }
      );
    }

    // 构建单词列表（包含单词和释义）
    const wordList = words.map((w) => `${w.word} (${w.meaning})`).join(", ");
    const wordListSimple = words.map((w) => w.word).join(", ");

    // 第一步：生成英文短文
    const storyResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的英语学习助手。请将给定的单词编成一篇约300字的逻辑通顺的故事或新闻，确保所有单词都自然融入文中。故事要有趣且有意义。",
          },
          {
            role: "user",
            content: `请用以下单词创作一篇约300字的英文故事。单词列表：${wordListSimple}\n\n要求：\n1. 故事要逻辑通顺，有趣且有意义\n2. 确保所有单词都自然融入文中\n3. 字数控制在250-350字之间\n4. 只返回故事内容，不要添加任何说明`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!storyResponse.ok) {
      const errorData = await storyResponse.json().catch(() => ({}));
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        {
          error: `生成故事失败: ${errorData.error?.message || storyResponse.statusText}`,
        },
        { status: storyResponse.status }
      );
    }

    const storyData = await storyResponse.json();
    const englishStory = storyData.choices?.[0]?.message?.content?.trim();

    if (!englishStory) {
      return NextResponse.json(
        { error: "未能生成英文故事，请重试" },
        { status: 500 }
      );
    }

    // 第二步：生成中文翻译
    const translateResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的翻译助手。请将英文文本准确、流畅地翻译成中文，保持原文的语气和风格。",
          },
          {
            role: "user",
            content: `请将以下英文文本翻译成中文：\n\n${englishStory}\n\n要求：\n1. 翻译要准确、流畅\n2. 保持原文的语气和风格\n3. 只返回中文翻译，不要添加任何说明`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!translateResponse.ok) {
      const errorData = await translateResponse.json().catch(() => ({}));
      console.error("DeepSeek Translation API Error:", errorData);
      // 如果翻译失败，至少返回英文故事
      return NextResponse.json({
        englishText: englishStory,
        chineseText: "翻译生成失败，请重试",
      });
    }

    const translateData = await translateResponse.json();
    const chineseStory = translateData.choices?.[0]?.message?.content?.trim();

    return NextResponse.json({
      englishText: englishStory,
      chineseText: chineseStory || "翻译生成失败，请重试",
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `生成短文失败: ${error.message}`
            : "生成短文失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}

