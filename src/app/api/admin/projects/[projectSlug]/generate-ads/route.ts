import { generateText } from "ai";
import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

function extractJson(text:string){
  const cleaned=text.trim().replace(/^\`\`\`(?:json)?/i,"").replace(/\`\`\`$/,"").trim();
  const start=cleaned.indexOf("{"),end=cleaned.lastIndexOf("}");
  if(start<0||end<0)throw new Error("The model did not return a valid campaign pack.");
  return JSON.parse(cleaned.slice(start,end+1));
}

export async function POST(_:Request,{params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)return NextResponse.json({error:"Unknown project"},{status:404});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY is not configured yet."},{status:503});

  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
  const facts=project.benefits.map((b,index)=>`${index+1}. ${b.label}`).join("\n");
  const campaign=project.campaign;

  const prompt=`
You are creating a paid-social creative pack for a UK planning communications consultancy.

PROJECT
Scheme: ${project.schemeName}
Client: ${project.clientName}
Location: ${project.location??"Not specified"}
Planning reference: ${project.applicationReference}
Project type: ${campaign?.projectType??"other"}
Destination URL: ${campaign?.destinationUrl??"Not specified"}
Target area: ${campaign?.targetArea??project.location??"Local area"}
Additional audience notes: ${campaign?.audienceNotes??"None"}

APPROVED FACTS / CAMPAIGN MESSAGES
${facts}

TASK
Create four distinct factual Meta ad concepts. Each concept should focus on a different approved fact or overall project angle. Keep wording concise, natural and suitable for Facebook/Instagram. Do not invent statistics, commitments, benefits, endorsements, local sentiment or planning outcomes. Do not imply that a person supports the scheme. Do not attack opponents. Do not use partisan or ideological language.

TARGETING
Recommend a broad local starting audience, not personalised political persuasion. Do not target or infer political affiliation, ethnicity, religion, health, sexuality, trade union status, income vulnerability or other sensitive traits. Prefer geography, broad adult audience settings and contextual/project-relevant interests only where appropriate and permitted. State that actual performance should be tested in the ad account and that Meta category requirements must be checked before launch.

CREATIVE
Images must look like polished, credible UK planning/public-affairs campaign creative. Avoid fake people giving endorsements. Avoid fabricated site photography. If the project facts do not include a real visual, prefer atmospheric/contextual imagery, landscape, infrastructure, energy, homes, employment or community imagery appropriate to the project type. Keep any requested on-image wording extremely short and derived only from approved facts. Leave safe space for cropping to 4:5, 1:1 and 9:16.

Return ONLY valid JSON with this exact shape:
{
  "strategy": {
    "recommendedObjective": "string",
    "creativeApproach": "string",
    "testingApproach": "string"
  },
  "targeting": {
    "geography": "string",
    "age": "string",
    "gender": "string",
    "audience": "string",
    "placements": "string",
    "optimisation": "string",
    "exclusions": "string",
    "compliance": "string"
  },
  "ads": [
    {
      "id": "ad-1",
      "name": "string",
      "angle": "string",
      "primaryText": "string",
      "headline": "string",
      "description": "string",
      "cta": "Learn More",
      "recommendedPlacement": "string",
      "imageBrief": "string",
      "imagePrompt": "string"
    }
  ]
}
`;

  const {text}=await generateText({
    model:"openai/gpt-5.6",
    prompt
  });

  try{
    return NextResponse.json(extractJson(text));
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Could not generate campaign pack."},{status:502});
  }
}
