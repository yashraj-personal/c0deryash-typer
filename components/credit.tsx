export function Credit({ className = '' }: { className?: string }) {
  return (
    <p className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs tracking-wide ${className}`}>
      <span>
        made by <span className="font-semibold tracking-[0.2em]">YASH</span>
      </span>
      <span aria-hidden="true" className="opacity-40">
        {'·'}
      </span>
      <span aria-hidden="true" className="opacity-40">
        {'·'}
      </span>
      <span className="flex items-center gap-2">
        <a href="/support" className="underline-offset-4 transition-opacity hover:underline hover:opacity-80">
          Support
        </a>
        <span aria-hidden="true" className="opacity-40">{'·'}</span>
        <a href="/privacy" className="underline-offset-4 transition-opacity hover:underline hover:opacity-80">
          Privacy
        </a>
      </span>
      <span aria-hidden="true" className="opacity-40">
        {'·'}
      </span>
      <a
        href="https://www.instagram.com/c0deryash/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 underline-offset-4 transition-opacity hover:underline hover:opacity-80"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
        <span>
          <span className="sr-only">Instagram </span>@c0deryash
        </span>
      </a>
    </p>
  )
}
