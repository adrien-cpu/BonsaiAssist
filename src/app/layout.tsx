/**
 * @fileOverview Composant de mise en page racine pour l'application Next.js.
 * Définit la structure HTML globale, les polices et les métadonnées.
 */

import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

// Configure la police sans-serif Geist
const geistSans = Geist({
  variable: '--font-geist-sans', // Variable CSS pour la police
  subsets: ['latin'], // Sous-ensembles de caractères à charger
});

// Configure la police mono-espacée Geist
const geistMono = Geist_Mono({
  variable: '--font-geist-mono', // Variable CSS pour la police
  subsets: ['latin'], // Sous-ensembles de caractères à charger
});

/**
 * Métadonnées de l'application.
 * @type {Metadata}
 * @description Définit le titre et la description par défaut de l'application, utilisés notamment pour le SEO.
 */
export const metadata: Metadata = {
  title: 'BonsAI Assist', // Titre mis à jour
  description: 'Votre assistant IA pour l&apos;entretien des bonsaïs', // Description mise à jour
};

/**
 * Composant de mise en page racine.
 * @param {object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Les composants enfants à afficher dans la mise en page.
 * @returns {JSX.Element} Le composant de mise en page HTML.
 * @description Enveloppe l'application entière, applique les polices globales et la classe `antialiased`.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Définit la langue du document
    <html lang="fr">
      {/* Applique les variables de police et l'antialiasing au corps du document */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children} { /* Affiche les composants enfants */}
      </body>
    </html>
  );
}
