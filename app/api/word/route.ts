import { NextResponse } from "next/server";

// ============================================
// DeepSeek API 配置
// ============================================
const DEEPSEEK_API_KEY = "sk-40e5d2076d2b47218005e49fdc382fb5";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json(
      { error: "请提供单词" },
      { status: 400 }
    );
  }

  if (!DEEPSEEK_API_KEY) {
    return NextResponse.json(
      { error: "请先配置 DeepSeek API Key" },
      { status: 500 }
    );
  }

  try {
    // 使用 DeepSeek API 查询单词
    const response = await fetch(DEEPSEEK_API_URL, {
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
              "你是一个专业的英语词典助手。请提供单词的详细信息。回答格式为JSON：{\"phonetic\": \"音标\", \"meaning\": \"简洁的中文释义（用于记忆卡片）\", \"example\": \"英文例句\", \"partOfSpeech\": \"词性（如：名词、动词、形容词等）\", \"plural\": \"复数形式（如果是名词）\", \"synonyms\": [\"同义词1\", \"同义词2\"], \"root\": \"词根\", \"affix\": \"词缀\", \"detailedMeaning\": \"详细的中文释义\"}。只返回JSON，不要添加任何其他文字。",
          },
          {
            role: "user",
            content: `请查询单词 "${word}" 的详细信息。要求：\n1. 音标使用国际音标格式，如 /ˈwɜːrd/\n2. meaning：简洁的中文释义（1-2句话）\n3. detailedMeaning：详细的中文释义（包含用法、语境等）\n4. partOfSpeech：词性（名词/动词/形容词/副词等）\n5. plural：如果是名词，提供复数形式；如果不是名词，可为空\n6. synonyms：提供2-3个常用同义词\n7. root：词根（如果有）\n8. affix：词缀（如果有，如前缀、后缀）\n9. example：自然、实用的英文例句\n10. 只返回JSON格式，不要添加任何说明文字`,
          },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("DeepSeek API Error:", errorData);
      return NextResponse.json(
        {
          error: `查询失败: ${errorData.error?.message || response.statusText}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      return NextResponse.json(
        { error: "未能获取单词信息，请重试" },
        { status: 500 }
      );
    }

    // 尝试解析 JSON 响应
    let wordInfo;
    try {
      // 移除可能的 markdown 代码块标记
      const jsonContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      wordInfo = JSON.parse(jsonContent);
    } catch (parseError) {
      // 如果解析失败，尝试从文本中提取信息
      console.warn("Failed to parse JSON, trying to extract from text:", content);
      
      // 如果解析失败，尝试从文本中提取信息
      console.warn("Failed to parse JSON, trying to extract from text:", content);
      
      // 使用正则表达式提取信息
      const phoneticMatch = content.match(/phonetic["\s:]+([^",}\n]+)/i);
      const meaningMatch = content.match(/meaning["\s:]+([^",}\n]+)/i);
      const exampleMatch = content.match(/example["\s:]+([^",}\n]+)/i);

      wordInfo = {
        phonetic: phoneticMatch?.[1]?.trim() || `/${word.toLowerCase()}/`,
        meaning: meaningMatch?.[1]?.trim() || `${word} 的中文释义`,
        example: exampleMatch?.[1]?.trim() || `This is an example sentence using "${word}".`,
      };
    }

    // 构建返回数据
    const result: any = {
      word: word.toLowerCase(),
      phonetic: wordInfo.phonetic || `/${word.toLowerCase()}/`,
      meaning: wordInfo.meaning || `${word} 的中文释义`,
      example: wordInfo.example || `This is an example sentence using "${word}".`,
    };

    // 如果有详细信息，添加到结果中
    if (wordInfo.partOfSpeech || wordInfo.plural || wordInfo.synonyms || wordInfo.root || wordInfo.affix || wordInfo.detailedMeaning) {
      result.detailedInfo = {
        partOfSpeech: wordInfo.partOfSpeech || undefined,
        plural: wordInfo.plural || undefined,
        synonyms: wordInfo.synonyms || undefined,
        root: wordInfo.root || undefined,
        affix: wordInfo.affix || undefined,
        detailedMeaning: wordInfo.detailedMeaning || undefined,
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching word:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `查询失败: ${error.message}`
            : "查询失败，请稍后重试",
      },
      { status: 500 }
    );
  }
}

