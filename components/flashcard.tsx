"use client";

import { useState, useEffect } from "react";
import { Word } from "@/types/word";
import { Card, CardContent } from "@/components/ui/card";
import { PronunciationButton } from "@/components/pronunciation-button";

interface FlashcardProps {
  word: Word;
  onFlip?: () => void;
}

export function Flashcard({ word, onFlip }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  // 当单词改变时，重置翻转状态
  useEffect(() => {
    setIsFlipped(false);
  }, [word.id]);

  const handleClick = () => {
    setIsFlipped(!isFlipped);
    onFlip?.();
  };

  return (
    <div
      className="cursor-pointer"
      onClick={handleClick}
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full h-64"
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.6s",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* 正面 - 单词 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          }}
        >
          <Card className="w-full h-full">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <h2 className="text-4xl font-bold">{word.word}</h2>
                  <PronunciationButton word={word.word} size="md" />
                </div>
                {word.phonetic && (
                  <p className="text-xl text-muted-foreground">{word.phonetic}</p>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  点击卡片查看释义
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 背面 - 释义 */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <Card className="w-full h-full">
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-semibold mb-4">释义</h3>
                <p className="text-lg">{word.meaning}</p>
                {word.example && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground mb-2">例句：</p>
                    <p className="text-base italic">{word.example}</p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  点击卡片返回
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

