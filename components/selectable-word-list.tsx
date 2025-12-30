"use client";

import { useState } from "react";
import { Word, WordStatus } from "@/types/word";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PronunciationButton } from "@/components/pronunciation-button";

interface SelectableWordListProps {
  words: Word[];
  selectedWordIds: Set<string>;
  onToggleSelect: (wordId: string) => void;
  onRemove: (wordId: string) => void;
  onStatusChange?: (wordId: string, status: WordStatus) => void;
  onSearchWord?: (word: string) => Promise<void>;
}

export function SelectableWordList({
  words,
  selectedWordIds,
  onToggleSelect,
  onRemove,
  onStatusChange,
  onSearchWord,
}: SelectableWordListProps) {
  const [expandedWordId, setExpandedWordId] = useState<string | null>(null);
  const [searchingWord, setSearchingWord] = useState<string | null>(null);

  if (words.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        还没有保存任何单词
      </div>
    );
  }

  const handleWordClick = (wordId: string, e: React.MouseEvent) => {
    // 如果点击的是复选框、按钮、徽章或同义词，不展开
    const target = e.target as HTMLElement;
    if (
      target.closest("button") ||
      target.closest("[data-slot='checkbox']") ||
      target.closest("[data-slot='badge']") ||
      target.closest("[data-slot='button']") ||
      target.closest("input[type='checkbox']") ||
      target.closest("span[class*='bg-muted']") // 同义词标签
    ) {
      return;
    }
    setExpandedWordId(expandedWordId === wordId ? null : wordId);
  };

  return (
    <div className="space-y-2">
      {words.map((word) => {
        const status = word.status || "unlearned";
        const isLearned = status === "learned";
        const isSelected = selectedWordIds.has(word.id);
        const isExpanded = expandedWordId === word.id;

        return (
          <Card
            key={word.id}
            className={`border-border/50 shadow-sm cursor-pointer ${
              isLearned ? "opacity-60" : ""
            } ${
              isSelected ? "ring-2 ring-primary/50 border-primary/30" : ""
            }`}
            onClick={(e) => handleWordClick(word.id, e)}
          >
            <CardHeader className="py-3">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(word.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div>
                        <span className="text-lg md:text-xl font-normal tracking-tight">
                          {word.word}
                        </span>
                        {word.phonetic && (
                          <span className="ml-2 text-muted-foreground text-sm font-light">
                            {word.phonetic}
                          </span>
                        )}
                      </div>
                      <PronunciationButton
                        word={word.word}
                        size="sm"
                        variant="ghost"
                      />
                    </div>
                    {onStatusChange && (
                      <Badge
                        variant={isLearned ? "default" : "secondary"}
                        className="cursor-pointer text-xs font-normal"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(
                            word.id,
                            isLearned ? "unlearned" : "learned"
                          );
                        }}
                      >
                        {isLearned ? "已掌握" : "未掌握"}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(word.id);
                  }}
                >
                  删除
                </Button>
              </CardTitle>
            </CardHeader>
            {isExpanded && word.detailedInfo && (
              <CardContent className="pt-0 pb-4">
                <div className="space-y-5">
                  {/* 词性 */}
                  {word.detailedInfo.partOfSpeech && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">
                        词性
                      </p>
                      <p className="text-base leading-relaxed font-light">
                        {word.detailedInfo.partOfSpeech}
                      </p>
                    </div>
                  )}

                  {/* 复数形式 */}
                  {word.detailedInfo.plural && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">
                        复数形式
                      </p>
                      <p className="text-base leading-relaxed font-light">
                        {word.detailedInfo.plural}
                      </p>
                    </div>
                  )}

                  {/* 详细释义 */}
                  {word.detailedInfo.detailedMeaning ? (
                    <div>
                      <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                        详细释义
                      </p>
                      <p className="text-base leading-relaxed font-light">
                        {word.detailedInfo.detailedMeaning}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                        释义
                      </p>
                      <p className="text-base leading-relaxed font-light">
                        {word.meaning}
                      </p>
                    </div>
                  )}

                  {/* 同义词 */}
                  {word.detailedInfo.synonyms && word.detailedInfo.synonyms.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">
                        同义词
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {word.detailedInfo.synonyms.map((synonym, index) => (
                          <span
                            key={index}
                            className={`px-3 py-1 rounded-md text-sm font-light cursor-pointer transition-colors ${
                              searchingWord === synonym
                                ? "bg-primary/20 text-primary"
                                : "bg-muted hover:bg-muted/80"
                            }`}
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (onSearchWord && synonym) {
                                setSearchingWord(synonym);
                                try {
                                  await onSearchWord(synonym);
                                } catch (error) {
                                  alert("查询失败，请稍后重试");
                                } finally {
                                  setSearchingWord(null);
                                }
                              }
                            }}
                          >
                            {synonym}
                            {searchingWord === synonym && "..."}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 词根词缀 */}
                  {(word.detailedInfo.root || word.detailedInfo.affix) && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-muted-foreground">
                        词根词缀
                      </p>
                      <div className="space-y-1">
                        {word.detailedInfo.root && (
                          <p className="text-base leading-relaxed font-light">
                            词根：<span className="font-normal">{word.detailedInfo.root}</span>
                          </p>
                        )}
                        {word.detailedInfo.affix && (
                          <p className="text-base leading-relaxed font-light">
                            词缀：<span className="font-normal">{word.detailedInfo.affix}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 例句 */}
                  {word.example && (
                    <div>
                      <p className="text-sm font-medium mb-2.5 text-muted-foreground">
                        例句
                      </p>
                      <p className="text-base text-muted-foreground italic leading-relaxed font-light">
                        {word.example}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}

