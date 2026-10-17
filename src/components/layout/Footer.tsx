const linkClass = 'text-muted hover:text-accent transition-colors'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="max-w-plate mx-auto px-6">
      <div className="border-t border-white/10 pt-10 pb-12 flex flex-wrap items-center justify-between gap-6">
        <p className="font-mono text-xs text-dim">&copy; {year} Jonathan Zhao</p>
        <nav aria-label="Contact" className="flex flex-wrap gap-x-7 gap-y-3 font-mono text-[13px]">
          <a href="mailto:jzhao222@stanford.edu" className={linkClass}>
            jzhao222@stanford.edu
          </a>
          <a
            href="https://github.com/JonathanZhao222/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GitHub ↗
          </a>
          <a
            href="https://www.linkedin.com/in/jonathan-zhao-818832236/"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            LinkedIn ↗
          </a>
        </nav>
      </div>
    </footer>
  )
}
