# 統計計算公式文件

> 本文件說明 `lib/sleepAnalyzer.ts` 及前端元件中所有統計計算的邏輯與公式。
> 資料來源：Apple Health 匯出的 XML，經解析後存入 PostgreSQL。

---

## 1. 基本資料單位

### 1.1 睡眠類別（category）

Apple Health 將睡眠分為以下五種類別，每筆記錄有明確的 `startDate` 與 `endDate`：

| 類別代碼 | 中文名稱 | 說明 |
|---|---|---|
| `InBed` | 在床上 | 偵測到使用者在床上的時間，包含清醒與睡眠 |
| `AsleepCore` | 核心睡眠 | 淺眠階段，佔夜間睡眠最大比例 |
| `AsleepDeep` | 深層睡眠 | 慢波睡眠，對體力恢復最重要 |
| `AsleepREM` | REM 睡眠 | 快速眼動睡眠，與記憶鞏固、情緒處理相關 |
| `Awake` | 清醒 | 睡眠中短暫清醒的片段 |

> `totalSleepMinutes = core + deep + REM`（不含 InBed 與 Awake）

### 1.2 日期歸屬規則

睡眠記錄跨越午夜時，以 **`endDate` 的日期** 代表當晚。

```
範例：
  startDate = 2024-05-06 23:30  →  2024-05-06 開始入睡
  endDate   = 2024-05-07 07:00  →  歸屬於 2024-05-07
```

**原因**：使用 `startDate` 會導致同一夜的記錄被拆到兩天，以 `endDate` 可保持一致性。

### 1.3 零值天的處理

若某天只有 `InBed` 或 `Awake` 記錄，沒有任何睡眠階段（`core + deep + rem = 0`），則：
- 該天仍會存在於 `SleepDaily` 資料表
- **所有平均值計算都會排除這些天**（視同未正確偵測到睡眠）
- 佩戴記錄統計中，這些天計入「有佩戴」（有 `InBed` 記錄）

---

## 2. 每日統計（`calculateDailyStats`）

**來源**：`lib/sleepAnalyzer.ts`
**輸入**：當次上傳解析出的所有 `ParsedSleepRecord[]`
**輸出**：`SleepDailyStats[]`（每天一筆）

### 2.1 每日各類別加總

同一天內同一類別的所有片段直接相加：

```
inBedMinutes     = Σ InBed 各片段時長
coreSleepMinutes = Σ AsleepCore 各片段時長
deepSleepMinutes = Σ AsleepDeep 各片段時長
remSleepMinutes  = Σ AsleepREM 各片段時長
awakeMinutes     = Σ Awake 各片段時長

totalSleepMinutes = coreSleepMinutes + deepSleepMinutes + remSleepMinutes
```

### 2.2 睡眠品質評分（`sleepQualityScore`）

**範圍**：0 – 100 分（整數）
**條件**：`totalSleepMinutes > 0`，否則為 0

```
sleepQualityScore = 結構分 + 時長分

結構分（最高 85 分）：
  = (deepPct × 0.35 + corePct × 0.30 + remPct × 0.20) × 85

  其中：
    deepPct  = deepSleepMinutes  / totalSleepMinutes  （0–1）
    corePct  = coreSleepMinutes  / totalSleepMinutes  （0–1）
    remPct   = remSleepMinutes   / totalSleepMinutes  （0–1）

時長分（最高 15 分）：
  = min(totalSleepMinutes / 480, 1) × 15

  其中：
    480 分鐘 = 8 小時（理想睡眠時長基準）
    超過 8 小時不額外加分（上限為 1）
```

**完整公式**：

```
score = round(
  (deep/total × 0.35 + core/total × 0.30 + rem/total × 0.20) × 85
  + min(total / 480, 1) × 15
)
```

**各階段權重說明**：

| 睡眠階段 | 結構分權重 | 依據 |
|---|---|---|
| 深層睡眠（Deep） | 35% | 體力、免疫恢復最關鍵 |
| 核心睡眠（Core） | 30% | 佔比最高，維持基本睡眠品質 |
| REM 睡眠（REM） | 20% | 記憶與情緒，重要但次於前兩者 |
| 時長達標 | 15% | 足夠的總睡眠時長作為基礎加分 |

**評分等級參考**：

| 分數 | 等級 |
|---|---|
| 85–100 | 優良 |
| 70–84 | 良好 |
| 55–69 | 普通 |
| 0–54 | 需改善 |

---

## 3. 週統計（`aggregateWeekly`）

**來源**：`lib/sleepAnalyzer.ts`
**輸入**：`SleepDailyStats[]`
**輸出**：`SleepWeeklyStats[]`（每週一筆，以週一為起始日）

### 3.1 週歸屬

每天依其日期找到所屬週的**週一**作為 key，週日為 `weekEnd`：

```
weekStart = 該週的週一日期（ISO 8601，週一為一週開始）
weekEnd   = weekStart + 6 天
```

### 3.2 週平均計算

**前提**：過濾掉 `totalSleepMinutes === 0` 的天，只對有效睡眠日計算平均。若整週全為零值，該週不產生記錄。

```
avgTotalSleepMinutes  = round( mean(sleepDays.totalSleepMinutes) )

avgDeepSleepPercentage = mean( deepSleepMinutes / totalSleepMinutes × 100 )
avgRemSleepPercentage  = mean( remSleepMinutes  / totalSleepMinutes × 100 )

avgQualityScore = round( mean(sleepDays.sleepQualityScore) )
```

> `mean(x)` = 算術平均（總和 ÷ 天數）

---

## 4. 月統計（`aggregateMonthly`）

**來源**：`lib/sleepAnalyzer.ts`
**輸入**：`SleepDailyStats[]`
**輸出**：`SleepMonthlyStats[]`（每月一筆）

### 4.1 月平均計算

**前提**：同週統計，過濾 `totalSleepMinutes === 0` 的天。若整月全為零值，該月不產生記錄。

```
avgTotalSleepMinutes   = round( mean(sleepDays.totalSleepMinutes) )

avgDeepSleepPercentage  = mean( deepSleepMinutes  / totalSleepMinutes × 100 )
avgCoreSleepPercentage  = mean( coreSleepMinutes  / totalSleepMinutes × 100 )
avgRemSleepPercentage   = mean( remSleepMinutes   / totalSleepMinutes × 100 )

avgQualityScore = round( mean(sleepDays.sleepQualityScore) )
```

> 月統計比週統計多了 `avgCoreSleepPercentage`，用於月度趨勢圖。

---

## 5. Dashboard 統計卡片計算（前端）

**來源**：`app/page.tsx`
**輸入**：API 回傳的 `SleepDailyStats[]`（已過濾 `totalSleepMinutes > 0`）

```
sleepDays = daily.filter(d => d.totalSleepMinutes > 0)

平均睡眠時間 = round( mean(sleepDays.totalSleepMinutes) )   （分鐘）
睡眠評分     = round( mean(sleepDays.sleepQualityScore) )   （0–100）
深度睡眠%    = round( mean(d.deepSleepMinutes / d.totalSleepMinutes × 100) )
REM 睡眠%    = round( mean(d.remSleepMinutes  / d.totalSleepMinutes × 100) )
```

---

## 6. 佩戴率計算

**來源**：`app/page.tsx`

```
totalDays  = 選取範圍的天數（7 / 30 / 90）
wornDays   = daily.length          （API 回傳有記錄的天數，含 InBed-only）
notWornDays = max(0, totalDays - wornDays)
wearRate   = round(wornDays / totalDays × 100)   （%）
```

> `notWornDays` 使用 `max(0, ...)` 防止邊界日期造成負數（API 可能回傳範圍邊緣的記錄）。

---

## 7. 日期範圍填補（`fillDateRange`）

**來源**：`lib/sleepAnalyzer.ts`
**用途**：供 `SleepWearCalendar` 顯示每週佩戴紀錄（含未佩戴的空日）

```
輸入：有資料的 SleepDailyStats[]  +  startDate  +  endDate
輸出：SleepDailyStatsOrGap[]（範圍內每一天都有一筆）

for 每一天 in [startDate, endDate]:
  if 該日有資料 → { ...originalRecord, hasData: true }
  else          → { date, hasData: false, 所有睡眠欄位: null }
```

`null` 值讓 Recharts `<Line connectNulls={false}>` 在折線圖上產生視覺斷口。
`SleepWearCalendar` 用 `hasData` 旗標區分有佩戴（teal）與未佩戴（深藍）的週柱。

---

## 8. 雷達圖指標計算（`SleepQualityRadar`）

**來源**：`app/dashboard/components/SleepQualityRadar.tsx`
**前提**：只對 `totalSleepMinutes > 0` 的天計算

雷達圖顯示五個維度，各自對應不同量綱，統一以 0–100 的數值呈現：

| 維度 | 計算方式 | 說明 |
|---|---|---|
| 深層睡眠% | `mean(deep / total × 100)` | 百分比，直接對應 0–100 |
| REM% | `mean(rem / total × 100)` | 百分比，直接對應 0–100 |
| 核心睡眠% | `mean(core / total × 100)` | 百分比，直接對應 0–100 |
| 睡眠評分 | `mean(sleepQualityScore)` | 0–100 分，與其他維度量綱一致 |
| 總時長 | `min(mean(total) / 480, 1) × 100` | 以 8 小時（480 分鐘）為滿分，轉換為 0–100 |

> 總時長維度的轉換確保雷達圖五個軸的量綱相同（皆為 0–100），視覺上有可比性。

---

## 9. 資料流總覽

```
Apple Health ZIP
  └─ lib/xmlParser.ts（SAX 串流解析）
       └─ ParsedSleepRecord[]
            └─ lib/sleepAnalyzer.ts
                 ├─ calculateDailyStats()  →  SleepDailyStats[]   →  DB: sleep_daily
                 ├─ aggregateWeekly()      →  SleepWeeklyStats[]  →  DB: sleep_weekly
                 └─ aggregateMonthly()     →  SleepMonthlyStats[] →  DB: sleep_monthly

前端查詢（TanStack Query）
  ├─ GET /api/sleep/daily    →  SleepDailyStats[]
  ├─ GET /api/sleep/monthly  →  SleepMonthlyStats[]
  └─ GET /api/sleep/yearly   →  SleepYearlyStats[]
       └─ app/page.tsx
            ├─ sleepDays = daily.filter(totalSleepMinutes > 0)
            ├─ 統計卡片（平均睡眠、評分、深睡%、REM%）
            ├─ 佩戴率（wornDays / totalDays）
            ├─ fillDateRange() → SleepDailyStatsOrGap[]
            └─ 各圖表元件
```
