import type { ProjectConfig } from "@/projects/types";

export type LetterInput={name:string;address:string;postcode:string;benefitIds:string[];comment?:string};

function hash(input:string){
  let value=2166136261;
  for(let i=0;i<input.length;i+=1){
    value^=input.charCodeAt(i);
    value=Math.imul(value,16777619);
  }
  return Math.abs(value>>>0);
}

const indexFor=(length:number,seed:string)=>hash(seed)%length;
const choose=<T,>(items:T[],seed:string)=>items[indexFor(items.length,seed)];
const identityFor=(input:Pick<LetterInput,"name"|"postcode">)=>`${input.name.trim().toLowerCase()}|${input.postcode.trim().toUpperCase()}`;

function seededOrder<T>(items:T[],seed:string){
  return [...items]
    .map((item,index)=>({item,score:hash(`${seed}|${index}`)}))
    .sort((a,b)=>a.score-b.score)
    .map(entry=>entry.item);
}

export function getPhrasingSelections(project:ProjectConfig,input:Pick<LetterInput,"name"|"postcode"|"benefitIds">){
  const identity=identityFor(input);
  return Object.fromEntries(
    input.benefitIds
      .map(id=>project.benefits.find(b=>b.id===id))
      .filter((b):b is NonNullable<typeof b>=>Boolean(b))
      .map(b=>[b.id,indexFor(b.phrasings.length,`${identity}|${b.id}`)])
  );
}

export function generateLetter(project:ProjectConfig,input:LetterInput){
  const identity=identityFor(input);
  const selected=input.benefitIds
    .map(id=>project.benefits.find(b=>b.id===id))
    .filter((b):b is NonNullable<typeof b>=>Boolean(b));

  const ordered=seededOrder(selected,`${identity}|paragraph-order|${input.benefitIds.join("|")}`);
  const transitions=project.letter.transitions??[];

  const reasonParagraphs=ordered.map((benefit,index)=>{
    const sentence=choose(benefit.phrasings,`${identity}|${benefit.id}`);
    if(index===0||transitions.length===0)return sentence;
    const transition=choose(transitions,`${identity}|transition|${benefit.id}|${index}`);
    return `${transition}\n\n${sentence}`;
  });

  const parts=[
    choose(project.letter.salutations,`${identity}|salutation`),
    "",
    choose(project.letter.openings,`${identity}|opening`),
    ""
  ];

  if(input.comment?.trim() && indexFor(2,`${identity}|comment-position`)===0){
    parts.push(input.comment.trim(),"");
  }

  if(reasonParagraphs.length)parts.push(reasonParagraphs.join("\n\n"),"");

  if(input.comment?.trim() && indexFor(2,`${identity}|comment-position`)===1){
    parts.push(input.comment.trim(),"");
  }

  parts.push(choose(project.letter.closings,`${identity}|closing`),"");
  parts.push("Yours faithfully,","",input.name.trim(),input.address.trim(),input.postcode.trim().toUpperCase());

  return parts.join("\n");
}
