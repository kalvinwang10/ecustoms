import type { Metadata } from 'next';
import AllIndonesiaContent from './AllIndonesiaContent';

export const metadata: Metadata = {
  title: 'All Indonesia Arrival Form — Airports & Seaports Entry Points',
  description:
    'Complete your All Indonesia Arrival Form for all entry points — Jakarta Soekarno-Hatta, Bali Ngurah Rai, Surabaya Juanda, Medan Kualanamu, and 170+ airports & seaports across 34 provinces.',
  keywords: [
    'Indonesia customs declaration',
    'all Indonesia arrival form',
    'Indonesia airport customs',
    'Indonesia seaport customs',
    'Bali customs form',
    'Jakarta customs declaration',
    'Indonesia entry points',
    'Indonesia arrival form',
  ],
  openGraph: {
    title: 'All Indonesia Arrival Form — Every Airport & Seaport',
    description:
      'Submit your All Indonesia Arrival Form for any of Indonesia\'s 35+ international airports and 140+ seaports. Fast, digital, and multilingual.',
    url: '/all-indonesia',
    siteName: 'eCustoms Indonesia',
    type: 'website',
    locale: 'en_US',
  },
  alternates: {
    canonical: '/all-indonesia',
  },
};

const faqData = [
  {
    question: 'Do I need a customs declaration for every airport in Indonesia?',
    answer:
      'Yes. Every traveler arriving in Indonesia — whether at Jakarta Soekarno-Hatta (CGK), Bali Ngurah Rai (DPS), Surabaya Juanda (SUB), or any other international entry point — must submit an All Indonesia Arrival Form before or upon arrival.',
  },
  {
    question: 'Is the customs declaration the same for airports and seaports?',
    answer:
      'Yes, the All Indonesia Arrival Form is the same regardless of whether you arrive by air or sea. The form covers personal information, travel details, and goods declaration for all entry points across Indonesia.',
  },
  {
    question: 'Can I fill out my customs declaration before arriving in Indonesia?',
    answer:
      'Yes. You can complete your All Indonesia Arrival Form online before departure. Once submitted, you will receive a QR code that customs officers can scan upon your arrival at any Indonesian airport or seaport.',
  },
  {
    question: 'What items must I declare on the Indonesian customs form?',
    answer:
      'You must declare goods exceeding the duty-free allowance (USD 500 per person), more than 200 cigarettes or 25 cigars or 100g of tobacco, more than 1 liter of alcoholic beverages, currency or negotiable instruments exceeding IDR 100 million (or equivalent), animals, plants, narcotics, firearms, and commercial goods.',
  },
  {
    question: 'How long is my customs declaration QR code valid?',
    answer:
      'Your arrival form QR code is valid for one entry into Indonesia. It should be used within a reasonable time frame of your planned arrival date. You will need to complete a new form for each separate trip into the country.',
  },
  {
    question: 'Do children and infants need their own customs declaration?',
    answer:
      'Families traveling together can submit a single customs declaration for the entire family group. Each individual adult traveler or separate family unit must submit their own declaration.',
  },
];

function generateJsonLd() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqData.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'All Indonesia Arrival Form — Airports & Seaports',
    description:
      'Complete guide to the All Indonesia Arrival Form at all Indonesian airports and seaports.',
    url: 'https://ecustoms.id/all-indonesia',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://ecustoms.id/',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'All Indonesia Entry Points',
          item: 'https://ecustoms.id/all-indonesia',
        },
      ],
    },
  };

  return [faqSchema, webPageSchema];
}

export default function AllIndonesiaPage() {
  const jsonLdSchemas = generateJsonLd();

  return (
    <>
      {jsonLdSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <AllIndonesiaContent faqData={faqData} />
    </>
  );
}
