/**
 * InvoiceNote 컴포넌트
 *
 * 견적서 비고 섹션을 표시합니다.
 * note가 빈 문자열이면 렌더링하지 않습니다.
 * 줄바꿈 문자가 포함된 경우 whitespace-pre-line으로 처리합니다.
 */

interface InvoiceNoteProps {
  /** 비고 텍스트 (빈 문자열이면 표시 안 함) */
  note: string;
}

export default function InvoiceNote({ note }: InvoiceNoteProps) {
  // 비고가 없으면 렌더링 생략
  if (!note.trim()) return null;

  return (
    <div className="border border-border rounded-md p-4">
      <p className="text-sm font-medium text-muted-foreground mb-2">비고</p>
      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
        {note}
      </p>
    </div>
  );
}
