-- ================================================================
-- Supabase SQL Editor에서 실행하세요
-- URL: https://supabase.com/dashboard → SQL Editor
-- ================================================================

CREATE TABLE IF NOT EXISTS options (
  id         SERIAL PRIMARY KEY,
  type       TEXT NOT NULL CHECK (type IN ('plan', 'brand', 'category')),
  label      TEXT NOT NULL,
  value      TEXT NOT NULL,
  sort_order INT  DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(type, value)
);

-- RLS 활성화
ALTER TABLE options ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 허용
CREATE POLICY "Public read options"
  ON options FOR SELECT USING (true);

-- 인증된 사용자 또는 anon 키로 전체 접근 허용
CREATE POLICY "Full access options"
  ON options FOR ALL USING (true) WITH CHECK (true);

-- 기본 데이터 삽입
INSERT INTO options (type, label, value, sort_order) VALUES
  -- 플랜
  ('plan', '330X2', '330X2', 1),
  ('plan', '330X3', '330X3', 2),
  ('plan', '330X4', '330X4', 3),
  ('plan', '330X6', '330X6', 4),
  -- 브랜드
  ('brand', '전체',      '전체',      0),
  ('brand', 'LG',        'LG',        1),
  ('brand', '삼성',      '삼성',      2),
  ('brand', '바디프렌드', '바디프렌드', 3),
  ('brand', '다이슨',    '다이슨',    4),
  ('brand', '기타',      '기타',      5),
  -- 카테고리
  ('category', '전체',      '전체',      0),
  ('category', 'TV',        'TV',        1),
  ('category', '냉장고',    '냉장고',    2),
  ('category', '세탁기',    '세탁기',    3),
  ('category', '안마의자',  '안마의자',  4),
  ('category', '스타일러',  '스타일러',  5),
  ('category', '에어컨',    '에어컨',    6),
  ('category', '공기청정기','공기청정기',7),
  ('category', '청소기',    '청소기',    8),
  ('category', '노트북',    '노트북',    9),
  ('category', '정수기',    '정수기',    10)
ON CONFLICT (type, value) DO NOTHING;
