export function AvatarBorderIcon({ className }: { className?: string }) {
  const uniqueId = Math.random().toString(36).substr(2, 9);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="74"
      height="74"
      viewBox="0 0 74 74"
      fill="none"
      className={className}
    >
      <path
        d="M1 21V5C1 2.79086 2.79086 1 5 1H21"
        stroke={`url(#paint0_linear_${uniqueId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M73 53V69C73 71.2091 71.2091 73 69 73H53"
        stroke={`url(#paint1_linear_${uniqueId})`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`paint0_linear_${uniqueId}`}
          x1="1"
          y1="1.05645"
          x2="9.5"
          y2="11"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`paint1_linear_${uniqueId}`}
          x1="73"
          y1="72.9436"
          x2="64.5"
          y2="63"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
