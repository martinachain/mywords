"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { WordList } from "@/components/word-list";
import { PronunciationButton } from "@/components/pronunciation-button";
import { Word, WordStatus } from "@/types/word";
import { getWords, saveWord, removeWord, updateWordStatus } from "@/lib/storage";
import { queryWord } from "@/lib/word-query";
import { playNotificationSound } from "@/lib/sound";

export default function Home() {
  const [inputWord, setInputWord] = useState("");
  const [loading, setLoading] = useState(false);
  const [wordData, setWordData] = useState<Word | null>(null);
  const [savedWords, setSavedWords] = useState<Word[]>([]);

  // 加载已保存的单词
  useEffect(() => {
    const loadWords = async () => {
      const words = await getWords();
      setSavedWords(words);
    };
    loadWords();
  }, []);

  // 查询单词
  const handleSearch = async () => {
    if (!inputWord.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/word?word=${encodeURIComponent(inputWord.trim())}`);
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

      setWordData(newWord);
      
      // 自动保存到生词本
      await saveWord(newWord);
      const words = await getWords();
      setSavedWords(words);
      
      // 播放提示音
      playNotificationSound();
    } catch (error) {
      console.error("Error fetching word:", error);
      alert("查询失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  // 删除单词
  const handleRemoveWord = async (wordId: string) => {
    await removeWord(wordId);
    const words = await getWords();
    setSavedWords(words);
  };

  // 更新单词状态
  const handleStatusChange = async (wordId: string, status: WordStatus) => {
    await updateWordStatus(wordId, status);
    const words = await getWords();
    setSavedWords(words);
  };

  // 查询同义词
  const handleSearchSynonym = async (synonym: string) => {
    try {
      const newWord = await queryWord(synonym);
      if (newWord) {
        setWordData(newWord);
        const words = await getWords();
        setSavedWords(words);
        // 滚动到顶部显示查询结果
        window.scrollTo({ top: 0, behavior: "smooth" });
        // 播放提示音
        playNotificationSound();
      }
    } catch (error) {
      throw error;
    }
  };

  // 处理回车键
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16 space-y-12">
        {/* 标题 */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-foreground">
            生词学习
          </h1>
          <p className="text-sm md:text-base text-muted-foreground font-light">
            输入单词，查询释义，自动保存
          </p>
        </div>

        {/* 输入框区域 */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="pt-8 pb-8">
            <div className="space-y-5">
              <Input
                type="text"
                placeholder="输入不会的单词..."
                value={inputWord}
                onChange={(e) => setInputWord(e.target.value)}
                onKeyPress={handleKeyPress}
                className="h-14 text-lg text-center border-border/60 focus:border-foreground/30"
              />
              <Button
                onClick={handleSearch}
                disabled={loading || !inputWord.trim()}
                className="w-full h-11 text-base font-normal"
                size="lg"
              >
                {loading ? "查询中..." : "查询"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 查询结果 */}
        {wordData && (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div>
                    <span className="text-2xl md:text-3xl font-normal tracking-tight">
                      {wordData.word}
                    </span>
                    {wordData.phonetic && (
                      <span className="ml-3 text-muted-foreground text-base font-light">
                        {wordData.phonetic}
                      </span>
                    )}
                  </div>
                  <PronunciationButton word={wordData.word} />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              {/* 词性 */}
              {wordData.detailedInfo?.partOfSpeech && (
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    词性
                  </p>
                  <p className="text-base leading-relaxed font-light">
                    {wordData.detailedInfo.partOfSpeech}
                  </p>
                </div>
              )}

              {/* 复数形式 */}
              {wordData.detailedInfo?.plural && (
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    复数形式
                  </p>
                  <p className="text-base leading-relaxed font-light">
                    {wordData.detailedInfo.plural}
                  </p>
                </div>
              )}

              {/* 详细释义 */}
              {wordData.detailedInfo?.detailedMeaning ? (
                <div>
                  <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                    详细释义
                  </p>
                  <p className="text-base leading-relaxed font-light">
                    {wordData.detailedInfo.detailedMeaning}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                    释义
                  </p>
                  <p className="text-base leading-relaxed font-light">
                    {wordData.meaning}
                  </p>
                </div>
              )}

              {/* 同义词 */}
              {wordData.detailedInfo?.synonyms && wordData.detailedInfo.synonyms.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    同义词
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {wordData.detailedInfo.synonyms.map((synonym, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-muted rounded-md text-sm font-light cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={async () => {
                          try {
                            await handleSearchSynonym(synonym);
                          } catch (error) {
                            alert("查询失败，请稍后重试");
                          }
                        }}
                      >
                        {synonym}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 词根词缀 */}
              {(wordData.detailedInfo?.root || wordData.detailedInfo?.affix) && (
                <div>
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    词根词缀
                  </p>
                  <div className="space-y-1">
                    {wordData.detailedInfo.root && (
                      <p className="text-base leading-relaxed font-light">
                        词根：<span className="font-normal">{wordData.detailedInfo.root}</span>
                      </p>
                    )}
                    {wordData.detailedInfo.affix && (
                      <p className="text-base leading-relaxed font-light">
                        词缀：<span className="font-normal">{wordData.detailedInfo.affix}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 例句 */}
              {wordData.example && (
                <div>
                  <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                    例句
                  </p>
                  <p className="text-base text-muted-foreground italic leading-relaxed font-light">
                    {wordData.example}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 生词本列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light tracking-tight">生词本</h2>
            {savedWords.length > 0 && (
              <Link href="/vocabulary">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  查看全部 →
                </Button>
              </Link>
            )}
          </div>
          <WordList
            words={savedWords.slice(0, 5)}
            onRemove={handleRemoveWord}
            onStatusChange={handleStatusChange}
            onSearchWord={handleSearchSynonym}
          />
          {savedWords.length > 5 && (
            <div className="text-center pt-2">
              <Link href="/vocabulary">
                <Button variant="outline" className="font-normal">
                  查看全部 {savedWords.length} 个单词
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
