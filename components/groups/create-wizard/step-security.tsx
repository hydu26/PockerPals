import type { WizardDraft } from "@/lib/types/wizard"
import { inputStyle } from "./step-basic"

export default function StepSecurity({
  draft,
  onChange,
}: Readonly<{
  draft: WizardDraft
  onChange: (d: Partial<WizardDraft>) => void
}>) {
  return (
    <div>
      <label htmlFor="group-password" style={lbl}>Mật khẩu nhóm (tuỳ chọn)</label>
      <input
        id="group-password"
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
      <p style={{ fontSize: 11, color: "var(--tx3)", lineHeight: 1.5, fontFamily: "var(--fm)" }}>
        Người xem cần nhập đúng mật khẩu để truy cập nhóm
      </p>
    </div>
  )
}

const lbl: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "1.2px",
  color: "var(--tx3)", marginBottom: 8,
}
