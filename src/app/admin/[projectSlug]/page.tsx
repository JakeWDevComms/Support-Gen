import { redirect } from "next/navigation";
import { getProject } from "@/lib/projects";

export default async function ProjectAdminPage({params}:{params:Promise<{projectSlug:string}>}){
  const {projectSlug}=await params;
  const project=await getProject(projectSlug);
  if(!project)redirect("/");
  redirect(`/admin/${project.slug}/ads`);
}
