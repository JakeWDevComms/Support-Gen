import type { ReactNode } from "react";
import { desc,eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";

export default async function AdminProjectPage({params}:{params:Promise<{projectSlug:string}>}){
 const {projectSlug}=await params,project=getProject(projectSlug);
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

 return <main className="min-h-screen bg-[#eef3f1] px-5 py-8 md:px-8">
  <div className="mx-auto max-w-7xl">
   <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
    <strong>Build mode:</strong> admin login is temporarily disabled while Support Gen is being developed.
   </div>

   <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
     <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#006f78]">Support Gen admin</p>
     <h1 className="mt-2 text-4xl font-bold">{project.schemeName}</h1>
     <p className="mt-2 text-[#657376]">{project.applicationReference}</p>
    </div>
    <div className="flex flex-wrap gap-3">
     <Link href="/" className="rounded-xl border border-[#c8d4d1] bg-white px-4 py-3 font-bold">Home</Link>
     {project.reach?<Link href={`/admin/${project.slug}/reach`} className="rounded-xl bg-[#083f47] px-4 py-3 font-bold text-white">Reach dashboard</Link>:null}
     <a href={`/api/admin/export/${project.slug}`} className="rounded-xl bg-[#006f78] px-4 py-3 font-bold text-white">Export CSV</a>
    </div>
   </div>

   {!process.env.DATABASE_URL?<div className="mt-6 rounded-2xl border border-[#d8e1de] bg-white px-5 py-4 text-sm leading-6 text-[#536467]"><strong>Database not connected yet.</strong> The dashboard is shown in preview mode with zero values. Once Neon is connected, live supporter data will appear here automatically.</div>:null}

   <div className="mt-8 grid gap-4 sm:grid-cols-3">
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
function Stat({label,value}:{label:string;value:number}){return <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"><div className="text-sm text-[#657376]">{label}</div><div className="mt-2 text-4xl font-bold text-[#083f47]">{value}</div></div>;}
function Panel({title,children}:{title:string;children:ReactNode}){return <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"><h2 className="text-xl font-bold">{title}</h2><div className="mt-5">{children}</div></section>;}
function Empty({text}:{text:string}){return <p className="text-sm text-[#657376]">{text}</p>;}
