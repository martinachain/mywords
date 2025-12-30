"use client";

import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playPronunciation } from "@/lib/pronunciation";
import { useState } from "react";

interface PronunciationButtonProps {
  word: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
}

export function PronunciationButton({
  word,
  size = "sm",
  variant = "ghost",
}: PronunciationButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    const audio = playPronunciation(word, 2); // 美式发音
    
    if (audio) {
      audio.onended = () => {
        setIsPlaying(false);
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };
    } else {
      setIsPlaying(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className="text-muted-foreground hover:text-foreground"
      onClick={handlePlay}
      disabled={isPlaying}
      title="播放发音"
    >
      <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
    </Button>
  );
}

