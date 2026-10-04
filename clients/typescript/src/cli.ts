#!/usr/bin/env node
import { JournalClient, JournalError } from './client.js';
const args=process.argv.slice(2);
if(args.includes('--help')||!args.length){console.log('Agam journal client 1.0.0\nUsage: agam-journal [--base-url ORIGIN] site | search QUERY | read ID\nOutput: JSON. Exit codes: 0 success, 1 request failure, 2 invalid usage.\nPublic reads require no credentials.');process.exit(0);}
if(args.includes('--version')){console.log('1.0.0');process.exit(0);}
let baseURL=process.env.AGAM_JOURNAL_BASE_URL;
const at=args.indexOf('--base-url');if(at>=0){baseURL=args[at+1];if(!baseURL){console.error('Missing --base-url value.');process.exit(2);}args.splice(at,2);}
const [command,...rest]=args;
if(!['site','search','read'].includes(command)||(command==='site'&&rest.length)||(command!=='site'&&!rest.length)||(command==='read'&&rest.length!==1)){console.error('Use --help for supported commands.');process.exit(2);}
try{const client=new JournalClient(baseURL);const result=command==='site'?await client.site():command==='search'?await client.search(rest.join(' ')):await client.get(rest[0]);console.log(JSON.stringify(result,null,2));}
catch(error){console.error(JSON.stringify(error instanceof JournalError?{status:error.status,code:error.problem?.code,message:error.message}:{message:error instanceof Error?error.message:'Read failed'}));process.exitCode=1;}
