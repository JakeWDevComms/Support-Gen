import { eq } from "drizzle-orm";
import { castleHillsSolar } from "@/projects/castle-hills-solar";
import { exampleProject } from "@/projects/example-project";
import type { ProjectConfig } from "@/projects/types";

const seededProjects:ProjectConfig[]=[castleHillsSolar,exampleProject];

export const getSeededProject=(slug:string)=>seededProjects.find(project=>project.slug===slug);
export const getSeededProjects=()=>seededProjects;

export async function getProject(slug:string):Promise<ProjectConfig|undefined>{
  if(process.env.DATABASE_URL){
    try{
      const { getDb }=await import("@/lib/db");
      const { projectConfigs }=await import("@/lib/db/schema");
      const [row]=await getDb().select({config:projectConfigs.config}).from(projectConfigs).where(eq(projectConfigs.slug,slug)).limit(1);
      if(row?.config)return row.config;
    }catch(error){
      console.error("Failed to load project config from database",error);
    }
  }
  return getSeededProject(slug);
}

export async function getProjects():Promise<Array<{config:ProjectConfig;source:"database"|"seeded";status:string}>>{
  const results=new Map<string,{config:ProjectConfig;source:"database"|"seeded";status:string}>();
  for(const project of seededProjects){
    if(project.slug==="example-project")continue;
    results.set(project.slug,{config:project,source:"seeded",status:"live"});
  }

  if(process.env.DATABASE_URL){
    try{
      const { getDb }=await import("@/lib/db");
      const { projectConfigs }=await import("@/lib/db/schema");
      const rows=await getDb().select({config:projectConfigs.config,status:projectConfigs.status}).from(projectConfigs);
      for(const row of rows)results.set(row.config.slug,{config:row.config,source:"database",status:row.status});
    }catch(error){
      console.error("Failed to list database projects",error);
    }
  }

  return [...results.values()].sort((a,b)=>a.config.schemeName.localeCompare(b.config.schemeName));
}
