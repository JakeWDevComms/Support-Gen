"use client";
import { useEffect } from "react";
import type { ProjectConfig,ReachCampaign } from "@/projects/types";

type Tracking={utmSource:string;utmMedium:string;utmCampaign:string;utmContent?:string};

export function ReachLanding({project,campaign,toolHref}:{project:ProjectConfig;campaign:ReachCampaign;toolHref:string}){
  const reach=project.reach!;
  const tracking:Tracking={utmSource:campaign.source,utmMedium:campaign.medium,utmCampaign:campaign.campaign,utmContent:campaign.content};

  function track(eventType:"landing_view"|"support_click"|"learn_more_click"){
    void fetch("/api/reach/events",{method:"POST",headers:{"content-type":"application/json"},keepalive:true,body:JSON.stringify({
      projectSlug:project.slug,campaignSlug:campaign.slug,eventType,
      tracking:{...tracking,referrer:document.referrer||undefined}
    })}).catch(()=>{});
  }

  useEffect(()=>{track("landing_view");},[]);

  function support(){track("support_click");window.location.href=toolHref;}
  function learnMore(){track("learn_more_click");if(reach.learnMoreUrl)window.location.href=reach.learnMoreUrl;}

  return <section className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">
    <div className="grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--project-primary)]">{reach.eyebrow??project.schemeName}</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight text-[var(--project-dark)] md:text-6xl">{campaign.headline??reach.headline}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5d6b6e]">{campaign.intro??reach.intro}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button onClick={support} className="focus-ring rounded-xl bg-[var(--project-primary)] px-6 py-4 text-left font-bold text-white sm:text-center">{reach.supportCta??"Yes, I support the proposals"}</button>
          {reach.learnMoreUrl?<button onClick={learnMore} className="focus-ring rounded-xl border border-[#c5d2cf] bg-white px-6 py-4 text-left font-bold text-[var(--project-dark)] sm:text-center">{reach.learnMoreCta??"I'd like to know more"}</button>:null}
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-[#718083]">If you choose to show your support, you will be taken to a page where you can select the reasons that genuinely reflect your own view and review your representation before deciding whether to send it.</p>
      </div>
      <aside className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--project-primary)]">At a glance</p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--project-dark)]">Why supporters may back the proposals</h2>
        <div className="mt-6 space-y-4">{(reach.keyPoints??project.benefits.slice(0,3).map(b=>b.label)).map((point,index)=><div key={point} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--project-primary)] text-sm font-bold text-white">{index+1}</span><p className="pt-1 leading-6 text-[#40575c]">{point}</p></div>)}</div>
        <div className="mt-7 rounded-2xl bg-[#f4f7f6] p-4 text-sm leading-6 text-[#657376]"><strong>Planning application:</strong><br/>{project.applicationReference}<br/><span className="mt-2 block"><strong>Decision-maker:</strong><br/>{project.planningAuthority.name}</span></div>
      </aside>
    </div>
  </section>;
}
