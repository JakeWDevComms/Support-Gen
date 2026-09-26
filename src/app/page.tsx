import Link from "next/link";

export default function Home(){
  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-12">
    <div className="mx-auto max-w-6xl">
      <section className="relative overflow-hidden rounded-[32px] bg-[#0b3f47] px-7 py-10 text-white shadow-[0_24px_70px_rgba(16,58,64,.16)] md:px-11 md:py-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white opacity-[0.06]"/>
        <div className="pointer-events-none absolute -bottom-36 left-[28%] h-72 w-72 rounded-full bg-[#e9b83f] opacity-[0.09]"/>
        <div className="relative">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-black ring-1 ring-white/15">D</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/60">DevComms campaign tools</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-[-0.035em] md:text-6xl">Support Gen</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/72">Build, run and report on planning-support campaigns from one reusable system.</p>
        </div>
      </section>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        <section className="group rounded-[26px] bg-white p-6 shadow-[0_12px_36px_rgba(20,53,57,.07)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(20,53,57,.1)] md:p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7f2ef] text-lg font-black text-[#006f78]">01</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Public experience</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#173136]">Castle Hills Solar Farm</h2>
          <p className="mt-3 text-sm leading-6 text-[#657376]">Review the resident-facing representation tool and the tracked campaign landing page.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link className="rounded-xl bg-[#006f78] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5" href="/castle-hills-solar">Open letter tool →</Link>
            <Link className="rounded-xl border border-[#cbd8d4] bg-white px-4 py-3 text-sm font-bold text-[#30494e] transition hover:bg-[#f7faf9]" href="/castle-hills-solar/reach/facebook-local">Reach landing page</Link>
          </div>
        </section>

        <section className="group rounded-[26px] bg-white p-6 shadow-[0_12px_36px_rgba(20,53,57,.07)] ring-1 ring-black/[0.04] transition hover:-translate-y-0.5 hover:shadow-[0_16px_42px_rgba(20,53,57,.1)] md:p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#eef1f1] text-lg font-black text-[#173136]">02</div>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Admin & reporting</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-[#173136]">Campaign dashboards</h2>
          <p className="mt-3 text-sm leading-6 text-[#657376]">Review supporter activity, campaign sources, conversion data, tracked links and QR codes.</p>
          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link className="rounded-xl bg-[#173f46] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5" href="/admin/castle-hills-solar">Support dashboard →</Link>
            <Link className="rounded-xl border border-[#cbd8d4] bg-white px-4 py-3 text-sm font-bold text-[#30494e] transition hover:bg-[#f7faf9]" href="/admin/castle-hills-solar/reach">Reach dashboard</Link>
          </div>
        </section>
      </div>

      <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#dce5e2] bg-white/65 px-5 py-4 text-sm text-[#607174]">
        <span>Build mode · admin authentication temporarily disabled</span>
        <Link className="font-bold text-[#006f78] hover:underline" href="/example-project">Example project →</Link>
      </div>
    </div>
  </main>;
}
