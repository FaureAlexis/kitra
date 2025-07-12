import React from "react";
import Image from "next/image";
import WhiteSvgLogo from "@/assets/white-kitra-logo.svg";
import BlackSvgLogo from "@/assets/black-kitra-logo.svg";

interface LogoProps {
  color?: 'black' | 'white';
  width?: number;
  className?: string;
}

export function Logo({ color = "white", width = 32, className = "" }: LogoProps) {
  const logoSrc = color === 'black' ? BlackSvgLogo : WhiteSvgLogo;

  return (
    <Image
      src={logoSrc}
      alt="Kitra Logo"
      width={width}
      height={width}
      className={className}
      priority
    />
  );
}
