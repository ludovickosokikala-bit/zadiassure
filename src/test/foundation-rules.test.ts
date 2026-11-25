// @ts-expect-error bun provides this module at test time
import { describe,expect,test } from 'bun:test';
import { CLIENT_TYPES,SERVICES,STATUSES,PRIORITIES,LANGUAGES,clientSchema,dossierSchema,isOpenDossier,whatsappHref } from '../lib/foundation.schemas';
describe('Phase 1 CRM rules',()=>{
 test('three client types',()=>expect(CLIENT_TYPES).toEqual(['person','household','company']));
 test('person requires first and last names',()=>{expect(clientSchema.safeParse({type:'person',first_name:'Jane',last_name:''}).success).toBe(false);expect(clientSchema.safeParse({type:'person',first_name:'Jane',last_name:'Doe'}).success).toBe(true);});
 test('household requires household name',()=>{expect(clientSchema.safeParse({type:'household'}).success).toBe(false);expect(clientSchema.safeParse({type:'household',household_name:'Doe'}).success).toBe(true);});
 test('company requires company name',()=>{expect(clientSchema.safeParse({type:'company'}).success).toBe(false);expect(clientSchema.safeParse({type:'company',company_name:'Acme'}).success).toBe(true);});
 test('client languages include NL FR EN and other',()=>expect(LANGUAGES).toEqual(['nl','fr','en','other']));
 test('three dossier services',()=>expect(SERVICES).toEqual(['IMM','ADM','BUD']));
 test('six dossier statuses',()=>expect(STATUSES).toEqual(['new','ongoing','waiting_client','waiting_authority','completed','archived']));
 test('three priorities',()=>expect(PRIORITIES).toEqual(['normal','high','urgent']));
 test('completed and archived dossiers excluded from open overview',()=>{expect(isOpenDossier('completed')).toBe(false);expect(isOpenDossier('archived')).toBe(false);expect(isOpenDossier('waiting_client')).toBe(true);});
 test('dossier requires a client and title',()=>{expect(dossierSchema.safeParse({service:'IMM',title:'',client_id:'invalid'}).success).toBe(false);});
 test('WhatsApp handles Belgian local and international numbers',()=>{expect(whatsappHref('0471 12 34 56')).toBe('https://wa.me/32471123456');expect(whatsappHref('+32 471 12 34 56')).toBe('https://wa.me/32471123456');expect(whatsappHref('')).toBe('');});
});
