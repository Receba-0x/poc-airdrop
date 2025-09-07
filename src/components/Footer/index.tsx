"use client";
import { ScrollAnimation } from "../ScrollAnimation";
import { useLanguage } from "@/contexts/LanguageContext";
import Image from "next/image";
import { InstagramIcon } from "../Icons/InstagramIcon";
import { TwitterIcon } from "../Icons/TwitterIcon";
import Link from "next/link";

interface FooterLinkProps {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}

interface FooterSectionProps {
  title: string;
  links: { href: string; label: string; external?: boolean }[];
}

interface SideDecorProps {
  image: string;
  side: "left" | "right";
}

const FooterLink = ({ href, children, external = false }: FooterLinkProps) => (
  <Link
    href={href}
    target={external ? "_blank" : undefined}
    className="hover:text-neutral-12 transition-colors duration-300"
  >
    {children}
  </Link>
);

const FooterSection = ({ title, links }: FooterSectionProps) => (
  <div className="flex flex-col items-center justify-between text-neutral-11 h-full">
    <h3 className="text-neutral-12 font-medium">{title}</h3>
    {links.map((link) => (
      <FooterLink key={link.href} href={link.href} external={link.external}>
        {link.label}
      </FooterLink>
    ))}
  </div>
);

const SideDecoration = ({ image, side }: SideDecorProps) => (
  <div
    className={`w-[5%] h-full relative bg-cover bg-center overflow-hidden ${
      side === "right" ? "border-l border-neutral-6" : ""
    }`}
    style={{ backgroundImage: `url('/images/${image}')` }}
  >
    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-primary-10 h-1 w-1/2 rounded-b-xl" />
    <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-primary-11 w-10 h-20 transition-all duration-500 ease-in-out blur-xl" />
  </div>
);

export function Footer() {
  const { t, language } = useLanguage();

  const socialLinks = [
    { href: "https://x.com/Loot4Fun", icon: TwitterIcon },
    { href: "https://www.instagram.com/loot4fun/", icon: InstagramIcon },
  ];

  const footerSections = [
    {
      title: "Plataforma",
      links: [
        { href: "/", label: "Home" },
        { href: "/boxes", label: "Boxes" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/affiliates", label: "Affiliates" },
      ],
    },
    {
      title: "Recursos",
      links: [
        { href: "/docs/privacy", label: "Politic and Privacy" },
        { href: "/docs/terms-of-use", label: "Terms and services" },
        { href: "/docs/refund", label: "Refund" },
        { href: "/docs/cookies", label: "Cookies" },
      ],
    },
    {
      title: "Company",
      links: [
        { href: "/#about-us", label: "About us" },
        { href: "/#tokenomics", label: "Tokenomics" },
        { href: "/#whitepaper", label: "Whitepaper" },
        { href: "/#gitbook", label: "Gitbook" },
      ],
    },
  ];

  return (
    <footer className="w-full h-[252px] flex flex-col items-center justify-start overflow-hidden bg-neutral-3 border-t border-neutral-6">
      <ScrollAnimation
        type="slide"
        direction="up"
        duration={0.7}
        delay={0.1}
        className="w-full h-full flex items-center justify-between"
      >
        <SideDecoration image="footer_side.png" side="left" />

        <div className="flex items-center justify-between w-full h-full p-8">
          {/* Brand Section */}
          <div className="flex flex-col items-start justify-between h-full w-1/2">
            <Image
              src="/images/logo_loot.png"
              alt="Loot4Fun Logo"
              width={164}
              height={44}
              className="object-cover"
              draggable={false}
            />

            <p className="text-neutral-11 leading-relaxed">
              Loot4Fun é uma plataforma Web3 de caixas surpresa que combina
              colecionáveis digitais e físicos, com transparência on-chain e
              foco em comunidade.
            </p>

            <div className="flex items-center gap-3">
              {socialLinks.map(({ href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  target="_blank"
                  className="hover:scale-110 transition-transform duration-200"
                >
                  <Icon className="text-white h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Sections */}
          <div className="grid grid-cols-3 gap-4 h-full w-1/3">
            {footerSections.map((section) => (
              <FooterSection key={section.title} {...section} />
            ))}
          </div>
        </div>

        <SideDecoration image="footer_right.png" side="right" />
      </ScrollAnimation>
    </footer>
  );
}
