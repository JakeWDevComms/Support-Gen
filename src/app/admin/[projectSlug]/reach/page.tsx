import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { reachEvents,submissions } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";
import { ReachLinkBuilder } from "@/components/reach-link-builder";

function Login({slug}:{slug:string}){return <main className="min-h-screen bg-[#eef3f1] px-5 py-16"><div className="mx-auto max-w-md rounded-3xl bg-white p-8 shadow-sm ring-1 ring-black/5"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#006f78]">Support Gen admin</p><h1 className="mt-3 text-3xl font-bold">Sign in</h1><form action="/api/admin/login" method="post" className="mt-6 space-y-4"><input type="hidden" name="next" value={`/admin/${slug}/reach`}/><input name="password" type="password" required className="w-full rounded-xl border border-[#cbd8d4] px-4 py-3" placeholder="Admin password"/><button className="w-full rounded-xl bg-[#083f47] px-5 py-3 font-bold text-white">Sign in</button></form></div></main>;}

const pct=(n:number,d:number)=>d?Math.round((n/d)*100):0;

export default async function ReachAdminPage({params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params,project=getProject(projectSlug);
  if(!project?.reach)notFound();
  if(!(await isAdmin()))return <Login slug={projectSlug}/>;
  if(!process.env.DATABASE_URL)return <main className="p-8"><h1 className="text-3xl font-bold">Reach · {project.schemeName}</h1><p className="mt-4">DATABASE_URL is not configured yet.</p></main>;

  const db=getDb();
  const [events,actions]=await Promise.all([
    db.select().from(reachEvents).where(eq(reachEvents.projectId,project.id)),
    db.select().from(submissions).where(eq(submissions.projectId,project.id))
  ]);

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
    const visitors=unique("landing_view");
    const supportClicks=unique("support_click");
    const toolStarts=unique("tool_start");
    const learnMore=unique("learn_more_click");
    const supporters=new Set(campaignActions.map(a=>a.supporterFingerprint)).size;
    return {
      code,
      name:config?.name??code,
      channel:config?.channel??campaignEvents.find(e=>e.source)?.source??campaignActions.find(a=>a.utmSource)?.utmSource??"Tracked link",
      visitors,supportClicks,toolStarts,learnMore,supporters,
      conversion:pct(supporters,visitors||toolStarts)
    };
  }).sort((a,b)=>b.supporters-a.supporters||b.visitors-a.visitors);

  const allReachCampaigns=new Set(project.reach.campaigns.map(c=>c.campaign));
  const reachActions=actions.filter(a=>a.utmCampaign&&allReachCampaigns.has(a.utmCampaign));
  const totalVisitors=new Set(events.filter(e=>e.eventType==="landing_view").map(e=>e.visitorId)).size;
  const totalClicks=new Set(events.filter(e=>e.eventType==="support_click").map(e=>e.visitorId)).size;
  const totalStarts=new Set(events.filter(e=>e.eventType==="tool_start").map(e=>e.visitorId)).size;
  const totalSupporters=new Set(reachActions.map(a=>a.supporterFingerprint)).size;

  return <main className="min-h-screen bg-[#eef3f1] px-5 py-8 md:px-8"><div className="mx-auto max-w-7xl">
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#006f78]">Support Gen · Reach</p><h1 className="mt-2 text-4xl font-bold">{project.schemeName}</h1><p className="mt-2 text-[#657376]">Campaign entry points and conversion reporting</p></div>
      <div className="flex gap-3"><Link href={`/admin/${project.slug}`} className="rounded-xl border border-[#c8d4d1] bg-white px-4 py-3 font-bold">Support dashboard</Link><form action="/api/admin/logout" method="post"><button className="rounded-xl border border-[#c8d4d1] bg-white px-4 py-3 font-bold">Sign out</button></form></div>
    </div>

    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Stat label="Landing visitors" value={totalVisitors}/>
      <Stat label="Clicked support" value={totalClicks}/>
      <Stat label="Started the tool" value={totalStarts}/>
      <Stat label="Unique supporters" value={totalSupporters}/>
    </div>

    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <div className="mb-6"><h2 className="text-2xl font-bold">Campaign links</h2><p className="mt-2 text-sm leading-6 text-[#657376]">Use a different tracked link for each advert, leaflet, website or outreach channel. The resident sees a short project landing page before choosing whether to continue.</p></div>
      <ReachLinkBuilder project={project}/>
    </section>

    <section className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="border-b border-[#e2e8e6] p-6 md:p-8"><h2 className="text-2xl font-bold">Conversion by source</h2><p className="mt-2 text-sm text-[#657376]">Unique counts are used wherever possible so repeat clicks do not inflate the funnel.</p></div>
      <div className="overflow-x-auto">
        <table className="min-w-[880px] w-full text-left text-sm">
          <thead className="bg-[#f5f8f7] text-[#5f6f72]"><tr><Th>Campaign</Th><Th>Channel</Th><Th>Visitors</Th><Th>Support clicks</Th><Th>Tool starts</Th><Th>Supporters</Th><Th>Conversion</Th></tr></thead>
          <tbody className="divide-y divide-[#e6ecea]">{rows.map(row=><tr key={row.code}><Td><strong>{row.name}</strong><div className="mt-1 max-w-[260px] truncate text-xs text-[#7a898b]">{row.code}</div></Td><Td>{row.channel}</Td><Td>{row.visitors}</Td><Td>{row.supportClicks}</Td><Td>{row.toolStarts}</Td><Td><strong>{row.supporters}</strong></Td><Td>{row.conversion}%</Td></tr>)}</tbody>
        </table>
      </div>
      {rows.length===0?<p className="p-8 text-sm text-[#657376]">No Reach data yet.</p>:null}
    </section>

    <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
      <h2 className="text-xl font-bold">What this funnel measures</h2>
      <p className="mt-3 max-w-4xl text-sm leading-6 text-[#657376]">Support Gen measures activity after somebody reaches one of these links. Paid-media impressions, reach and spend still live in the advertising platform. A later ad-account integration can add those figures so this dashboard can also report click-through rate, cost per visit and cost per unique supporter.</p>
    </section>
  </div></main>;
}

function Stat({label,value}:{label:string;value:number}){return <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5"><div className="text-sm text-[#657376]">{label}</div><div className="mt-2 text-4xl font-bold text-[#083f47]">{value}</div></div>;}
function Th({children}:{children:React.ReactNode}){return <th className="px-5 py-4 font-bold">{children}</th>;}
function Td({children}:{children:React.ReactNode}){return <td className="px-5 py-4 align-top">{children}</td>;}
