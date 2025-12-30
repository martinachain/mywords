"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WordList } from "@/components/word-list";
import { SelectableWordList } from "@/components/selectable-word-list";
import { Flashcard } from "@/components/flashcard";
import { StoryDisplay } from "@/components/story-display";
import { Word, WordStatus } from "@/types/word";
import { getWords, updateWordStatus, removeWord } from "@/lib/storage";
import { queryWord } from "@/lib/word-query";
import { playNotificationSound } from "@/lib/sound";

type ViewMode = "list" | "cards" | "select";

export default function VocabularyPage() {
  const [words, setWords] = useState<Word[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [filterStatus, setFilterStatus] = useState<WordStatus | "all">("all");
  const [selectedWordIds, setSelectedWordIds] = useState<Set<string>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [storyData, setStoryData] = useState<{
    words: Word[];
    englishText: string;
    chineseText: string;
  } | null>(null);

  useEffect(() => {
    loadWords();
  }, []);

  const loadWords = async () => {
    const words = await getWords();
    setWords(words);
  };

  const handleStatusChange = async (wordId: string, status: WordStatus) => {
    await updateWordStatus(wordId, status);
    await loadWords();
  };

  const handleRemove = async (wordId: string) => {
    await removeWord(wordId);
    await loadWords();
    // 如果删除的是当前卡片，调整索引
    if (viewMode === "cards" && currentCardIndex >= filteredWords.length - 1) {
      setCurrentCardIndex(Math.max(0, currentCardIndex - 1));
    }
  };

  const filteredWords = words.filter((word) => {
    if (filterStatus === "all") return true;
    return (word.status || "unlearned") === filterStatus;
  });

  const currentCard = filteredWords[currentCardIndex];

  const handleNextCard = () => {
    if (currentCardIndex < filteredWords.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
    }
  };

  const handlePrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const handleToggleSelect = (wordId: string) => {
    const newSelected = new Set(selectedWordIds);
    if (newSelected.has(wordId)) {
      newSelected.delete(wordId);
    } else {
      // 检查是否超过20个
      if (newSelected.size >= 20) {
        alert("最多只能选择 20 个单词");
        return;
      }
      newSelected.add(wordId);
    }
    setSelectedWordIds(newSelected);
  };

  // 查询同义词
  const handleSearchSynonym = async (synonym: string) => {
    try {
      const newWord = await queryWord(synonym);
      if (newWord) {
        await loadWords();
        // 播放提示音
        playNotificationSound();
        // 如果单词已存在，展开显示它
        const wordIndex = filteredWords.findIndex((w) => w.word.toLowerCase() === newWord.word.toLowerCase());
        if (wordIndex !== -1) {
          // 单词已存在，可以在这里添加展开逻辑
        }
      }
    } catch (error) {
      throw error;
    }
  };

  const handleGenerateStory = async () => {
    const selectedWords = filteredWords.filter((w) =>
      selectedWordIds.has(w.id)
    );

    if (selectedWords.length < 10) {
      alert("请至少选择 10 个单词");
      return;
    }

    if (selectedWords.length > 20) {
      alert("最多只能选择 20 个单词");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: selectedWords.map((w) => ({
            word: w.word,
            meaning: w.meaning,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("生成失败");
      }

      const data = await response.json();
      setStoryData({
        words: selectedWords,
        englishText: data.englishText,
        chineseText: data.chineseText,
      });
    } catch (error) {
      console.error("Error generating story:", error);
      alert("生成短文失败，请稍后重试");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12 space-y-8">
        {/* 头部导航 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">
              生词库
            </h1>
            <p className="text-sm text-muted-foreground font-light">
              共 {words.length} 个单词
              {filterStatus !== "all" &&
                `，${filteredWords.length} 个${filterStatus === "learned" ? "已掌握" : "未掌握"}`}
            </p>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="flex flex-wrap items-center gap-3">
          {/* 视图切换 */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => {
                setViewMode("list");
                if (viewMode === "select") {
                  setSelectedWordIds(new Set());
                }
              }}
            >
              列表模式
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => {
                setViewMode("cards");
                if (viewMode === "select") {
                  setSelectedWordIds(new Set());
                }
              }}
            >
              记忆卡片
            </Button>
            <Button
              variant={viewMode === "select" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => setViewMode("select")}
            >
              选择模式
            </Button>
          </div>

          {/* 筛选 */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === "all" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => setFilterStatus("all")}
            >
              全部
            </Button>
            <Button
              variant={filterStatus === "unlearned" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => setFilterStatus("unlearned")}
            >
              未掌握
            </Button>
            <Button
              variant={filterStatus === "learned" ? "default" : "outline"}
              size="sm"
              className="font-normal"
              onClick={() => setFilterStatus("learned")}
            >
              已掌握
            </Button>
          </div>
        </div>

        {/* 选择模式控制栏 */}
        {viewMode === "select" && (
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground font-light">
                已选择：{selectedWordIds.size} / 20
                {selectedWordIds.size < 10 && "（至少需要 10 个）"}
              </span>
            </div>
            <Button
              onClick={handleGenerateStory}
              disabled={selectedWordIds.size < 10 || selectedWordIds.size > 20 || isGenerating}
              size="lg"
              className="font-normal"
            >
              {isGenerating ? "生成中..." : "生成情境短文"}
            </Button>
          </div>
        )}

        {/* 短文展示 */}
        {storyData && (
          <StoryDisplay
            words={storyData.words}
            englishText={storyData.englishText}
            chineseText={storyData.chineseText}
            onClose={() => setStoryData(null)}
          />
        )}

        {/* 内容区域 */}
        {filteredWords.length === 0 ? (
          <div className="text-center text-muted-foreground py-16">
            {filterStatus === "all"
              ? "还没有保存任何单词"
              : `没有${filterStatus === "learned" ? "已掌握" : "未掌握"}的单词`}
          </div>
        ) : viewMode === "select" ? (
          <SelectableWordList
            words={filteredWords}
            selectedWordIds={selectedWordIds}
            onToggleSelect={handleToggleSelect}
            onRemove={handleRemove}
            onStatusChange={handleStatusChange}
            onSearchWord={handleSearchSynonym}
          />
        ) : viewMode === "list" ? (
          <WordList
            words={filteredWords}
            onRemove={handleRemove}
            onStatusChange={handleStatusChange}
            onSearchWord={handleSearchSynonym}
          />
        ) : (
          <div className="space-y-6">
            {/* 卡片导航 */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevCard}
                disabled={currentCardIndex === 0}
                variant="outline"
              >
                上一张
              </Button>
              <span className="text-muted-foreground">
                {currentCardIndex + 1} / {filteredWords.length}
              </span>
              <Button
                onClick={handleNextCard}
                disabled={currentCardIndex === filteredWords.length - 1}
                variant="outline"
              >
                下一张
              </Button>
            </div>

            {/* 记忆卡片 */}
            <div className="max-w-md mx-auto">
              <Flashcard word={currentCard} />
            </div>

            {/* 卡片操作 */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={() =>
                  handleStatusChange(
                    currentCard.id,
                    (currentCard.status || "unlearned") === "learned"
                      ? "unlearned"
                      : "learned"
                  )
                }
              >
                {(currentCard.status || "unlearned") === "learned"
                  ? "标记为未掌握"
                  : "标记为已掌握"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleRemove(currentCard.id)}
              >
                删除
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

