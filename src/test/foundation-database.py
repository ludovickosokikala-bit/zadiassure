"""Run after `lovable auth-session --json --self`; tests real database rules as active staff."""
import asyncio
from playwright.async_api import async_playwright
from lovable_playwright_defaults import signed_in_context
async def main():
 async with async_playwright() as p:
  browser=await p.chromium.launch(headless=True)
  context=await signed_in_context(browser)
  page=await context.new_page()
  await page.goto('http://localhost:8080/crm',wait_until='networkidle')
  result=await page.evaluate('''async () => {
   const {supabase:db}=await import('/src/integrations/supabase/client.ts');
   const {data:{user}}=await db.auth.getUser();
   const {data:member}=await db.from('org_members').select('organization_id,foundation_role').eq('user_id',user.id).single();
   if(member.foundation_role !== 'admin') throw Error('Current member must remain admin');
   const org=member.organization_id;
   const {data:person,error}=await db.from('crm_clients').insert({organization_id:org,type:'person',first_name:'PhaseOneDB',last_name:'Verification'}).select('*').single();
   if(error)throw Error('Client insert failed');
   const checks=[];
   if(!/^K-\\d{4,}$/.test(person.number))throw Error('Invalid client number'); checks.push('database client number');
   const mutation=await db.from('crm_clients').update({number:'K-999999'}).eq('id',person.id);if(!mutation.error)throw Error('Client number was mutable');checks.push('immutable client number');
   const all=[];
   for(const service of ['IMM','ADM','BUD']){
    const responses=await Promise.all(Array.from({length:8},(_,i)=>db.from('crm_dossiers').insert({organization_id:org,client_id:person.id,service,title:'Phase 1 numbering verification '+i}).select('id,number,service').single()));
    if(responses.some(r=>r.error))throw Error('Concurrent dossier insert failed');
    const rows=responses.map(r=>r.data);const year=new Date().getFullYear();
    if(new Set(rows.map(r=>r.number)).size!==8||rows.some(r=>!r.number.startsWith(service+'-'+year+'-')))throw Error('Concurrent service/year numbering invalid');
    all.push(...rows);checks.push(service+' concurrent numbering');
   }
   const immutable=await db.from('crm_dossiers').update({number:'IMM-2026-99999'}).eq('id',all[0].id);if(!immutable.error)throw Error('Dossier number was mutable');checks.push('immutable dossier number');
   const badResponsible=await db.from('crm_dossiers').update({responsible_id:'00000000-0000-0000-0000-000000000001'}).eq('id',all[0].id);if(!badResponsible.error)throw Error('Non-staff responsible accepted');checks.push('responsible must be active staff');
   const firstNumber=person.number;
   const second=await db.from('crm_clients').insert({organization_id:org,type:'person',first_name:'PhaseOneDB',last_name:'NextNumber'}).select('id,number').single();
   if(second.error||second.data.number===firstNumber)throw Error('Client number reused');checks.push('monotonic client sequence');
   const invalidOrg=await db.from('crm_client_links').insert({organization_id:org,client_id:person.id,person_id:second.data.id,role:'partner'});if(!invalidOrg.error)throw Error('Person cannot be relationship parent');checks.push('relationship type validation');
   const {data:timeline}=await db.from('crm_timeline').select('actor_id,kind').eq('client_id',person.id);
   if(timeline.length!==25||timeline.some(t=>t.actor_id!==user.id))throw Error('Automatic timeline actor wrong');checks.push('automatic client/dossier timeline with verified actor');
   const counterRead=await db.from('crm_number_counters').select('*');if(!counterRead.error&&counterRead.data.length)throw Error('Staff can read numbering counters');
   const counterWrite=await db.from('crm_number_counters').update({value:0}).eq('service','IMM').select('*');if(!counterWrite.error&&counterWrite.data.length)throw Error('Staff can reset numbering counters');checks.push('numbering counters inaccessible to staff');
   return checks;
  }''')
  print('Database rules passed:', ', '.join(result))
  await browser.close()
asyncio.run(main())
