type BrandMarkProps = {
  className?: string;
  iconClassName?: string;
  labelClassName?: string;
  subtitleClassName?: string;
  showLabel?: boolean;
  size?: number;
};

export default function BrandMark({
  className = '',
  iconClassName = '',
  labelClassName = '',
  subtitleClassName = '',
  showLabel = true,
  size = 56,
}: BrandMarkProps) {
  return (
    <div className={`inline-flex items-center gap-4 ${className}`.trim()}>
      <img
        src="/gala-mark.svg"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={`shrink-0 ${iconClassName}`.trim()}
      />
      {showLabel && (
        <div className="leading-none">
          <div className={`font-display text-[clamp(2rem,4vw,3.6rem)] tracking-tight ${labelClassName}`.trim()}>
            Gala
          </div>
          <div className={`mt-2 text-[0.68rem] uppercase tracking-[0.34em] ${subtitleClassName}`.trim()}>
            Confirmação de presença
          </div>
        </div>
      )}
    </div>
  );
}
