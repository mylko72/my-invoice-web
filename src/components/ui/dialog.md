# Dialog

> Radix UI 기반의 모달 다이얼로그 컴포넌트 모음

## 개요

`dialog.tsx`는 Radix UI의 `Dialog` 프리미티브를 shadcn/ui 스타일로 래핑한 모달 다이얼로그 컴포넌트 집합입니다.
사용자에게 중요한 정보를 전달하거나, 확인/취소 같은 결정을 요구할 때 화면 위에 레이어를 띄워 표시합니다.
키보드 접근성(포커스 트랩, ESC 닫기), 스크린 리더 지원, 다크모드 대응이 모두 Radix UI에 의해 자동으로 처리됩니다.

---

## 컴포넌트 구성

| 컴포넌트 | 역할 |
|----------|------|
| `Dialog` | 전체 다이얼로그의 루트. 열림/닫힘 상태를 관리합니다. |
| `DialogTrigger` | 클릭 시 다이얼로그를 여는 트리거 요소입니다. |
| `DialogPortal` | 콘텐츠를 `document.body`에 직접 렌더링하는 포털 래퍼입니다. |
| `DialogClose` | 클릭 시 다이얼로그를 닫는 요소 래퍼입니다. |
| `DialogOverlay` | 배경을 반투명 검정으로 덮는 오버레이입니다. |
| `DialogContent` | 다이얼로그 본문 패널. 포털과 오버레이를 자동 포함합니다. |
| `DialogHeader` | 제목과 설명을 담는 상단 영역입니다. |
| `DialogFooter` | 액션 버튼을 담는 하단 영역입니다. |
| `DialogTitle` | 다이얼로그 제목 (접근성 aria 자동 연결). |
| `DialogDescription` | 다이얼로그 보조 설명 텍스트 (접근성 aria 자동 연결). |

---

## 사용 방법

### 기본 사용 예시

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

export default function Example() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>다이얼로그 열기</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>제목을 입력하세요</DialogTitle>
          <DialogDescription>
            여기에 다이얼로그의 설명을 입력합니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit">확인</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### 외부에서 열림 상태 직접 제어하기 (제어 컴포넌트)

```tsx
const [open, setOpen] = React.useState(false)

return (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button>열기</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>제어 컴포넌트 예시</DialogTitle>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={() => setOpen(false)}>닫기</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)
```

### X 버튼 숨기고 푸터에 닫기 버튼 표시하기

```tsx
<DialogContent showCloseButton={false}>
  <DialogHeader>
    <DialogTitle>확인이 필요합니다</DialogTitle>
    <DialogDescription>이 작업을 진행하시겠습니까?</DialogDescription>
  </DialogHeader>
  <DialogFooter showCloseButton={true}>
    <Button>확인</Button>
  </DialogFooter>
</DialogContent>
```

### 직접 닫기 버튼 만들기

```tsx
import { DialogClose } from "@/components/ui/dialog"

<DialogFooter>
  <DialogClose asChild>
    <Button variant="outline">취소</Button>
  </DialogClose>
  <Button>저장</Button>
</DialogFooter>
```

---

## Props 상세

### `Dialog`

Radix UI `Dialog.Root`의 모든 props를 그대로 전달받습니다.

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| `open` | `boolean` | ❌ | - | 열림 여부를 외부에서 제어합니다 (제어 컴포넌트) |
| `onOpenChange` | `(open: boolean) => void` | ❌ | - | 열림 상태 변경 시 호출되는 콜백 |
| `defaultOpen` | `boolean` | ❌ | `false` | 초기 렌더링 시 열려있을지 여부 (비제어 컴포넌트) |
| `modal` | `boolean` | ❌ | `true` | false로 설정하면 배경과 상호작용 가능 |

### `DialogContent`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| `showCloseButton` | `boolean` | ❌ | `true` | 우상단 X 닫기 버튼 표시 여부 |
| `className` | `string` | ❌ | - | 추가 Tailwind 클래스 |
| `children` | `ReactNode` | ✅ | - | 다이얼로그 내부 콘텐츠 |

### `DialogFooter`

| 이름 | 타입 | 필수 | 기본값 | 설명 |
|------|------|:----:|--------|------|
| `showCloseButton` | `boolean` | ❌ | `false` | outline 스타일 닫기 버튼 자동 추가 여부 |
| `className` | `string` | ❌ | - | 추가 Tailwind 클래스 |
| `children` | `ReactNode` | ❌ | - | 푸터에 렌더링할 버튼 등의 콘텐츠 |

### `DialogHeader` / `DialogTitle` / `DialogDescription` / `DialogOverlay`

모두 `className` prop을 받아 Tailwind 클래스를 추가할 수 있습니다.
그 외에는 각각의 기반 HTML 요소(`div`, Radix UI 컴포넌트)의 props를 그대로 전달받습니다.

---

## 주요 로직 설명

### 1. 포털 렌더링 (DialogPortal)

다이얼로그는 `ReactDOM.createPortal`을 사용해 `document.body`에 직접 렌더링됩니다.
이렇게 하는 이유는 부모 요소에 `overflow: hidden`이나 `z-index` 제한이 걸려 있어도
다이얼로그가 항상 화면 최상단에 올바르게 표시되도록 보장하기 위해서입니다.

### 2. 화면 중앙 배치

```
fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]
```

`top: 50%`, `left: 50%`로 요소의 좌상단 모서리를 화면 중앙으로 이동한 뒤,
`translate(-50%, -50%)`로 요소 자신의 절반 크기만큼 되돌려 정확한 중앙 배치를 구현합니다.
이 방법은 요소의 크기를 미리 알 필요 없이 항상 중앙에 배치할 수 있는 CSS 표준 기법입니다.

### 3. 열림/닫힘 애니메이션

Radix UI는 열림 상태에 따라 자동으로 `data-[state=open]` / `data-[state=closed]` 속성을 부여합니다.
Tailwind CSS의 `animate-in` / `animate-out` 유틸리티와 결합해 부드러운 fade + zoom 애니메이션을 구현합니다.

- `data-[state=open]:fade-in-0` + `data-[state=open]:zoom-in-95` : 열릴 때 서서히 나타나며 살짝 확대
- `data-[state=closed]:fade-out-0` + `data-[state=closed]:zoom-out-95` : 닫힐 때 서서히 사라지며 살짝 축소

### 4. showCloseButton 기본값 차이

| 컴포넌트 | 기본값 | 이유 |
|----------|:------:|------|
| `DialogContent` | `true` | 별도 설정 없이도 항상 X 버튼으로 닫을 수 있어야 합니다. |
| `DialogFooter` | `false` | 대부분의 경우 개발자가 직접 확인/취소 버튼을 구성하기 때문입니다. |

### 5. asChild 패턴

Radix UI의 `asChild` prop은 자신의 동작(예: 클릭 시 닫기)을 직접 자식 요소에 위임합니다.
이를 통해 불필요한 DOM 중첩 없이 기존 컴포넌트(Button 등)를 그대로 활용할 수 있습니다.

```tsx
// DialogClose가 Button에 닫기 동작을 위임 → DOM에는 <button>만 렌더링됩니다
<DialogClose asChild>
  <Button variant="outline">취소</Button>
</DialogClose>
```

### 6. 접근성 (Accessibility)

- `DialogTitle`은 Radix UI에 의해 `aria-labelledby`로 자동 연결됩니다.
- `DialogDescription`은 `aria-describedby`로 자동 연결됩니다.
- X 닫기 버튼의 `<span className="sr-only">Close</span>`는 화면에는 보이지 않지만 스크린 리더가 읽어 버튼의 목적을 알려줍니다.
- ESC 키를 누르면 자동으로 닫히고, 포커스가 트랩되어 Tab 키로만 내부를 탐색할 수 있습니다.

### 7. 반응형 레이아웃

| 영역 | 모바일 | 태블릿(sm) 이상 |
|------|--------|----------------|
| `DialogContent` 최대 너비 | `calc(100% - 2rem)` (좌우 1rem 여백) | `32rem (max-w-lg)` |
| `DialogHeader` 텍스트 정렬 | 중앙 정렬 | 좌측 정렬 |
| `DialogFooter` 버튼 배치 | 세로 쌓기 (역순) | 가로 우측 정렬 |

---

## 관련 파일

- [`src/components/ui/button.tsx`](./button.tsx) — `DialogFooter`의 닫기 버튼에 사용됩니다.
- [`src/lib/utils.ts`](../../lib/utils.ts) — `cn()` 유틸리티 함수 (Tailwind 클래스 병합).
- [Radix UI Dialog 공식 문서](https://www.radix-ui.com/docs/primitives/components/dialog)
- [lucide-react XIcon](https://lucide.dev/icons/x) — X 닫기 버튼 아이콘.

---

## 변경 이력

| 날짜 | 내용 |
|------|------|
| 2026-03-09 | 한국어 주석 추가 및 문서 최초 작성 |
