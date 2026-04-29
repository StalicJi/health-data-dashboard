# Health Data Dashboard

個人睡眠數據追蹤與視覺化儀表板。從 Apple Watch 自動記錄的睡眠數據出發，透過上傳 Apple Health 匯出的 ZIP 檔，即可在瀏覽器中看到完整的睡眠分析圖表與品質評分。

本專案為個人使用設計（單一使用者架構），資料儲存於本機 PostgreSQL 資料庫，不依賴任何第三方雲端服務。

---

## 功能一覽

**睡眠儀表板**
- 時間範圍切換：7 天 / 30 天 / 90 天
- 統計卡片：平均睡眠時間、睡眠評分（0–100）、深度睡眠佔比、REM 睡眠佔比、佩戴天數、未佩戴天數
- 每日睡眠分佈折線圖（總睡眠時間趨勢）
- 睡眠週期堆疊柱狀圖（In Bed / 核心 / 深層 / REM / 清醒）
- 睡眠品質雷達圖（五維度：深層睡眠% / REM% / 核心睡眠% / 睡眠評分 / 總時長達標）
- 每週佩戴記錄（teal = 有紀錄，深藍 = 未佩戴）
- 年度月度趨勢折線圖

**資料上傳**
- 拖曳或點擊上傳 Apple Health 匯出 ZIP 檔
- SAX 串流解析，支援大型 XML（不受記憶體限制）
- 解析完成後自動計算每日 / 週 / 月聚合統計，寫入資料庫

**其他**
- 深海軍藍 / teal 主題，全站 dark-by-default
- 無資料時顯示引導上傳的空狀態畫面
- 行動裝置可透過區網 IP 存取開發伺服器

---

## 技術棧

| 層級 | 技術 |
|---|---|
| 框架 | Next.js 16（App Router，TypeScript） |
| 資料庫 ORM | Prisma 7 + `@prisma/adapter-pg` |
| 資料庫 | PostgreSQL |
| 前端狀態 / 請求 | TanStack Query v5 |
| 圖表 | Recharts v3 |
| UI 元件 | shadcn/ui（Base UI）+ Tailwind CSS v4 |
| XML 解析 | sax（串流）+ unzipper |
| 日期工具 | date-fns v4 |
| 語言 | TypeScript 5 / React 19 |

---

## 快速開始

### 環境需求

- **Node.js 20+**（Prisma 7 不支援 Node.js 18，建議使用 nvm）
- **PostgreSQL**（本機安裝，預設 `localhost:5432`）

```bash
# 切換至 Node.js 20（若使用 nvm）
nvm use 20
```

### 安裝步驟

**1. 複製專案並安裝依賴**

```bash
git clone <repository-url>
cd health-data-dashboard
npm install
```

**2. 設定環境變數**

在專案根目錄建立 `.env.local`：

```env
DATABASE_URL="postgresql://your_user:your_password@localhost:5432/health_dashboard"
```

請將 `your_user`、`your_password` 替換為你的 PostgreSQL 帳密，資料庫名稱可自訂。

**3. 建立資料庫與資料表**

先在 PostgreSQL 中手動建立資料庫（資料庫名稱需與 `DATABASE_URL` 一致）：

```bash
psql -U postgres -c "CREATE DATABASE health_dashboard;"
```

接著執行 Prisma 建立所有資料表：

```bash
npx prisma db push
```

**4. 建立初始使用者記錄**

本專案為單一使用者架構，所有資料繫結至 `id = 1` 的使用者，需手動插入一筆初始記錄：

```bash
psql -U postgres -d health_dashboard -c "INSERT INTO \"User\" (email, \"createdAt\", \"updatedAt\") VALUES ('your@email.com', NOW(), NOW());"
```

**5. 啟動開發伺服器**

```bash
npm run dev
```

開啟瀏覽器至 [http://localhost:3000](http://localhost:3000)。

> `predev` 腳本會自動執行 `prisma generate`，無需手動執行。

---

## 使用說明

### 上傳 Apple Health 資料

1. 在 iPhone 的「健康」App 中，點擊右上角個人頭像
2. 向下滾動，點擊「匯出所有健康資料」
3. 等待產生 ZIP 檔後，透過 AirDrop 或其他方式將 ZIP 傳至電腦
4. 前往網站的「上傳」頁面（導覽列右上角）
5. 拖曳 ZIP 檔至上傳區域，或點擊選取檔案
6. 等待解析完成（大型 ZIP 可能需要幾十秒）

解析完成後，系統會自動計算每日、週、月的聚合統計並寫入資料庫。

### 查看儀表板

返回首頁即可看到所有睡眠圖表。使用右上角的時間範圍切換器（7天 / 30天 / 90天）調整顯示區間。

**各圖表說明：**

| 圖表 | 說明 |
|---|---|
| 統計卡片 | 選取範圍內的平均睡眠數據，排除未佩戴的日子 |
| 每日睡眠分佈 | 每天的總睡眠時間趨勢折線圖 |
| 睡眠週期堆疊 | 每天各睡眠階段的時長比例堆疊圖 |
| 睡眠品質雷達 | 五維度平均值，顯示整體睡眠品質側寫 |
| 每週佩戴記錄 | 以週為單位，一眼看出哪幾天有佩戴手錶 |
| 月度趨勢 | 本年度每月平均睡眠時間趨勢 |

---

## 睡眠品質評分公式

評分範圍 0–100，由睡眠結構與總時長兩部分組成：

```
score = (deep% × 0.35 + core% × 0.30 + rem% × 0.20) × 85
      + min(totalMinutes / 480, 1) × 15
```

| 分數 | 等級 |
|---|---|
| 85–100 | 優良 |
| 70–84 | 良好 |
| 55–69 | 普通 |
| 0–54 | 需改善 |

詳細公式說明請參閱 [`docs/formulas.md`](./docs/formulas.md)。

---

## 專案結構

```
health-data-dashboard/
├── app/
│   ├── api/
│   │   ├── health/route.ts          # 服務健康檢查 GET /api/health
│   │   ├── upload/route.ts          # 上傳解析 POST /api/upload
│   │   └── sleep/
│   │       ├── route.ts             # 分頁查詢原始記錄 GET /api/sleep
│   │       ├── daily/route.ts       # 每日統計 GET /api/sleep/daily
│   │       ├── weekly/route.ts      # 每週統計 GET /api/sleep/weekly
│   │       ├── monthly/route.ts     # 每月統計 GET /api/sleep/monthly
│   │       └── yearly/route.ts      # 年度統計 GET /api/sleep/yearly
│   ├── dashboard/
│   │   └── components/
│   │       ├── EmptyState.tsx        # 無資料引導畫面
│   │       ├── SleepChart.tsx        # 每日睡眠折線圖
│   │       ├── SleepCycleBreakdown.tsx  # 週期堆疊柱狀圖
│   │       ├── SleepQualityRadar.tsx    # 品質雷達圖
│   │       ├── SleepStatsCard.tsx       # 統計卡片
│   │       ├── SleepTrendChart.tsx      # 月度趨勢折線圖
│   │       └── SleepWearCalendar.tsx    # 每週佩戴記錄圖
│   ├── upload/
│   │   ├── page.tsx                 # 上傳頁面
│   │   └── components/
│   │       └── FileUploader.tsx      # 拖曳上傳元件
│   ├── generated/prisma/            # Prisma 自動產生的 client（勿手動修改）
│   ├── layout.tsx                   # Root layout（導覽列、Providers）
│   ├── page.tsx                     # 首頁 = 儀表板
│   └── providers.tsx                # TanStack Query Provider
├── lib/
│   ├── db.ts                        # Prisma singleton client
│   ├── sleepAnalyzer.ts             # 每日/週/月統計聚合、品質評分
│   ├── types.ts                     # 全域 TypeScript 型別
│   ├── utils.ts                     # cn()、formatMinutes()、formatDate()
│   └── xmlParser.ts                 # ZIP 解壓 + Apple Health XML SAX 解析
├── prisma/
│   └── schema.prisma                # 資料庫 schema（6 張資料表）
└── docs/
    └── formulas.md                  # 所有統計公式詳細文件
```

---

## API 端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| `POST` | `/api/upload` | 上傳 Apple Health ZIP，解析並寫入資料庫 |
| `GET` | `/api/sleep` | 分頁查詢原始睡眠記錄 |
| `GET` | `/api/sleep/daily` | 查詢每日統計（`?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD`） |
| `GET` | `/api/sleep/weekly` | 查詢每週統計 |
| `GET` | `/api/sleep/monthly` | 查詢每月統計（`?year=2024`） |
| `GET` | `/api/sleep/yearly` | 查詢年度統計（判斷是否曾上傳過資料） |
| `GET` | `/api/health` | 服務健康檢查 |

---

## 資料庫 Schema

| 資料表 | 說明 |
|---|---|
| `User` | 使用者（單一使用者，id=1） |
| `UploadSession` | 每次上傳的批次記錄（狀態：pending / processing / completed / failed） |
| `SleepRecord` | 從 XML 解析出的原始睡眠區間記錄 |
| `SleepDaily` | 每日聚合統計（含品質評分） |
| `SleepWeekly` | 每週平均聚合統計 |
| `SleepMonthly` | 每月平均聚合統計（含各階段佔比） |

---

## 開發注意事項

**Prisma Client 輸出路徑**

本專案的 Prisma client 輸出至 `app/generated/prisma`（非預設的 `node_modules/@prisma/client`），import 路徑為：

```typescript
import { PrismaClient } from '@/app/generated/prisma/client';
```

**Apple Health 日期格式**

Apple Health XML 日期格式為 `"2024-05-07 01:05:31 +0800"`（時區前有空格，非標準 ISO 8601），解析時需要特別處理：

```typescript
dateStr.replace(' ', 'T').replace(/\s*([+-])(\d{2})(\d{2})$/, '$1$2:$3')
```

**日期歸屬規則**

睡眠跨越午夜時，以 `endDate` 的日期代表當晚（例如 5/6 晚上 23:30 入睡，5/7 早上 7:00 起床，歸屬於 5/7）。

**行動裝置開發存取**

`npm run dev` 綁定 `0.0.0.0`，同一區網內的手機可透過電腦 IP 存取（如 `http://192.168.1.x:3000`）。如需允許特定來源，在 `next.config.ts` 的 `allowedDevOrigins` 中加入對應 IP。

---

## 已知限制

- 目前無使用者認證，`userId` 硬編為 1，僅適合本機個人使用，**請勿部署至公開網路**
- 上傳進度僅顯示文字狀態，尚未實作進度條
- 儀表板年份固定顯示當年，尚未支援手動切換
- 尚未實作 `/api/sleep/stats` 整體摘要端點
