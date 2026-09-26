"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProjectConfig } from "@/projects/types";

type CampaignPack={
  strategy:{
    recommendedObjective:string;
    creativeApproach:string;
    testingApproach:string;
  };
  targeting:{
    geography:string;
    age:string;
    gender:string;
    audience:string;
    placements:string;
    optimisation:string;
    exclusions:string;
    compliance:string;
  };
  ads:Array<{
    id:string;
    name:string;
    angle:string;
    primaryText:string;
    headline:string;
    description:string;
    cta:string;
    recommendedPlacement:string;
    imageBrief:string;
    imagePrompt:string;
  }>;
};

export function AdStudio({project,aiReady}:{project:ProjectConfig;aiReady:boolean}){
  const [pack,setPack]=useState<CampaignPack|null>(null);
  const [loading,setLoading]=useState(false);
  const [message,setMessage]=useState<string|null>(null);
  const [images,setImages]=useState<Record<string,string>>({});
  const [imageLoading,setImageLoading]=useState<string|null>(null);
  const [copied,setCopied]=useState<string|null>(null);

  async function generatePack(){
    if(!aiReady){
      setMessage("Add OPENAI_API_KEY in Vercel before generating campaign creative.");
      return;
    }
    setLoading(true);setMessage(null);
    try{
      const response=await fetch(`/api/admin/projects/${project.slug}/generate-ads`,{method:"POST"});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not generate campaign pack.");
      setPack(data);
      setImages({});
    }catch(error){
      setMessage(error instanceof Error?error.message:"Could not generate campaign pack.");
    }finally{
      setLoading(false);
    }
  }

  async function generateImage(ad:CampaignPack["ads"][number]){
    if(!aiReady)return;
    setImageLoading(ad.id);setMessage(null);
    try{
      const response=await fetch(`/api/admin/projects/${project.slug}/generate-image`,{
        method:"POST",
        headers:{"content-type":"application/json"},
        body:JSON.stringify({prompt:ad.imagePrompt})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||"Could not generate image.");
      setImages(current=>({...current,[ad.id]:data.image}));
    }catch(error){
      setMessage(error instanceof Error?error.message:"Could not generate image.");
    }finally{
      setImageLoading(null);
    }
  }

  async function copy(text:string,key:string){
    await navigator.clipboard.writeText(text);
    setCopied(key);
    window.setTimeout(()=>setCopied(null),1400);
  }

  async function downloadCrop(dataUrl:string,filename:string,width:number,height:number){
    const image=new Image();
    image.onload=()=>{
      const canvas=document.createElement("canvas");
      canvas.width=width;canvas.height=height;
      const ctx=canvas.getContext("2d");
      if(!ctx)return;
      const target=width/height,source=image.width/image.height;
      let sx=0,sy=0,sw=image.width,sh=image.height;
      if(source>target){
        sw=image.height*target;
        sx=(image.width-sw)/2;
      }else{
        sh=image.width/target;
        sy=(image.height-sh)/2;
      }
      ctx.drawImage(image,sx,sy,sw,sh,0,0,width,height);
      const a=document.createElement("a");
      a.href=canvas.toDataURL("image/png");
      a.download=filename;
      a.click();
    };
    image.src=dataUrl;
  }

  const facts=project.benefits.map(item=>item.label);

  return <div className="space-y-6">
    <section className="relative overflow-hidden rounded-[30px] bg-[#0b3f47] px-6 py-8 text-white shadow-[0_22px_65px_rgba(16,58,64,.16)] md:px-9 md:py-10">
      <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white opacity-[0.06]"/>
      <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/55">Campaign Studio</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] md:text-5xl">{project.schemeName}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-white/70">Generate factual paid-social ad concepts, captions, headlines, creative briefs and a recommended local audience setup from the approved project facts.</p>
        </div>
        <button onClick={generatePack} disabled={loading} className="shrink-0 rounded-xl bg-white px-5 py-3.5 font-bold text-[#0b3f47] shadow-sm transition hover:-translate-y-0.5 disabled:opacity-60">{loading?"Generating…":pack?"Regenerate ad pack":"Generate ad pack"}</button>
      </div>
    </section>

    {!aiReady?<div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-900"><strong>AI generation is not connected yet.</strong> Add <code>OPENAI_API_KEY</code> to the Vercel project. The Campaign Studio UI is ready and will start generating images and copy once the key is present.</div>:null}
    {message?<div className="rounded-2xl border border-[#d7e2df] bg-white px-5 py-4 text-sm leading-6 text-[#425b60]">{message}</div>:null}

    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <section className="rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04] md:p-7">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Approved campaign facts</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {facts.map((fact,index)=><div key={fact} className="flex gap-3 rounded-2xl bg-[#f5f8f7] p-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#e4f1ee] text-xs font-black text-[#006f78]">{index+1}</span><p className="text-sm leading-6 text-[#40575c]">{fact}</p></div>)}
        </div>
      </section>

      <aside className="rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Campaign setup</p>
        <div className="mt-4 space-y-4 text-sm">
          <Row label="Project type" value={project.campaign?.projectType??"Not set"}/>
          <Row label="Target area" value={project.campaign?.targetArea??project.location??"Not set"}/>
          <Row label="Destination" value={project.campaign?.destinationUrl??"Not set"}/>
          <Row label="Application" value={project.applicationReference}/>
        </div>
        <Link href={`/admin/projects/${project.slug}/edit`} className="mt-5 inline-flex text-sm font-bold text-[#006f78] hover:underline">Edit campaign facts →</Link>
      </aside>
    </div>

    {pack?<div className="space-y-6">
      <section className="grid gap-5 lg:grid-cols-2">
        <Panel title="Campaign strategy">
          <Info label="Recommended objective" value={pack.strategy.recommendedObjective}/>
          <Info label="Creative approach" value={pack.strategy.creativeApproach}/>
          <Info label="Testing approach" value={pack.strategy.testingApproach}/>
        </Panel>
        <Panel title="Recommended targeting">
          <Info label="Geography" value={pack.targeting.geography}/>
          <Info label="Age" value={pack.targeting.age}/>
          <Info label="Gender" value={pack.targeting.gender}/>
          <Info label="Audience" value={pack.targeting.audience}/>
          <Info label="Placements" value={pack.targeting.placements}/>
          <Info label="Optimisation" value={pack.targeting.optimisation}/>
          <Info label="Exclusions" value={pack.targeting.exclusions}/>
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900"><strong>Pre-launch check:</strong> {pack.targeting.compliance}</div>
        </Panel>
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#006f78]">Creative variants</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173136]">{pack.ads.length} ads ready to develop</h2>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          {pack.ads.map((ad,index)=><article key={ad.id} className="overflow-hidden rounded-[27px] bg-white shadow-[0_12px_36px_rgba(20,53,57,.07)] ring-1 ring-black/[0.04]">
            <div className="border-b border-[#e7edeb] px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#006f78]">Ad {index+1} · {ad.recommendedPlacement}</p><h3 className="mt-1 text-xl font-bold text-[#173136]">{ad.name}</h3><p className="mt-1 text-sm text-[#718083]">{ad.angle}</p></div>
                <button onClick={()=>copy(`${ad.primaryText}\n\nHeadline: ${ad.headline}\nDescription: ${ad.description}\nCTA: ${ad.cta}`,`ad-${ad.id}`)} className="rounded-lg border border-[#cad8d4] px-3 py-2 text-xs font-bold text-[#39575c]">{copied===`ad-${ad.id}`?"Copied":"Copy ad"}</button>
              </div>
            </div>

            <div className="grid md:grid-cols-[.9fr_1.1fr]">
              <div className="bg-[#eef3f1] p-4">
                {images[ad.id]?<div>
                  <img src={images[ad.id]} alt="" className="aspect-[2/3] w-full rounded-xl object-cover shadow-sm"/>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <button onClick={()=>downloadCrop(images[ad.id],`${project.slug}-${ad.id}-feed-4x5.png`,1080,1350)} className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-[#35545a]">4:5 Feed</button>
                    <button onClick={()=>downloadCrop(images[ad.id],`${project.slug}-${ad.id}-square.png`,1080,1080)} className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-[#35545a]">1:1 Square</button>
                    <button onClick={()=>downloadCrop(images[ad.id],`${project.slug}-${ad.id}-story.png`,1080,1920)} className="rounded-lg bg-white px-2 py-2 text-xs font-bold text-[#35545a]">9:16 Story</button>
                  </div>
                </div>:<div className="flex aspect-[2/3] flex-col items-center justify-center rounded-xl border border-dashed border-[#bdccc8] bg-white/55 p-5 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e5f1ee] text-xl">✦</div>
                  <p className="mt-4 text-sm font-bold text-[#40575c]">Generate this ad image</p>
                  <p className="mt-2 text-xs leading-5 text-[#7b898b]">{ad.imageBrief}</p>
                  <button onClick={()=>generateImage(ad)} disabled={imageLoading===ad.id||!aiReady} className="mt-4 rounded-xl bg-[#0b3f47] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">{imageLoading===ad.id?"Generating…":"Generate image"}</button>
                </div>}
              </div>

              <div className="space-y-5 p-6">
                <CopyBlock title="Primary text / caption" text={ad.primaryText} onCopy={()=>copy(ad.primaryText,`primary-${ad.id}`)} copied={copied===`primary-${ad.id}`}/>
                <CopyBlock title="Headline" text={ad.headline} onCopy={()=>copy(ad.headline,`headline-${ad.id}`)} copied={copied===`headline-${ad.id}`}/>
                <CopyBlock title="Description" text={ad.description} onCopy={()=>copy(ad.description,`description-${ad.id}`)} copied={copied===`description-${ad.id}`}/>
                <div className="flex items-center justify-between rounded-xl bg-[#f5f8f7] px-4 py-3"><span className="text-xs font-bold uppercase tracking-[0.11em] text-[#7a898b]">CTA</span><strong className="text-sm">{ad.cta}</strong></div>
                <details className="rounded-xl border border-[#e0e8e5] p-4"><summary className="cursor-pointer text-sm font-bold text-[#40575c]">Image brief / prompt</summary><p className="mt-3 text-xs leading-6 text-[#6e7d80]">{ad.imagePrompt}</p></details>
              </div>
            </div>
          </article>)}
        </div>
      </section>
    </div>:<section className="rounded-[27px] border border-dashed border-[#bdcdca] bg-white/55 p-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e5f1ee] text-2xl">✦</div>
      <h2 className="mt-5 text-xl font-bold text-[#173136]">No ad pack generated yet</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#6e7d80]">Generate a campaign pack to create four factual ad concepts, copy, image briefs and a recommended local audience setup.</p>
    </section>}
  </div>;
}

function Panel({title,children}:{title:string;children:React.ReactNode}){return <section className="rounded-[26px] bg-white p-6 shadow-[0_12px_34px_rgba(20,53,57,.06)] ring-1 ring-black/[0.04] md:p-7"><h2 className="text-xl font-bold tracking-tight text-[#173136]">{title}</h2><div className="mt-5 space-y-4">{children}</div></section>;}
function Info({label,value}:{label:string;value:string}){return <div><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#849193]">{label}</p><p className="mt-1 text-sm leading-6 text-[#40575c]">{value}</p></div>;}
function Row({label,value}:{label:string;value:string}){return <div><p className="text-[10px] font-bold uppercase tracking-[0.11em] text-[#8a9799]">{label}</p><p className="mt-1 break-words font-semibold leading-5 text-[#40575c]">{value}</p></div>;}
function CopyBlock({title,text,onCopy,copied}:{title:string;text:string;onCopy:()=>void;copied:boolean}){return <div><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#849193]">{title}</p><button onClick={onCopy} className="text-xs font-bold text-[#006f78]">{copied?"Copied":"Copy"}</button></div><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#344d52]">{text}</p></div>;}
