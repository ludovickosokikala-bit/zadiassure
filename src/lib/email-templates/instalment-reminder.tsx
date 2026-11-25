import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ClientLayout, text } from './client-layout'

interface Props { lang?: string; name?: string; creditor?: string; amount?: string; due?: string }
const T = {
  nl: { title: 'Herinnering afbetaling', hi: 'Beste', body: 'Binnenkort vervalt een afbetaling die u zelf rechtstreeks aan uw schuldeiser betaalt:', note: 'U betaalt de schuldeiser zelf. ZADIASSURE ontvangt geen gelden voor schuldeisers.', after: 'Laat ons gerust weten wanneer u betaald heeft, zodat wij uw opvolging kunnen bijwerken.' },
  fr: { title: 'Rappel de paiement', hi: 'Bonjour', body: 'Un paiement que vous effectuez vous-même directement à votre créancier arrive bientôt à échéance :', note: 'Vous payez vous-même le créancier. ZADIASSURE ne perçoit aucun montant destiné aux créanciers.', after: 'N’hésitez pas à nous prévenir une fois le paiement effectué, afin que nous mettions votre suivi à jour.' },
}
const Email = ({ lang = 'nl', name, creditor, amount, due }: Props) => {
  const t = lang === 'fr' ? T.fr : T.nl
  return (
    <ClientLayout lang={lang} preview={`${t.title}: ${creditor ?? ''}`} title={t.title}>
      <Text style={text}>{t.hi}{name ? ` ${name}` : ''},</Text>
      <Text style={text}>{t.body}</Text>
      <Text style={{ ...text, fontWeight: 600 }}>{creditor} · {amount} · {due}</Text>
      <Text style={text}>{t.note}</Text>
      <Text style={text}>{t.after}</Text>
    </ClientLayout>
  )
}
export const template = {
  component: Email,
  subject: (d: Record<string, any>) => d['lang'] === 'fr' ? 'Rappel : paiement à votre créancier' : 'Herinnering: afbetaling aan uw schuldeiser',
  displayName: 'Herinnering afbetaling',
  previewData: { lang: 'nl', name: 'Jan', creditor: 'Engie', amount: '50,00 €', due: '1 december 2026' },
} satisfies TemplateEntry
