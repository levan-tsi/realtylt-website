/** Five review stars in porchlight amber. */
export function Stars({ label = "Rated 5.0 out of 5", className = "" }: { label?: string; className?: string }) {
  return (
    <span role="img" aria-label={label} className={`inline-flex gap-0.5 text-porchlight ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} aria-hidden viewBox="0 0 20 20" className="h-4 w-4 fill-current">
          <path d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
        </svg>
      ))}
    </span>
  );
}
