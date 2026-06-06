"use client"

import { Fragment, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import { useAuthStore } from "@/lib/stores/auth-store"
import { DEFAULT_DRAFT, type WizardDraft } from "@/lib/types/wizard"
import StepBasic from "@/components/groups/create-wizard/step-basic"
import StepChips from "@/components/groups/create-wizard/step-chips"
import StepSecurity from "@/components/groups/create-wizard/step-security"
import StepMembers from "@/components/groups/create-wizard/step-members"
import StepPreview from "@/components/groups/create-wizard/step-preview"

const STEPS = [
  { icon: "📝", label: "Cơ bản" },
  { icon: "🎲", label: "Xèng" },
  { icon: "🔒", label: "Bảo mật" },
  { icon: "👥", label: "Thành viên" },
  { icon: "✨", label: "Xem lại" },
]

function validate(step: number, draft: WizardDraft): string | null {
  if (step === 0 && !draft.name.trim()) return "Vui lòng nhập tên nhóm"
  return null
}

export default function NewGroupPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [draft, setDraft] = useState<WizardDraft>(DEFAULT_DRAFT)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const patchDraft = (patch: Partial<WizardDraft>) =>
    setDraft((d) => ({ ...d, ...patch }))

  const goNext = () => {
    const err = validate(step, draft)
    if (err) { setError(err); return }
    setError(null)
    setStep((s) => s + 1)
  }

  const goPrev = () => { setError(null); setStep((s) => s - 1) }

  const handleJump = (target: number) => { setError(null); setStep(target) }

  const handleSubmit = async () => {
    if (!user?.email) {
      toast.error("Bạn cần đăng nhập để tạo nhóm")
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const supabase = createClient()

      let passwordHash: string | null = null
      if (draft.password) {
        const { data, error: rpcErr } = await supabase
          .rpc("hash_password", { p_password: draft.password })
        if (rpcErr) throw rpcErr
        passwordHash = data
      }

      const { data: group, error: groupErr } = await supabase
        .from("groups")
        .insert({
          name: draft.name.trim(),
          type: draft.type,
          loan_amount: draft.loan_amount,
          currency_unit: draft.currency_unit,
          chips: draft.chips,
          password_hash: passwordHash,
          created_by: user.id,
        })
        .select("id")
        .single()
      if (groupErr) throw groupErr

      if (draft.members.length > 0) {
        const { error: membersErr } = await supabase
          .from("members")
          .insert(
            draft.members.map((m, i) => ({
              group_id: group.id,
              name: m.name,
              color: m.color,
              position: i,
            }))
          )
        if (membersErr) throw membersErr
      }

      const adminEmails = Array.from(
        new Set([
          user.email,
          ...draft.admin_emails.map((e) => e.trim()).filter(Boolean),
        ])
      )
      const { error: adminsErr } = await supabase
        .from("group_admins")
        .insert(adminEmails.map((email) => ({ group_id: group.id, email })))
      if (adminsErr) throw adminsErr

      toast.success("Tạo nhóm thành công!")
      router.push(`/groups/${group.id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Có lỗi xảy ra"
      setError(msg)
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      minHeight: "calc(100dvh - 194px)",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <h1 style={{
          fontSize: 22, fontWeight: 800, fontFamily: "var(--fb)",
          color: "var(--tx)", marginBottom: 4,
        }}>
          Tạo nhóm mới
        </h1>
        <p style={{ fontSize: 12, color: "var(--tx3)", fontFamily: "var(--fm)" }}>
          {STEPS[step].icon} Bước {step + 1}/5 · {STEPS[step].label}
        </p>
      </div>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24 }}>
        {STEPS.map((s, i) => {
          const isActive = i === step
          const isDone = i < step
          let dotStyle: React.CSSProperties = { background: "var(--gl2)", color: "var(--tx3)", border: "1px solid var(--gl-bd)" }
          if (isDone) dotStyle = { background: "var(--win)", color: "#07050f" }
          if (isActive) dotStyle = { background: "linear-gradient(135deg,var(--ac),var(--ac3))", color: "white", boxShadow: "0 0 0 3px var(--gw), 0 4px 14px var(--gw)" }
          return (
          <Fragment key={s.label}>
            <button
              type="button"
              onClick={() => isDone && handleJump(i)}
              title={s.label}
              style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontFamily: "var(--fb)", fontWeight: 800,
                cursor: isDone ? "pointer" : "default",
                transition: "all var(--dur-f)", border: "none", padding: 0,
                ...dotStyle,
              }}
            >
              {isDone ? "✓" : i + 1}
            </button>
            {i < STEPS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: "0 3px",
                background: i < step ? "var(--win)" : "var(--gl-bd)",
                transition: "background var(--dur-f)",
              }} />
            )}
          </Fragment>
          )
        })}
      </div>

      {/* Step content — flex: 1 pushes nav to bottom */}
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 1 }}>
        {step === 0 && <StepBasic draft={draft} onChange={patchDraft} />}
        {step === 1 && <StepChips draft={draft} onChange={patchDraft} />}
        {step === 2 && <StepSecurity draft={draft} onChange={patchDraft} />}
        {step === 3 && <StepMembers draft={draft} onChange={patchDraft} />}
        {step === 4 && <StepPreview draft={draft} onJump={handleJump} />}
      </div>

      {/* Navigation — marginTop: auto keeps this at the bottom */}
      <div style={{ marginTop: "auto" }}>
        {error && (
          <p style={{
            fontSize: 12, color: "var(--lose)", marginBottom: 10,
            fontFamily: "var(--fm)", textAlign: "center",
          }}>
            ⚠ {error}
          </p>
        )}
      </div>
      <div style={{
        display: "flex", gap: 10,
        paddingTop: 16, borderTop: "1px solid var(--gl-bd)",
      }}>
        {step > 0 && (
          <button
            onClick={goPrev}
            disabled={submitting}
            style={{
              flex: 1, padding: "14px 0", borderRadius: 14,
              border: "1.5px solid var(--gl-bd)", background: "var(--gl)",
              color: "var(--tx2)", fontFamily: "var(--fb)",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              transition: "all var(--dur-f)",
            }}
          >
            ← Trước
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={goNext}
            style={{
              flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
              background: "linear-gradient(135deg,var(--ac),var(--ac3))",
              color: "white", fontFamily: "var(--fb)",
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)",
              transition: "all var(--dur-f)",
            }}
          >
            Tiếp →
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              flex: 2, padding: "14px 0", borderRadius: 14, border: "none",
              background: submitting
                ? "var(--gl2)"
                : "linear-gradient(135deg,var(--ac),var(--ac3))",
              color: submitting ? "var(--tx3)" : "white",
              fontFamily: "var(--fb)", fontSize: 14, fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              boxShadow: submitting
                ? "none"
                : "inset 0 1px 0 0 rgba(255,255,255,.3), 0 4px 14px var(--gw)",
              transition: "all var(--dur-f)",
            }}
          >
            {submitting ? "Đang tạo…" : "✓ Tạo nhóm"}
          </button>
        )}
      </div>
    </div>
  )
}
