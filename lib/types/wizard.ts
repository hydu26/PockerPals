export type WizardChip = {
  id: string
  name: string
  color: string
  value: number
}

export type WizardMember = {
  id: string
  name: string
  color: string
}

export type CurrencyUnit = "centime" | "EUR"

export type WizardDraft = {
  name: string
  type: "standard" | "tournament"
  loan_amount: number
  currency_unit: CurrencyUnit
  chips: WizardChip[]
  password: string
  admin_emails: string[]
  members: WizardMember[]
}

export const MEMBER_COLORS = [
  "#a78bfa","#f472b6","#60a5fa","#34d399",
  "#fbbf24","#f97316","#06b6d4","#e879f9",
  "#84cc16","#14b8a6","#fb7185","#818cf8",
  "#2dd4bf","#facc15","#c084fc","#38bdf8",
  "#4ade80","#fb923c","#a3e635","#e2e8f0",
]

export const DEFAULT_DRAFT: WizardDraft = {
  name: "",
  type: "standard",
  loan_amount: 100,
  currency_unit: "centime",
  chips: [
    { id: "c1", name: "Trắng",  color: "#e2e8f0", value: 10  },
    { id: "c2", name: "Đỏ",    color: "#ef4444", value: 50  },
    { id: "c3", name: "Xanh",  color: "#3b82f6", value: 100 },
    { id: "c4", name: "Đen",   color: "#1e293b", value: 500 },
  ],
  password: "",
  admin_emails: [],
  members: [],
}
