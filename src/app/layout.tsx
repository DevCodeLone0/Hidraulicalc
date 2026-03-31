import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata: Metadata = {
  title: 'HIDRAULICALC. | Ingeniería Hidráulica de Precisión',
  description: 'Calculadoras de ingeniería hidráulica con diseño inmersivo. Cálculos precisos para embalses cilíndricos, canales rectangulares y tanques verticales.',
  keywords: ['hidráulica', 'calculadora', 'ingeniería', 'volumen', 'integral'],
  authors: [{ name: 'Hidraulicalc Team' }],
  openGraph: {
    title: 'HIDRAULICALC.',
    description: 'Calculadoras de ingeniería hidráulica de precisión',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
