interface BrandLogoProps {
  className?: string
  decorative?: boolean
}

export function BrandLogo({ className, decorative = false }: BrandLogoProps) {
  return (
    <img
      src="/brand/ntt-data-logo-white.svg"
      alt={decorative ? '' : 'NTT DATA'}
      className={className}
      aria-hidden={decorative}
    />
  )
}
