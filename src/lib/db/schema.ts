import { boolean,index,jsonb,pgTable,text,timestamp,uniqueIndex,uuid } from "drizzle-orm/pg-core";
import type { ProjectConfig } from "@/projects/types";

export const submissions=pgTable("submissions",{
  id:uuid("id").defaultRandom().primaryKey(),
  createdAt:timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
  projectId:text("project_id").notNull(),
  action:text("action").notNull(),
  name:text("name").notNull(),
  email:text("email").notNull(),
  address:text("address").notNull(),
  postcode:text("postcode").notNull(),
  postcodeDistrict:text("postcode_district").notNull(),
  benefitIds:jsonb("benefit_ids").$type<string[]>().notNull(),
  chosenPhrasingIds:jsonb("chosen_phrasing_ids").$type<Record<string,number>>().notNull(),
  commentLeft:boolean("comment_left").default(false).notNull(),
  marketingOptIn:boolean("marketing_opt_in").default(false).notNull(),
  privacyConsentAt:timestamp("privacy_consent_at",{withTimezone:true}).notNull(),
  utmSource:text("utm_source"),utmMedium:text("utm_medium"),utmCampaign:text("utm_campaign"),utmContent:text("utm_content"),utmTerm:text("utm_term"),referrer:text("referrer"),
  ipHash:text("ip_hash").notNull(),supporterFingerprint:text("supporter_fingerprint").notNull(),duplicate:boolean("duplicate").default(false).notNull()
},table=>[
  index("submissions_project_created_idx").on(table.projectId,table.createdAt),
  index("submissions_project_supporter_idx").on(table.projectId,table.supporterFingerprint),
  index("submissions_project_ip_idx").on(table.projectId,table.ipHash,table.createdAt)
]);

export const reachEvents=pgTable("reach_events",{
  id:uuid("id").defaultRandom().primaryKey(),
  createdAt:timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
  projectId:text("project_id").notNull(),
  campaignSlug:text("campaign_slug"),
  eventType:text("event_type").notNull(),
  visitorId:text("visitor_id").notNull(),
  source:text("source"),
  medium:text("medium"),
  campaign:text("campaign"),
  content:text("content"),
  term:text("term"),
  referrer:text("referrer"),
  ipHash:text("ip_hash").notNull()
},table=>[
  index("reach_events_project_created_idx").on(table.projectId,table.createdAt),
  index("reach_events_project_campaign_idx").on(table.projectId,table.campaignSlug,table.eventType),
  index("reach_events_project_visitor_idx").on(table.projectId,table.visitorId)
]);


export const projectConfigs=pgTable("project_configs",{
  id:uuid("id").defaultRandom().primaryKey(),
  createdAt:timestamp("created_at",{withTimezone:true}).defaultNow().notNull(),
  updatedAt:timestamp("updated_at",{withTimezone:true}).defaultNow().notNull(),
  slug:text("slug").notNull(),
  status:text("status").default("draft").notNull(),
  config:jsonb("config").$type<ProjectConfig>().notNull()
},table=>[
  uniqueIndex("project_configs_slug_unique").on(table.slug),
  index("project_configs_status_idx").on(table.status)
]);
