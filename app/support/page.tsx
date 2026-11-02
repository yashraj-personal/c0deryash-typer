import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'Support — type garden',
  description: 'Support type garden and its creator, YASH.',
}

export default function SupportPage() {
  return (
    <main className="min-h-dvh bg-[#f3d4d9] px-5 py-10 text-[#141414] md:px-10 md:py-16">
      <div className="mx-auto flex max-w-2xl flex-col gap-8">
        <Link href="/" className="text-sm underline-offset-4 hover:underline">← Back to type garden</Link>
        <section className="rounded-[2rem] border border-black/10 bg-white/45 p-6 shadow-sm backdrop-blur md:p-10">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.25em] opacity-60">Support</p>
          <h1 className="font-serif text-5xl tracking-tight md:text-7xl">Keep the garden growing.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 opacity-75">
            If type garden helped you make something lovely, you can support its continued development using the QR code below.
          </p>
          <div className="mt-8 flex justify-center rounded-2xl bg-white p-5">
            <Image src="/support-qr.jpg" alt="Payment QR code to support YASH" width={800} height={1067} className="h-auto w-full max-w-sm rounded-xl" priority />
          </div>
          <p className="mt-6 text-center text-sm opacity-70">Thank you for supporting independent creative tools.</p>
        </section>
        <footer className="flex flex-col gap-2 text-sm opacity-70">
          <p>Made by YASH.</p>
          <p>© 2026 YASH. All rights reserved. Type garden and its original artwork are protected creative works.</p>
          <Link href="/privacy" className="underline-offset-4 hover:underline">Read the privacy policy</Link>
        </footer>
      </div>
    </main>
  )
}
