import type { ProjectConfig } from "./types";

export const castleHillsSolar: ProjectConfig = {
  id:"castle-hills-solar",
  slug:"castle-hills-solar",
  clientName:"TotalEnergies",
  dataController:"TotalEnergies",
  dataProcessor:"DevComms",
  schemeName:"Castle Hills Solar Farm",
  location:"Solihull",
  pitch:"Share your own reasons for supporting the Castle Hills Solar Farm planning application.",
  applicationReference:"PL/2025/01404/PPFL",
  planningAuthority:{name:"Solihull Metropolitan Borough Council",to:["planning@solihull.gov.uk"],cc:[]},
  theme:{primary:"#006f78",primaryDark:"#083f47",accent:"#e9b83f",background:"#f5f8f6"},
  benefits:[
    {id:"clean-energy",label:"Enough clean electricity for around 14,000 homes in the West Midlands",phrasings:[
      "I support the amount of clean electricity the scheme could generate, equivalent to the annual needs of around 14,000 homes in the West Midlands.",
      "For me, a key benefit is the renewable electricity Castle Hills could produce, enough for roughly 14,000 homes in the West Midlands.",
      "I welcome the contribution the solar farm could make to local renewable energy, with generation equivalent to around 14,000 homes.",
      "The scale of clean power proposed is one of the main reasons I support the application, with output equivalent to about 14,000 homes."
    ]},
    {id:"biodiversity",label:"Significant biodiversity gains, including new planting, habitat creation and screening",phrasings:[
      "I also welcome the proposed biodiversity improvements, including new planting and habitat creation, with the updated scheme targeting a 67.25% net gain in habitat units.",
      "The biodiversity measures are important to me, particularly the new habitat, planting and long-term ecological improvements proposed across the site.",
      "I support the scheme's landscape and ecological measures, including substantial habitat enhancement and new planting around the development.",
      "Another positive aspect is the commitment to measurable biodiversity improvements alongside the renewable energy generation."
    ]},
    {id:"airport-private-wire",label:"Potential to support Birmingham Airport's decarbonisation ambitions through a private-wire arrangement",phrasings:[
      "I think the potential for locally generated renewable power to support Birmingham Airport's decarbonisation ambitions is worth pursuing.",
      "I welcome the dialogue around a possible private-wire arrangement that could help Birmingham Airport reduce its carbon impact.",
      "The possibility of supplying renewable electricity locally to Birmingham Airport is another reason I see value in the scheme.",
      "I support exploring a direct renewable-energy connection with Birmingham Airport as part of the wider move towards lower-carbon operations."
    ]},
    {id:"community-benefit",label:"A £40,000 annual Community Benefit Fund, indexed to inflation, over the project's 40-year life",phrasings:[
      "I also welcome the £40,000 annual Community Benefit Fund, indexed to inflation, which would provide a long-term source of support for local projects.",
      "The proposed Community Benefit Fund is meaningful to me, with £40,000 a year, index-linked, available to support local priorities over the project's operational life.",
      "I see the £40,000 per year Community Benefit Fund as a practical way for the project to provide a lasting local benefit alongside energy generation.",
      "The long-term Community Benefit Fund is another positive part of the proposal, particularly because the annual £40,000 contribution would be indexed to inflation."
    ]}
  ],
  reach:{
    eyebrow:"Castle Hills Solar Farm",
    headline:"Support clean energy and long-term local benefits in Solihull",
    intro:"Castle Hills Solar Farm would generate renewable electricity alongside significant biodiversity improvements and a long-term Community Benefit Fund. If you support the proposals, you can share the reasons that matter to you with Solihull Council.",
    supportCta:"Yes, I support the proposals",
    learnMoreCta:"I'd like to know more",
    learnMoreUrl:"https://castlehillssolarfarm.co.uk/",
    keyPoints:[
      "Renewable electricity equivalent to the annual needs of around 14,000 homes",
      "Significant new habitat, planting and biodiversity improvements",
      "A £40,000 annual Community Benefit Fund, indexed to inflation"
    ],
    campaigns:[
      {slug:"facebook-local",name:"Facebook – local audience",channel:"Meta",source:"facebook",medium:"paid_social",campaign:"castle-hills-facebook-local"},
      {slug:"instagram-local",name:"Instagram – local audience",channel:"Meta",source:"instagram",medium:"paid_social",campaign:"castle-hills-instagram-local"},
      {slug:"leaflet-qr",name:"Leaflet QR",channel:"Print",source:"leaflet",medium:"qr",campaign:"castle-hills-leaflet"},
      {slug:"client-website",name:"Castle Hills website",channel:"Website",source:"castle-hills-website",medium:"referral",campaign:"castle-hills-client-website"},
      {slug:"organic-social",name:"Organic social",channel:"Social",source:"organic-social",medium:"social",campaign:"castle-hills-organic"}
    ]
  },
  letter:{
    salutations:["Dear Planning Officer,","Dear Development Management Team,"],
    openings:[
      "I am writing to express my support for Castle Hills Solar Farm, planning application PL/2025/01404/PPFL.",
      "I would like to register my support for the Castle Hills Solar Farm application, reference PL/2025/01404/PPFL.",
      "Please accept this as my representation in support of Castle Hills Solar Farm, application PL/2025/01404/PPFL."
    ],
    closings:[
      "I hope these points are taken into account when the application is determined.",
      "I would be grateful if my comments could be considered as part of the Council's assessment of the application.",
      "Please include these comments among the representations considered when the application is determined."
    ],
    subject:"Support for Castle Hills Solar Farm – PL/2025/01404/PPFL",
    transparencyLine:"I used an online drafting tool to help prepare this representation; the selections and comments above reflect my own views."
  },
  retentionMonths:18,
  privacy:{coreLawfulBasis:"legitimate interests",legitimateInterest:"operating the representation tool, understanding community views on the planning application, preventing abuse and preparing aggregated project reporting"},
  keepUpdatedLabel:"Keep me updated about Castle Hills Solar Farm by email",
  embedOrigins:["https://castlehillssolarfarm.co.uk","https://www.castlehillssolarfarm.co.uk"]
};
