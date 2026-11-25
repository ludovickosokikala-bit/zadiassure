import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { z } from 'zod';
import { clientSchema, dossierSchema } from './foundation.schemas';
const idSchema=z.object({id:z.string().uuid()});
export const getFoundation = createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
  const {loadFoundation}=await import('./foundation.server');
  return loadFoundation(context.supabase,context.userId);
});
export const saveFoundationClient=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>clientSchema.parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');
  const member=await foundationMember(context.supabase,context.userId);
  const {id,...fields}=data;
  const values={...fields,whatsapp:fields.whatsapp || fields.phone};
  const result=id? await context.supabase.from('crm_clients').update(values).eq('id',id).eq('organization_id',member.organization_id).select('id').single():await context.supabase.from('crm_clients').insert({...values,organization_id:member.organization_id}).select('id').single();
  if(result.error) throw new Error('SAVE_FAILED');
  return result.data;
});
export const saveFoundationDossier=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>dossierSchema.parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');
  const member=await foundationMember(context.supabase,context.userId);
  const {id,...fields}=data;
  const result=id?await context.supabase.from('crm_dossiers').update(fields).eq('id',id).eq('organization_id',member.organization_id).select('id').single():await context.supabase.from('crm_dossiers').insert({...fields,organization_id:member.organization_id}).select('id').single();
  if(result.error) throw new Error('SAVE_FAILED');
  return result.data;
});
export const saveFoundationLink=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({client_id:z.string().uuid(),person_id:z.string().uuid(),role:z.string().trim().min(1).max(200)}).parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');
  const member=await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.from('crm_client_links').upsert({...data,organization_id:member.organization_id},{onConflict:'client_id,person_id'});
  if(error) throw new Error('SAVE_FAILED'); return {ok:true};
});
export const removeFoundationLink=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>idSchema.parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server'); const member=await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.from('crm_client_links').delete().eq('id',data.id).eq('organization_id',member.organization_id);
  if(error) throw new Error('SAVE_FAILED');return {ok:true};
});
export const addFoundationEntry=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({client_id:z.string().uuid(),dossier_id:z.string().uuid().nullable().default(null),kind:z.enum(['note','contact']),body:z.string().trim().max(20000).default(''),action:z.enum(['phone','email','whatsapp']).optional()}).superRefine((v,c)=>{if(v.kind==='note'&&!v.body)c.addIssue({code:'custom',message:'Note required'});if(v.kind==='contact'&&!v.action)c.addIssue({code:'custom',message:'Action required'});}).parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');const member=await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.from('crm_timeline').insert({organization_id:member.organization_id,client_id:data.client_id,dossier_id:data.dossier_id,kind:data.kind,body:data.body,detail:data.action?{action:data.action}:{},actor_id:context.userId});
  if(error)throw new Error('SAVE_FAILED');return {ok:true};
});
export const recordFoundationAccess=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>idSchema.parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');const member=await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.from('crm_access_log').insert({organization_id:member.organization_id,client_id:data.id,user_id:context.userId});
  if(error)throw new Error('ACCESS_LOG_FAILED');return {ok:true};
});
export const saveFoundationPreferences=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({language:z.enum(['nl','fr']),theme:z.enum(['system','light','dark'])}).parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');const member=await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.from('crm_preferences').upsert({...data,user_id:context.userId,organization_id:member.organization_id});
  if(error)throw new Error('SAVE_FAILED');return {ok:true};
});
export const saveFoundationProfile=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator((v:unknown)=>z.object({name:z.string().trim().min(1).max(200)}).parse(v)).handler(async({data,context})=>{
  const {foundationMember}=await import('./foundation.server');await foundationMember(context.supabase,context.userId);
  const {error}=await context.supabase.rpc('foundation_update_profile',{new_name:data.name});
  if(error)throw new Error('SAVE_FAILED');return {ok:true};
});
