---
argument-hint: [컴포넌트명]
---

# 컴포넌트 추가

`src/components/ui`에 새로운 React 컴포넌트를 생성합니다.

## 인자

$ARGUMENTS

## 지시사항

`src/components/ui/$ARGUMENTS.tsx` 경로에 새로운 TypeScript React 컴포넌트 파일을 생성하세요.

아래 템플릿을 따릅니다:

```tsx
import { cn } from "@/lib/utils";

interface $ARGUMENTSProps {
  className?: string;
  children?: React.ReactNode;
}

export default function $ARGUMENTS({ className, children }: $ARGUMENTSProps) {
  return (
    <div className={cn("", className)}>
      {children}
    </div>
  );
}
```

### 규칙
- 타입이 지정된 `Props` 인터페이스와 함께 **TypeScript**를 사용할 것
- 모든 스타일링에 **Tailwind CSS**를 사용할 것 (인라인 스타일 금지)
- 조건부 className에는 `@/lib/utils`의 `cn()`을 사용할 것 (shadcn/ui 컨벤션)
- 컴포넌트는 **default export**로 내보낼 것
- 컴포넌트 이름은 반드시 **PascalCase**로 작성할 것 — `$ARGUMENTS`가 PascalCase가 아닌 경우 자동으로 변환할 것
- 불필요한 보일러플레이트는 추가하지 말 것 (요청이 없는 한 `useEffect`, `useState` 사용 금지)
- 파일 생성 후 전체 파일 경로와 생성된 내용을 간략히 출력할 것