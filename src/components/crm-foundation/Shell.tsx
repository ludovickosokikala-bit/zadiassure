import { useEffect, useState, type ReactNode } from 'react';
import { Link,useNavigate,useRouterState } from '@tanstack/react-router';
import { useQueryClient,useSuspenseQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { CalendarDays, Inbox, LayoutGrid, Users, Search, Settings, LogOut, ChevronDown, Monitor, Sun, Moon, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu,DropdownMenuTrigger,DropdownMenuContent,DropdownMenuItem,DropdownMenuLabel,DropdownMenuSeparator,DropdownMenuRadioGroup,DropdownMenuRadioItem } from '@/components/ui/dropdown-menu';
import { LogoMark } from '@/components/brand/Logo';
import { supabase } from '@/integrations/supabase/client';
import { saveFoundationPreferences } from '@/lib/foundation.functions';
import { displayClient } from '@/lib/foundation.schemas';
import { foundationQuery } from './data';
import { CrmProvider,useFoundation,type Theme } from './context';
import { crmDictionary,type CrmLanguage } from './dictionary';
import { CrmModal } from './ui';
import './crm.css';
const nav=[{to:'/crm',key:'today',icon:LayoutGrid},{to:'/crm/clients',key:'clients',icon:Users},{to:'/crm/agenda',key:'agenda',icon:CalendarDays},{to:'/crm/inbox',key:'inbox',icon:Inbox}] as const;
export function FoundationShell({children}:{children:ReactNode}){
 const {data}=useSuspenseQuery(foundationQuery());const queryClient=useQueryClient();const save=useServerFn(saveFoundationPreferences);
 const [language,setLanguage]=useState<CrmLanguage>(data.preferences.language==='fr'?'fr':'nl');
 const [theme,setTheme]=useState<Theme>(data.preferences.theme==='dark'?'dark':data.preferences.theme==='light'?'light':'system');
 const [systemDark,setSystemDark]=useState(false);
 useEffect(()=>{setLanguage(data.preferences.language==='fr'?'fr':'nl');setTheme(data.preferences.theme==='dark'?'dark':data.preferences.theme==='light'?'light':'system');},[data.preferences.language,data.preferences.theme,data.member?.user_id]);
 useEffect(()=>{const media=window.matchMedia('(prefers-color-scheme: dark)');setSystemDark(media.matches);const onChange=()=>setSystemDark(media.matches);media.addEventListener('change',onChange);return()=>media.removeEventListener('change',onChange);},[]);
 const resolvedTheme=theme==='system'?(systemDark?'dark':'light'):theme;
 const c=crmDictionary[language];
 const refresh=async()=>{await queryClient.invalidateQueries({queryKey:['crm-foundation']});};
 const setPreferences=async(nextLanguage:CrmLanguage,nextTheme:Theme)=>{await save({data:{language:nextLanguage,theme:nextTheme}});setLanguage(nextLanguage);setTheme(nextTheme);await refresh();};
 return <CrmProvider value={{data,c,language,theme,resolvedTheme,setPreferences,refresh}}><div className="crm-app crm-layout" data-theme={resolvedTheme} lang={language}>{data.member?<ShellInterior>{children}</ShellInterior>:<div className="crm-empty min-h-screen"><LogoMark className="h-12 w-12"/><h1 className="text-xl font-semibold">{c.noAccess}</h1><p>{c.noAccessText}</p><Button onClick={()=>void supabase.auth.signOut().then(()=>window.location.assign('/auth'))}>{c.signOut}</Button></div>}</div></CrmProvider>;
}
function ShellInterior({children}:{children:ReactNode}){
 const {data,c,resolvedTheme,language,theme,setPreferences}=useFoundation();const navigate=useNavigate();const pathname=useRouterState({select:s=>s.location.pathname});const [searchOpen,setSearchOpen]=useState(false);const [preferenceError,setPreferenceError]=useState(false);
 useEffect(()=>{function key(e:KeyboardEvent){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setSearchOpen(v=>!v);}}window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 const member=data.member;if(!member)return null;
 const name=member.full_name||member.email;const initials=name.split(/\s+/).slice(0,2).map(n=>n[0]).join('').toUpperCase();
 const prefs=(lang:CrmLanguage,nextTheme:Theme)=>{setPreferenceError(false);void setPreferences(lang,nextTheme).catch(()=>setPreferenceError(true));};
 const links=nav.map(({to,key,icon:Icon})=><Link key={to} to={to} data-active={to==='/crm'?pathname==='/crm'||pathname==='/crm/':pathname.startsWith(to)}><Icon/><span>{c[key]}</span></Link>);
 const profile=<DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" aria-label={c.profile} className="gap-2 rounded-full p-1"><span className="crm-avatar">{initials}</span><ChevronDown className="text-muted-foreground"/></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="crm-app crm-menu" data-theme={resolvedTheme}><DropdownMenuLabel className="overflow-hidden"><p className="truncate">{name}</p><p className="mt-1 truncate text-xs font-normal text-muted-foreground">{member.foundation_role==='admin'?c.admin:c.staff} · {member.email}</p></DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem asChild><Link to="/crm/settings"><UserRound/>{c.profile} / {c.password}</Link></DropdownMenuItem>{member.foundation_role==='admin'&&<DropdownMenuItem asChild><Link to="/crm/team"><Users/>{c.team}</Link></DropdownMenuItem>}<DropdownMenuItem asChild><Link to="/crm/settings"><Settings/>{c.settings}</Link></DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuLabel>{c.language}</DropdownMenuLabel><DropdownMenuRadioGroup value={language} onValueChange={v=>prefs(v==='fr'?'fr':'nl',theme)}><DropdownMenuRadioItem value="nl">Nederlands</DropdownMenuRadioItem><DropdownMenuRadioItem value="fr">Français</DropdownMenuRadioItem></DropdownMenuRadioGroup><DropdownMenuSeparator/><DropdownMenuLabel>{c.appearance}</DropdownMenuLabel><DropdownMenuRadioGroup value={theme} onValueChange={v=>prefs(language,v==='dark'?'dark':v==='light'?'light':'system')}><DropdownMenuRadioItem value="system"><Monitor className="mr-2 size-4"/>{c.system}</DropdownMenuRadioItem><DropdownMenuRadioItem value="light"><Sun className="mr-2 size-4"/>{c.light}</DropdownMenuRadioItem><DropdownMenuRadioItem value="dark"><Moon className="mr-2 size-4"/>{c.dark}</DropdownMenuRadioItem></DropdownMenuRadioGroup><DropdownMenuSeparator/><DropdownMenuItem onSelect={()=>void supabase.auth.signOut().then(()=>{void navigate({to:'/auth'});})}><LogOut/>{c.signOut}</DropdownMenuItem></DropdownMenuContent></DropdownMenu>;
 return <><aside className="crm-sidebar"><Link to="/crm" className="crm-brand"><LogoMark className="h-8 w-8"/><span>ZADIASSURE <span className="text-xs font-normal text-muted-foreground">CRM</span></span></Link><nav className="crm-nav">{links}</nav><div className="mt-auto flex items-center gap-3 border-t border-border px-3 pt-5"><span className="crm-avatar">{initials}</span><div className="min-w-0"><p className="truncate text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{member.foundation_role==='admin'?c.admin:c.staff}</p></div></div></aside><div className="crm-content"><header className="crm-topbar"><Button variant="ghost" className="crm-topbar-search justify-start px-0 hover:bg-transparent" onClick={()=>setSearchOpen(true)} aria-label={c.globalSearch}><Search/><span className="hidden sm:inline">{c.search}</span></Button><div className="flex items-center gap-3">{preferenceError&&<p role="alert" className="text-xs text-destructive">{c.failed}</p>}{profile}</div></header><main className="crm-main">{children}</main></div><nav className="crm-bottom-tabs">{links}</nav><SearchPalette open={searchOpen} onClose={()=>setSearchOpen(false)}/></>;
}
function SearchPalette({open,onClose}:{open:boolean;onClose:()=>void}){
 const {data,c}=useFoundation();const [query,setQuery]=useState('');useEffect(()=>{if(open)setQuery('');},[open]);
 const q=query.trim().toLocaleLowerCase();
 const clients=q?data.clients.filter(v=>[displayClient(v),v.number,v.phone,v.email].join(' ').toLocaleLowerCase().includes(q)).slice(0,20):[];
 const dossiers=q?data.dossiers.filter(v=>[v.number,v.title].join(' ').toLocaleLowerCase().includes(q)).slice(0,20):[];
 return <CrmModal open={open} onClose={onClose} title={c.globalSearch}><Input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder={c.search} aria-label={c.search}/><div className="max-h-[55dvh] overflow-y-auto">{q&&clients.length+dossiers.length===0&&<p className="p-6 text-center text-muted-foreground">{c.noResults}</p>}{clients.length>0&&<h2 className="mb-2 mt-3 text-xs font-semibold text-muted-foreground">{c.clients}</h2>}{clients.map(v=><Link key={v.id} to="/crm/clients/$id" params={{id:v.id}} className="crm-search-result" onClick={onClose}>{displayClient(v)}<small>{v.number} · {v.email||v.phone||c.types[v.type as keyof typeof c.types]}</small></Link>)}{dossiers.length>0&&<h2 className="mb-2 mt-3 text-xs font-semibold text-muted-foreground">{c.dossiers}</h2>}{dossiers.map(v=><Link key={v.id} to="/crm/cases/$id" params={{id:v.id}} className="crm-search-result" onClick={onClose}>{v.title}<small>{v.number}</small></Link>)}</div></CrmModal>;
}
