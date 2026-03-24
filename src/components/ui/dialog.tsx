/**
 * Dialog 컴포넌트 모음
 *
 * Radix UI의 Dialog 프리미티브를 기반으로 shadcn/ui 스타일로 래핑한 모달 다이얼로그입니다.
 * 사용자에게 중요한 정보를 전달하거나, 확인/취소 같은 액션을 요구할 때
 * 화면 위에 띄우는 레이어(모달)를 구현할 때 사용합니다.
 *
 * 구성 컴포넌트:
 * - Dialog           : 전체 다이얼로그의 루트 (열림/닫힘 상태 관리)
 * - DialogTrigger    : 다이얼로그를 여는 트리거 요소
 * - DialogPortal     : DOM body에 직접 렌더링하는 포털 래퍼
 * - DialogClose      : 다이얼로그를 닫는 요소 래퍼
 * - DialogOverlay    : 배경 반투명 오버레이
 * - DialogContent    : 실제 다이얼로그 본문 영역
 * - DialogHeader     : 제목과 설명을 담는 상단 영역
 * - DialogFooter     : 액션 버튼을 담는 하단 영역
 * - DialogTitle      : 다이얼로그 제목
 * - DialogDescription: 다이얼로그 보조 설명 텍스트
 *
 * @see https://www.radix-ui.com/docs/primitives/components/dialog
 */
"use client"

import * as React from "react"
import { XIcon } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/**
 * 다이얼로그 루트 컴포넌트
 *
 * 다이얼로그의 열림/닫힘 상태를 관리하는 최상위 컨테이너입니다.
 * 모든 Dialog 서브 컴포넌트는 반드시 이 컴포넌트 안에 위치해야 합니다.
 *
 * 비제어 방식(open 없이 사용)과 제어 방식(open + onOpenChange로 직접 상태 관리) 모두 지원합니다.
 *
 * @param open         - 다이얼로그 열림 여부를 외부에서 제어할 때 사용 (제어 컴포넌트)
 * @param onOpenChange - 열림 상태가 변경될 때 호출되는 콜백 함수
 * @param defaultOpen  - 초기 렌더링 시 열려있을지 여부 (비제어 컴포넌트)
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  // data-slot은 부모 컴포넌트에서 CSS 선택자로 자식을 타겟팅할 때 활용합니다
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * 다이얼로그 트리거 컴포넌트
 *
 * 클릭 시 다이얼로그를 여는 역할을 하는 요소입니다.
 * 일반적으로 버튼 컴포넌트를 감싸서 사용합니다.
 *
 * @example
 * <DialogTrigger asChild>
 *   <Button>열기</Button>
 * </DialogTrigger>
 *
 * @param asChild - true로 설정하면 자식 요소에 트리거 동작을 위임합니다 (Radix UI asChild 패턴)
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * 다이얼로그 포털 컴포넌트
 *
 * 다이얼로그 내용을 React 트리상의 현재 위치가 아닌 document.body에 직접 렌더링합니다.
 * 이렇게 하면 z-index나 overflow:hidden 같은 부모 스타일의 영향을 받지 않아
 * 다이얼로그가 항상 화면 최상단에 올바르게 표시됩니다.
 *
 * 보통 DialogContent 내부에서 자동으로 사용되므로 직접 사용할 일은 드뭅니다.
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * 다이얼로그 닫기 컴포넌트
 *
 * 클릭 시 다이얼로그를 닫는 역할을 합니다.
 * DialogContent 내부의 X 버튼과는 별개로,
 * 푸터에 "취소" 버튼 등을 직접 만들 때 활용합니다.
 *
 * @example
 * <DialogClose asChild>
 *   <Button variant="outline">취소</Button>
 * </DialogClose>
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * 다이얼로그 오버레이 컴포넌트
 *
 * 다이얼로그가 열릴 때 배경을 반투명한 검정색으로 덮는 레이어입니다.
 * 시각적으로 다이얼로그에 집중하게 만들고, 클릭 시 다이얼로그를 닫는 역할도 합니다.
 * 열릴 때 fade-in, 닫힐 때 fade-out 애니메이션이 자동으로 적용됩니다.
 *
 * @param className - 추가적인 Tailwind 클래스를 병합할 때 사용
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        // data-[state=open/closed]: Radix UI가 상태에 따라 자동으로 속성을 붙여줍니다
        // animate-in / animate-out: Tailwind 애니메이션 유틸리티로 부드러운 전환 효과를 줍니다
        // fixed inset-0: 화면 전체를 덮도록 고정 배치합니다
        // z-50: 다른 요소 위에 올라오도록 z-index를 설정합니다
        // bg-black/50: 50% 투명도의 검정 배경을 적용합니다
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        // cn()으로 외부에서 전달된 className을 병합해 커스터마이징을 허용합니다
        className
      )}
      {...props}
    />
  )
}

/**
 * 다이얼로그 본문 컨테이너 컴포넌트
 *
 * 실제 다이얼로그 내용이 들어가는 패널입니다.
 * 내부적으로 DialogPortal과 DialogOverlay를 자동으로 포함하므로,
 * 사용자는 이 컴포넌트만 사용해도 완전한 다이얼로그를 구현할 수 있습니다.
 *
 * 화면 중앙에 고정 배치되며, 열림/닫힘 시 fade + zoom 애니메이션이 적용됩니다.
 *
 * @param className       - 추가 Tailwind 클래스 (최대 너비, 패딩 등 커스터마이징)
 * @param children        - 다이얼로그 내부에 렌더링할 콘텐츠
 * @param showCloseButton - 우상단 X 닫기 버튼 표시 여부 (기본값: true)
 */
function DialogContent({
  className,
  children,
  // 기본값을 true로 설정해 별도 설정 없이도 X 버튼이 항상 표시됩니다
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    // DialogPortal로 감싸 body에 직접 렌더링해 부모 스타일의 간섭을 차단합니다
    <DialogPortal data-slot="dialog-portal">
      {/* 배경 오버레이를 자동으로 렌더링합니다 */}
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          // bg-background: CSS 변수로 정의된 배경색으로 다크모드에 자동 대응합니다
          // fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]: 화면 정중앙 배치 기법입니다
          // max-w-[calc(100%-2rem)]: 모바일에서 좌우 1rem씩 여백을 확보합니다
          // sm:max-w-lg: 태블릿 이상에서는 최대 너비를 lg(32rem)로 제한합니다
          // zoom-out-95 / zoom-in-95: 닫힐 때 살짝 축소, 열릴 때 살짝 확대되는 애니메이션입니다
          // duration-200: 애니메이션 전환 속도를 200ms로 설정합니다
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {/* showCloseButton이 true일 때만 우상단 X 닫기 버튼을 렌더링합니다 */}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            {/* sr-only: 화면에는 보이지 않지만 스크린 리더가 읽을 수 있는 접근성 전용 텍스트입니다 */}
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * 다이얼로그 헤더 컴포넌트
 *
 * DialogTitle과 DialogDescription을 담는 상단 영역입니다.
 * 모바일에서는 중앙 정렬, 태블릿(sm) 이상에서는 좌측 정렬로 자동 전환됩니다.
 *
 * @param className - 추가 Tailwind 클래스
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        // flex-col gap-2: 제목과 설명을 세로로 2단위 간격을 두고 배치합니다
        // text-center sm:text-left: 모바일은 중앙 정렬, 데스크탑은 좌측 정렬로 전환합니다
        "flex flex-col gap-2 text-center sm:text-left",
        className
      )}
      {...props}
    />
  )
}

/**
 * 다이얼로그 푸터 컴포넌트
 *
 * 확인, 취소 등 액션 버튼을 담는 하단 영역입니다.
 * 모바일에서는 버튼이 세로로 쌓이고(역순으로 배치), 태블릿 이상에서는 가로 우측 정렬로 전환됩니다.
 *
 * @param className       - 추가 Tailwind 클래스
 * @param showCloseButton - outline 스타일의 "Close" 닫기 버튼 자동 추가 여부 (기본값: false)
 * @param children        - 푸터에 렌더링할 버튼 등의 콘텐츠
 */
function DialogFooter({
  className,
  // DialogContent의 showCloseButton(기본값: true)과 달리,
  // 푸터의 닫기 버튼은 기본적으로 숨겨져 있습니다.
  // 자체 취소 버튼을 만들지 않고 간편하게 닫기 버튼을 추가할 때 true로 설정합니다.
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        // flex-col-reverse: 모바일에서 버튼을 역순으로 쌓아 주요 액션이 상단에 오게 합니다
        // sm:flex-row sm:justify-end: 데스크탑에서는 버튼을 가로로 우측 정렬합니다
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {/* showCloseButton이 true이면 outline 스타일의 닫기 버튼을 자동으로 추가합니다 */}
      {showCloseButton && (
        // asChild 패턴: DialogPrimitive.Close의 닫기 동작을 Button 컴포넌트에 위임합니다
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

/**
 * 다이얼로그 제목 컴포넌트
 *
 * 다이얼로그의 제목을 표시합니다.
 * Radix UI가 aria-labelledby로 이 컴포넌트를 자동 연결하므로,
 * 스크린 리더 사용자도 다이얼로그의 목적을 파악할 수 있습니다.
 *
 * @param className - 추가 Tailwind 클래스 (폰트 크기, 색상 등 커스터마이징)
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        // text-lg: 18px 크기, leading-none: 줄 간격 제거, font-semibold: 굵은 글씨
        "text-lg leading-none font-semibold",
        className
      )}
      {...props}
    />
  )
}

/**
 * 다이얼로그 설명 컴포넌트
 *
 * 다이얼로그 제목 아래에 표시되는 보조 설명 텍스트입니다.
 * Radix UI가 aria-describedby로 이 컴포넌트를 자동 연결해 접근성을 보장합니다.
 *
 * @param className - 추가 Tailwind 클래스
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        // text-muted-foreground: CSS 변수로 정의된 보조 텍스트 색상으로 다크모드에 자동 대응합니다
        // text-sm: 14px 크기로 제목보다 작게 표시합니다
        "text-muted-foreground text-sm",
        className
      )}
      {...props}
    />
  )
}

// 외부에서 사용할 수 있도록 모든 서브 컴포넌트를 내보냅니다
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
