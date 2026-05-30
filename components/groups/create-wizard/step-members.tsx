import { useState } from "react"
import type { WizardDraft } from "@/lib/types/wizard"
import { MEMBER_COLORS } from "@/lib/types/wizard"

export default function StepMembers({
  draft,
  onChange,
}: Readonly<{ draft: WizardDraft; onChange: (d: Partial<WizardDraft>) => void }>) {
  const [newName, setNewName] = useState("")
  const [pickerIdx, setPickerIdx] = useState<number | null>(null)

  const addMember = () => {
    const name = newName.trim()
    if (!name) return
    const color = MEMBER_COLORS[draft.members.length % MEMBER_COLORS.length]
    onChange({
      members: [...draft.members, { id: `m${Date.now()}`, name, color }],
    })
    setNewName("")
  }

  const removeMember = (idx: number) =>
    onChange({ members: draft.members.filter((_, i) => i !== idx) })

  const updateColor = (idx: number, color: string) => {
    onChange({
      members: draft.members.map((m, i) => i === idx ? { ...m, color } : m),
    })
    setPickerIdx(null)
  }

  return (
    <div>
      {/* Existing members */}
      {draft.members.map((m, idx) => (
        <div key={m.id} style={{
          background: "var(--gl)", border: "1px solid var(--gl-bd)",
          backdropFilter: "blur(20px)",
          borderRadius: 14, padding: "15px 18px",
          display: "flex", alignItems: "center", gap: 14,
          marginBottom: 12, position: "relative",
          zIndex: pickerIdx === idx ? 100 : 1,
        }}>
          {/* Avatar / color picker */}
          <div
            onClick={() => setPickerIdx(pickerIdx === idx ? null : idx)}
            style={{
              width: 42, height: 42, borderRadius: "50%", flexShrink: 0,
              background: m.color, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 16, fontWeight: 700,
              color: "white", cursor: "pointer",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
            }}
          >
            {m.name.charAt(0).toUpperCase()}
          </div>

          {/* Color grid */}
          {pickerIdx === idx && (
            <div style={{
              position: "absolute", top: "100%", left: 0, zIndex: 10,
              background: "var(--bg-a)", border: "1px solid var(--gl-bd)",
              borderRadius: 16, padding: 14, marginTop: 4,
              display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 9,
              boxShadow: "0 8px 32px var(--gl-sh)",
            }}>
              {MEMBER_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => updateColor(idx, c)}
                  style={{
                    width: 32, height: 32, borderRadius: 10, background: c,
                    cursor: "pointer",
                    border: m.color === c ? "2px solid var(--tx)" : "2px solid transparent",
                    boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3)",
                    transition: "transform var(--dur-f)",
                  }}
                />
              ))}
            </div>
          )}

          <span style={{ flex: 1, fontFamily: "var(--fm)", fontWeight: 700, fontSize: 15 }}>
            {m.name}
          </span>
          <button
            onClick={() => removeMember(idx)}
            style={{
              width: 28, height: 28, borderRadius: 9,
              border: "1px solid var(--gl-bd)", background: "var(--gl)",
              cursor: "pointer", color: "var(--lose)", fontSize: 12,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            ✕
          </button>
        </div>
      ))}

      {/* Add member */}
      <div style={{ display: "flex", gap: 9, marginTop: 7 }}>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addMember()}
          placeholder="Tên thành viên…"
          style={{
            flex: 1, background: "var(--gl)",
            backdropFilter: "blur(20px)",
            border: "1.5px solid var(--gl-bd)", borderRadius: 14,
            padding: "13px 15px", color: "var(--tx)",
            fontFamily: "var(--fb)", fontSize: 15, outline: "none",
            boxShadow: "inset 0 1px 0 0 var(--gl-hl)",
            transition: "border-color var(--dur-f)",
          }}
        />
        <button
          onClick={addMember}
          style={{
            padding: "13px 18px", borderRadius: 14, border: "none",
            background: "linear-gradient(135deg,var(--ac),var(--ac3))",
            color: "white", fontSize: 14, fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--fb)", whiteSpace: "nowrap",
            boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)",
          }}
        >
          + Thêm
        </button>
      </div>

      {draft.members.length === 0 && (
        <p style={{ fontSize: 12, color: "var(--tx3)", textAlign: "center", marginTop: 24, fontFamily: "var(--fm)" }}>
          Nhấn avatar để đổi màu sau khi thêm
        </p>
      )}
    </div>
  )
}
