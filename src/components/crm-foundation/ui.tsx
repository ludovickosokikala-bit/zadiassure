import { cloneElement, isValidElement, useId, type ReactNode, type ReactElement } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog,DialogContent,DialogTitle,DialogDescription,DialogHeader } from '@/components/ui/dialog';
import { useFoundation } from './context';
export function PageTitle({title,subtitle,action}:{title:string;subtitle?:string;action?:ReactNode}){return <header className="crm-page-title"><div className="min-w-0"><h1>{title}</h1>{subtitle&&<p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}</div>{action}</header>;}
export function EmptyState({text,icon,action}:{text:string;icon?:ReactNode;action?:ReactNode}){return <div className="crm-empty">{icon}<p>{text}</p>{action}</div>;}
export function Field({label,children}:{label:string;children:ReactNode}){const id=useId();return <div className="crm-field"><span id={id}>{label}</span>{isValidElement(children)?cloneElement(children as ReactElement<{'aria-labelledby'?:string}>,{'aria-labelledby':id}):children}</div>;}
export function Status({value}:{value:string}){const {c}=useFoundation();return <span className={`crm-status crm-status-${value}`}>{c.statuses[value as keyof typeof c.statuses]??value}</span>;}
export function CrmModal({title,open,onClose,children}:{title:string;open:boolean;onClose:()=>void;children:ReactNode}){const {resolvedTheme,c}=useFoundation();return <Dialog open={open} onOpenChange={(v)=>{if(!v)onClose();}}><DialogContent className="crm-app crm-modal" data-theme={resolvedTheme}><DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription className="sr-only">{title}</DialogDescription></DialogHeader>{children}<span className="sr-only">{c.close}</span></DialogContent></Dialog>;}
export function FoundationError(){const router=useRouter();return <div className="p-8" role="alert"><p>CRM — Laden mislukt / Chargement impossible</p><Button onClick={()=>void router.invalidate()}>Opnieuw / Réessayer</Button></div>;}
export function FoundationNotFound(){return <div className="p-8">CRM — Niet gevonden / Introuvable</div>;}
