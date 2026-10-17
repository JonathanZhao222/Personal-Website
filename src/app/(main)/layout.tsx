import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { Cursor } from '@/components/ui/Cursor'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-ground text-ink min-h-screen overflow-hidden select-none">
      <div aria-hidden="true" className="lab-grid pointer-events-none absolute inset-0" />
      <div className="relative">
        <Nav />
        <main>{children}</main>
        <Footer />
      </div>
      <Cursor />
    </div>
  )
}
