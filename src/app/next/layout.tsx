export default function NextLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#d4d4d4] font-sans">
      {children}
    </div>
  )
}
