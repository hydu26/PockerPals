import type { WizardDraft } from "@/lib/types/wizard"
import { inputStyle } from "./step-basic"

const SUPER_ADMIN = "corneille261998@gmail.com"

export default function StepSecurity({
  draft,
  onChange,
  userEmail,
}: Readonly<{
  draft: WizardDraft
  onChange: (d: Partial<WizardDraft>) => void
  userEmail: string | null
}>) {
  const isSuperAdmin = userEmail === SUPER_ADMIN

  const updateEmail = (idx: number, val: string) => {
    const next = [...draft.admin_emails]
    next[idx] = val
    onChange({ admin_emails: next })
  }

  const addEmail = () => onChange({ admin_emails: [...draft.admin_emails, ""] })
  const removeEmail = (idx: number) =>
    onChange({ admin_emails: draft.admin_emails.filter((_, i) => i !== idx) })

  return (
    <div>
      {/* Password */}
      <label style={lbl}>Mật khẩu nhóm (tuỳ chọn)</label>
      <input
        type="text"
        value={draft.password}
        onChange={(e) => onChange({ password: e.target.value })}
        placeholder="Để trống nếu không cần mật khẩu"
        style={{
          ...inputStyle,
          fontFamily: "var(--fm)", fontWeight: 700, letterSpacing: 2,
          marginBottom: 6,
        }}
      />
      <p style={{ fontSize: 11, color: "var(--tx3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--fm)" }}>
        Người xem cần nhập đúng mật khẩu để truy cập nhóm
      </p>

      {/* Admin emails — super admin only */}
      {isSuperAdmin && (
        <>
          <label style={lbl}>Quản trị viên</label>
          <p style={{ fontSize: 12, color: "var(--tx3)", marginBottom: 12, lineHeight: 1.5 }}>
            Email những người có quyền chỉnh sửa nhóm này
          </p>

          {draft.admin_emails.map((email, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 9,
              background: "var(--gl2)", border: "1px solid var(--gl-bd)",
              borderRadius: 11, padding: "8px 12px", marginBottom: 7,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg,var(--ac),var(--ac3))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, color: "white",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,.3)",
              }}>
                👤
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => updateEmail(idx, e.target.value)}
                placeholder="email@example.com"
                style={{
                  flex: 1, background: "transparent", border: "none",
                  color: "var(--tx)", fontFamily: "var(--fm)",
                  fontSize: 13, fontWeight: 600, outline: "none", padding: "5px 0",
                }}
              />
              <button
                onClick={() => removeEmail(idx)}
                style={{
                  width: 26, height: 26, borderRadius: 8,
                  border: "1px solid var(--gl-bd)", background: "transparent",
                  cursor: "pointer", color: "var(--lose)", fontSize: 11,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                ✕
              </button>
            </div>
          ))}

          <button
            onClick={addEmail}
            style={{
              width: "100%", padding: "10px",
              border: "1.5px dashed var(--ac)", background: "transparent",
              color: "var(--ac)", fontSize: 13, fontWeight: 700,
              borderRadius: 11, cursor: "pointer", fontFamily: "var(--fb)",
              transition: "all var(--dur-f)",
            }}
          >
            + Thêm admin
          </button>
        </>
      )}

      {!isSuperAdmin && (
        <p style={{
          fontSize: 12, color: "var(--tx3)", padding: "10px 13px",
          background: "var(--gl)", border: "1px dashed var(--gl-bd)",
          borderRadius: 10, lineHeight: 1.5, fontFamily: "var(--fm)",
          marginTop: 4,
        }}>
          Email của bạn sẽ tự động được thêm làm admin nhóm
        </p>
      )}
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "1.2px",
  color: "var(--tx3)", marginBottom: 8,
}
