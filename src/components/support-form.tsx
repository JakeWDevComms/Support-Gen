"use client";
import Link from "next/link";
import { useEffect,useMemo,useState } from "react";
import { buildMailto } from "@/lib/mailto";
import { generateLetter } from "@/lib/letter";
import { isValidUKPostcode,normalisePostcode } from "@/lib/postcode";
import type { ProjectConfig } from "@/projects/types";

type Tracking={utmSource?:string;utmMedium?:string;utmCampaign?:string;utmContent?:string;utmTerm?:string;reachCampaign?:string};

export function SupportForm({project,tracking}:{project:ProjectConfig;tracking:Tracking}){
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[address,setAddress]=useState(""),[postcode,setPostcode]=useState("");
 const [benefitIds,setBenefitIds]=useState<string[]>([]),[comment,setComment]=useState(""),[privacyConsent,setPrivacyConsent]=useState(false),[marketingOptIn,setMarketingOptIn]=useState(false),[honeypot,setHoneypot]=useState(""),[message,setMessage]=useState<string|null>(null),[busy,setBusy]=useState(false);
 const hasContent=benefitIds.length>0||comment.trim().length>0;
 const normalisedPostcode=normalisePostcode(postcode);
 const valid=name.trim().length>=2&&/\S+@\S+\.\S+/.test(email)&&address.trim().length>=8&&isValidUKPostcode(postcode)&&hasContent&&privacyConsent;
 const letter=useMemo(()=>hasContent?generateLetter(project,{name:name||"Your name",address:address||"Your address",postcode:normalisedPostcode||"Your postcode",benefitIds,comment}):"",[project,name,address,normalisedPostcode,benefitIds,comment,hasContent]);
 useEffect(()=>{
   if(!tracking.reachCampaign&&!tracking.utmCampaign)return;
   void fetch("/api/reach/events",{method:"POST",headers:{"content-type":"application/json"},keepalive:true,body:JSON.stringify({
     projectSlug:project.slug,
     campaignSlug:tracking.reachCampaign,
     eventType:"tool_start",
     tracking:{...tracking,referrer:document.referrer||undefined}
   })}).catch(()=>{});
 },[]);
 function toggleBenefit(id:string){setBenefitIds(current=>current.includes(id)?current.filter(v=>v!==id):[...current,id]);}
 async function logAction(action:"copy"|"email"){try{await fetch("/api/actions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({projectSlug:project.slug,action,name,email,address,postcode:normalisedPostcode,benefitIds,comment,privacyConsent,marketingOptIn,honeypot,tracking:{...tracking,referrer:document.referrer||undefined}})});}catch{}}
 async function copyLetter(){if(!valid||!letter)return;setBusy(true);await logAction("copy");await navigator.clipboard.writeText(letter);setMessage("Your letter has been copied to your clipboard.");setBusy(false);}
 async function openEmail(){if(!valid||!letter)return;setBusy(true);await logAction("email");const mailto=buildMailto(project,letter);if(mailto.safe){window.location.href=mailto.url;setMessage("Your email app should open with the draft ready for you to review and send.");}else{await navigator.clipboard.writeText(letter);setMessage(`Your letter is too long for a reliable email link, so it has been copied. Open a new email to ${project.planningAuthority.to.join(", ")} and paste it in.`);}setBusy(false);}
 function reset(){setName("");setEmail("");setAddress("");setPostcode("");setBenefitIds([]);setComment("");setPrivacyConsent(false);setMarketingOptIn(false);setHoneypot("");setMessage(null);}
 return <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)] lg:items-start">
  <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
   <div className="grid gap-5 sm:grid-cols-2">
    <label><span className="mb-2 block text-sm font-bold">Full name *</span><input value={name} onChange={e=>setName(e.target.value)} autoComplete="name" className="focus-ring w-full rounded-xl border border-[#cbd8d4] px-4 py-3"/></label>
    <label><span className="mb-2 block text-sm font-bold">Email *</span><input value={email} onChange={e=>setEmail(e.target.value)} type="email" autoComplete="email" className="focus-ring w-full rounded-xl border border-[#cbd8d4] px-4 py-3"/></label>
    <label className="sm:col-span-2"><span className="mb-2 block text-sm font-bold">Full address *</span><textarea value={address} onChange={e=>setAddress(e.target.value)} autoComplete="street-address" rows={3} className="focus-ring w-full rounded-xl border border-[#cbd8d4] px-4 py-3"/></label>
    <label><span className="mb-2 block text-sm font-bold">Postcode *</span><input value={postcode} onChange={e=>setPostcode(e.target.value)} onBlur={()=>setPostcode(normalisedPostcode)} autoComplete="postal-code" className="focus-ring w-full rounded-xl border border-[#cbd8d4] px-4 py-3 uppercase"/>{postcode&&!isValidUKPostcode(postcode)&&<span className="mt-2 block text-sm text-red-700">Enter a valid UK postcode.</span>}</label>
   </div>
   <div className="mt-8"><h2 className="text-xl font-bold text-[var(--project-dark)]">What are your reasons for supporting the proposal?</h2><p className="mt-2 text-sm leading-6 text-[#657376]">Choose any points that genuinely reflect your own view. You can also add your own comments below.</p><div className="mt-4 space-y-3">{project.benefits.map(benefit=><label key={benefit.id} className="flex cursor-pointer gap-3 rounded-2xl border border-[#d8e1de] p-4 transition hover:border-[var(--project-primary)]"><input type="checkbox" checked={benefitIds.includes(benefit.id)} onChange={()=>toggleBenefit(benefit.id)} className="mt-1 h-5 w-5 accent-[var(--project-primary)]"/><span className="leading-6">{benefit.label}</span></label>)}</div></div>
   <label className="mt-7 block"><span className="mb-2 block text-sm font-bold">Additional comments <span className="font-normal text-[#657376]">(optional)</span></span><textarea value={comment} onChange={e=>setComment(e.target.value)} rows={5} maxLength={1800} placeholder="Add anything else you would like the Council to consider, in your own words." className="focus-ring w-full rounded-xl border border-[#cbd8d4] px-4 py-3"/><span className="mt-2 block text-right text-xs text-[#7c898b]">{comment.length}/1800</span></label>
   <div className="mt-7 space-y-4 rounded-2xl bg-[#f5f8f6] p-5">
    <label className="flex gap-3 text-sm leading-6"><input type="checkbox" checked={privacyConsent} onChange={e=>setPrivacyConsent(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--project-primary)]"/><span>I understand how my information will be used as described in the <Link className="font-bold underline" href={`/${project.slug}/privacy`} target="_blank">privacy statement</Link>. *</span></label>
    <label className="flex gap-3 text-sm leading-6"><input type="checkbox" checked={marketingOptIn} onChange={e=>setMarketingOptIn(e.target.checked)} className="mt-1 h-5 w-5 accent-[var(--project-primary)]"/><span>{project.keepUpdatedLabel??"Keep me updated about this project by email"}</span></label>
   </div>
   <div aria-hidden="true" className="absolute left-[-9999px] top-auto h-px w-px overflow-hidden"><label>Website<input tabIndex={-1} autoComplete="off" value={honeypot} onChange={e=>setHoneypot(e.target.value)}/></label></div>
   {!hasContent&&<p className="mt-5 text-sm font-semibold text-amber-800">Choose at least one reason or add a comment before using the letter.</p>}
   {message&&<div role="status" className="mt-5 rounded-xl border border-[#b9d6cf] bg-[#edf8f4] px-4 py-3 text-sm font-semibold text-[#245d50]">{message}</div>}
   <div className="mt-7 flex flex-wrap gap-3"><button type="button" onClick={reset} className="focus-ring rounded-xl border border-[#c5d2cf] px-5 py-3 font-bold">Start over</button><button type="button" disabled={!valid||busy} onClick={copyLetter} className="focus-ring rounded-xl bg-[var(--project-primary)] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Copy letter</button><button type="button" disabled={!valid||busy} onClick={openEmail} className="focus-ring rounded-xl bg-[var(--project-dark)] px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Open in email</button></div>
   <p className="mt-4 text-xs leading-5 text-[#718083]">We do not send the email for you. “Open in email” creates a draft in your own email app for you to review and choose whether to send.</p>
  </section>
  <aside className="lg:sticky lg:top-6"><div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5"><div className="border-b border-[#e0e6e4] px-6 py-5"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--project-primary)]">Live preview</p><h2 className="mt-1 text-xl font-bold">Your planning representation</h2></div><div className="min-h-[520px] whitespace-pre-wrap px-6 py-7 text-[15px] leading-7 text-[#283e43] md:px-8">{letter||<span className="text-[#899597]">Your letter will appear here as you choose your reasons or add a comment.</span>}</div></div></aside>
 </div>;
}
