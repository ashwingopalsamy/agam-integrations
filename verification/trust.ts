// Agam publisher-integrity profile 1.0.0: RFC 8785 + detached RFC 7515 JWS / ES256.
const ORIGIN = 'https://home.ashwingopalsamy.in';
export const DID='did:web:home.ashwingopalsamy.in';
const utf8=new TextEncoder();
export const base64url=(bytes:Uint8Array)=>btoa(Array.from(bytes,b=>String.fromCharCode(b)).join('')).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const unbase64=(s:string)=>Uint8Array.from(atob(s.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
export function canonicalize(value:unknown):string {
  if(value===null || typeof value==='boolean')return JSON.stringify(value);
  if(typeof value==='string') {if(/(?:[\uD800-\uDBFF](?![\uDC00-\uDFFF]))|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/u.test(value))throw new Error('Invalid Unicode');return JSON.stringify(value);}
  if(typeof value==='number'&&Number.isFinite(value))return JSON.stringify(value);
  if(Array.isArray(value))return '['+value.map(canonicalize).join(',')+']';
  if(typeof value==='object'&&value) return '{'+Object.keys(value).sort().map(k=>canonicalize(k)+':'+canonicalize((value as Record<string,unknown>)[k])).join(',')+'}';
  throw new Error('Not an I-JSON value');
}
export async function digest(bytes:string){return 'sha256:'+Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',utf8.encode(bytes))),b=>b.toString(16).padStart(2,'0')).join('');}
export type PublisherKey=JsonWebKey & {kid:string};
export function publicDocument(key:PublisherKey) {
  if(key.kty!=='EC'||key.crv!=='P-256'||!key.x||!key.y||!/^publisher-[a-zA-Z0-9-]+$/.test(key.kid))throw new Error('Invalid publisher key');
  const id=DID+'#'+key.kid;
  return {'@context':['https://www.w3.org/ns/did/v1','https://w3id.org/security/suites/jws-2020/v1'],id:DID,
    verificationMethod:[{id,type:'JsonWebKey2020',controller:DID,publicKeyJwk:{kty:'EC',crv:'P-256',x:key.x,y:key.y}}],assertionMethod:[id]};
}
export async function signCatalog(catalog:{specVersion:string;entries:Record<string,unknown>[]},secret:string,files:Record<string,{body:string}>) {
  const jwk=JSON.parse(secret) as PublisherKey;const document=publicDocument(jwk);
  if(!jwk.d)throw new Error('Signing key unavailable');
  const key=await crypto.subtle.importKey('jwk',jwk,{name:'ECDSA',namedCurve:'P-256'},false,['sign']);
  const header=base64url(utf8.encode(JSON.stringify({alg:'ES256',kid:document.verificationMethod[0].id})));
  const entries=[];
  for(const entry of catalog.entries) {
    const path=new URL(String(entry.url)).pathname;
    if(!String(entry.identifier).startsWith('urn:air:home.ashwingopalsamy.in:')||new URL(String(entry.url)).origin!==ORIGIN||!files[path])throw new Error('Invalid resource authority');
    const trustManifest={identity:DID,identityType:'did',trustSchema:{identifier:'urn:air:home.ashwingopalsamy.in:trust:publisher-integrity',version:'1.0.0',governanceUri:ORIGIN+'/trust/',verificationMethods:['did:web','RFC8785','RFC7515-ES256']},provenance:[{relation:'published-artifact',sourceId:entry.url,sourceDigest:await digest(files[path].body)}]};
    const unsigned={...entry,trustManifest};
    const signature=base64url(new Uint8Array(await crypto.subtle.sign({name:'ECDSA',hash:'SHA-256'},key,utf8.encode(header+'.'+base64url(utf8.encode(canonicalize(unsigned)))))));
    entries.push({...entry,trustManifest:{...trustManifest,signature:header+'..'+signature}});
  }
  return {...catalog,entries};
}
export async function verifyEntry(entry:Record<string,any>,document:ReturnType<typeof publicDocument>,artifact:string) {
  const trust=entry.trustManifest;
  if(!trust||trust.identity!==DID||document.id!==DID||!String(entry.identifier).startsWith('urn:air:home.ashwingopalsamy.in:')||new URL(entry.url).origin!==ORIGIN)throw new Error('Publisher authority mismatch');
  if(trust.trustSchema?.identifier!=='urn:air:home.ashwingopalsamy.in:trust:publisher-integrity'||trust.trustSchema.version!=='1.0.0'||trust.trustSchema.governanceUri!==ORIGIN+'/trust/')throw new Error('Unsupported trust profile');
  const [h,p,s]=String(trust.signature).split('.');if(p!==''||!h||!s)throw new Error('Invalid detached signature');
  const header=JSON.parse(new TextDecoder().decode(unbase64(h)));
  const method=document.verificationMethod.find(m=>m.id===header.kid);
  if(header.alg!=='ES256'||!method||method.controller!==DID||!document.assertionMethod.includes(header.kid))throw new Error('Unknown or revoked signing key');
  const {signature:_,...unsignedTrust}=trust;const unsigned={...entry,trustManifest:unsignedTrust};
  const key=await crypto.subtle.importKey('jwk',method.publicKeyJwk,{name:'ECDSA',namedCurve:'P-256'},false,['verify']);
  if(!await crypto.subtle.verify({name:'ECDSA',hash:'SHA-256'},key,unbase64(s),utf8.encode(h+'.'+base64url(utf8.encode(canonicalize(unsigned))))))throw new Error('Invalid signature');
  const provenance=trust.provenance;
  if(provenance.length!==1||provenance[0].sourceId!==entry.url||provenance[0].sourceDigest!==await digest(artifact))throw new Error('Resource digest mismatch');
  return true;
}
