import React from 'react'
import { Body, Button, Container, Head, Heading, Hr, Html, Preview, Text } from '@react-email/components'

export const ADDRESS = 'ZADIASSURE · Kortrijkstraat 145, 8560 Wevelgem · BE 0783.444.650'

export function ClientLayout({ lang, preview, title, children, cta }: { lang: string; preview: string; title: string; children: React.ReactNode; cta?: { href: string; label: string } }) {
  return (
    <Html lang={lang === 'fr' ? 'fr' : 'nl'} dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>ZADIASSURE</Text>
          <Heading style={h1}>{title}</Heading>
          {children}
          {cta && (
            <Button href={cta.href} style={button}>
              {cta.label}
            </Button>
          )}
          <Hr style={hr} />
          <Text style={small}>{ADDRESS}</Text>
        </Container>
      </Body>
    </Html>
  )
}
export const text = { fontSize: '15px', lineHeight: '24px', color: '#1d1d1f', margin: '0 0 14px' }
const main = { backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brand = { fontSize: '13px', fontWeight: 700, letterSpacing: '0.08em', color: '#0B1B33', margin: '0 0 24px' }
const h1 = { fontSize: '22px', fontWeight: 600, color: '#0B1B33', margin: '0 0 18px' }
const button = { backgroundColor: '#0B1B33', color: '#ffffff', borderRadius: '10px', padding: '12px 20px', fontSize: '15px', fontWeight: 600, textDecoration: 'none', margin: '8px 0 20px' }
const hr = { borderColor: '#e5e5ea', margin: '24px 0 12px' }
const small = { fontSize: '12px', color: '#6e6e73', margin: 0 }
