import type { ProjectConfig } from "./types";

export const exampleProject: ProjectConfig = {
  id:"example-project",
  slug:"example-project",
  clientName:"CLIENT NAME",
  dataController:"DATA CONTROLLER NAME",
  dataProcessor:"DevComms",
  schemeName:"SCHEME NAME",
  location:"LOCATION",
  pitch:"One-line explanation of what the resident can do here.",
  applicationReference:"APPLICATION REFERENCE",
  planningAuthority:{name:"PLANNING AUTHORITY",to:["PLANNING-INBOX@example.gov.uk"],cc:["OPTIONAL-REPORTING-INBOX@example.com"]},
  theme:{primary:"#33502c",primaryDark:"#23391f",accent:"#a97323",background:"#f8f6f1"},
  benefits:[{id:"benefit-one",label:"Short resident-facing benefit statement",phrasings:[
    "First plain-English way of expressing this reason.",
    "Second genuinely different way of expressing the same factual reason.",
    "Third phrasing for this reason."
  ]}],
  letter:{
    salutations:["Dear Planning Officer,"],
    openings:["I am writing about SCHEME NAME, application APPLICATION REFERENCE."],
    closings:["Please take my comments into account when the application is determined."],
    subject:"Representation on SCHEME NAME – APPLICATION REFERENCE",
    transparencyLine:"I used an online drafting tool to help prepare this representation; the selections and comments above reflect my own views."
  },
  consultationCloses:"2027-01-31",
  retentionMonths:18,
  privacy:{coreLawfulBasis:"legitimate interests",legitimateInterest:"describe the controller's documented legitimate interest here",contactEmail:"privacy@example.com",controllerPrivacyUrl:"https://www.example.com/privacy"},
  keepUpdatedLabel:"Keep me updated about this project by email",
  embedOrigins:["https://www.example-consultation-site.co.uk"]
};
