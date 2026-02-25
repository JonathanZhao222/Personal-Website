export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="max-w-4xl mx-auto px-6 md:px-8 py-12 mt-20">
      <div className="border-t border-black/10 pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <span className="font-sans text-sm text-black/40">
          &copy; {year} Jonathan Zhao
        </span>
        <div className="flex items-center gap-6">
          <a
            href="mailto:jzhao222@stanford.edu"
            className="font-sans text-sm text-black/40 hover:text-black transition-colors"
          >
            Email
          </a>
          <a
            href="https://github.com/JonathanZhao222/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-black/40 hover:text-black transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://www.linkedin.com/in/jonathan-zhao-818832236/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-sm text-black/40 hover:text-black transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  )
}
