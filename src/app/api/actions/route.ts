import { and,count,eq,gte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp,secureHash } from "@/lib/abuse";
import { getDb } from "@/lib/db";
import { submissions } from "@/lib/db/schema";
import { getPhrasingSelections } from "@/lib/letter";
import { getProject } from "@/lib/projects";
import { isValidUKPostcode,normalisePostcode,postcodeDistrict } from "@/lib/postcode";

const schema=z.object({
 projectSlug:z.string().min(1),action:z.enum(["copy","email"]),name:z.string().trim().min(2).max(160),email:z.string().trim().email().max(254),address:z.string().trim().min(8).max(1200),postcode:z.string().trim().max(12),benefitIds:z.array(z.string()).max(20),comment:z.string().max(1800).optional().default(""),privacyConsent:z.literal(true),marketingOptIn:z.boolean().default(false),honeypot:z.string().max(200).optional().default(""),
 tracking:z.object({utmSource:z.string().max(200).optional(),utmMedium:z.string().max(200).optional(),utmCampaign:z.string().max(200).optional(),utmContent:z.string().max(200).optional(),utmTerm:z.string().max(200).optional(),referrer:z.string().max(1000).optional()}).optional().default({})
});
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid submission"},{status:400});
 const input=parsed.data;if(input.honeypot)return new NextResponse(null,{status:204});
 const project=getProject(input.projectSlug);if(!project)return NextResponse.json({error:"Unknown project"},{status:404});
 if(!isValidUKPostcode(input.postcode))return NextResponse.json({error:"Invalid postcode"},{status:400});
 if(input.benefitIds.length===0&&input.comment.trim().length===0)return NextResponse.json({error:"Choose a reason or add a comment"},{status:400});
 const allowed=new Set(project.benefits.map(b=>b.id));if(input.benefitIds.some(id=>!allowed.has(id)))return NextResponse.json({error:"Invalid benefit"},{status:400});
 const db=getDb(),postcode=normalisePostcode(input.postcode),ipHash=secureHash(getClientIp(request.headers)),supporterFingerprint=secureHash(`${input.email.toLowerCase()}|${postcode}`),windowStart=new Date(Date.now()-15*60*1000);
 const [rate]=await db.select({value:count()}).from(submissions).where(and(eq(submissions.projectId,project.id),eq(submissions.ipHash,ipHash),gte(submissions.createdAt,windowStart)));
 if((rate?.value??0)>=10)return NextResponse.json({error:"Too many attempts. Please try again later."},{status:429});
 const [existing]=await db.select({value:count()}).from(submissions).where(and(eq(submissions.projectId,project.id),eq(submissions.supporterFingerprint,supporterFingerprint)));
 await db.insert(submissions).values({
  projectId:project.id,action:input.action,name:input.name.trim(),email:input.email.trim().toLowerCase(),address:input.address.trim(),postcode,postcodeDistrict:postcodeDistrict(postcode),benefitIds:input.benefitIds,
  chosenPhrasingIds:getPhrasingSelections(project,{name:input.name,postcode,benefitIds:input.benefitIds}),commentLeft:input.comment.trim().length>0,marketingOptIn:input.marketingOptIn,privacyConsentAt:new Date(),
  utmSource:input.tracking.utmSource,utmMedium:input.tracking.utmMedium,utmCampaign:input.tracking.utmCampaign,utmContent:input.tracking.utmContent,utmTerm:input.tracking.utmTerm,referrer:input.tracking.referrer,
  ipHash,supporterFingerprint,duplicate:(existing?.value??0)>0
 });
 return NextResponse.json({ok:true,duplicate:(existing?.value??0)>0});
}
