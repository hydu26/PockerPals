import type { WizardDraft } from "@/lib/types/wizard"


export default function StepPreview({
  draft,
  onJump,
}: Readonly<{ draft: WizardDraft; onJump: (step: number) => void }>) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {/* Step 1: Basic */}
      <PreviewCard icon="📝" label="Cơ bản" onEdit={() => onJump(0)}>
        <Row label="Tên nhóm" value={draft.name || "—"} mono />
      </PreviewCard>

      {/* Step 2: Chips */}
      <PreviewCard icon="🎲" label="Xèng" onEdit={() => onJump(1)}>
        <Row label="Đơn vị" value={draft.currency_unit === "centime" ? "¢ Centimes" : "€ EUR"} mono />
        <Row label="Vay mỗi lần" value={`${draft.loan_amount} ${draft.currency_unit === "centime" ? "c" : "€"}`} mono />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
          {draft.chips.map((c) => (
            <span key={c.id} style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "4px 10px", background: "var(--gl2)",
              border: "1px solid var(--gl-bd)", borderRadius: 20,
              fontSize: 12, fontFamily: "var(--fm)", color: "var(--tx2)",
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: c.color, flexShrink: 0 }} />
              {c.name} · {c.value}{draft.currency_unit === "centime" ? "c" : "€"}
            </span>
          ))}
        </div>
      </PreviewCard>

      {/* Step 3: Security */}
      <PreviewCard icon="🔒" label="Bảo mật" onEdit={() => onJump(2)}>
        <Row
          label="Mật khẩu"
          value={draft.password || "Không có"}
          mono={!!draft.password}
        />
        {draft.admin_emails.length > 0 && (
          <Row label="Admin" value={draft.admin_emails.join(", ")} mono />
        )}
      </PreviewCard>

      {/* Step 4: Members */}
      <PreviewCard icon="👥" label="Thành viên" onEdit={() => onJump(3)}>
        {draft.members.length === 0 ? (
          <span style={{ fontSize: 12, color: "var(--lose)" }}>⚠ Chưa có thành viên</span>
        ) : (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {draft.members.map((m) => (
              <span key={m.id} style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "3px 10px", borderRadius: 20,
                fontSize: 12, fontFamily: "var(--fm)",
                background: `${m.color}22`, border: `1px solid ${m.color}66`,
                color: "var(--tx)",
              }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: m.color }} />
                {m.name}
              </span>
            ))}
          </div>
        )}
      </PreviewCard>
    </div>
  )
}

function PreviewCard({
  icon, label, onEdit, children,
}: Readonly<{ icon: string; label: string; onEdit: () => void; children: React.ReactNode }>) {
  return (
    <div style={{
      background: "var(--gl)", backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      border: "1px solid var(--gl-bd)", borderRadius: 16,
      overflow: "hidden",
      boxShadow: "inset 0 1px 0 0 var(--gl-hl), 0 3px 12px var(--gl-sh)",
    }}>
      <button
        type="button"
        onClick={onEdit}
        style={{
          width: "100%", padding: "13px 16px", display: "flex", alignItems: "center",
          justifyContent: "space-between", cursor: "pointer",
          transition: "background var(--dur-f)",
          background: "transparent", border: "none", borderBottom: "1px solid var(--gl-bd)",
          textAlign: "left",
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
          <span>{icon}</span>{label}
        </span>
        <span style={{ fontSize: 12, color: "var(--ac)", fontWeight: 600 }}>Sửa →</span>
      </button>
      <div style={{ padding: "12px 16px" }}>{children}</div>
    </div>
  )
}

function Row({ label, value, mono }: Readonly<{ label: string; value: string; mono?: boolean }>) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: "var(--tx3)" }}>{label}</span>
      <span style={{
        fontSize: 13, fontWeight: 600, color: "var(--tx)",
        fontFamily: mono ? "var(--fm)" : "var(--fb)",
        maxWidth: "60%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }}>
        {value}
      </span>
    </div>
  )
}
