import Link from "next/link";
import { getProjects } from "@/lib/projects";

export default async function Home(){
  const projects=await getProjects();
  const databaseReady=Boolean(process.env.DATABASE_URL);

  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-12">
    <div className="mx-auto max-w-7xl">
      <section className="relative overflow-hidden rounded-[32px] bg-[#0b3f47] px-7 py-9 text-white shadow-[0_24px_70px_rgba(16,58,64,.16)] md:px-10 md:py-11">
        <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-white opacity-[0.06]"/>
        <div className="pointer-events-none absolute -bottom-36 left-[28%] h-72 w-72 rounded-full bg-[#e9b83f] opacity-[0.09]"/>
        <div className="relative flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-lg font-black ring-1 ring-white/15">D</div>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-white/60">DevComms campaign tools</p>
            <h1 className="mt-2 text-4xl font-bold tracking-[-0.035em] md:text-5xl">Support Gen</h1>
            <p className="mt-4 max-w-2xl text-lg leading-8 text-white/72">Create project-specific paid-social creative, captions, targeting plans and campaign assets from one reusable system.</p>
          </div>
          <Link href="/admin/projects/new" className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-3.5 font-bold text-[#0b3f47] shadow-sm transition hover:-translate-y-0.5">+ New project</Link>
        </div>
      </section>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Projects</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173136]">{projects.length} active workspace{projects.length===1?"":"s"}</h2>
        </div>
        {!databaseReady?<div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900"><strong>Build mode:</strong> connect the database to save new projects.</div>:null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {projects.map(({config:project,source,status})=><article key={project.slug} className="overflow-hidden rounded-[27px] bg-white shadow-[0_12px_36px_rgba(20,53,57,.07)] ring-1 ring-black/[0.04]">
          <div className="border-b border-[#e8eeec] p-6 md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] ${status==="live"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-700"}`}>{status}</span>
                  <span className="rounded-full bg-[#f1f5f4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#718083]">{source==="seeded"?"Seed project":"Database project"}</span>
                </div>
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-[#173136]">{project.schemeName}</h3>
                <p className="mt-2 text-sm text-[#6b7a7d]">{project.clientName}{project.location?` · ${project.location}`:""}</p>
              </div>
              <div className="h-12 w-12 shrink-0 rounded-2xl" style={{background:project.theme.primary}}/>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Mini label="Application" value={project.applicationReference}/>
              <Mini label="Campaign facts" value={String(project.benefits.length)}/>
              <Mini label="Project type" value={project.campaign?.projectType??"Not set"}/>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 bg-[#fbfcfc] p-5 md:px-7">
            <Link href={`/admin/${project.slug}/ads`} className="rounded-xl bg-[#006f78] px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5">Open Ad Studio</Link>
            <Link href={`/admin/projects/${project.slug}/edit`} className="ml-auto rounded-xl border border-[#cbd8d4] bg-white px-4 py-2.5 text-sm font-bold text-[#30494e]">Edit project</Link>
          </div>
        </article>)}
      </div>

      {projects.length===0?<div className="mt-6 rounded-[26px] border border-dashed border-[#bdcdca] bg-white/60 p-10 text-center"><h3 className="text-xl font-bold">No projects yet</h3><p className="mt-2 text-[#6c7c7f]">Create your first Support Gen campaign.</p><Link href="/admin/projects/new" className="mt-5 inline-flex rounded-xl bg-[#006f78] px-5 py-3 font-bold text-white">Create project</Link></div>:null}

      <div className="mt-6 flex flex-col gap-2 rounded-2xl border border-[#dce5e2] bg-white/65 px-5 py-4 text-sm text-[#607174] sm:flex-row sm:items-center sm:justify-between">
        <span>Build mode · admin authentication temporarily disabled</span>
        <span>Create the project once, then generate and iterate campaign creative from the Ad Studio.</span>
      </div>
    </div>
  </main>;
}

function Mini({label,value}:{label:string;value:string}){
  return <div className="rounded-xl bg-[#f4f7f6] px-3.5 py-3"><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#8a9799]">{label}</p><p className="mt-1 truncate text-sm font-bold text-[#3c555a]">{value}</p></div>;
}
