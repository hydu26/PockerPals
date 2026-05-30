# 🃏 PokerPals

Ứng dụng theo dõi điểm poker cho nhóm bạn — nhanh, gọn, đẹp.

> PWA · Next.js 16 · Supabase · Claude AI

---

## Tính năng

| Tính năng | Mô tả |
|---|---|
| **Nhóm & quyền truy cập** | Tạo nhiều nhóm, đặt mật khẩu riêng cho từng nhóm |
| **Nhập điểm phiên** | Nhập điểm từng người, kiểm tra tổng cân bằng trước khi lưu |
| **Lịch sử phiên** | Xem lại toàn bộ các phiên đã chơi |
| **Bảng xếp hạng** | Xếp hạng thành viên theo tổng điểm tích lũy |
| **AI Phân xử** | Claude AI giải quyết tranh chấp Texas Hold'em theo thời gian thực |
| **Luật chơi** | Tham khảo nhanh thứ bậc bài, hành động đặt cược, diễn biến ván |
| **PWA** | Cài đặt như app native trên iOS/Android |
| **Phân quyền** | Super admin · Admin nhóm · Thành viên chỉ xem |

---

## Stack

- **Framework** — [Next.js 16](https://nextjs.org) (App Router)
- **UI** — React 19 · Tailwind CSS v4
- **Backend / Auth / DB** — [Supabase](https://supabase.com)
- **Data fetching** — [TanStack Query v5](https://tanstack.com/query)
- **AI** — [Anthropic Claude](https://anthropic.com) qua `@anthropic-ai/sdk`
- **State** — [Zustand](https://zustand-demo.pmnd.rs)
- **Notifications** — [Sonner](https://sonner.emilkowal.ski)

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

# Anthropic (cho tính năng AI Phân xử)
ANTHROPIC_API_KEY=sk-ant-...

# URL của app (dùng cho SEO / Open Graph)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Chạy dev server

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000).

---

## Cấu trúc thư mục

```
app/
├── (app)/                  # Layout chính (TopBar + BottomNav)
│   ├── page.tsx            # Trang chủ — danh sách nhóm
│   ├── groups/
│   │   ├── new/            # Tạo nhóm mới
│   │   └── [id]/
│   │       ├── page.tsx    # Nhập điểm phiên
│   │       ├── history/    # Lịch sử phiên
│   │       ├── rank/       # Bảng xếp hạng
│   │       ├── members/    # Quản lý thành viên
│   │       └── settings/   # Cài đặt nhóm
│   ├── ai/                 # AI Phân xử + FAQ
│   └── rules/              # Luật chơi
├── (auth)/login/           # Đăng nhập
├── icon.tsx                # Favicon (joker card, render động)
├── apple-icon.tsx          # Apple touch icon
├── opengraph-image.tsx     # Ảnh preview OG (1200×630)
└── layout.tsx              # Root layout + SEO metadata

components/
├── shared/                 # TopBar, BottomNav, Providers, modals
├── groups/                 # GroupCard, group wizards
└── score/                  # ScoreRow

lib/
├── hooks/                  # useGroups, usePermissions, useGroupAccess …
├── supabase/               # Client + server Supabase helpers
├── types/                  # TypeScript types
└── utils/                  # format-score, …

supabase/
├── migrations/             # SQL migrations
└── functions/              # Edge Functions

public/
├── icon.svg                # Icon tĩnh (PWA manifest)
├── manifest.json           # Web app manifest
└── sw.js                   # Service Worker
```

---

## Phân quyền

| Role | Quyền |
|---|---|
| **Super admin** | Tạo nhóm mới, xem tất cả nhóm |
| **Group admin** | Lưu điểm, chỉnh sửa cài đặt nhóm, quản lý thành viên |
| **Member** | Xem điểm, lịch sử, xếp hạng (chỉ đọc) |

Super admin được cấu hình qua biến môi trường hoặc Supabase. Nhóm có mật khẩu yêu cầu người dùng nhập đúng mật khẩu trước khi truy cập.

---

## Deploy lên Vercel

```bash
# Push lên GitHub rồi import vào Vercel
# Thêm các biến môi trường trong Settings > Environment Variables:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL   # ví dụ: https://pokerpals.vercel.app
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
