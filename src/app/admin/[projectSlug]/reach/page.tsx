import type { ReactNode } from "react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { reachEvents,submissions } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";
import { ReachLinkBuilder } from "@/components/reach-link-builder";

const pct=(n:number,d:number)=>d?Math.round((n/d)*100):0;

export default async function ReachAdminPage({params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params,project=await getProject(projectSlug);
  if(!project?.reach)notFound();

  const [events,actions]=process.env.DATABASE_URL
    ? await Promise.all([
        getDb().select().from(reachEvents).where(eq(reachEvents.projectId,project.id)),
        getDb().select().from(submissions).where(eq(submissions.projectId,project.id))
      ])
    : [[],[]];

  const configuredByCampaign=new Map(project.reach.campaigns.map(c=>[c.campaign,c]));
  const campaignCodes=new Set<string>();
  for(const e of events)if(e.campaign)campaignCodes.add(e.campaign);
  for(const a of actions)if(a.utmCampaign)campaignCodes.add(a.utmCampaign);
  for(const c of project.reach.campaigns)campaignCodes.add(c.campaign);

  const rows=[...campaignCodes].map(code=>{
    const config=configuredByCampaign.get(code);
    const campaignEvents=events.filter(e=>e.campaign===code);
    const campaignActions=actions.filter(a=>a.utmCampaign===code);
    const unique=(type:string)=>new Set(campaignEvents.filter(e=>e.eventType===type).map(e=>e.visitorId)).size;

    const landingVisitors=unique("landing_view");
    const supportClicks=unique("support_click");
    const toolStarts=unique("tool_start");
    const supporters=new Set(campaignActions.map(a=>a.supporterFingerprint)).size;
    const direct=config?.journey!=="landing";
    const visits=direct?toolStarts:landingVisitors;

    return {
      code,
      name:config?.name??code,
      channel:config?.channel??campaignEvents.find(e=>e.source)?.source??campaignActions.find(a=>a.utmSource)?.utmSource??"Tracked link",
      journey:direct?"Direct to tool":"Landing first",
      visits,
      supportClicks,
      toolStarts,
      supporters,
      conversion:pct(supporters,visits||toolStarts)
    };
  }).sort((a,b)=>b.supporters-a.supporters||b.visits-a.visits);

  const allReachCampaigns=new Set(project.reach.campaigns.map(c=>c.campaign));
  const reachActions=actions.filter(a=>a.utmCampaign&&allReachCampaigns.has(a.utmCampaign));
  const totalCampaignVisitors=new Set(events.filter(e=>e.eventType==="landing_view"||e.eventType==="tool_start").map(e=>e.visitorId)).size;
  const totalStarts=new Set(events.filter(e=>e.eventType==="tool_start").map(e=>e.visitorId)).size;
  const totalSupporters=new Set(reachActions.map(a=>a.supporterFingerprint)).size;
  const totalConversion=pct(totalSupporters,totalCampaignVisitors||totalStarts);

  return <main className="min-h-screen bg-[#eef4f1] px-5 py-8 md:px-8 md:py-10">
    <div className="mx-auto max-w-7xl">
      <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-sm text-amber-900 shadow-sm"><strong>Build mode:</strong> admin login is temporarily disabled while Support Gen is being developed.</div>

      <div className="mt-6 rounded-[28px] bg-[#0b3f47] px-6 py-7 text-white shadow-[0_18px_50px_rgba(16,58,64,.13)] md:flex md:items-end md:justify-between md:gap-6 md:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/60">Support Gen · Reach</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{project.schemeName}</h1>
          <p className="mt-2 text-white/65">Campaign links and source-to-supporter conversion reporting</p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2.5 md:mt-0">
          <Link href="/" className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15">Projects</Link>
          <Link href={`/admin/projects/${project.slug}/edit`} className="rounded-xl border border-white/15 bg-white/10 px-4 py-3 font-bold text-white transition hover:bg-white/15">Edit project</Link>
          <Link href={`/admin/${project.slug}`} className="rounded-xl bg-white px-4 py-3 font-bold text-[#0b3f47] transition hover:-translate-y-0.5">Support dashboard</Link>
        </div>
      </div>

      {!process.env.DATABASE_URL?<div className="mt-6 rounded-2xl border border-[#d8e1de] bg-white px-5 py-4 text-sm leading-6 text-[#536467]"><strong>Database not connected yet.</strong> Reach is shown in preview mode with zero values until Neon is connected.</div>:null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Campaign visits" value={totalCampaignVisitors}/>
        <Stat label="Started the tool" value={totalStarts}/>
        <Stat label="Unique supporters" value={totalSupporters}/>
        <Stat label="Visit → supporter" value={totalConversion} suffix="%"/>
      </div>

      <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04] md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Campaign links</h2>
          <p className="mt-2 text-sm leading-6 text-[#657376]">By default, Facebook, Instagram, leaflet and other campaign links go straight into the survey/letter generator, matching the Clyst and Castle Hills approach. A project can optionally use a short landing page first.</p>
        </div>
        <ReachLinkBuilder project={project}/>
      </section>

      <section className="mt-6 overflow-hidden rounded-[26px] bg-white shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04]">
        <div className="border-b border-[#e2e8e6] p-6 md:p-8">
          <h2 className="text-2xl font-bold">Conversion by source</h2>
          <p className="mt-2 text-sm text-[#657376]">Unique visitor counts are used where possible so repeat page loads do not inflate the funnel.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead className="bg-[#f5f8f7] text-[#5f6f72]">
              <tr><Th>Campaign</Th><Th>Channel</Th><Th>Journey</Th><Th>Visits</Th><Th>Tool starts</Th><Th>Supporters</Th><Th>Conversion</Th></tr>
            </thead>
            <tbody className="divide-y divide-[#e6ecea]">
              {rows.map(row=><tr key={row.code}>
                <Td><strong>{row.name}</strong><div className="mt-1 max-w-[260px] truncate text-xs text-[#7a898b]">{row.code}</div></Td>
                <Td>{row.channel}</Td>
                <Td><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${row.journey==="Direct to tool"?"bg-emerald-50 text-emerald-700":"bg-sky-50 text-sky-700"}`}>{row.journey}</span></Td>
                <Td>{row.visits}</Td>
                <Td>{row.toolStarts}</Td>
                <Td><strong>{row.supporters}</strong></Td>
                <Td>{row.conversion}%</Td>
              </tr>)}
            </tbody>
          </table>
        </div>
        {rows.length===0?<p className="p-8 text-sm text-[#657376]">No Reach data yet.</p>:null}
      </section>

      <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04] md:p-8">
        <h2 className="text-xl font-bold">What this funnel measures</h2>
        <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657376]">For direct campaigns, a campaign visit is the resident arriving in the support tool from a tracked link. For optional landing-page campaigns, it is the resident arriving on that landing page. Paid-media impressions, reach and spend still live in the advertising platform; those can be integrated later to calculate click-through rate and cost per supporter.</p>
      </section>
    </div>
  </main>;
}

function Stat({label,value,suffix=""}:{label:string;value:number;suffix?:string}){return <div className="rounded-[24px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04]"><div className="text-xs font-bold uppercase tracking-[0.12em] text-[#7b898b]">{label}</div><div className="mt-3 text-4xl font-bold tracking-tight text-[#0b3f47]">{value}{suffix}</div></div>;}
function Th({children}:{children:ReactNode}){return <th className="px-5 py-4 font-bold">{children}</th>;}
function Td({children}:{children:ReactNode}){return <td className="px-5 py-4 align-top">{children}</td>;}
