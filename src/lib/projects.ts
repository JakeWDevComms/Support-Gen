import { castleHillsSolar } from "@/projects/castle-hills-solar";
import { exampleProject } from "@/projects/example-project";
import type { ProjectConfig } from "@/projects/types";
const projects: ProjectConfig[]=[castleHillsSolar,exampleProject];
export const getProject=(slug:string)=>projects.find(p=>p.slug===slug);
export const getProjects=()=>projects;
