import {api} from '../lib/projects.js';
import {bucket} from '../lib/blob-store.js';
export default async function handler(req,res){
 try{
  const origin='https://'+req.headers.host;const query=new URL(req.url,origin).searchParams;
  let path='/api/projects';if(query.get('media'))path='/media/'+query.get('media');else if(query.get('id'))path+='/'+query.get('id');
  const headers=new Headers();for(const [key,value]of Object.entries(req.headers))if(value)headers.set(key,Array.isArray(value)?value.join(','):value);
  let body;if(!['GET','HEAD'].includes(req.method)){const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>4*1024*1024){res.status(413).json({error:'Photo trop volumineuse après optimisation.'});return}chunks.push(chunk)}body=Buffer.concat(chunks)}
  const request=new Request(origin+path,{method:req.method,headers,...(body?.length?{body}:{})});
  const available=Boolean(process.env.BLOB_STORE_ID||process.env.BLOB_READ_WRITE_TOKEN);
  const response=await api(request,{BUCKET:available?bucket:undefined,ADMIN_ACCESS_CODE:process.env.ADMIN_ACCESS_CODE});
  res.statusCode=response.status;for(const[k,v]of response.headers)res.setHeader(k,v);res.end(Buffer.from(await response.arrayBuffer()));
 }catch{res.status(503).json({error:'Le service de publication est temporairement indisponible.'})}
}
