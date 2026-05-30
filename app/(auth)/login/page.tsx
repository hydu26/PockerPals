"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--gl2)",
  border: "1.5px solid var(--gl-bd)",
  borderRadius: 14,
  padding: "13px 15px",
  color: "var(--tx)",
  fontFamily: "var(--fb)",
  fontSize: 15,
  outline: "none",
  boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
  transition: "border-color var(--dur-f)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "1.2px",
  color: "var(--tx3)",
  marginBottom: 8,
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);

  const sendCode = async () => {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Lỗi gửi mã");
        return;
      }
      setStep(2);
      toast.success("Mã đã tạo — kiểm tra email để nhận mã xác nhận");
      setTimeout(() => codeRef.current?.focus(), 100);
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: code.trim().toUpperCase(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Mã không đúng");
        setCode("");
        codeRef.current?.focus();
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: "magiclink",
      });
      if (error) {
        toast.error("Lỗi xác thực: " + error.message);
        return;
      }

      toast.success("Đăng nhập thành công!");
      router.push("/");
      router.refresh();
    } catch {
      toast.error("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 22px",
        position: "relative",
        zIndex: 1,
      }}
    >
      {/* Brand */}
      <Link
        href="/"
        style={{
          width: 52,
          height: 52,
          borderRadius: 16,
          background: "linear-gradient(135deg,var(--ac),var(--ac3))",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 26,
          boxShadow:
            "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
          marginBottom: 32,
        }}
      >
        🃏
      </Link>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 390,
          background: "var(--gl)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid var(--gl-bd)",
          borderRadius: 28,
          padding: "30px 24px 36px",
          boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 20px 60px var(--gl-sh)",
          animation: "fadeUp .45s cubic-bezier(.16,1,.3,1) both",
        }}
      >
        <div
          style={{
            width: 44,
            height: 5,
            background: "var(--gl-bd)",
            borderRadius: 3,
            margin: "0 auto 24px",
          }}
        />

        {step === 1 ? (
          <>
            <h1
              style={{
                fontFamily: "var(--fb)",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: "-.4px",
                color: "var(--tx)",
              }}
            >
              Đăng nhập
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--tx3)",
                marginBottom: 16,
                lineHeight: 1.6,
              }}
            >
              Nhập email admin để nhận mã xác nhận.
            </p>

            <label style={labelStyle}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendCode()}
              placeholder="ten@example.com"
              autoFocus
              style={{ ...inputStyle, marginBottom: 16 }}
            />

            <button
              onClick={sendCode}
              disabled={loading || !email.trim()}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: 22,
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white",
                fontFamily: "var(--fb)",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading || !email.trim() ? "not-allowed" : "pointer",
                opacity: loading || !email.trim() ? 0.6 : 1,
                boxShadow:
                  "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
                transition: "all var(--dur-f)",
              }}
            >
              {loading ? "Đang xử lý…" : "Gửi mã 📨"}
            </button>

            <p
              style={{
                fontSize: 11,
                color: "var(--tx3)",
                textAlign: "center",
                marginTop: 14,
                lineHeight: 1.5,
                fontFamily: "var(--fm)",
              }}
            >
              Chỉ admin nhóm mới đăng nhập được.
              <br />
              Người xem không cần đăng nhập.
            </p>
          </>
        ) : (
          <>
            <h1
              style={{
                fontFamily: "var(--fb)",
                fontSize: 22,
                fontWeight: 700,
                marginBottom: 6,
                letterSpacing: "-.4px",
                color: "var(--tx)",
              }}
            >
              Nhập mã xác nhận
            </h1>
            <p
              style={{
                fontSize: 13,
                color: "var(--tx3)",
                marginBottom: 20,
                lineHeight: 1.6,
              }}
            >
              Kiểm tra{" "}
              <span style={{ fontFamily: "var(--fm)", color: "var(--ac)" }}>
                email
              </span>{" "}
              để nhận mã xác nhận.
            </p>

            {/* Code input */}
            <label style={labelStyle}>Mã xác nhận</label>
            <input
              ref={codeRef}
              type="text"
              value={code}
              onChange={(e) =>
                setCode(
                  e.target.value
                    .toUpperCase()
                    .replace(/[^A-Z2-9]/g, "")
                    .slice(0, 6),
                )
              }
              onKeyDown={(e) =>
                e.key === "Enter" && code.length === 6 && verifyCode()
              }
              placeholder="XXXXXX"
              autoComplete="off"
              style={{
                ...inputStyle,
                fontFamily: "var(--fm)",
                fontSize: 28,
                fontWeight: 800,
                letterSpacing: 10,
                textAlign: "center",
                marginBottom: 8,
              }}
            />

            <div
              style={{
                fontSize: 11,
                color: "var(--tx3)",
                textAlign: "center",
                marginBottom: 16,
                fontFamily: "var(--fm)",
              }}
            >
              {code.length}/6 · {email}
            </div>

            <button
              onClick={verifyCode}
              disabled={loading || code.length !== 6}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: 22,
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                color: "white",
                fontFamily: "var(--fb)",
                fontSize: 15,
                fontWeight: 700,
                cursor:
                  loading || code.length !== 6 ? "not-allowed" : "pointer",
                opacity: loading || code.length !== 6 ? 0.6 : 1,
                boxShadow:
                  "inset 0 1px 0 0 rgba(255,255,255,.3), 0 6px 20px var(--gw)",
                transition: "all var(--dur-f)",
                marginBottom: 10,
              }}
            >
              {loading ? "Đang xác nhận…" : "Xác nhận →"}
            </button>

            <button
              onClick={() => {
                setStep(1);
                setCode("");
              }}
              style={{
                width: "100%",
                padding: "11px",
                border: "1px solid var(--gl-bd)",
                borderRadius: 22,
                background: "var(--gl)",
                color: "var(--tx2)",
                fontFamily: "var(--fb)",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all var(--dur-f)",
              }}
            >
              ← Đổi email
            </button>
          </>
        )}
      </div>
    </div>
  );
}
