import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy — type garden',
  description: 'Privacy policy for type garden.',
}

export default function PrivacyPage() {
  return (
    <main className="min-h-dvh bg-[#f3d4d9] px-5 py-10 text-[#141414] md:px-10 md:py-16">
      <article className="mx-auto max-w-2xl rounded-[2rem] border border-black/10 bg-white/45 p-6 shadow-sm backdrop-blur md:p-10">
        <Link href="/" className="text-sm underline-offset-4 hover:underline">← Back to type garden</Link>
        <p className="mt-10 text-xs font-medium uppercase tracking-[0.25em] opacity-60">Privacy policy</p>
        <h1 className="mt-3 font-serif text-5xl tracking-tight">Your words stay yours.</h1>
        <div className="mt-6 space-y-5 text-base leading-7 opacity-80">
          <p>Type garden is a client-side creative tool. Text you enter is used in your browser to render the Garden and Matchcut experiences.</p>
          <p>We do not intentionally collect, sell, or store the text you type, exported videos, or personal payment information. The Support page only displays the QR image supplied by the creator.</p>
          <p>The site may receive basic technical information from its hosting provider, such as request and error logs, to keep the service secure and reliable.</p>
          <p>
            To understand how the tool is used and to improve it, type garden records anonymous usage statistics: a random visitor ID stored in your browser, which pages and features you use (for example which theme or export format you pick), how long the page is open, and basic device details such as browser, operating system, device type, screen size, language, time zone and the website that referred you. This never includes the text you type, your exported videos, your IP address, your name or your email.
          </p>
          <p>
            Usage statistics are stored in a private Google Sheet managed by the creator. If your browser sends a Do Not Track or Global Privacy Control signal, no usage statistics are recorded. You can also clear this site&apos;s data in your browser at any time to reset your random visitor ID.
          </p>
          <p>For questions about this policy, visit the Support page or contact YASH through the linked social profile.</p>
        </div>
        <p className="mt-10 text-sm opacity-60">Last updated: November 3, 2026</p>
      </article>
    </main>
  )
}
