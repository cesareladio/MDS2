import type { ReactNode } from 'react'

export function StoryCopy({ index, kicker, title, children, align = 'left' }: { index: string; kicker: string; title: ReactNode; children?: ReactNode; align?: 'left' | 'right' | 'center' }) {
  return (
    <div className={`story-copy story-copy--${align}`}>
      <div className="chapter-kicker"><span>{index}</span>{kicker}</div>
      <h2>{title}</h2>
      {children && <div className="story-body">{children}</div>}
    </div>
  )
}
