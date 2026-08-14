/*
  Small consistent stroke-based icon set.

  All icons share the same viewBox, stroke width and
  round joins so they stay visually consistent. They
  inherit the surrounding text color via currentColor.
*/

function IconBase({ children, className, label }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : 'presentation'}
      aria-hidden={label ? undefined : 'true'}
      aria-label={label}
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function ChevronIcon({ className, label }) {
  return (
    <IconBase className={className} label={label}>
      <path d="M9 6l6 6-6 6" />
    </IconBase>
  );
}

export function MenuIcon({ className, label }) {
  return (
    <IconBase className={className} label={label}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </IconBase>
  );
}

export function HomeIcon({ className, label }) {
  return (
    <IconBase className={className} label={label}>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </IconBase>
  );
}

export function ArrowLeftIcon({ className, label }) {
  return (
    <IconBase className={className} label={label}>
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </IconBase>
  );
}

export function ArrowRightIcon({ className, label }) {
  return (
    <IconBase className={className} label={label}>
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </IconBase>
  );
}