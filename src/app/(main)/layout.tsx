import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-black min-h-screen">
      <Nav />
      <main>{children}</main>
      <Footer />
    </div>
  )
}
