import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getProjects } from "@/lib/projects";

function retentionDate(close:string,months:number){
  const date=new Date(`${close}T23:59:59Z`);
  date.setUTCMonth(date.getUTCMonth()+months);
  return date;
}

export async function GET(request:Request){
  const secret=process.env.CRON_SECRET;
  const authorised=Boolean(secret)&&request.headers.get("authorization")===`Bearer ${secret}`;
  if(process.env.NODE_ENV==="production"&&!authorised)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!process.env.DATABASE_URL)return NextResponse.json({ok:true,purged:[]});

  const db=getDb(),purged:string[]=[];
  const projects=await getProjects();
  for(const entry of projects){
    const project=entry.config;
    if(!project.consultationCloses)continue;
    if(Date.now()<retentionDate(project.consultationCloses,project.retentionMonths).getTime())continue;
    await db.delete(submissions).where(eq(submissions.projectId,project.id));
    purged.push(project.id);
  }
  return NextResponse.json({ok:true,purged});
}
