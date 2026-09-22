import { cn } from "@/lib/utils";

interface FuriiLogoProps {
  className?: string;
  variant?: "horizontal" | "stacked" | "icon";
  theme?: "auto" | "light" | "dark";
  alt?: string;
}

export function FuriiLogo({
  className,
  variant = "horizontal",
  theme = "auto",
  alt = "Furii",
}: FuriiLogoProps) {
  const lightSrc = {
    horizontal: "/brand/furii-logo-horizontal.png",
    stacked: "/brand/furii-logo-stacked.png",
    icon: "/brand/furii-icon.png",
  }[variant];

  const darkSrc = {
    horizontal: "/brand/furii-logo-horizontal-white.png",
    stacked: "/brand/furii-logo-stacked-white.png",
    icon: "/brand/furii-icon-white.png",
  }[variant];

  if (theme === "light") {
    return (
      <div className={cn("relative inline-flex items-center shrink-0 select-none", className)}>
        <img src={lightSrc} alt={alt} className="h-full w-auto object-contain" />
      </div>
    );
  }

  if (theme === "dark") {
    return (
      <div className={cn("relative inline-flex items-center shrink-0 select-none", className)}>
        <img src={darkSrc} alt={alt} className="h-full w-auto object-contain" />
      </div>
    );
  }

  return (
    <div className={cn("relative inline-flex items-center shrink-0 select-none", className)}>
      {/* Light theme */}
      <img
        src={lightSrc}
        alt={alt}
        className="h-full w-auto object-contain dark:hidden"
      />
      {/* Dark theme */}
      <img
        src={darkSrc}
        alt={alt}
        className="h-full w-auto object-contain hidden dark:block"
      />
    </div>
  );
}

export default FuriiLogo;
