import { randomUUID } from "node:crypto";
import { and,count,eq,gte } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getClientIp,secureHash } from "@/lib/abuse";
import { getDb } from "@/lib/db";
import { reachEvents } from "@/lib/db/schema";
import { getProject } from "@/lib/projects";

const COOKIE="support_gen_vid";
const schema=z.object({
  projectSlug:z.string().min(1),
  campaignSlug:z.string().max(120).optional(),
  eventType:z.enum(["landing_view","support_click","learn_more_click","tool_start"]),
  tracking:z.object({
    utmSource:z.string().max(200).optional(),
    utmMedium:z.string().max(200).optional(),
    utmCampaign:z.string().max(200).optional(),
    utmContent:z.string().max(200).optional(),
    utmTerm:z.string().max(200).optional(),
    referrer:z.string().max(1000).optional()
  }).optional().default({})
});

export async function POST(request:Request){
  const parsed=schema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"Invalid event"},{status:400});
  const input=parsed.data,project=await getProject(input.projectSlug);
  if(!project)return NextResponse.json({error:"Unknown project"},{status:404});

  const configured=input.campaignSlug?project.reach?.campaigns.find(c=>c.slug===input.campaignSlug):undefined;
  if(input.campaignSlug&&project.reach&&!configured)return NextResponse.json({error:"Unknown campaign"},{status:404});

  const cookieStore=await cookies();
  let visitorToken=cookieStore.get(COOKIE)?.value;
  if(!visitorToken)visitorToken=randomUUID();

  const ipHash=secureHash(getClientIp(request.headers));
  const visitorId=secureHash(visitorToken);
  const db=getDb(),windowStart=new Date(Date.now()-15*60*1000);
  const [rate]=await db.select({value:count()}).from(reachEvents).where(and(
    eq(reachEvents.projectId,project.id),
    eq(reachEvents.ipHash,ipHash),
    gte(reachEvents.createdAt,windowStart)
  ));
  if((rate?.value??0)>=100)return new NextResponse(null,{status:204});

  await db.insert(reachEvents).values({
    projectId:project.id,
    campaignSlug:input.campaignSlug,
    eventType:input.eventType,
    visitorId,
    source:input.tracking.utmSource??configured?.source,
    medium:input.tracking.utmMedium??configured?.medium,
    campaign:input.tracking.utmCampaign??configured?.campaign,
    content:input.tracking.utmContent??configured?.content,
    term:input.tracking.utmTerm,
    referrer:input.tracking.referrer,
    ipHash
  });

  const response=NextResponse.json({ok:true});
  response.cookies.set(COOKIE,visitorToken,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:60*60*24*30});
  return response;
}
