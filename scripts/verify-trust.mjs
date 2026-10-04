import { verifyEntry } from '../verification/trust.ts';
const origin='https://home.ashwingopalsamy.in';
const read=async path=>{const r=await fetch(origin+path,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('HTTP '+r.status);return r.json();};
const document=await read('/.well-known/did.json'),catalog=await read('/.well-known/ard.json');
for(const entry of catalog.entries){const url=new URL(entry.url);if(url.origin!==origin||!entry.identifier.startsWith('urn:air:home.ashwingopalsamy.in:'))throw new Error('Foreign authority');const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw new Error('Artifact unavailable');await verifyEntry(entry,document,await r.text());}
console.log('Verified '+catalog.entries.length+' signed entries and exact artifact digests.');
