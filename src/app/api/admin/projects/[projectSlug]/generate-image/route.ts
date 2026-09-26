import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

export async function POST(request:Request,{params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)return NextResponse.json({error:"Unknown project"},{status:404});

  const body=await request.json() as {prompt?:string};
  if(!body.prompt?.trim())return NextResponse.json({error:"Missing image prompt."},{status:400});

  const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN;
  if(!token)return NextResponse.json({error:"Vercel AI Gateway authentication is not available."},{status:503});

  const brand=`Brand palette: primary ${project.theme.primary}, dark ${project.theme.primaryDark}, accent ${project.theme.accent}. `;
  const prompt=`${brand}${body.prompt.trim()} Create a polished UK planning/public-affairs paid social image. No fabricated endorsements or fake quotes. Do not invent a real site photograph if one has not been provided. Keep the main visual subject in the central safe area so it can be cropped cleanly. Avoid dense text; if text is necessary, keep it to one short factual phrase based only on the approved project facts.`;

  const gatewayResponse=await fetch("https://ai-gateway.vercel.sh/v1/images/generations",{
    method:"POST",
    headers:{
      "authorization":`Bearer ${token}`,
      "content-type":"application/json"
    },
    body:JSON.stringify({
      model:"openai/gpt-image-2.5-flare",
      prompt,
      size:"1024x1280",
      response_format:"b64_json"
    })
  });

  const data=await gatewayResponse.json() as {
    data?:Array<{b64_json?:string;url?:string}>;
    error?:{message?:string}
  };

  if(!gatewayResponse.ok){
    return NextResponse.json({error:data.error?.message??"Image generation failed."},{status:gatewayResponse.status});
  }

  const first=data.data?.[0];
  if(first?.b64_json)return NextResponse.json({image:`data:image/png;base64,${first.b64_json}`});
  if(first?.url)return NextResponse.json({image:first.url});
  return NextResponse.json({error:"No image was returned."},{status:502});
}
