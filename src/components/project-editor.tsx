"use client";

import { useMemo,useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import type { ProjectConfig,SupportBenefit } from "@/projects/types";

type Props={
  initial?:ProjectConfig;
  databaseReady:boolean;
  mode:"create"|"edit";
};

const DEFAULT_PRIMARY="#006f78";
const DEFAULT_DARK="#083f47";
const DEFAULT_ACCENT="#e9b83f";
const DEFAULT_BG="#f5f8f6";

function slugify(value:string){
  return value.toLowerCase().trim().replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
}

function clause(value:string){
  const clean=value.trim().replace(/[.!?]+$/,"");
  if(!clean)return clean;
  if(/^[A-Z][a-z]/.test(clean))return clean.charAt(0).toLowerCase()+clean.slice(1);
  return clean;
}

function genericPhrasings(label:string):[string,string,string,...string[]]{
  const text=clause(label);
  return [
    `I support the proposal because ${text}.`,
    `One reason I support the application is ${text}.`,
    `For me, an important positive is ${text}.`,
    `I welcome this part of the proposal: ${label.replace(/[.!?]+$/,"")}.`,
    `This is one of the reasons I support the scheme: ${label.replace(/[.!?]+$/,"")}.`,
    `I think this would be a positive part of the development because ${text}.`,
    `Another benefit in my view is ${text}.`,
    `I also place weight on the fact that ${text}.`
  ];
}

function newBenefit(index:number):SupportBenefit{
  const label="";
  return {id:`benefit-${index+1}`,label,phrasings:genericPhrasings("this project benefit")};
}

export function ProjectEditor({initial,databaseReady,mode}:Props){
  const [schemeName,setSchemeName]=useState(initial?.schemeName??"");
  const [slug,setSlug]=useState(initial?.slug??"");
  const [slugTouched,setSlugTouched]=useState(Boolean(initial));
  const [clientName,setClientName]=useState(initial?.clientName??"");
  const [dataController,setDataController]=useState(initial?.dataController??"");
  const [location,setLocation]=useState(initial?.location??"");
  const [pitch,setPitch]=useState(initial?.pitch??"");
  const [projectType,setProjectType]=useState(initial?.campaign?.projectType??"other");
  const [destinationUrl,setDestinationUrl]=useState(initial?.campaign?.destinationUrl??"");
  const [targetArea,setTargetArea]=useState(initial?.campaign?.targetArea??initial?.location??"");
  const [audienceNotes,setAudienceNotes]=useState(initial?.campaign?.audienceNotes??"");
  const [applicationReference,setApplicationReference]=useState(initial?.applicationReference??"");
  const [authorityName,setAuthorityName]=useState(initial?.planningAuthority.name??"");
  const [recipient,setRecipient]=useState(initial?.planningAuthority.to?.[0]??"");
  const [cc,setCc]=useState(initial?.planningAuthority.cc?.join(", ")??"");
  const [primary,setPrimary]=useState(initial?.theme.primary??DEFAULT_PRIMARY);
  const [primaryDark,setPrimaryDark]=useState(initial?.theme.primaryDark??DEFAULT_DARK);
  const [accent,setAccent]=useState(initial?.theme.accent??DEFAULT_ACCENT);
  const [background,setBackground]=useState(initial?.theme.background??DEFAULT_BG);
  const [logoUrl,setLogoUrl]=useState(initial?.theme.logoUrl??"");
  const [benefits,setBenefits]=useState<SupportBenefit[]>(initial?.benefits?.length?initial.benefits:[newBenefit(0),newBenefit(1),newBenefit(2)]);
  const [consultationCloses,setConsultationCloses]=useState(initial?.consultationCloses??"");
  const [retentionMonths,setRetentionMonths]=useState(initial?.retentionMonths??18);
  const [privacyEmail,setPrivacyEmail]=useState(initial?.privacy.contactEmail??"");
  const [status,setStatus]=useState<"draft"|"live">("draft");
  const [reachEnabled,setReachEnabled]=useState(Boolean(initial?.reach));
  const [reachJourney,setReachJourney]=useState<"direct"|"landing">(initial?.reach?.campaigns?.[0]?.journey==="landing"?"landing":"direct");
  const [reachHeadline,setReachHeadline]=useState(initial?.reach?.headline??"");
  const [reachIntro,setReachIntro]=useState(initial?.reach?.intro??"");
  const [learnMoreUrl,setLearnMoreUrl]=useState(initial?.reach?.learnMoreUrl??"");
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState<string|null>(null);

  const effectiveSlug=slug||slugify(schemeName);

  function updateSchemeName(value:string){
    setSchemeName(value);
    if(!slugTouched)setSlug(slugify(value));
  }

  function updateBenefit(index:number,label:string){
    setBenefits(current=>current.map((benefit,i)=>{
      if(i!==index)return benefit;
      const shouldRegenerate=!benefit.label||benefit.phrasings.join("|")===genericPhrasings(benefit.label).join("|");
      return {
        ...benefit,
        label,
        phrasings:shouldRegenerate?genericPhrasings(label||"this project benefit"):benefit.phrasings
      };
    }));
  }

  function addBenefit(){
    setBenefits(current=>[...current,newBenefit(current.length)]);
  }

  function removeBenefit(index:number){
    setBenefits(current=>current.filter((_,i)=>i!==index));
  }

  const config=useMemo<ProjectConfig>(()=>{
    const cleanBenefits=benefits.filter(item=>item.label.trim()).map((item,index)=>({
      ...item,
      id:item.id&&item.id.startsWith("benefit-")?`benefit-${index+1}`:item.id,
      phrasings:item.phrasings?.length>=3?item.phrasings:genericPhrasings(item.label)
    })) as SupportBenefit[];

    const s=effectiveSlug||"project";
    const openings=[
      `I am writing to express my support for ${schemeName||"the proposal"}, planning application ${applicationReference||"REFERENCE"}.`,
      `I would like to register my support for ${schemeName||"the proposal"}, reference ${applicationReference||"REFERENCE"}.`,
      `Please accept this as my representation in support of ${schemeName||"the proposal"}, application ${applicationReference||"REFERENCE"}.`,
      `I am writing in support of the proposals for ${schemeName||"the scheme"} under application ${applicationReference||"REFERENCE"}.`,
      `I would like my support for ${schemeName||"the scheme"} to be recorded against application ${applicationReference||"REFERENCE"}.`,
      `I am submitting these comments in support of ${schemeName||"the proposal"}, reference ${applicationReference||"REFERENCE"}.`,
      `I am contacting the Council to register my support for ${schemeName||"the scheme"}, application ${applicationReference||"REFERENCE"}.`,
      `Please record this as a representation in support of ${schemeName||"the proposal"}, reference ${applicationReference||"REFERENCE"}.`
    ];

    const transitions=[
      "There are a number of parts of the proposal that I think are positive.",
      "There are other aspects of the scheme that I also support.",
      "I also think there are wider benefits that should be taken into account.",
      "Another part of the proposal that matters to me is set out below.",
      "There are further points that have influenced my support for the application.",
      "I also welcome some of the other measures included as part of the proposal.",
      "A further reason for my support is the wider benefit the scheme could provide.",
      "There are additional parts of the proposal that I believe are worth considering.",
      "I also see value in the wider package of benefits proposed.",
      "There are several other features of the scheme that reinforce my support."
    ];

    const closings=[
      "I hope these points are taken into account when the application is determined.",
      "I would be grateful if my comments could be considered as part of the Council's assessment of the application.",
      "Please include these comments among the representations considered when the application is determined.",
      "I hope the Council will give these points proper consideration when reaching its decision.",
      "Please take my support and the reasons set out above into account as part of the determination of the application.",
      "I would appreciate my comments being included in the representations considered by the Council.",
      "I hope my views can be taken into account alongside the other representations received on the application.",
      "Thank you for considering my comments on the application."
    ];

    return {
      id:s,
      slug:s,
      clientName:clientName||"CLIENT",
      dataController:dataController||clientName||"DATA CONTROLLER",
      dataProcessor:"DevComms",
      schemeName:schemeName||"Untitled project",
      location:location||undefined,
      pitch:pitch||`Share your views in support of ${schemeName||"this proposal"}.`,
      applicationReference:applicationReference||"REFERENCE",
      planningAuthority:{
        name:authorityName||"Planning authority",
        to:recipient?[recipient]:[],
        cc:cc.split(",").map(v=>v.trim()).filter(Boolean)
      },
      theme:{primary,primaryDark,accent,background,logoUrl:logoUrl||undefined},
      campaign:{projectType,destinationUrl:destinationUrl||undefined,targetArea:targetArea||undefined,audienceNotes:audienceNotes||undefined},
      benefits:cleanBenefits,
      letter:{
        salutations:["Dear Planning Officer,","Dear Development Management Team,","Dear Planning Team,"],
        openings,
        transitions,
        closings,
        subject:`Support for ${schemeName||"planning application"} – ${applicationReference||"REFERENCE"}`
      },
      reach:reachEnabled?{
        eyebrow:schemeName||"Project",
        headline:reachHeadline||`Support ${schemeName||"the proposals"}`,
        intro:reachIntro||pitch||`Find out more about ${schemeName||"the proposal"} and share your support with the planning authority.`,
        supportCta:"Yes, I support the proposals",
        learnMoreCta:"I'd like to know more",
        learnMoreUrl:learnMoreUrl||undefined,
        keyPoints:cleanBenefits.slice(0,3).map(item=>item.label),
        campaigns:[
          {slug:"facebook-local",name:"Facebook – local audience",channel:"Meta",journey:reachJourney,source:"facebook",medium:"paid_social",campaign:`${s}-facebook-local`},
          {slug:"instagram-local",name:"Instagram – local audience",channel:"Meta",journey:reachJourney,source:"instagram",medium:"paid_social",campaign:`${s}-instagram-local`},
          {slug:"leaflet-qr",name:"Leaflet QR",channel:"Print",journey:reachJourney,source:"leaflet",medium:"qr",campaign:`${s}-leaflet`},
          {slug:"client-website",name:"Client website",channel:"Website",journey:reachJourney,source:"client-website",medium:"referral",campaign:`${s}-client-website`},
          {slug:"organic-social",name:"Organic social",channel:"Social",journey:reachJourney,source:"organic-social",medium:"social",campaign:`${s}-organic`}
        ]
      }:undefined,
      consultationCloses:consultationCloses||undefined,
      retentionMonths:Number(retentionMonths)||18,
      privacy:{
        coreLawfulBasis:"legitimate interests",
        legitimateInterest:"operating the representation tool, understanding community views on the planning application, preventing abuse and preparing aggregated project reporting",
        contactEmail:privacyEmail||undefined
      },
      keepUpdatedLabel:`Keep me updated about ${schemeName||"this project"} by email`,
      embedOrigins:[]
    };
  },[schemeName,effectiveSlug,clientName,dataController,location,pitch,applicationReference,authorityName,recipient,cc,primary,primaryDark,accent,background,logoUrl,benefits,consultationCloses,retentionMonths,privacyEmail,reachEnabled,reachHeadline,reachIntro,learnMoreUrl]);

  async function save(){
    setMessage(null);
    if(!databaseReady){
      setMessage("The project editor is ready, but the database still needs connecting before projects can be saved.");
      return;
    }
    if(!schemeName||!clientName||!applicationReference||!authorityName||!recipient||config.benefits.length===0){
      setMessage("Complete the scheme, client, application, planning authority, recipient email and at least one support reason.");
      return;
    }
    setSaving(true);
    try{
      const url=mode==="edit"&&initial?`/api/admin/projects/${initial.slug}`:"/api/admin/projects";
      const response=await fetch(url,{
        method:mode==="edit"?"PUT":"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({config,status})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not save project.");
      window.location.href=`/admin/${data.slug}`;
    }catch(error){
      setMessage(error instanceof Error?error.message:"Could not save project.");
    }finally{
      setSaving(false);
    }
  }

  async function copyConfig(){
    await navigator.clipboard.writeText(JSON.stringify(config,null,2));
    setMessage("Project configuration copied.");
  }

  const field="focus-ring mt-2 w-full rounded-xl border border-[#d5dfdc] bg-white px-4 py-3 text-sm text-[#294247] outline-none transition focus:border-[#006f78]";

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
    <div className="space-y-6">
      <Section number="01" title="Project details" description="The core scheme and client information used across the public tool.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Scheme name *"><input className={field} value={schemeName} onChange={e=>updateSchemeName(e.target.value)} placeholder="e.g. Castle Hills Solar Farm"/></Field>
          <Field label="Project URL slug *"><input className={field} value={slug} onChange={e=>{setSlugTouched(true);setSlug(slugify(e.target.value));}} placeholder="castle-hills-solar"/></Field>
          <Field label="Client name *"><input className={field} value={clientName} onChange={e=>setClientName(e.target.value)} placeholder="Client / developer"/></Field>
          <Field label="Data Controller *"><input className={field} value={dataController} onChange={e=>setDataController(e.target.value)} placeholder="Usually the client"/></Field>
          <Field label="Location"><input className={field} value={location} onChange={e=>setLocation(e.target.value)} placeholder="Town / district"/></Field>
          <Field label="Planning application reference *"><input className={field} value={applicationReference} onChange={e=>setApplicationReference(e.target.value)} placeholder="25/00000/FUL"/></Field>
        </div>
        <Field label="Campaign summary"><textarea rows={3} className={field} value={pitch} onChange={e=>setPitch(e.target.value)} placeholder="A concise internal summary of the project and campaign objective."/></Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Project type">
            <select className={field} value={projectType} onChange={e=>setProjectType(e.target.value as typeof projectType)}>
              <option value="residential">Residential</option>
              <option value="employment">Employment</option>
              <option value="renewables">Renewables</option>
              <option value="infrastructure">Infrastructure</option>
              <option value="mixed">Mixed</option>
              <option value="other">Other</option>
            </select>
          </Field>
          <Field label="Campaign destination URL"><input className={field} value={destinationUrl} onChange={e=>setDestinationUrl(e.target.value)} placeholder="https://projectwebsite.co.uk/"/></Field>
          <Field label="Target area"><input className={field} value={targetArea} onChange={e=>setTargetArea(e.target.value)} placeholder="e.g. Solihull and nearby communities"/></Field>
          <Field label="Audience notes"><textarea rows={3} className={field} value={audienceNotes} onChange={e=>setAudienceNotes(e.target.value)} placeholder="Any legitimate local/contextual audience considerations."/></Field>
        </div>
      </Section>

      <Section number="02" title="Planning context" description="Planning authority and application details used to keep campaign copy accurate.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Planning authority *"><input className={field} value={authorityName} onChange={e=>setAuthorityName(e.target.value)} placeholder="Council name"/></Field>
          <Field label="Planning recipient email *"><input type="email" className={field} value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="planning@council.gov.uk"/></Field>
        </div>
        <Field label="CC addresses"><input className={field} value={cc} onChange={e=>setCc(e.target.value)} placeholder="reporting@devcomms.co.uk, client@example.com"/></Field>
      </Section>

      <Section number="03" title="Approved campaign facts" description="Add the factual benefits and messages the Ad Studio is allowed to use. Generated ads will be locked to these claims.">
        <div className="space-y-3">
          {benefits.map((benefit,index)=><div key={index} className="flex gap-3 rounded-2xl border border-[#e0e7e5] bg-[#fafcfb] p-4">
            <span className="mt-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e7f2ef] text-xs font-black text-[#006f78]">{index+1}</span>
            <div className="min-w-0 flex-1">
              <input className={field} value={benefit.label} onChange={e=>updateBenefit(index,e.target.value)} placeholder="e.g. A £40,000 annual Community Benefit Fund"/>
            </div>
            {benefits.length>1?<button type="button" onClick={()=>removeBenefit(index)} className="mt-2 h-10 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50">Remove</button>:null}
          </div>)}
        </div>
        <button type="button" onClick={addBenefit} className="mt-4 rounded-xl border border-[#bfd0cc] bg-white px-4 py-2.5 text-sm font-bold text-[#31575c]">+ Add another reason</button>
      </Section>

      <Section number="04" title="Branding" description="Project colours are applied automatically to the resident and Reach pages.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Colour label="Primary" value={primary} onChange={setPrimary}/>
          <Colour label="Dark" value={primaryDark} onChange={setPrimaryDark}/>
          <Colour label="Accent" value={accent} onChange={setAccent}/>
          <Colour label="Background" value={background} onChange={setBackground}/>
        </div>
        <Field label="Logo URL"><input className={field} value={logoUrl} onChange={e=>setLogoUrl(e.target.value)} placeholder="https://..."/></Field>
      </Section>

      <Section number="05" title="Campaign tracking" description="Optional tracked links for Facebook, Instagram, leaflets, websites and other outreach.">
        <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[#dce5e2] bg-[#f8fbfa] p-4">
          <input type="checkbox" className="h-5 w-5 accent-[#006f78]" checked={reachEnabled} onChange={e=>setReachEnabled(e.target.checked)}/>
          <span><strong>Enable Reach for this project</strong><span className="mt-1 block text-sm text-[#6d7d80]">Creates standard Facebook, Instagram, leaflet, website and organic tracked routes.</span></span>
        </label>
        {reachEnabled?<div className="mt-5 space-y-4">
          <div>
            <p className="text-sm font-semibold text-[#40575c]">Campaign journey</p>
            <div className="mt-2 grid gap-3 md:grid-cols-2">
              <label className={`cursor-pointer rounded-2xl border p-4 transition ${reachJourney==="direct"?"border-[#006f78] bg-[#eef8f6]":"border-[#dce5e2] bg-white"}`}>
                <input type="radio" name="reachJourney" value="direct" checked={reachJourney==="direct"} onChange={()=>setReachJourney("direct")} className="mr-2 accent-[#006f78]"/>
                <strong>Direct to destination URL</strong>
                <span className="mt-1 block text-sm font-normal leading-6 text-[#6d7d80]">The ad or QR link goes straight to the project website or campaign destination configured above.</span>
              </label>
              <label className={`cursor-pointer rounded-2xl border p-4 transition ${reachJourney==="landing"?"border-[#006f78] bg-[#eef8f6]":"border-[#dce5e2] bg-white"}`}>
                <input type="radio" name="reachJourney" value="landing" checked={reachJourney==="landing"} onChange={()=>setReachJourney("landing")} className="mr-2 accent-[#006f78]"/>
                <strong>Campaign landing page first</strong>
                <span className="mt-1 block text-sm font-normal leading-6 text-[#6d7d80]">Optional for campaigns where you want a short explainer before the resident enters the support tool.</span>
              </label>
            </div>
          </div>
          <Field label="Reach headline"><input className={field} value={reachHeadline} onChange={e=>setReachHeadline(e.target.value)} placeholder={`Support ${schemeName||"the proposals"}`}/></Field>
          <Field label="Reach introduction"><textarea rows={3} className={field} value={reachIntro} onChange={e=>setReachIntro(e.target.value)} placeholder="Short factual introduction to the campaign."/></Field>
          <Field label="Learn more URL"><input className={field} value={learnMoreUrl} onChange={e=>setLearnMoreUrl(e.target.value)} placeholder="https://projectwebsite.co.uk/"/></Field>
        </div>:null}
      </Section>

      <Section number="06" title="Privacy & retention" description="Project-specific data handling settings.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Consultation closes"><input type="date" className={field} value={consultationCloses} onChange={e=>setConsultationCloses(e.target.value)}/></Field>
          <Field label="Retention (months)"><input type="number" min={1} max={120} className={field} value={retentionMonths} onChange={e=>setRetentionMonths(Number(e.target.value))}/></Field>
          <Field label="Privacy contact email"><input type="email" className={field} value={privacyEmail} onChange={e=>setPrivacyEmail(e.target.value)} placeholder="privacy@client.co.uk"/></Field>
        </div>
      </Section>
    </div>

    <aside className="xl:sticky xl:top-6">
      <div className="rounded-[26px] bg-[#0b3f47] p-6 text-white shadow-[0_18px_50px_rgba(16,58,64,.14)]">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">{mode==="create"?"New project":"Edit project"}</p>
        <h2 className="mt-2 text-2xl font-bold">{schemeName||"Untitled project"}</h2>
        <p className="mt-2 text-sm text-white/60">/{effectiveSlug||"project-slug"}</p>

        <div className="mt-6 space-y-3 rounded-2xl bg-white/8 p-4 text-sm">
          <Summary label="Client" value={clientName||"Not set"}/>
          <Summary label="Application" value={applicationReference||"Not set"}/>
          <Summary label="Campaign facts" value={String(config.benefits.length)}/>
          <Summary label="Reach" value={reachEnabled?(reachJourney==="direct"?"Direct to tool":"Landing first"):"Off"}/>
        </div>

        <label className="mt-5 block text-sm font-semibold">Project status
          <select value={status} onChange={e=>setStatus(e.target.value as "draft"|"live")} className="mt-2 w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-white outline-none">
            <option value="draft" className="text-black">Draft</option>
            <option value="live" className="text-black">Live</option>
          </select>
        </label>

        {!databaseReady?<div className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-50">The project editor is available now, but the database must be connected before a new project can be saved and published.</div>:null}
        {message?<div className="mt-5 rounded-xl bg-white/10 p-4 text-sm leading-6 text-white">{message}</div>:null}

        <button type="button" disabled={saving} onClick={save} className="mt-6 w-full rounded-xl bg-white px-5 py-3.5 font-bold text-[#0b3f47] transition hover:-translate-y-0.5 disabled:opacity-50">{saving?"Saving…":mode==="create"?"Create project":"Save changes"}</button>
        <button type="button" onClick={copyConfig} className="mt-2 w-full rounded-xl border border-white/15 px-5 py-3 font-bold text-white/90 hover:bg-white/5">Copy config JSON</button>
        <Link href="/" className="mt-3 block text-center text-sm font-semibold text-white/60 hover:text-white">Cancel</Link>
      </div>
    </aside>
  </div>;
}

function Section({number,title,description,children}:{number:string;title:string;description:string;children:ReactNode}){
  return <section className="rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04] md:p-7">
    <div className="mb-6 flex gap-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e7f2ef] text-xs font-black text-[#006f78]">{number}</span>
      <div><h2 className="text-xl font-bold tracking-tight text-[#173136]">{title}</h2><p className="mt-1 text-sm leading-6 text-[#718083]">{description}</p></div>
    </div>
    <div className="space-y-4">{children}</div>
  </section>;
}
function Field({label,children}:{label:string;children:ReactNode}){return <label className="block text-sm font-semibold text-[#40575c]">{label}{children}</label>;}
function Colour({label,value,onChange}:{label:string;value:string;onChange:(value:string)=>void}){return <label className="text-sm font-semibold text-[#40575c]">{label}<div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d5dfdc] bg-white p-2"><input type="color" value={value} onChange={e=>onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent"/><input value={value} onChange={e=>onChange(e.target.value)} className="min-w-0 flex-1 text-xs font-mono uppercase outline-none"/></div></label>;}
function Summary({label,value}:{label:string;value:string}){return <div className="flex items-start justify-between gap-4"><span className="text-white/55">{label}</span><strong className="text-right font-semibold">{value}</strong></div>;}
