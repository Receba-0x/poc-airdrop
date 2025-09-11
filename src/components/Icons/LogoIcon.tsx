import Image from "next/image";

export function LogoIcon({ className }: { className?: string }) {
  return (
    <Image
      src="/images/logo_token.png"
      alt="Logo"
      width={44}
      height={44}
      className={className}
    />
  );
}
