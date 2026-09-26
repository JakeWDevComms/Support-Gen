import { desc,eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";

function csv(value:unknown){const text=value==null?"":Array.isArray(value)?value.join("|"):String(value);return `"${text.replaceAll('"','""')}"`;}

export async function GET(_:Request,{params}:{params:Promise<{projectSlug:string}>}){
 const {projectSlug}=await params,project=getProject(projectSlug);
 if(!project)return NextResponse.json({error:"Unknown project"},{status:404});

 const rows=process.env.DATABASE_URL
   ? await getDb().select().from(submissions).where(eq(submissions.projectId,project.id)).orderBy(desc(submissions.createdAt))
   : [];

 const header=["timestamp","action","name","email","address","postcode","postcode_district","benefit_ids","comment_left","marketing_opt_in","utm_source","utm_medium","utm_campaign","utm_content","utm_term","duplicate"];
 const lines=rows.map(row=>[row.createdAt.toISOString(),row.action,row.name,row.email,row.address,row.postcode,row.postcodeDistrict,row.benefitIds,row.commentLeft,row.marketingOptIn,row.utmSource,row.utmMedium,row.utmCampaign,row.utmContent,row.utmTerm,row.duplicate].map(csv).join(","));
 return new NextResponse([header.map(csv).join(","),...lines].join("\n"),{headers:{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="${project.slug}-support.csv"`,"cache-control":"no-store"}});
}
