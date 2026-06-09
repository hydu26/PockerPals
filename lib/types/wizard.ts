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

export type CurrencyUnit = "EUR"

export type WizardDraft = {
  name: string
  type: "standard" | "tournament"
  loan_amount: number
  currency_unit: CurrencyUnit
  chips: WizardChip[]
  password: string
  members: WizardMember[]
}

export const MEMBER_COLORS = [
  "#a78bfa","#f472b6","#60a5fa","#34d399",
  "#fbbf24","#f97316","#06b6d4","#e879f9",
  "#84cc16","#14b8a6","#fb7185","#818cf8",
  "#2dd4bf","#facc15","#c084fc","#38bdf8",
  "#4ade80","#fb923c","#a3e635","#e2e8f0",
  "#ef4444","#1e293b",
]


export const DEFAULT_DRAFT: WizardDraft = {
  name: "",
  type: "standard",
  loan_amount: 1,
  currency_unit: "EUR",
  chips: [
    { id: "c1", name: "Trắng",  color: "#e2e8f0", value: 0.1  },
    { id: "c2", name: "Đỏ",    color: "#ef4444", value: 0.5  },
    { id: "c3", name: "Xanh",  color: "#3b82f6", value: 1   },
    { id: "c4", name: "Đen",   color: "#1e293b", value: 5   },
  ],
  password: "",
  members: [],
}
