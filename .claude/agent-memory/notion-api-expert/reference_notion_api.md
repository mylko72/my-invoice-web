---
name: Notion API 핵심 레퍼런스
description: Notion API v1 엔드포인트, 쿼리 패턴, 프로퍼티 타입 처리, 페이지네이션 기법
type: reference
---

## 핵심 엔드포인트
- POST /v1/databases/{database_id}/query — 데이터베이스 조회
- POST /v1/pages — 페이지(항목) 생성
- PATCH /v1/pages/{page_id} — 페이지 수정
- DELETE /v1/pages/{page_id} (archived: true) — 페이지 아카이브(삭제)
- GET /v1/databases/{database_id} — 데이터베이스 스키마 조회
- GET /v1/blocks/{block_id}/children — 블록 자식 조회

## 쿼리 구조 패턴
- filter: 단일 조건 또는 and/or 복합 조건
- sorts: [{property, direction}] 배열
- page_size: 최대 100 (기본 100)
- start_cursor: 페이지네이션 커서

## 프로퍼티 타입 목록
title, rich_text, number, select, multi_select, date, checkbox,
url, email, phone_number, relation, rollup, formula,
created_time, last_edited_time, created_by, last_edited_by, files

## 중요 패턴
- 텍스트 추출: prop.rich_text[0]?.plain_text ?? ""
- title 추출: prop.title[0]?.plain_text ?? ""
- select 값: prop.select?.name ?? null
- 날짜 값: prop.date?.start ?? null
- 관계(relation): prop.relation.map(r => r.id)

## 에러 처리 패턴
- 429 Rate Limit: 지수 백오프 (1s, 2s, 4s...)
- 404: 페이지/DB 없음 또는 권한 없음
- 400: 잘못된 필터 구조

## 페이지네이션 패턴
- has_more: true이면 다음 페이지 존재
- next_cursor: 다음 요청의 start_cursor 값
- 전체 조회 시 while(has_more) 루프 사용
