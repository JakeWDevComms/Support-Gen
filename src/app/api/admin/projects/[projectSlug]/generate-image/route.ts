import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

export async function POST(request:Request,{params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)return NextResponse.json({error:"Unknown project"},{status:404});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({error:"OPENAI_API_KEY is not configured yet."},{status:503});

  const body=await request.json() as {prompt?:string};
  if(!body.prompt?.trim())return NextResponse.json({error:"Missing image prompt."},{status:400});

  const brand=`Brand palette: primary ${project.theme.primary}, dark ${project.theme.primaryDark}, accent ${project.theme.accent}. `;
  const prompt=`${brand}${body.prompt.trim()} Create a polished UK planning/public-affairs paid social image. No logos unless explicitly provided. No fabricated endorsements. No fake quotes. Keep the main visual subject in the central safe area so the image can be cropped to 4:5, 1:1 and 9:16. Avoid dense text; if text is necessary, keep it to one short factual phrase.`;

  const response=await fetch("https://api.openai.com/v1/images/generations",{
    method:"POST",
    headers:{
      "authorization":`Bearer ${process.env.OPENAI_API_KEY}`,
      "content-type":"application/json"
    },
    body:JSON.stringify({
      model:"gpt-image-2",
      prompt,
      size:"1024x1536",
      quality:"medium",
      output_format:"png"
    })
  });

  const data=await response.json() as {data?:Array<{b64_json?:string}>;error?:{message?:string}};
  if(!response.ok)return NextResponse.json({error:data.error?.message??"Image generation failed."},{status:response.status});
  const b64=data.data?.[0]?.b64_json;
  if(!b64)return NextResponse.json({error:"No image was returned."},{status:502});

  return NextResponse.json({image:`data:image/png;base64,${b64}`});
}
