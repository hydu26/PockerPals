import type { Database } from "./database"

// Convenience row types
export type Group   = Database["public"]["Tables"]["groups"]["Row"]
export type Member  = Database["public"]["Tables"]["members"]["Row"]
export type Admin   = Database["public"]["Tables"]["group_admins"]["Row"]
export type Session = Database["public"]["Tables"]["sessions"]["Row"]

// Chip definition stored in groups.chips jsonb array
export type Chip = {
  id:    string
  name:  string
  color: string
  value: number   // nghìn đồng per chip
}

// Session scores map: { [member_id]: number }
export type ScoreMap = Record<string, number>

// Group with aggregated data (from queries)
export type GroupWithMeta = Group & {
  members:       Member[]
  sessions:      Session[]
  admin_emails:  string[]
  session_count: number
  last_session:  string | null
}
