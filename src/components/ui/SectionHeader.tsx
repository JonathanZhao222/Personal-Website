interface SectionHeaderProps {
  id: string
  /** Structure-level label, e.g. "2°" */
  label: string
  title: string
  /** Right-hand annotation: plain text or a link */
  aside?: React.ReactNode
  /** Short line under the title */
  description?: React.ReactNode
  as?: 'h1' | 'h2'
}

export function SectionHeader({
  id,
  label,
  title,
  aside,
  description,
  as: Heading = 'h2',
}: SectionHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-3">
        <span className="font-mono text-xs tracking-[0.16em] text-accent">{label}</span>
        <Heading id={id} className="font-serif italic font-normal text-[56px] leading-none">
          {title}
        </Heading>
        <span aria-hidden="true" className="flex-[1_1_80px] h-px bg-white/10 self-center" />
        {aside && <span className="font-mono text-xs text-dim">{aside}</span>}
      </div>
      {description && (
        <p className="mt-4 max-w-[560px] text-[17px] leading-[1.6] text-body">{description}</p>
      )}
    </div>
  )
}
