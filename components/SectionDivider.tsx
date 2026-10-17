export default function SectionDivider() {
  return (
    // eslint-disable-next-line jsx-a11y/role-supports-aria-props
    <div
      className="relative w-full overflow-hidden pointer-events-none select-none py-0"
      aria-hidden="true"
      role="none"
    >
      {/* 1px hairline separator with center-weighted fade */}
      <div
        className="h-px w-full bg-white/15 [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]"
      />

      {/* Subtle teal glow centered on the hairline */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-4 w-48 sm:w-72 items-center justify-center overflow-hidden">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#5ad1cd] to-transparent opacity-75 blur-[2px]" />
        <div className="absolute h-2 w-28 rounded-full bg-[#5ad1cd]/20 blur-md" />
      </div>
    </div>
  );
}
