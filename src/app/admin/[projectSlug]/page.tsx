import type { ReactNode } from "react";
import { desc,eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";

export default async function AdminProjectPage({params}:{params:Promise<{projectSlug:string}>}){
 const {projectSlug}=await params,project=await getProject(projectSlug);
 if(!project)notFound();

 const rows=process.env.DATABASE_URL
   ? await getDb().select().from(submissions).where(eq(submissions.projectId,project.id)).orderBy(desc(submissions.createdAt))
   : [];

 const unique=new Set(rows.map(r=>r.supporterFingerprint)).size,duplicates=rows.filter(r=>r.duplicate).length;
 const byDay=new Map<string,number>(),benefits=new Map<string,number>(),districts=new Map<string,Set<string>>();
 for(const row of rows){
   const day=row.createdAt.toISOString().slice(0,10);
   byDay.set(day,(byDay.get(day)??0)+1);
   for(const id of row.benefitIds)benefits.set(id,(benefits.get(id)??0)+1);
   if(!districts.has(row.postcodeDistrict))districts.set(row.postcodeDistrict,new Set());
   districts.get(row.postcodeDistrict)!.add(row.supporterFingerprint);
 }
 const dayRows=[...byDay].sort((a,b)=>a[0].localeCompare(b[0])).slice(-30),maxDay=Math.max(1,...dayRows.map(v=>v[1]));
 const districtRows=[...districts].map(([district,set])=>[district,set.size] as const).sort((a,b)=>b[1]-a[1]).slice(0,12);

 return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-10">
  <div className="mx-auto max-w-7xl">
   <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm">
    <strong>Build mode:</strong> admin login is temporarily disabled while Support Gen is being developed.
   </div>

   <div className="mt-6 rounded-[28px] bg-[#0b3f47] px-6 py-7 text-white shadow-[0_18px_50px_rgba(16,58,64,.13)] md:flex md:items-end md:justify-between md:gap-6 md:px-8">
    <div>
     <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Support Gen admin</p>
     <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{project.schemeName}</h1>
     <p className="mt-2 text-white/65">{project.applicationReference}</p>
    </div>
    <div className="mt-5 flex flex-wrap gap-2.5 md:mt-0">
     <Link href="/" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15">Projects</Link><Link href={`/admin/projects/${project.slug}/edit`} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15">Edit project</Link>
     {project.reach?<Link href={`/admin/${project.slug}/reach`} className="rounded-xl bg-white px-4 py-3 font-bold text-[#0b3f47] transition hover:-translate-y-0.5">Reach dashboard</Link>:null}
     <a href={`/api/admin/export/${project.slug}`} className="rounded-xl bg-[#0f737b] px-4 py-3 font-bold text-white ring-1 ring-white/10 transition hover:-translate-y-0.5">Export CSV</a>
    </div>
   </div>

   {!process.env.DATABASE_URL?<div className="mt-6 rounded-2xl border border-[#d8e1de] bg-white px-5 py-4 text-sm leading-6 text-[#536467]"><strong>Database not connected yet.</strong> The dashboard is shown in preview mode with zero values. Once Neon is connected, live supporter data will appear here automatically.</div>:null}

   <div className="mt-7 grid gap-4 sm:grid-cols-3">
    <Stat label="Unique supporters" value={unique}/>
    <Stat label="Recorded actions" value={rows.length}/>
    <Stat label="Duplicate actions flagged" value={duplicates}/>
   </div>

   <div className="mt-6 grid gap-6 lg:grid-cols-2">
    <Panel title="Actions over time">{dayRows.length===0?<Empty text="No supporter actions yet."/>:<div className="space-y-3">{dayRows.map(([day,value])=><div key={day} className="grid grid-cols-[90px_1fr_38px] items-center gap-3 text-sm"><span className="text-[#657376]">{day.slice(5)}</span><div className="h-3 overflow-hidden rounded-full bg-[#edf2f0]"><div className="h-full rounded-full bg-[#006f78]" style={{width:`${Math.max(4,(value/maxDay)*100)}%`}}/></div><span className="text-right font-bold">{value}</span></div>)}</div>}</Panel>
    <Panel title="Reasons selected"><div className="space-y-4">{project.benefits.map(benefit=>{const value=benefits.get(benefit.id)??0;return <div key={benefit.id}><div className="flex justify-between gap-4 text-sm"><span>{benefit.label}</span><strong>{value}</strong></div><div className="mt-2 h-2 rounded-full bg-[#edf2f0]"><div className="h-full rounded-full bg-[#006f78]" style={{width:`${rows.length?Math.min(100,(value/rows.length)*100):0}%`}}/></div></div>;})}</div></Panel>
    <Panel title="Support by postcode district">{districtRows.length===0?<Empty text="No postcode data yet."/>:<div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{districtRows.map(([district,value])=><div key={district} className="rounded-2xl bg-[#f4f7f6] p-4"><div className="text-sm text-[#657376]">{district}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>)}</div>}</Panel>
    <Panel title="Recent activity">{rows.length===0?<Empty text="No recent supporter activity yet."/>:<div className="divide-y divide-[#e2e8e6]">{rows.slice(0,12).map(row=><div key={row.id} className="flex items-center justify-between gap-4 py-3 text-sm"><div><strong>{row.name}</strong><div className="text-[#657376]">{row.postcodeDistrict} · {row.action}</div></div><div className="text-right text-[#657376]">{new Intl.DateTimeFormat("en-GB",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"}).format(row.createdAt)}{row.duplicate?<div className="font-semibold text-amber-700">duplicate flag</div>:null}</div></div>)}</div>}</Panel>
   </div>
  </div>
 </main>;
}
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04]"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[#7b898b]">{label}</div><div className="mt-3 text-4xl font-bold tracking-tight text-[#0b3f47]">{value}</div></div>;}
function Panel({title,children}:{title:string;children:ReactNode}){return <section className="rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04]"><h2 className="text-xl font-bold tracking-tight text-[#173136]">{title}</h2><div className="mt-5">{children}</div></section>;}
function Empty({text}:{text:string}){return <p className="text-sm text-[#657376]">{text}</p>;}
