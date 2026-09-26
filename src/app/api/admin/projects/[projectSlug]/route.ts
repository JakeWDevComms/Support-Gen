import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { projectConfigs } from "@/lib/db/schema";
import type { ProjectConfig } from "@/projects/types";

export async function PUT(request:Request,{params}:{params:Promise<{projectSlug:string}>}){
  if(!process.env.DATABASE_URL)return NextResponse.json({error:"Database not connected."},{status:503});
  const {projectSlug}=await params;
  const body=await request.json() as {config?:ProjectConfig;status?:"draft"|"live"};
  if(!body.config)return NextResponse.json({error:"Missing project config."},{status:400});

  const db=getDb();
  const [existing]=await db.select({id:projectConfigs.id}).from(projectConfigs).where(eq(projectConfigs.slug,projectSlug)).limit(1);

  if(existing){
    await db.update(projectConfigs).set({
      slug:body.config.slug,
      status:body.status??"draft",
      config:body.config,
      updatedAt:new Date()
    }).where(eq(projectConfigs.slug,projectSlug));
  }else{
    await db.insert(projectConfigs).values({
      slug:body.config.slug,
      status:body.status??"draft",
      config:body.config
    });
  }

  return NextResponse.json({ok:true,slug:body.config.slug});
}

export async function DELETE(_:Request,{params}:{params:Promise<{projectSlug:string}>}){
  if(!process.env.DATABASE_URL)return NextResponse.json({error:"Database not connected."},{status:503});
  const {projectSlug}=await params;
  await getDb().delete(projectConfigs).where(eq(projectConfigs.slug,projectSlug));
  return NextResponse.json({ok:true});
}
