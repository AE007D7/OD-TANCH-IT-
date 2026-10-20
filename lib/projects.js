import {timingSafeEqual} from 'node:crypto';
const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
const owner=(request,env)=>{const expected=env.ADMIN_ACCESS_CODE;if(!expected||expected.length<24)return false;const actual=request.headers.get('authorization')?.replace(/^Bearer /,'')||'';const a=Buffer.from(actual),b=Buffer.from(expected);return a.length===b.length&&timingSafeEqual(a,b)};
const clean=(value,max)=>String(value||'').trim().slice(0,max);
export async function api(request,env){
 const url=new URL(request.url),path=url.pathname;
 if(!env.BUCKET)return json({error:'Le stockage de projets est indisponible.'},503);
 if(path==='/api/projects'&&request.method==='GET'){
  const listing=await env.BUCKET.list({prefix:'projects/',limit:100});
  const records=await Promise.all(listing.objects.map(async obj=>{try{const o=await env.BUCKET.get(obj.key);return o?await o.json():null}catch{return null}}));
  return json({projects:records.filter(Boolean).sort((a,b)=>b.created.localeCompare(a.created)),canPublish:owner(request,env)});
 }
 if(path.startsWith('/media/')&&request.method==='GET'){
  const id=path.slice(7);if(!/^[a-f0-9-]{36}$/.test(id))return new Response('Introuvable',{status:404});
  const file=await env.BUCKET.get('photos/'+id);if(!file)return new Response('Introuvable',{status:404});
  return new Response(file.body,{headers:{'content-type':file.httpMetadata?.contentType||'image/jpeg','cache-control':'public,max-age=86400','x-content-type-options':'nosniff'}});
 }
 if(request.method!=='POST'&&request.method!=='DELETE')return json({error:'Méthode non autorisée.'},405);
 if(!owner(request,env))return json({error:'Activez votre accès administrateur pour publier.'},403);
 if(request.headers.get('origin')!==url.origin)return json({error:'Origine de la requête non autorisée.'},403);
 if(path==='/api/projects'&&request.method==='POST'){
  if(Number(request.headers.get('content-length')||0)>6*1024*1024)return json({error:'Fichier trop volumineux.'},413);
  let data;try{data=await request.formData()}catch{return json({error:'Formulaire invalide.'},400)}
  const title=clean(data.get('title'),100),description=clean(data.get('description'),3000),category=data.get('category'),file=data.get('photo');
  if(!title||!description||!['etancheite','couverture','bardage'].includes(category)||data.get('rights')!=='on')return json({error:'Complétez les champs obligatoires et les droits de publication.'},400);
  if(!file||typeof file==='string'||!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024||file.size<12)return json({error:'Photo JPG, PNG ou WebP requise, de 5 Mo maximum.'},400);
  const bytes=new Uint8Array(await file.arrayBuffer());const magic=file.type==='image/jpeg'?bytes[0]===255&&bytes[1]===216:file.type==='image/png'?bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71:String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
  if(!magic)return json({error:'Le contenu de la photo ne correspond pas au format annoncé.'},400);
  const id=crypto.randomUUID();const date=clean(data.get('date'),10);const area=Number(data.get('area'))||null;
  const project={id,title,description,category,city:clean(data.get('city'),80),date:/^\d{4}-\d{2}-\d{2}$/.test(date)?date:null,area:area&&area>0&&area<=1000000?area:null,illustrative:data.get('illustrative')==='true',image:'/media/'+id,created:new Date().toISOString()};
  await env.BUCKET.put('photos/'+id,bytes,{httpMetadata:{contentType:file.type}});
  try{await env.BUCKET.put('projects/'+id,JSON.stringify(project),{httpMetadata:{contentType:'application/json'}})}catch(err){await env.BUCKET.delete('photos/'+id);throw err}
  return json({project},201);
 }
 if(path.startsWith('/api/projects/')&&request.method==='DELETE'){
  const id=path.slice('/api/projects/'.length);if(!/^[a-f0-9-]{36}$/.test(id))return json({error:'Projet invalide.'},400);
  await env.BUCKET.delete(['projects/'+id,'photos/'+id]);return json({success:true});
 }
 return json({error:'Route introuvable.'},404);
}
