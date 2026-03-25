/**
 * 견적서 페이지 로딩 스켈레톤 UI
 *
 * Next.js Suspense 경계에 자동으로 표시됩니다.
 * 견적서 데이터를 Notion API에서 가져오는 동안 사용자에게
 * 페이지 레이아웃을 미리 보여줌으로써 체감 로딩 시간을 줄입니다.
 *
 * 컴포넌트 구조를 실제 Invoice 페이지와 동일하게 유지합니다:
 * - InvoiceActions (버튼 영역)
 * - InvoiceHeader (헤더)
 * - InvoiceClientInfo (고객 정보)
 * - InvoiceItemsTable (품목 테이블)
 * - InvoiceSummary (합계)
 */
export default function InvoiceLoading() {
  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-4xl mx-auto">

        {/* 액션 버튼 스켈레톤 */}
        <div className="flex justify-end gap-3 mb-6">
          <div className="h-9 w-32 bg-muted animate-pulse rounded-md" />
          <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
        </div>

        {/* 견적서 본문 스켈레톤 */}
        <div className="bg-white shadow-sm rounded-lg p-8">

          {/* InvoiceHeader 스켈레톤 */}
          <div className="flex justify-between items-start mb-8">
            {/* 좌측: 발급사명 */}
            <div className="space-y-2">
              <div className="h-7 w-32 bg-muted animate-pulse rounded" />
            </div>
            {/* 우측: 제목, 번호, 날짜, 상태 */}
            <div className="text-right space-y-2">
              <div className="h-8 w-24 bg-muted animate-pulse rounded ml-auto" />
              <div className="h-4 w-36 bg-muted animate-pulse rounded ml-auto" />
              <div className="h-4 w-36 bg-muted animate-pulse rounded ml-auto" />
              <div className="h-4 w-36 bg-muted animate-pulse rounded ml-auto" />
              <div className="h-5 w-16 bg-muted animate-pulse rounded-full ml-auto" />
            </div>
          </div>

          {/* InvoiceClientInfo 스켈레톤 */}
          <div className="border border-gray-200 rounded-md p-4 mb-6 space-y-2">
            <div className="h-4 w-56 bg-muted animate-pulse rounded" />
            <div className="h-4 w-40 bg-muted animate-pulse rounded" />
          </div>

          {/* InvoiceItemsTable 스켈레톤 */}
          <div className="space-y-1 mb-6">
            {/* 헤더 행 */}
            <div className="h-9 bg-muted animate-pulse rounded" />
            {/* 데이터 행 3개 */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted/50 animate-pulse rounded" />
            ))}
          </div>

          {/* InvoiceSummary 스켈레톤 */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-2">
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-8 bg-muted animate-pulse rounded" />
              <div className="h-10 bg-muted animate-pulse rounded" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
