import { NextResponse } from "next/server";
import { adminCookie } from "@/lib/auth";
export async function POST(request:Request){const response=NextResponse.redirect(new URL("/",request.url),{status:303});response.cookies.set(adminCookie.name,"",{path:"/",maxAge:0});return response;}
