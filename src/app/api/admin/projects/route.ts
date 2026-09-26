import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { projectConfigs } from "@/lib/db/schema";
import type { ProjectConfig } from "@/projects/types";

const benefit=z.object({
  id:z.string().min(1),
  label:z.string().min(3),
  phrasings:z.array(z.string().min(3)).min(3)
});

const configSchema=z.object({
  id:z.string().min(1),
  slug:z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  clientName:z.string().min(2),
  dataController:z.string().min(2),
  dataProcessor:z.string().min(2),
  schemeName:z.string().min(2),
  location:z.string().optional(),
  pitch:z.string().min(5),
  applicationReference:z.string().min(2),
  planningAuthority:z.object({
    name:z.string().min(2),
    to:z.array(z.string().email()),
    cc:z.array(z.string().email()).optional()
  }),
  theme:z.object({
    primary:z.string().min(4),
    primaryDark:z.string().min(4),
    accent:z.string().min(4),
    background:z.string().min(4),
    logoUrl:z.string().url().optional().or(z.literal(""))
  }),
  campaign:z.object({
    projectType:z.enum(["residential","employment","renewables","infrastructure","mixed","other"]).optional(),
    destinationUrl:z.string().url().optional(),
    targetArea:z.string().optional(),
    audienceNotes:z.string().optional()
  }).optional(),
  benefits:z.array(benefit).min(1),
  letter:z.object({
    salutations:z.array(z.string()).min(1),
    openings:z.array(z.string()).min(1),
    transitions:z.array(z.string()).optional(),
    closings:z.array(z.string()).min(1),
    subject:z.string().min(3)
  }),
  reach:z.any().optional(),
  consultationCloses:z.string().optional(),
  retentionMonths:z.number().int().min(1).max(120),
  privacy:z.object({
    coreLawfulBasis:z.string().min(2),
    legitimateInterest:z.string().optional(),
    contactEmail:z.string().email().optional().or(z.literal("")),
    controllerPrivacyUrl:z.string().url().optional().or(z.literal(""))
  }),
  keepUpdatedLabel:z.string().optional(),
  embedOrigins:z.array(z.string()).optional()
});

export async function POST(request:Request){
  if(!process.env.DATABASE_URL){
    return NextResponse.json({error:"Connect the Support Gen database before saving projects."},{status:503});
  }

  const body=await request.json();
  const parsed=z.object({config:configSchema,status:z.enum(["draft","live"]).default("draft")}).safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Please check the project details.",details:parsed.error.flatten()},{status:400});

  const config=parsed.data.config as ProjectConfig;
  const db=getDb();
  const [existing]=await db.select({slug:projectConfigs.slug}).from(projectConfigs).where(eq(projectConfigs.slug,config.slug)).limit(1);
  if(existing)return NextResponse.json({error:"A project with this URL slug already exists."},{status:409});

  await db.insert(projectConfigs).values({slug:config.slug,status:parsed.data.status,config});
  return NextResponse.json({ok:true,slug:config.slug});
}
