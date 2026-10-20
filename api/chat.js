import {generateText} from 'ai';
import {guidedReply,instructions} from '../lib/chat-guidance.js';
const counters=new Map();
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'Méthode non autorisée.'});
 const origin=req.headers.origin;if(!origin||new URL(origin).host!==req.headers.host)return res.status(403).json({error:'Requête non autorisée.'});
 const ip=req.headers['x-vercel-forwarded-for']||req.socket?.remoteAddress||'unknown';const now=Date.now();if(counters.size>2000)for(const[k,v]of counters)if(v.until<now)counters.delete(k);const limit=counters.get(ip);if(limit&&limit.until>now&&limit.count>=20)return res.status(429).json({error:'Patientez un instant avant de continuer.'});counters.set(ip,{until:limit?.until>now?limit.until:now+60000,count:limit?.until>now?limit.count+1:1});
 const raw=req.body;let data;try{data=typeof raw==='string'?JSON.parse(raw):raw}catch{return res.status(400).json({error:'Message invalide.'})}
 if(!Array.isArray(data?.messages)||data.messages.length>12)return res.status(400).json({error:'Conversation invalide.'});
 const messages=data.messages.filter(m=>['user','assistant'].includes(m.role)&&typeof m.content==='string').slice(-10).map(m=>({role:m.role,content:m.content.slice(0,1000)}));const last=messages.at(-1);if(!last||last.role!=='user'||!last.content.trim())return res.status(400).json({error:'Écrivez votre question.'});
 if(!process.env.VERCEL&&!process.env.AI_GATEWAY_API_KEY&&!process.env.VERCEL_OIDC_TOKEN)return res.status(200).json({mode:'guided',text:guidedReply(last.content)});
 try{const result=await generateText({model:process.env.AI_GATEWAY_MODEL||'google/gemini-3.1-flash-lite',instructions,messages,maxOutputTokens:400,maxRetries:0,abortSignal:AbortSignal.timeout(12000)});return res.status(200).json({mode:'ai',text:result.text||guidedReply(last.content)})}catch(error){console.warn('OD_ASSISTANT_GATEWAY_ERROR',JSON.stringify({name:error?.name,status:error?.statusCode||error?.cause?.statusCode||null}));return res.status(200).json({mode:'guided',text:guidedReply(last.content)})}
}
