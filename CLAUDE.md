# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Context

Study-07은 Supabase와 연동된 쇼핑리스트 앱입니다.

전체 워크스페이스 구조는 상위 디렉토리의 `../CLAUDE.md`를 참조하세요.

## 앱 개요

- **파일**: `index.html` (단일 파일, 빌드 스텝 없음)
- **실행**: 브라우저에서 직접 열기
- **데이터 저장**: Supabase (프로젝트: `shopping-list`, ID: `mmohippvxmysjuinlhfp`)

## Supabase 설정

- **프로젝트 URL**: `https://mmohippvxmysjuinlhfp.supabase.co`
- **리전**: ap-northeast-2 (서울)
- **테이블**: `shopping_item`
  - `id` UUID (PK, auto)
  - `name` text
  - `done` boolean (default false)
  - `created_at` timestamptz (default now())

## 이전 스터디 참고

| 스터디 | 내용 | 기술 스택 |
|---|---|---|
| Study-01 | 손글씨 숫자 인식 | Python, scikit-learn, tkinter, Flask |
| Study-02 | Todo 앱 | Vanilla JS, localStorage |
| Study-03 | 퀴즈 게임 | Vanilla JS, localStorage, 커스텀 CLI 명령 |
| Study-04 | 냉장고 재료 → 레시피 추천 | Flask, OpenRouter (Vision + LLM) |
| Study-05 | PDF 요약기 | Flask, PDF.js, OpenRouter |

## 설계 관례

**UI/UX**
- 한국어 레이블, `Noto Sans KR` (Google Fonts CDN)
- 다크 테마: 배경 `#0f172a` 또는 `#1e1e2e`, 강조색 `#38bdf8` / `#89b4fa`

**웹 프론트엔드**
- 빌드 스텝 없이 브라우저에서 직접 열 수 있는 단일 HTML 파일 선호
- 순수 Vanilla JS (프레임워크 없음)

**백엔드 (OpenRouter 연동 시)**
- Flask + `python-dotenv` + `openai` SDK (`openai` SDK를 OpenRouter base URL로 지정)
- API 키는 `.env`에 보관, 브라우저에 절대 노출 금지
- 모델 폴백 체인으로 안정성 확보 (Study-04, 05 참고)

```python
from openai import OpenAI
client = OpenAI(base_url="https://openrouter.ai/api/v1", api_key=os.getenv("OPENROUTER_API_KEY"))
```

**환경 변수**
```bash
pip install flask python-dotenv openai
# .env 파일에 OPENROUTER_API_KEY=sk-or-v1-... 설정
python app.py  # → http://localhost:5000
```
