interface TokenIconProps {
  token: "photon" | "atone";
  size?: number;
  className?: string;
}

const TOKEN_ICONS = {
  photon: { svg: "/assets/photon.svg", alt: "PHOTON" },
  atone: { svg: "/assets/atone.svg", alt: "ATONE" },
};

export function TokenIcon({ token, size = 20, className = "" }: TokenIconProps) {
  const { svg, alt } = TOKEN_ICONS[token];
  return (
    <img
      src={svg}
      alt={alt}
      width={size}
      height={size}
      className={`inline-block flex-shrink-0 ${className}`}
    />
  );
}
