"use client";

import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { buildMailto } from "@/lib/mailto";
import { generateLetter } from "@/lib/letter";
import { isValidUKPostcode,normalisePostcode } from "@/lib/postcode";
import type { ProjectConfig } from "@/projects/types";

type Tracking={utmSource?:string;utmMedium?:string;utmCampaign?:string;utmContent?:string;utmTerm?:string;reachCampaign?:string};

export function SupportForm({project,tracking}:{project:ProjectConfig;tracking:Tracking}){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [address,setAddress]=useState("");
  const [postcode,setPostcode]=useState("");
  const [benefitIds,setBenefitIds]=useState<string[]>([]);
  const [comment,setComment]=useState("");
  const [privacyConsent,setPrivacyConsent]=useState(false);
  const [marketingOptIn,setMarketingOptIn]=useState(false);
  const [honeypot,setHoneypot]=useState("");
  const [message,setMessage]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);

  const hasContent=benefitIds.length>0||comment.trim().length>0;
  const normalisedPostcode=normalisePostcode(postcode);
  const valid=name.trim().length>=2&&/\S+@\S+\.\S+/.test(email)&&address.trim().length>=8&&isValidUKPostcode(postcode)&&hasContent&&privacyConsent;
  const letter=useMemo(()=>hasContent?generateLetter(project,{
    name:name||"Your name",
    address:address||"Your address",
    postcode:normalisedPostcode||"Your postcode",
    benefitIds,
    comment
  }):"",[project,name,address,normalisedPostcode,benefitIds,comment,hasContent]);

  useEffect(()=>{
    if(!tracking.reachCampaign&&!tracking.utmCampaign)return;
    void fetch("/api/reach/events",{method:"POST",headers:{"content-type":"application/json"},keepalive:true,body:JSON.stringify({
      projectSlug:project.slug,
      campaignSlug:tracking.reachCampaign,
      eventType:"tool_start",
      tracking:{...tracking,referrer:document.referrer||undefined}
    })}).catch(()=>{});
  },[]);

  function toggleBenefit(id:string){
    setBenefitIds(current=>current.includes(id)?current.filter(value=>value!==id):[...current,id]);
  }

  async function logAction(action:"copy"|"email"){
    try{
      await fetch("/api/actions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({
        projectSlug:project.slug,action,name,email,address,postcode:normalisedPostcode,
        benefitIds,comment,privacyConsent,marketingOptIn,honeypot,
        tracking:{...tracking,referrer:document.referrer||undefined}
      })});
    }catch{}
  }

  async function copyLetter(){
    if(!valid||!letter)return;
    setBusy(true);
    await logAction("copy");
    await navigator.clipboard.writeText(letter);
    setMessage("Your letter has been copied to your clipboard.");
    setBusy(false);
  }

  async function openEmail(){
    if(!valid||!letter)return;
    setBusy(true);
    await logAction("email");
    const mailto=buildMailto(project,letter);
    if(mailto.safe){
      window.location.href=mailto.url;
      setMessage("Your email app should open with the draft ready for you to review and send.");
    }else{
      await navigator.clipboard.writeText(letter);
      setMessage(`Your letter is too long for a reliable email link, so it has been copied. Open a new email to ${project.planningAuthority.to.join(", ")} and paste it in.`);
    }
    setBusy(false);
  }

  function reset(){
    setName("");setEmail("");setAddress("");setPostcode("");setBenefitIds([]);setComment("");
    setPrivacyConsent(false);setMarketingOptIn(false);setHoneypot("");setMessage(null);
  }

  const inputClass="focus-ring w-full rounded-xl border border-[#d4dfdc] bg-[#fbfcfc] px-4 py-3.5 text-[15px] text-[#233b40] shadow-[inset_0_1px_0_rgba(255,255,255,.8)] transition placeholder:text-[#9aa7a8] hover:border-[#b7c9c5] focus:border-[var(--project-primary)] focus:bg-white focus:outline-none";

  return <div className="grid gap-7 xl:grid-cols-[minmax(0,1.05fr)_minmax(390px,.8fr)] xl:items-start">
    <section className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(20,53,57,.08)] ring-1 ring-black/[0.045]">
      <div className="border-b border-[#e8eeec] bg-gradient-to-r from-[#fbfdfc] to-white px-6 py-5 md:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--project-primary)] text-sm font-bold text-white">1</span>
          <div>
            <h2 className="text-lg font-bold text-[var(--project-dark)]">Your details</h2>
            <p className="mt-0.5 text-sm text-[#718083]">Needed so the Council can treat this as your representation.</p>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#334b50]">Full name <span className="text-[var(--project-primary)]">*</span></span>
            <input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="Your full name" className={inputClass}/>
          </label>
          <label>
            <span className="mb-2 block text-sm font-semibold text-[#334b50]">Email <span className="text-[var(--project-primary)]">*</span></span>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" placeholder="you@example.com" className={inputClass}/>
          </label>
          <label className="sm:col-span-2">
            <span className="mb-2 block text-sm font-semibold text-[#334b50]">Full address <span className="text-[var(--project-primary)]">*</span></span>
            <textarea value={address} onChange={e=>setAddress(e.target.value)} autoComplete="street-address" rows={3} placeholder="House number/name, street, town" className={inputClass}/>
          </label>
          <label className="sm:max-w-xs">
            <span className="mb-2 block text-sm font-semibold text-[#334b50]">Postcode <span className="text-[var(--project-primary)]">*</span></span>
            <input value={postcode} onChange={e=>setPostcode(e.target.value)} onBlur={()=>setPostcode(normalisedPostcode)} autoComplete="postal-code" placeholder="B91 3AA" className={`${inputClass} uppercase`}/>
            {postcode&&!isValidUKPostcode(postcode)&&<span className="mt-2 flex items-center gap-1.5 text-sm font-medium text-red-700"><span>●</span> Enter a valid UK postcode.</span>}
          </label>
        </div>
      </div>

      <div className="border-t border-[#e8eeec] bg-[#fcfdfd]">
        <div className="border-b border-[#e8eeec] px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--project-primary)] text-sm font-bold text-white">2</span>
            <div>
              <h2 className="text-lg font-bold text-[var(--project-dark)]">Choose your reasons</h2>
              <p className="mt-0.5 text-sm text-[#718083]">Select any points that genuinely reflect your own view.</p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-6 md:p-8">
          {project.benefits.map((benefit,index)=>{
            const selected=benefitIds.includes(benefit.id);
            return <label key={benefit.id} className={`group flex cursor-pointer gap-4 rounded-2xl border p-4.5 transition-all duration-200 ${selected?"border-[var(--project-primary)] bg-[var(--project-primary)]/[0.055] shadow-[0_6px_20px_rgba(0,90,99,.08)]":"border-[#dde6e3] bg-white hover:-translate-y-0.5 hover:border-[#b9cdc8] hover:shadow-sm"}`}>
              <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-xs font-black transition ${selected?"border-[var(--project-primary)] bg-[var(--project-primary)] text-white":"border-[#becdca] bg-white text-transparent"}`}>✓</span>
              <input type="checkbox" checked={selected} onChange={()=>toggleBenefit(benefit.id)} className="sr-only"/>
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-[0.12em] text-[var(--project-primary)]">Reason {index+1}</span>
                <span className="mt-1 block leading-6 text-[#31494e]">{benefit.label}</span>
              </span>
            </label>;
          })}

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold text-[#334b50]">Anything else you want to say? <span className="font-normal text-[#7a888a]">(optional)</span></span>
            <textarea value={comment} onChange={e=>setComment(e.target.value)} rows={5} maxLength={1800} placeholder="Add your own comments in your own words…" className={inputClass}/>
            <span className="mt-2 block text-right text-xs text-[#8c999b]">{comment.length}/1800</span>
          </label>
        </div>
      </div>

      <div className="border-t border-[#e8eeec] bg-white">
        <div className="border-b border-[#e8eeec] px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--project-primary)] text-sm font-bold text-white">3</span>
            <div>
              <h2 className="text-lg font-bold text-[var(--project-dark)]">Review and send</h2>
              <p className="mt-0.5 text-sm text-[#718083]">Confirm the privacy notice, then copy or open your letter in email.</p>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <div className="space-y-4 rounded-2xl border border-[#e0e8e5] bg-[#f7faf9] p-5">
            <label className="flex cursor-pointer gap-3.5 text-sm leading-6 text-[#425a5f]">
              <input type="checkbox" checked={privacyConsent} onChange={e=>setPrivacyConsent(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--project-primary)]"/>
              <span>I understand how my information will be used as described in the <Link className="font-bold text-[var(--project-primary)] underline underline-offset-2" href={`/${project.slug}/privacy`} target="_blank">privacy statement</Link>. <span className="text-[var(--project-primary)]">*</span></span>
            </label>
            <div className="h-px bg-[#e1e9e6]"/>
            <label className="flex cursor-pointer gap-3.5 text-sm leading-6 text-[#425a5f]">
              <input type="checkbox" checked={marketingOptIn} onChange={e=>setMarketingOptIn(e.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[var(--project-primary)]"/>
              <span>{project.keepUpdatedLabel??"Keep me updated about this project by email"}</span>
            </label>
          </div>

          <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden">
            <label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></label>
          </div>

          {!hasContent&&<div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium leading-6 text-amber-900"><span className="mt-0.5">●</span><span>Choose at least one reason or add a comment to create your letter.</span></div>}
          {message&&<div role="status" className="mt-5 flex gap-3 rounded-xl border border-[#b9d6cf] bg-[#edf8f4] px-4 py-3 text-sm font-semibold leading-6 text-[#245d50]"><span>✓</span><span>{message}</span></div>}

          <div className="mt-7 grid gap-3 sm:grid-cols-[auto_1fr_1.15fr]">
            <button type="button" onClick={reset} className="focus-ring order-3 rounded-xl border border-[#ccd9d6] bg-white px-5 py-3.5 font-bold text-[#53696d] transition hover:bg-[#f6f9f8] sm:order-1">Start over</button>
            <button type="button" disabled={!valid||busy} onClick={copyLetter} className="focus-ring order-2 rounded-xl border border-[var(--project-primary)] bg-white px-5 py-3.5 font-bold text-[var(--project-primary)] transition hover:bg-[var(--project-primary)]/[0.045] disabled:border-[#d8e1df] disabled:text-[#a8b2b1]">Copy letter</button>
            <button type="button" disabled={!valid||busy} onClick={openEmail} className="focus-ring order-1 rounded-xl bg-[var(--project-dark)] px-5 py-3.5 font-bold text-white shadow-[0_8px_22px_rgba(18,55,60,.17)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(18,55,60,.22)] disabled:translate-y-0 disabled:bg-[#b3bfbd] disabled:shadow-none sm:order-3">Open in email <span aria-hidden="true">→</span></button>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-[#7c898b]">Nothing is sent automatically. Your own email app opens with the draft ready for you to review.</p>
        </div>
      </div>
    </section>

    <aside className="xl:sticky xl:top-6">
      <div className="overflow-hidden rounded-[28px] bg-white shadow-[0_18px_50px_rgba(20,53,57,.09)] ring-1 ring-black/[0.045]">
        <div className="flex items-center justify-between border-b border-[#e5ecea] bg-[#fbfdfc] px-6 py-5 md:px-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--project-primary)]">Live preview</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--project-dark)]">Your representation</h2>
          </div>
          <span className="rounded-full bg-[#eef5f2] px-3 py-1.5 text-xs font-bold text-[#567069]">Updates live</span>
        </div>

        <div className="bg-[#eef3f1] p-4 md:p-6">
          <div className="relative min-h-[560px] rounded-sm bg-white px-6 py-8 shadow-[0_4px_18px_rgba(31,57,60,.08)] md:px-8 md:py-10">
            <div className="absolute left-0 top-0 h-1 w-full bg-[var(--project-primary)]"/>
            <div className="mb-7 flex items-center justify-between border-b border-[#edf1ef] pb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#778789]">Planning representation</p>
                <p className="mt-1 text-xs text-[#95a0a2]">{project.applicationReference}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-[var(--project-primary)]/[0.08]"/>
            </div>

            <div className="whitespace-pre-wrap text-[14px] leading-7 text-[#32494e] md:text-[15px]">
              {letter||<div className="flex min-h-[360px] flex-col items-center justify-center px-3 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--project-primary)]/[0.07] text-2xl text-[var(--project-primary)]">✎</div>
                <p className="mt-5 max-w-xs font-semibold text-[#607477]">Your letter will appear here</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[#899698]">Choose one or more reasons, or add your own comment, to start building your representation.</p>
              </div>}
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>;
}
