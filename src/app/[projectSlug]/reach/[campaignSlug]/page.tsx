import { notFound } from "next/navigation";
import { ProjectShell } from "@/components/project-shell";
import { ReachLanding } from "@/components/reach-landing";
import { getProject } from "@/lib/projects";

export default async function ReachCampaignPage({params}:{params:Promise<{projectSlug:string;campaignSlug:string}>}){
  const {projectSlug,campaignSlug}=await params,project=getProject(projectSlug);
  if(!project?.reach)notFound();
  const campaign=project.reach.campaigns.find(item=>item.slug===campaignSlug);
  if(!campaign)notFound();

  const query=new URLSearchParams({
    utm_source:campaign.source,
    utm_medium:campaign.medium,
    utm_campaign:campaign.campaign,
    reach_campaign:campaign.slug
  });
  if(campaign.content)query.set("utm_content",campaign.content);

  return <ProjectShell project={project}><ReachLanding project={project} campaign={campaign} toolHref={`/${project.slug}?${query.toString()}`}/></ProjectShell>;
}
