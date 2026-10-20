import assert from 'node:assert/strict';import {api} from '../lib/projects.js';
const BUCKET={};const host='https://site.example';
const req=(path,method,headers={})=>new Request(host+path,{method,headers});
assert.equal((await api(req('/api/projects','POST',{origin:host}),{BUCKET,ADMIN_ACCESS_CODE:'123456789012345678901234'})).status,403);
assert.equal((await api(req('/api/projects','POST',{authorization:'Bearer 123456789012345678901234',origin:'https://other.example'}),{BUCKET,ADMIN_ACCESS_CODE:'123456789012345678901234'})).status,403);
assert.equal((await api(req('/api/projects','POST',{authorization:'Bearer 123456789012345678901234',origin:host,'content-length':'7000000'}),{BUCKET,ADMIN_ACCESS_CODE:'123456789012345678901234'})).status,413);
assert.equal((await api(req('/api/projects','GET'),{})).status,503);
assert.equal((await api(req('/media/invalid','GET'),{BUCKET,ADMIN_ACCESS_CODE:'123456789012345678901234'})).status,404);
console.log('Access, origin, size and invalid media checks passed.');
