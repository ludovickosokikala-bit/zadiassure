import React from 'react'
import { Text } from '@react-email/components'
import type { TemplateEntry } from './registry'
import { ClientLayout, text } from './client-layout'

interface Props { lang?: string; name?: string; items?: string[]; link?: string; expires?: string; reminder?: boolean }
const T = {
  nl: { title: 'Documenten gevraagd', hi: 'Beste', intro: 'Om uw dossier verder op te volgen, vragen wij u de volgende documenten:', how: 'U kunt ze veilig opladen via de knop hieronder (pdf, jpg, png of heic, max. 20 MB per bestand). U hoeft niet in te loggen.', until: 'De link is geldig tot', cta: 'Documenten opladen', remind: 'Herinnering: wij hebben nog niet alle gevraagde documenten ontvangen.' },
  fr: { title: 'Documents demandés', hi: 'Bonjour', intro: 'Pour suivre votre dossier, nous vous demandons les documents suivants :', how: 'Vous pouvez les envoyer en toute sécurité via le bouton ci-dessous (pdf, jpg, png ou heic, max. 20 Mo par fichier). Aucune connexion n’est nécessaire.', until: 'Le lien est valable jusqu’au', cta: 'Envoyer les documents', remind: 'Rappel : nous n’avons pas encore reçu tous les documents demandés.' },
}
const Email = ({ lang = 'nl', name, items = [], link = '#', expires, reminder }: Props) => {
  const t = lang === 'fr' ? T.fr : T.nl
  return (
    <ClientLayout lang={lang} preview={t.title} title={t.title} cta={{ href: link, label: t.cta }}>
      <Text style={text}>{t.hi}{name ? ` ${name}` : ''},</Text>
      {reminder && <Text style={text}>{t.remind}</Text>}
      <Text style={text}>{t.intro}</Text>
      {items.map((i, n) => <Text key={n} style={{ ...text, margin: '0 0 6px' }}>• {i}</Text>)}
      <Text style={text}>{t.how}</Text>
      {expires && <Text style={text}>{t.until} {expires}.</Text>}
    </ClientLayout>
  )
}
export const template = {
  component: Email,
  subject: (d: Record<string, any>) => d['lang'] === 'fr' ? (d['reminder'] ? 'Rappel : documents demandés' : 'ZADIASSURE – documents demandés') : (d['reminder'] ? 'Herinnering: gevraagde documenten' : 'ZADIASSURE – gevraagde documenten'),
  displayName: 'Documenten opvragen',
  previewData: { lang: 'nl', name: 'Jan', items: ['Paspoort', 'Huurcontract'], link: 'https://www.zadiassure.com/documenten/voorbeeld', expires: '9 december 2026' },
} satisfies TemplateEntry
