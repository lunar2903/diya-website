/* Plain <img> on purpose: the local placeholder art is SVG and needs no optimisation. */
export default function Art({ src, alt = "", className = "" }: { src: string; alt?: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} loading="lazy" decoding="async" className={`block w-full h-full object-cover ${className}`} />
  );
}

/** Book cover: the project's artwork, or a typographic cover (title on the spine colour) when it has none. */
export function Cover({ p, alt = "" }: { p: { title: string; category: string; coverImage: string; coverColor: string; spineText: string }; alt?: string }) {
  if (p.coverImage) return <Art src={p.coverImage} alt={alt} />;
  return (
    <div className="flex h-full w-full flex-col justify-between p-[9%]" style={{ background: p.coverColor, color: p.spineText, containerType: "inline-size", boxShadow: "inset 0 0 0 1px rgba(63,48,41,.15)" }}>
      <span className="folio !text-current opacity-80" style={{ fontSize: "max(0.5rem, 5cqw)" }}>{p.category}</span>
      <span className="display" style={{ fontSize: "clamp(1.1rem, 17cqw, 4rem)", textWrap: "balance" }}>{p.title}</span>
      <span aria-hidden className="block h-px w-1/3 bg-current opacity-60" />
    </div>
  );
}
