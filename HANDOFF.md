# Productivity App — 인수인계 문서

> 최종 업데이트: 2026-02-12
> 커밋: `f01eeee` feat: OpenRouter API 전환 + 시스템 전체 연동 완성 + 버그 수정

---

## 1. 프로젝트 개요

GTD(Getting Things Done) 기반 개인 업무 관리 앱.
AI 채팅으로 업무를 입력하면 자동 분류 → 칸반 보드 관리 → AI 타임블로킹까지 연결되는 통합 시스템.

**기술 스택**: Next.js 16 (App Router) / SQLite (better-sqlite3 + Drizzle ORM) / OpenRouter API / Tailwind CSS / shadcn/ui / dnd-kit

---

## 2. 아키텍처

```
┌─────────────┐     ┌──────────────────┐     ┌────────────┐
│  Frontend    │────▶│  API Routes      │────▶│  SQLite DB │
│  (React/SWR) │◀────│  (Next.js)       │◀────│  (Drizzle) │
└─────────────┘     └──────┬───────────┘     └────────────┘
                           │
                    ┌──────▼───────┐
                    │  OpenRouter   │
                    │  (Claude 4.5) │
                    └──────────────┘
```

### 데이터 플로우

```
사용자 채팅 입력
  → POST /api/chat (SSE 스트리밍)
  → OpenRouter chatStream() 호출
  → AI 응답에서 classification JSON 추출
  → createTask() (status: TODAY/BACKLOG 자동 결정)
  → createInboxItem() + updateInboxItem()
  → 클라이언트에 text_delta + task_created 이벤트 전송

칸반 보드
  → 드래그앤드롭으로 상태 변경 (BACKLOG → TODAY → IN_PROGRESS → DONE)
  → sortOrder DB 저장
  → WIP 제한: IN_PROGRESS 최대 3개

스케줄 생성
  → POST /api/schedule/generate
  → TODAY + IN_PROGRESS 태스크를 P0→P1→P2 순 정렬
  → OpenRouter chatComplete() 호출
  → 타임블록 자동 생성 (겹침 검증 포함)
```

---

## 3. 디렉토리 구조

```
productivity-app/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts           # AI 채팅 (SSE 스트리밍)
│   │   │   ├── inbox/route.ts          # 인박스 CRUD
│   │   │   ├── inbox/count/route.ts    # 미처리 카운트
│   │   │   ├── projects/route.ts       # 프로젝트 목록/생성
│   │   │   ├── projects/[id]/route.ts  # 프로젝트 수정/삭제
│   │   │   ├── schedule/generate/route.ts # AI 스케줄 생성
│   │   │   ├── tasks/route.ts          # 태스크 목록/생성
│   │   │   ├── tasks/[id]/route.ts     # 태스크 수정/삭제
│   │   │   ├── time-blocks/route.ts    # 타임블록 CRUD
│   │   │   └── time-blocks/[id]/route.ts
│   │   ├── page.tsx                    # 대시보드 (/)
│   │   ├── inbox/page.tsx              # 인박스 (/inbox)
│   │   ├── board/page.tsx              # 칸반 보드 (/board)
│   │   └── schedule/page.tsx           # 스케줄 (/schedule)
│   ├── components/
│   │   ├── board/                      # 칸반: 보드, 컬럼, 카드, 필터
│   │   ├── inbox/                      # 인박스: 채팅, 처리 목록
│   │   ├── schedule/                   # 스케줄: 타임라인, 블록
│   │   ├── dashboard/                  # 대시보드 위젯
│   │   ├── layout/                     # AppShell, Sidebar, ChatPanel
│   │   ├── shared/                     # PriorityBadge 등 공통
│   │   └── ui/                         # shadcn/ui 컴포넌트
│   ├── hooks/
│   │   ├── use-chat.ts                 # 채팅 SSE 훅
│   │   ├── use-tasks.ts                # 태스크 CRUD 훅
│   │   ├── use-time-blocks.ts          # 타임블록 훅
│   │   └── use-projects.ts             # 프로젝트 훅
│   ├── db/
│   │   ├── index.ts                    # DB 초기화 + 자동 테이블 생성
│   │   ├── schema.ts                   # Drizzle 스키마
│   │   └── queries/                    # 테이블별 쿼리 함수
│   ├── lib/
│   │   ├── anthropic.ts                # OpenRouter API 클라이언트
│   │   ├── classify.ts                 # AI 응답 JSON 파싱
│   │   ├── prompts.ts                  # AI 시스템 프롬프트
│   │   ├── constants.ts                # 상수 (WIP 제한, 라벨 등)
│   │   └── utils.ts                    # cn() 유틸
│   └── types/index.ts                  # TypeScript 타입 정의
├── data/                               # SQLite DB 파일 (gitignore)
├── .env.local                          # OPENROUTER_API_KEY
├── drizzle.config.ts                   # Drizzle Kit 설정
└── package.json
```

---

## 4. 환경 설정

```bash
# 의존성 설치
npm install

# 환경 변수 (.env.local)
OPENROUTER_API_KEY=sk-or-v1-...

# 개발 서버 (DB 자동 생성됨)
npm run dev

# 빌드
npm run build
```

**DB는 별도 마이그레이션 불필요** — 서버 시작 시 `CREATE TABLE IF NOT EXISTS`로 자동 초기화.

---

## 5. 이번 작업에서 변경된 사항

### API 전환
| Before | After |
|--------|-------|
| `@anthropic-ai/sdk` (Anthropic 직접) | `fetch` 기반 OpenRouter API |
| `client.messages.create({stream})` | `chatStream(system, messages)` |
| `content_block_delta` 파싱 | `delta.content` (OpenAI SSE 포맷) 파싱 |
| `ANTHROPIC_API_KEY` | `OPENROUTER_API_KEY` |

### 버그 수정 (3건)
| 버그 | 파일 | 수정 |
|------|------|------|
| 마감일 필터 SQL 타입 불일치 | `db/queries/tasks.ts` | `toISOString()` → `.split("T")[0]` |
| 드래그앤드롭 순서 미저장 | `board/kanban-board.tsx` | `sortOrder` 계산 후 PATCH |
| blockType enum 미검증 | `api/tasks/route.ts`, `[id]/route.ts` | `deep\|shallow` 검증 추가 |

### 신규 기능 (6건)
| 기능 | 파일 |
|------|------|
| 타임블록 겹침 검증 | `api/time-blocks/route.ts` |
| 타임블록 태스크 정보 표시 | `schedule/timeline.tsx`, `time-block-item.tsx` |
| 인박스→칸반 링크 + 삭제 표시 | `inbox/processed-items.tsx` |
| contextTags 필터 | `board/tag-filter.tsx`, `board-view.tsx`, `kanban-board.tsx` |
| 프로젝트 CRUD + 연결 | `api/projects/[id]`, `use-projects.ts`, `task-detail-dialog.tsx`, `project-filter.tsx` |
| 스케줄 우선순위 정렬 | `api/schedule/generate/route.ts` |

### 기반 개선 (4건)
| 개선 | 파일 |
|------|------|
| ChatPanel 인박스 중복 해소 | `layout/chat-panel.tsx` |
| DB 자동 테이블 생성 | `db/index.ts` |
| SSE controller 안전 처리 | `api/chat/route.ts` |
| AI 시스템 프롬프트 개선 (기능 인식 + status) | `lib/prompts.ts`, `lib/classify.ts`, `types/index.ts` |

---

## 6. 알려진 제한사항 및 향후 개선 방향

### 현재 제한사항
- AI 채팅은 분류+생성만 가능 (태스크 조회/수정/삭제는 UI에서 직접)
- 스케줄 자동생성은 수동 버튼 클릭 필요 (채팅에서 직접 트리거 불가)
- 프로젝트 관리 UI는 태스크 상세 다이얼로그 내 선택기만 존재 (전용 페이지 없음)
- 태그 검색은 칸반 보드에서만 가능 (전역 검색 없음)

### 향후 확장 시 고려사항

**Tool Use(Function Calling) 전환 시점:**
현재는 프롬프트+JSON 파싱 방식이 충분하지만, 아래 요구사항이 3개 이상 발생하면 전환 검토:
- "태스크 X를 내일로 미뤄줘" (상태/날짜 변경)
- "이번 주 P0 태스크 알려줘" (조회)
- "오후 스케줄 비워줘" (타임블록 삭제)
- "이 태스크를 프로젝트 Y에 넣어줘" (연결 변경)

**전환 시 아키텍처:**
```
chatStream() → OpenAI tools 파라미터 추가
  → AI가 tool_call 반환
  → 서버에서 도구 실행 (create_task, update_task, generate_schedule 등)
  → 결과를 AI에게 다시 전달
  → AI가 최종 응답 생성
```

**주의점:**
- 스트리밍 UX가 변경됨 (도구 실행 중 로딩 상태 필요)
- 보안: AI의 직접 DB 변경에 대한 검증 레이어 필요
- OpenRouter의 function calling 호환성 확인 필요

---

## 7. API 레퍼런스

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/chat` | 채팅 메시지 목록 |
| POST | `/api/chat` | 메시지 전송 (SSE 스트리밍) |
| GET | `/api/inbox` | 인박스 항목 (`?processed=true/false`) |
| POST | `/api/inbox` | 인박스 항목 추가 |
| GET | `/api/inbox/count` | 미처리 항목 수 |
| GET | `/api/tasks` | 태스크 목록 (`?dueSoon=true`) |
| POST | `/api/tasks` | 태스크 생성 |
| GET | `/api/tasks/:id` | 태스크 조회 |
| PATCH | `/api/tasks/:id` | 태스크 수정 |
| DELETE | `/api/tasks/:id` | 태스크 삭제 |
| GET | `/api/projects` | 프로젝트 목록 |
| POST | `/api/projects` | 프로젝트 생성 |
| GET | `/api/projects/:id` | 프로젝트 조회 |
| PATCH | `/api/projects/:id` | 프로젝트 수정 |
| DELETE | `/api/projects/:id` | 프로젝트 삭제 |
| GET | `/api/time-blocks?date=` | 타임블록 조회 |
| POST | `/api/time-blocks` | 타임블록 생성 (겹침 검증) |
| PATCH | `/api/time-blocks/:id` | 타임블록 수정 |
| DELETE | `/api/time-blocks/:id` | 타임블록 삭제 |
| DELETE | `/api/time-blocks?date=` | 해당일 전체 삭제 |
| POST | `/api/schedule/generate` | AI 스케줄 자동생성 |
