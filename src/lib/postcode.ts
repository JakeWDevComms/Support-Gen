const UK_POSTCODE=/^(GIR ?0AA|(?:(?:[A-PR-UWYZ][0-9][0-9A-HJKS-UW]?|[A-PR-UWYZ][A-HK-Y][0-9][0-9ABEHMNPRV-Y]?)[ ]?[0-9][ABD-HJLNP-UW-Z]{2}))$/i;
export function normalisePostcode(value:string){const raw=value.toUpperCase().replace(/\s+/g,"");if(raw.length<5)return raw;return `${raw.slice(0,-3)} ${raw.slice(-3)}`;}
export function isValidUKPostcode(value:string){return UK_POSTCODE.test(normalisePostcode(value));}
export function postcodeDistrict(value:string){return normalisePostcode(value).split(" ")[0]??normalisePostcode(value);}
