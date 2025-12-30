-- 创建 words 表
CREATE TABLE IF NOT EXISTS words (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  definition TEXT NOT NULL,
  phonetic TEXT,
  example TEXT,
  status TEXT DEFAULT 'unlearned' CHECK (status IN ('unlearned', 'learned')),
  detailed_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS words_user_id_idx ON words(user_id);
CREATE INDEX IF NOT EXISTS words_user_id_created_at_idx ON words(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS words_word_idx ON words(word);

-- 创建唯一索引，确保每个用户不会重复添加相同的单词（不区分大小写）
CREATE UNIQUE INDEX IF NOT EXISTS words_user_word_unique_idx 
ON words(user_id, LOWER(word));

-- 启用 Row Level Security (RLS)
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- 删除已存在的策略（如果存在）
DROP POLICY IF EXISTS "Users can view their own words" ON words;
DROP POLICY IF EXISTS "Users can insert their own words" ON words;
DROP POLICY IF EXISTS "Users can update their own words" ON words;
DROP POLICY IF EXISTS "Users can delete their own words" ON words;

-- 创建 RLS 策略

-- 策略 1: 用户只能查看自己的单词
CREATE POLICY "Users can view their own words"
  ON words
  FOR SELECT
  USING (auth.uid() = user_id);

-- 策略 2: 用户只能插入自己的单词
CREATE POLICY "Users can insert their own words"
  ON words
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 策略 3: 用户只能更新自己的单词
CREATE POLICY "Users can update their own words"
  ON words
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 策略 4: 用户只能删除自己的单词
CREATE POLICY "Users can delete their own words"
  ON words
  FOR DELETE
  USING (auth.uid() = user_id);

-- 创建更新 updated_at 的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 创建触发器，自动更新 updated_at
DROP TRIGGER IF EXISTS update_words_updated_at ON words;
CREATE TRIGGER update_words_updated_at
  BEFORE UPDATE ON words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

