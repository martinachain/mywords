"use client";

import { Word } from "@/types/word";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface StoryDisplayProps {
  words: Word[];
  englishText: string;
  chineseText: string;
  onClose: () => void;
}

export function StoryDisplay({
  words,
  englishText,
  chineseText,
  onClose,
}: StoryDisplayProps) {
  // 创建单词映射（不区分大小写）
  const wordMap = new Map<string, Word>();
  words.forEach((word) => {
    wordMap.set(word.word.toLowerCase(), word);
  });

  // 将英文文本中的单词加粗
  const highlightWords = (text: string): React.ReactNode[] => {
    // 转义特殊字符并创建正则表达式
    const escapedWords = words.map((w) => w.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const regex = new RegExp(`\\b(${escapedWords.join("|")})\\b`, "gi");
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyCounter = 0;

    while ((match = regex.exec(text)) !== null) {
      // 添加匹配前的文本
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${keyCounter++}`}>
            {text.substring(lastIndex, match.index)}
          </span>
        );
      }

      // 添加加粗的单词
      const matchedWord = match[0];
      parts.push(
        <strong key={`word-${keyCounter++}`} className="font-bold text-primary">
          {matchedWord}
        </strong>
      );

      lastIndex = regex.lastIndex;
    }

    // 添加剩余的文本
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${keyCounter++}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : [<span key="full-text">{text}</span>];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>情境短文</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            关闭
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 英文原文 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">英文原文</h3>
          <div className="p-4 bg-muted rounded-lg leading-relaxed text-base">
            {highlightWords(englishText)}
          </div>
        </div>

        {/* 中文翻译 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">中文翻译</h3>
          <div className="p-4 bg-muted rounded-lg leading-relaxed text-base">
            {chineseText}
          </div>
        </div>

        {/* 使用的单词列表 */}
        <div>
          <h3 className="text-lg font-semibold mb-3">包含的单词</h3>
          <div className="flex flex-wrap gap-2">
            {words.map((word) => (
              <span
                key={word.id}
                className="px-3 py-1 bg-primary/10 text-primary rounded-md text-sm font-medium"
              >
                {word.word}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

