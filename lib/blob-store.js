import {put,get,list,del} from '@vercel/blob';
export const bucket={
 async put(key,value,opts={}){return put(key,value,{access:'private',addRandomSuffix:false,contentType:opts.httpMetadata?.contentType||'application/octet-stream'});},
 async get(key){const result=await get(key,{access:'private',useCache:false});if(!result||result.statusCode!==200)return null;return {body:result.stream,httpMetadata:{contentType:result.blob.contentType},json:async()=>new Response(result.stream).json()};},
 async list({prefix,limit}){const {blobs}=await list({prefix,limit});return {objects:blobs.map(x=>({key:x.pathname}))};},
 async delete(keys){await del(keys);}
};
