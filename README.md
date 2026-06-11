# PokerPals

Ứng dụng theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp.

> PWA · Next.js 16 · Supabase · Claude AI

---

## Tính năng

### Quản lý nhóm
- Tạo nhiều nhóm chơi, đặt mật khẩu riêng cho từng nhóm
- Nhập điểm từng người trong phiên, kiểm tra tổng cân bằng trước khi lưu
- Xem lại lịch sử toàn bộ phiên đã chơi
- Bảng xếp hạng thành viên theo tổng điểm tích lũy
- Phân quyền 3 cấp: Super admin · Admin nhóm · Thành viên chỉ xem

### AI & Công cụ hỗ trợ (`/ai`)
- **AI Phân xử** — Nhập bài tay + board, Claude AI giải thích người thắng theo luật Texas Hold'em (yêu cầu đăng nhập)
- **Hỗ trợ tính toán** — Monte Carlo 8.000 ván giả lập, hiển thị:
  - Tỉ lệ thắng & hòa theo số người chơi (2–10)
  - Outs và bộ bài mục tiêu (từ Flop trở đi)
  - Tính toán theo các giai đoạn hợp lệ: Pre-flop · Flop · Turn · River
- **Tùy chỉnh bộ bài** — 6 theme mặt sau lá bài theo CLB bóng đá, lưu vào localStorage

### Luật chơi (`/rules`)
- Thứ bậc 10 bộ bài từ High Card đến Royal Flush, kèm ví dụ
- Diễn biến ván: Pre-flop → Flop → Turn → River → Showdown
- Các hành động đặt cược: Check · Bet · Call · Raise · Fold · All-in
- FAQ các tình huống đặc biệt

### Khác
- PWA — cài đặt như app native trên iOS/Android
- Dark/Light mode
- Giao diện tiếng Việt

---

## Stack

| Lớp | Công nghệ |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19 · Tailwind CSS v4 · next-themes |
| Backend / Auth / DB | [Supabase](https://supabase.com) |
| Data fetching | [TanStack Query v5](https://tanstack.com/query) |
| State | [Zustand](https://zustand-demo.pmnd.rs) |
| AI | [Anthropic Claude](https://anthropic.com) via `@anthropic-ai/sdk` |
| Notifications | [Sonner](https://sonner.emilkowal.ski) |

---

## Bắt đầu

### 1. Clone & cài dependencies

```bash
git clone <repo-url>
cd pocker_bulletin
pnpm install
```

### 2. Tạo file `.env.local`

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # server-side only

# Anthropic (cho tính năng AI Phân xử)
ANTHROPIC_API_KEY=sk-ant-...

# URL của app (SEO / email redirect / Open Graph)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Chạy dev server

```bash
pnpm dev     # http://localhost:3000
```

---

## Cấu trúc thư mục

```
app/
├── (app)/                   # Layout chính (TopBar + BottomNav)
│   ├── page.tsx             # Trang chủ — danh sách nhóm
│   ├── groups/
│   │   ├── new/             # Tạo nhóm mới (super admin)
│   │   └── [id]/
│   │       ├── page.tsx     # Nhập điểm phiên
│   │       ├── history/     # Lịch sử phiên
│   │       ├── rank/        # Bảng xếp hạng
│   │       ├── members/     # Quản lý thành viên
│   │       └── settings/    # Cài đặt nhóm
│   ├── ai/                  # AI Phân xử + Hỗ trợ tính toán
│   └── rules/               # Luật chơi & FAQ
├── auth/
│   ├── login/               # Đăng nhập
│   ├── callback/            # OAuth callback
│   └── update-password/     # Đặt lại mật khẩu
├── admin/                   # Bảng quản trị (super admin)
├── api/
│   ├── claude/              # AI Phân xử endpoint (streaming)
│   ├── scan-cards/          # Nhận diện lá bài từ ảnh
│   ├── verify-password/     # Xác thực mật khẩu nhóm
│   └── admin/               # Quản lý user & invite
└── layout.tsx               # Root layout + SEO metadata

components/
├── shared/                  # TopBar, BottomNav, CardSlot, Providers
├── groups/                  # GroupCard, group wizards
└── score/                   # ScoreRow

lib/
├── hooks/                   # useGroups, usePermissions, useGroupAccess …
├── supabase/                # Client + server helpers
├── types/                   # TypeScript types
└── utils/                   # format-score, …

supabase/
├── migrations/              # SQL migrations
└── functions/               # Edge Functions

public/
├── card-backs/              # Logo CLB bóng đá (theme mặt sau lá bài)
├── logo/                    # Logo dark/light
├── manifest.json            # Web app manifest
└── sw.js                    # Service Worker (PWA)
```

---

## Phân quyền

| Role | Quyền |
|---|---|
| **Super admin** | Tạo nhóm mới, truy cập /admin, xem tất cả nhóm |
| **Group admin** | Lưu điểm, chỉnh cài đặt nhóm, quản lý thành viên |
| **Member** | Xem điểm, lịch sử, xếp hạng (chỉ đọc) |

Nhóm có mật khẩu yêu cầu nhập đúng mật khẩu trước khi truy cập. Super admin được cấu hình qua Supabase.

---

## Deploy lên Vercel

Push lên GitHub rồi import vào Vercel. Thêm các biến môi trường trong **Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL        # ví dụ: https://pokerpals.vercel.app
```

Vercel tự động build và deploy khi push lên `main`.

---

## Scripts

```bash
pnpm dev      # dev server (http://localhost:3000)
pnpm build    # production build
pnpm start    # chạy production build local
pnpm lint     # ESLint
```
