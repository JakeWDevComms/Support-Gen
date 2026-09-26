import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getProjects } from "@/lib/projects";
function retentionDate(close:string,months:number){const date=new Date(`${close}T23:59:59Z`);date.setUTCMonth(date.getUTCMonth()+months);return date;}
export async function GET(request:Request){const secret=process.env.CRON_SECRET,authorised=Boolean(secret)&&request.headers.get("authorization")===`Bearer ${secret}`;if(process.env.NODE_ENV==="production"&&!authorised)return NextResponse.json({error:"Unauthorized"},{status:401});const db=getDb(),purged:string[]=[];for(const project of getProjects()){if(!project.consultationCloses)continue;if(Date.now()<retentionDate(project.consultationCloses,project.retentionMonths).getTime())continue;await db.delete(submissions).where(eq(submissions.projectId,project.id));purged.push(project.id);}return NextResponse.json({ok:true,purged});}
