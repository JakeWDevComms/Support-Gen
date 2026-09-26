import { generateImage } from "ai";
import { NextResponse } from "next/server";
import { getProject } from "@/lib/projects";

export async function POST(request:Request,{params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)return NextResponse.json({error:"Unknown project"},{status:404});

  const body=await request.json() as {prompt?:string};
  if(!body.prompt?.trim())return NextResponse.json({error:"Missing image prompt."},{status:400});

  const brand=`Brand palette: primary ${project.theme.primary}, dark ${project.theme.primaryDark}, accent ${project.theme.accent}. `;
  const prompt=`${brand}${body.prompt.trim()} Create a polished UK planning/public-affairs paid social image. No fabricated endorsements or fake quotes. Do not invent a real site photograph if one has not been provided. Keep the main visual subject in the central safe area. Avoid dense text; if text is necessary, keep it to one short factual phrase based only on the approved project facts.`;

  try{
    const {image}=await generateImage({
      model:"openai/gpt-image-2.5-flare",
      prompt,
      aspectRatio:"4:5"
    });

    if(!image)return NextResponse.json({error:"No image was returned."},{status:502});
    const mediaType=image.mediaType||"image/png";
    return NextResponse.json({image:`data:${mediaType};base64,${image.base64}`});
  }catch(error){
    return NextResponse.json({error:error instanceof Error?error.message:"Image generation failed."},{status:502});
  }
}
