import type { Content, ContentPage, Site, Problem } from './types.js';
export type { Content, ContentPage, Site, Problem } from './types.js';
export class JournalError extends Error {
  constructor(public status: number, public problem: Problem | null) { super(problem?.detail ?? `Journal request failed (HTTP ${status}).`); }
}
export class JournalClient {
  readonly baseURL: URL;
  constructor(baseURL = 'https://home.ashwingopalsamy.in', private fetcher: typeof fetch = fetch) {
    this.baseURL = new URL(baseURL);
    if(this.baseURL.username || this.baseURL.password || this.baseURL.search || this.baseURL.hash ||
      (this.baseURL.protocol !== 'https:' && !(this.baseURL.protocol === 'http:' && ['localhost','127.0.0.1','[::1]'].includes(this.baseURL.hostname)))) throw new Error('Use an HTTPS origin, or localhost HTTP for fixture tests. No credentials or query parameters.');
  }
  private async read<T>(path:string,params:Record<string,string|number|undefined>={}):Promise<T> {
    const url=new URL(path,this.baseURL);for(const [key,value] of Object.entries(params))if(value!==undefined)url.searchParams.set(key,String(value));
    for(let attempt=0;attempt<=2;attempt++) {
      const r=await this.fetcher(url,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15_000)});
      if(r.status===429 && attempt<2){const retry=Number(r.headers.get('Retry-After')??'1');if(retry>5)throw new JournalError(r.status,await r.json().catch(()=>null));await new Promise(resolve=>setTimeout(resolve,Math.max(0,retry)*1000+Math.floor(Math.random()*200)));continue;}
      if(!r.ok)throw new JournalError(r.status,await r.json().catch(()=>null));
      if(!r.headers.get('Content-Type')?.includes('application/json'))throw new Error('Expected JSON from journal endpoint.');
      return await r.json() as T;
    }
    throw new Error('Read retry limit exceeded.');
  }
  site(){return this.read<Site>('/api/v1/site');}
  list(options:{kind?:'page'|'summary'|'cost'|'work';limit?:number;cursor?:string}={}){return this.read<ContentPage>('/api/v1/content',options);}
  search(q:string,options:{kind?:'page'|'summary'|'cost'|'work';limit?:number;cursor?:string}={}){return this.read<ContentPage>('/api/v1/search',{q,...options});}
  get(id:string){if(!/^[a-z0-9][a-z0-9-]{0,119}$/.test(id))throw new Error('Invalid public record ID.');return this.read<Content>('/api/v1/content/'+id);}
}
