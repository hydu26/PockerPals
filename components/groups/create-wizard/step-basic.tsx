import type { WizardDraft } from "@/lib/types/wizard"

export default function StepBasic({
  draft,
  onChange,
}: Readonly<{ draft: WizardDraft; onChange: (d: Partial<WizardDraft>) => void }>) {
  return (
    <div>
      <label style={labelStyle}>Tên nhóm</label>
      <input
        value={draft.name}
        onChange={(e) => onChange({ name: e.target.value })}
        placeholder="VD: Nhóm anh em thứ 6…"
        maxLength={50}
        autoFocus
        style={inputStyle}
      />

    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "1.2px",
  color: "var(--tx3)", marginBottom: 8,
}

export const inputStyle: React.CSSProperties = {
  width: "100%", background: "var(--gl2)",
  border: "1.5px solid var(--gl-bd)", borderRadius: 14,
  padding: "13px 15px", color: "var(--tx)",
  fontFamily: "var(--fb)", fontSize: 15, outline: "none",
  boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
  transition: "border-color var(--dur-f)",
}
