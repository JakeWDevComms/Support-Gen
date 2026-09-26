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

  function support(){
    track("support_click");
    window.location.href=toolHref;
  }

  function learnMore(){
    track("learn_more_click");
    if(reach.learnMoreUrl)window.location.href=reach.learnMoreUrl;
  }

  const points=reach.keyPoints??project.benefits.slice(0,3).map(benefit=>benefit.label);

  return <div className="relative overflow-hidden">
    <div className="pointer-events-none absolute -right-40 top-8 h-[520px] w-[520px] rounded-full bg-[var(--project-primary)] opacity-[0.055] blur-2xl"/>
    <div className="pointer-events-none absolute -left-40 top-[38%] h-96 w-96 rounded-full bg-[var(--project-accent)] opacity-[0.06] blur-2xl"/>

    <section className="relative mx-auto max-w-7xl px-5 py-12 md:px-8 md:py-20">
      <div className="grid gap-10 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:gap-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--project-primary)]/10 bg-white/70 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--project-primary)] shadow-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-[var(--project-primary)]"/>
            {reach.eyebrow??project.schemeName}
          </div>

          <h1 className="mt-6 max-w-4xl text-4xl font-bold tracking-[-0.035em] text-[var(--project-dark)] md:text-6xl md:leading-[1.04]">{campaign.headline??reach.headline}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-[#5d6b6e] md:text-xl">{campaign.intro??reach.intro}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button onClick={support} className="focus-ring rounded-xl bg-[var(--project-dark)] px-6 py-4 text-left font-bold text-white shadow-[0_10px_28px_rgba(20,55,60,.17)] transition hover:-translate-y-0.5 hover:shadow-[0_13px_32px_rgba(20,55,60,.22)] sm:text-center">
              {reach.supportCta??"Yes, I support the proposals"} <span aria-hidden="true">→</span>
            </button>
            {reach.learnMoreUrl?<button onClick={learnMore} className="focus-ring rounded-xl border border-[#cad7d4] bg-white px-6 py-4 text-left font-bold text-[var(--project-dark)] shadow-sm transition hover:-translate-y-0.5 hover:border-[#b2c5c0] hover:shadow-md sm:text-center">{reach.learnMoreCta??"I'd like to know more"}</button>:null}
          </div>

          <div className="mt-7 flex max-w-2xl items-start gap-3 rounded-2xl border border-[#dce6e3] bg-white/65 px-4 py-3.5 text-sm leading-6 text-[#66777a] backdrop-blur">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#eef5f2] text-xs font-bold text-[var(--project-primary)]">i</span>
            <p>You stay in control. If you choose to support the proposal, you can select the points that reflect your own view, review the letter and decide whether to send it.</p>
          </div>
        </div>

        <aside className="relative">
          <div className="absolute -inset-3 rounded-[34px] bg-[var(--project-primary)] opacity-[0.055]"/>
          <div className="relative overflow-hidden rounded-[30px] bg-white shadow-[0_24px_65px_rgba(20,53,57,.12)] ring-1 ring-black/[0.04]">
            <div className="border-b border-[#e8eeec] bg-gradient-to-r from-[#fbfdfc] to-white px-6 py-6 md:px-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--project-primary)]">At a glance</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-[var(--project-dark)]">Why people may support the proposals</h2>
            </div>

            <div className="space-y-5 p-6 md:p-8">
              {points.map((point,index)=><div key={point} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--project-primary)]/[0.08] text-sm font-black text-[var(--project-primary)]">{String(index+1).padStart(2,"0")}</span>
                <p className="pt-1.5 leading-7 text-[#40575c]">{point}</p>
              </div>)}

              <div className="mt-7 grid gap-3 rounded-2xl bg-[#f5f8f7] p-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#849193]">Planning reference</p>
                  <p className="mt-1.5 text-sm font-bold text-[#344d52]">{project.applicationReference}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#849193]">Decision-maker</p>
                  <p className="mt-1.5 text-sm font-bold leading-5 text-[#344d52]">{project.planningAuthority.name}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  </div>;
}
