const svgProps = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
}

export function IconUser() {
  return (
    <svg {...svgProps}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19c1.4-3.2 3.8-5 7-5s5.6 1.8 7 5" />
    </svg>
  )
}

export function IconSearch() {
  return (
    <svg {...svgProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export function IconCart() {
  return (
    <svg {...svgProps}>
      <path d="M4 6h2l1.2 9.2a2 2 0 0 0 2 1.8h7.6a2 2 0 0 0 2-1.7L20 8H7" />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconMenu() {
  return (
    <svg {...svgProps}>
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="19" y2="17" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg {...svgProps}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function IconFilter() {
  return (
    <svg {...svgProps}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

export function IconPin() {
  return (
    <svg {...svgProps} width="16" height="16">
      <path d="M12 11.5c1.9-1.9 4-4.2 4-6.5a4 4 0 1 0-8 0c0 2.3 2.1 4.6 4 6.5Z" />
      <circle cx="12" cy="5.2" r="1.2" />
    </svg>
  )
}

export function IconClock() {
  return (
    <svg {...svgProps} width="16" height="16">
      <circle cx="12" cy="12" r="7" />
      <path d="M12 8v4l2.5 1.5" />
    </svg>
  )
}

export function IconPhone() {
  return (
    <svg {...svgProps} width="16" height="16">
      <path d="M8 5.5c.4 2 1.4 3.8 2.8 5.2s3.2 2.4 5.2 2.8l1.5-1.5a1 1 0 0 1 1 .2l2.2 1.7a1 1 0 0 1 .2 1.3 8.5 8.5 0 0 1-9.7 4.4A12.5 12.5 0 0 1 3.4 10.7 8.5 8.5 0 0 1 7.8 1.1a1 1 0 0 1 1.3.2L10.8 3.5a1 1 0 0 1 .2 1L8 5.5Z" />
    </svg>
  )
}

export function IconArrow() {
  return (
    <svg {...svgProps} width="16" height="16">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  )
}

export function IconMinus() {
  return (
    <svg {...svgProps} width="14" height="14">
      <path d="M5 12h10" />
    </svg>
  )
}

export function IconPlus() {
  return (
    <svg {...svgProps} width="14" height="14">
      <path d="M12 5v10M7 12h10" />
    </svg>
  )
}

export function IconTrash() {
  return (
    <svg {...svgProps} width="14" height="14">
      <path d="M5 7h10M9 7V5h6v2M7 7l.8 10h8.4L17 7" />
    </svg>
  )
}

function CatFrame({ children, fill }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill={fill} />
      {children}
    </svg>
  )
}

const categoryIcons = {
  noodles: (
    <CatFrame fill="#F8D7C4">
      <ellipse cx="32" cy="40" rx="16" ry="7" fill="#C45D2C" />
      <path d="M16 40c2-10 10-16 16-16s14 6 16 16" stroke="#8A3A16" strokeWidth="2.2" />
      <path d="M22 36c3-4 7-4 10 0M34 35c3-4 7-3 9 1" stroke="#F4EFE6" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M44 18l6 10M50 18l-6 10" stroke="#1A1714" strokeWidth="2" strokeLinecap="round" />
    </CatFrame>
  ),
  vegetables: (
    <CatFrame fill="#D7EBDC">
      <path d="M32 46c-9-2-16-12-12-22 8 2 12 8 12 14 0-6 4-12 12-14 4 10-3 20-12 22Z" fill="#2F6B47" />
      <path d="M32 38V18" stroke="#1C4634" strokeWidth="2.2" strokeLinecap="round" />
    </CatFrame>
  ),
  fruits: (
    <CatFrame fill="#F8D5D2">
      <circle cx="32" cy="36" r="12" fill="#C45D2C" />
      <path d="M32 24c4-8 12-8 14-6" stroke="#2F6B47" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M32 24c0-4 2-8 6-9" stroke="#1C4634" strokeWidth="2.2" strokeLinecap="round" />
    </CatFrame>
  ),
  dairy: (
    <CatFrame fill="#D7E6F4">
      <rect x="24" y="16" width="16" height="32" rx="8" fill="#F4EFE6" stroke="#3A6F9A" strokeWidth="2" />
      <rect x="24" y="16" width="16" height="8" rx="4" fill="#3A6F9A" />
    </CatFrame>
  ),
  bakery: (
    <CatFrame fill="#F3E3B5">
      <ellipse cx="32" cy="38" rx="16" ry="10" fill="#C4962A" />
      <path d="M18 36c4-12 24-12 28 0" fill="#E8C07A" />
      <path d="M24 32v6M32 30v8M40 32v6" stroke="#8A6A1C" strokeWidth="1.6" strokeLinecap="round" />
    </CatFrame>
  ),
  snacks: (
    <CatFrame fill="#F7E7B8">
      <path d="M26 18h12l4 28H22l4-28Z" fill="#E2B93D" />
      <path d="M24 46h16l-2 4H26l-2-4Z" fill="#C4962A" />
      <circle cx="32" cy="30" r="3" fill="#F4EFE6" />
    </CatFrame>
  ),
  tea: (
    <CatFrame fill="#E9DCC8">
      <path d="M20 28h20v10a8 8 0 0 1-20 0V28Z" fill="#6B4A2F" />
      <path d="M40 32h6a4 4 0 0 1 0 8h-4" stroke="#6B4A2F" strokeWidth="2.2" />
      <path d="M26 20c2 4 4 4 6 0s4-4 6 0" stroke="#2F6B47" strokeWidth="2" strokeLinecap="round" />
    </CatFrame>
  ),
  beverages: (
    <CatFrame fill="#D4EBE7">
      <path d="M26 16h12l2 28a8 8 0 0 1-16 0l2-28Z" fill="#2A7A72" />
      <rect x="27" y="20" width="10" height="8" fill="#F4EFE6" opacity=".4" />
    </CatFrame>
  ),
  groceries: (
    <CatFrame fill="#E3E9C9">
      <path d="M20 24h24l-2 20H22L20 24Z" fill="#6B7A32" />
      <path d="M24 24c0-6 4-10 8-10s8 4 8 10" stroke="#6B7A32" strokeWidth="2.2" />
    </CatFrame>
  ),
  care: (
    <CatFrame fill="#E6DDF4">
      <rect x="26" y="18" width="12" height="28" rx="6" fill="#7B62A8" />
      <rect x="29" y="14" width="6" height="6" rx="2" fill="#7B62A8" />
      <circle cx="32" cy="34" r="3.5" fill="#F4EFE6" />
    </CatFrame>
  ),
  household: (
    <CatFrame fill="#DEE3EA">
      <rect x="22" y="22" width="20" height="22" rx="4" fill="#5B6B7A" />
      <path d="M26 22c0-6 12-6 12 0" stroke="#5B6B7A" strokeWidth="2.4" />
      <path d="M28 30h8M28 36h8" stroke="#F4EFE6" strokeWidth="1.8" strokeLinecap="round" />
    </CatFrame>
  ),
  chocolates: (
    <CatFrame fill="#E9D5C4">
      <rect x="18" y="22" width="28" height="20" rx="4" fill="#6B3A2A" />
      <path d="M18 32h28M32 22v20" stroke="#F4EFE6" strokeWidth="1.5" opacity=".5" />
    </CatFrame>
  ),
}

export function CategoryIcon({ id }) {
  return categoryIcons[id] || null
}
