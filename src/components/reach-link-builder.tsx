"use client";
import { useMemo,useState } from "react";
import type { ProjectConfig } from "@/projects/types";

export function ReachLinkBuilder({project}:{project:ProjectConfig}){
  const [source,setSource]=useState("community-outreach"),[medium,setMedium]=useState("referral"),[campaign,setCampaign]=useState(`${project.slug}-custom`),[copied,setCopied]=useState<string|null>(null),[qrBusy,setQrBusy]=useState<string|null>(null);
  const directPath=useMemo(()=>{
    const q=new URLSearchParams({utm_source:source.trim()||"custom",utm_medium:medium.trim()||"referral",utm_campaign:campaign.trim()||`${project.slug}-custom`});
    return `/${project.slug}?${q.toString()}`;
  },[project.slug,source,medium,campaign]);

  async function copy(path:string,key:string){await navigator.clipboard.writeText(`${window.location.origin}${path}`);setCopied(key);window.setTimeout(()=>setCopied(null),1800);}
  async function downloadQr(path:string,key:string,name:string){
    setQrBusy(key);
    try{
      const QRCode=await import("qrcode");
      const url=`${window.location.origin}${path}`;
      const dataUrl=await QRCode.toDataURL(url,{width:1200,margin:2,errorCorrectionLevel:"H"});
      const a=document.createElement("a");
      a.href=dataUrl;
      a.download=`${name.replace(/[^a-z0-9]+/gi,"-").replace(/^-|-$/g,"").toLowerCase()}-qr.png`;
      a.click();
    }finally{setQrBusy(null);}
  }

  return <div className="space-y-6">
    <div className="grid gap-3 md:grid-cols-2">
      {project.reach?.campaigns.map(item=>{
        const path=`/${project.slug}/reach/${item.slug}`;
        return <div key={item.slug} className="rounded-2xl border border-[#d8e1de] p-4">
          <div className="flex items-start justify-between gap-4">
            <div><div className="text-xs font-bold uppercase tracking-[0.12em] text-[#6e7d80]">{item.channel}</div><div className="mt-1 font-bold">{item.name}</div></div>
            <div className="flex shrink-0 gap-2">
              <button onClick={()=>copy(path,item.slug)} className="rounded-lg bg-[#083f47] px-3 py-2 text-xs font-bold text-white">{copied===item.slug?"Copied":"Copy URL"}</button>
              <button onClick={()=>downloadQr(path,item.slug,item.name)} disabled={qrBusy===item.slug} className="rounded-lg border border-[#cbd8d4] bg-white px-3 py-2 text-xs font-bold text-[#083f47] disabled:opacity-50">{qrBusy===item.slug?"Making…":"QR PNG"}</button>
            </div>
          </div>
          <code className="mt-3 block break-all rounded-lg bg-[#f4f7f6] p-3 text-xs text-[#536467]">{path}</code>
        </div>;
      })}
    </div>

    <div className="rounded-2xl bg-[#f4f7f6] p-5">
      <h3 className="font-bold">Build a direct tracked link</h3>
      <p className="mt-1 text-sm text-[#657376]">Useful for community groups, emails or one-off outreach that should go straight to the representation tool.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="text-sm font-semibold">Source<input value={source} onChange={e=>setSource(e.target.value)} className="mt-1 w-full rounded-lg border border-[#cbd8d4] bg-white px-3 py-2"/></label>
        <label className="text-sm font-semibold">Medium<input value={medium} onChange={e=>setMedium(e.target.value)} className="mt-1 w-full rounded-lg border border-[#cbd8d4] bg-white px-3 py-2"/></label>
        <label className="text-sm font-semibold">Campaign<input value={campaign} onChange={e=>setCampaign(e.target.value)} className="mt-1 w-full rounded-lg border border-[#cbd8d4] bg-white px-3 py-2"/></label>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap rounded-lg bg-white px-3 py-2 text-xs">{directPath}</code>
        <div className="flex gap-2">
          <button onClick={()=>copy(directPath,"custom")} className="rounded-lg bg-[#006f78] px-4 py-2 text-sm font-bold text-white">{copied==="custom"?"Copied":"Copy tracked URL"}</button>
          <button onClick={()=>downloadQr(directPath,"custom",`${project.slug}-custom`)} disabled={qrBusy==="custom"} className="rounded-lg border border-[#cbd8d4] bg-white px-4 py-2 text-sm font-bold text-[#083f47] disabled:opacity-50">{qrBusy==="custom"?"Making…":"Download QR"}</button>
        </div>
      </div>
    </div>
  </div>;
}
