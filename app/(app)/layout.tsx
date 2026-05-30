import TopBar from "@/components/shared/topbar"
import BottomNav from "@/components/shared/bottom-nav"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopBar />
      <main className="max-w-[430px] mx-auto pb-[104px] relative z-1 px-5.5 pt-2" >
        {children}
      </main>
      <BottomNav />
    </>
  )
}
