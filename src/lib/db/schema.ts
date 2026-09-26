import { boolean,index,jsonb,pgTable,text,timestamp,uuid } from "drizzle-orm/pg-core";
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
