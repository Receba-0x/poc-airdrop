export function AvatarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="12"
      height="16"
      viewBox="0 0 12 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <ellipse
        opacity="0.4"
        cx="6.00033"
        cy="12.1668"
        rx="5.83333"
        ry="3.33333"
        fill="#EDEDF0"
      />
      <ellipse
        cx="6.00033"
        cy="3.83333"
        rx="3.33333"
        ry="3.33333"
        fill="#EDEDF0"
      />
    </svg>
  );
}
