import Link from "next/link";

export default function Home(){
 return <main className="min-h-screen bg-[#eef3f1] px-5 py-10 md:py-16">
  <div className="mx-auto max-w-5xl">
   <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5 md:p-12">
    <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#006f78]">DevComms</p>
    <h1 className="mt-3 text-4xl font-bold tracking-tight text-[#173136] md:text-5xl">Support Gen</h1>
    <p className="mt-4 max-w-2xl text-lg leading-8 text-[#5f6e71]">Build, run and report on project-specific planning support campaigns from one place.</p>

    <div className="mt-9 grid gap-4 md:grid-cols-2">
     <section className="rounded-2xl border border-[#d8e1de] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Public experience</p>
      <h2 className="mt-2 text-xl font-bold">Castle Hills Solar Farm</h2>
      <p className="mt-2 text-sm leading-6 text-[#657376]">Review the resident-facing letter generator and campaign landing pages.</p>
      <div className="mt-5 flex flex-wrap gap-2">
       <Link className="rounded-xl bg-[#006f78] px-4 py-3 text-sm font-bold text-white" href="/castle-hills-solar">Letter tool</Link>
       <Link className="rounded-xl border border-[#cbd8d4] px-4 py-3 text-sm font-bold" href="/castle-hills-solar/reach/facebook-local">Reach landing page</Link>
      </div>
     </section>

     <section className="rounded-2xl border border-[#d8e1de] p-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Admin & reporting</p>
      <h2 className="mt-2 text-xl font-bold">Dashboards</h2>
      <p className="mt-2 text-sm leading-6 text-[#657376]">Admin login is temporarily disabled while the product is being built.</p>
      <div className="mt-5 flex flex-wrap gap-2">
       <Link className="rounded-xl bg-[#083f47] px-4 py-3 text-sm font-bold text-white" href="/admin/castle-hills-solar">Support dashboard</Link>
       <Link className="rounded-xl bg-[#006f78] px-4 py-3 text-sm font-bold text-white" href="/admin/castle-hills-solar/reach">Reach dashboard</Link>
      </div>
     </section>
    </div>

    <div className="mt-5">
     <Link className="text-sm font-bold text-[#506265] underline underline-offset-4" href="/example-project">Open example project config →</Link>
    </div>
   </div>
  </div>
 </main>;
}
