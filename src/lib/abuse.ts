import { createHmac } from "node:crypto";
export function secureHash(value:string){const secret=process.env.AUTH_SECRET;if(!secret)throw new Error("AUTH_SECRET is not configured");return createHmac("sha256",secret).update(value).digest("hex");}
export function getClientIp(headers:Headers){return headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim()||headers.get("x-forwarded-for")?.split(",")[0]?.trim()||headers.get("x-real-ip")||"unknown";}
