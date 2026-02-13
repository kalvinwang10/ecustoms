export interface EntryPoint {
  code: string;
  name: string;
  city?: string;
  type: 'airport' | 'seaport';
}

export interface Region {
  id: string;
  name: string;
  description: string;
  airports: EntryPoint[];
  seaports: EntryPoint[];
}

export const regions: Region[] = [
  {
    id: 'java',
    name: 'Java',
    description:
      'Java is Indonesia\'s most populated island and the main gateway for international travelers. Jakarta\'s Soekarno-Hatta International Airport (CGK) is the busiest airport in Southeast Asia, handling millions of customs declarations annually. Surabaya\'s Juanda Airport and Semarang\'s Ahmad Yani Airport also serve as major international entry points.',
    airports: [
      { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', type: 'airport' },
      { code: 'HLP', name: 'Halim Perdanakusuma Airport', city: 'Jakarta', type: 'airport' },
      { code: 'SUB', name: 'Juanda International Airport', city: 'Surabaya', type: 'airport' },
      { code: 'YIA', name: 'Yogyakarta International Airport', city: 'Yogyakarta', type: 'airport' },
      { code: 'SRG', name: 'Ahmad Yani International Airport', city: 'Semarang', type: 'airport' },
      { code: 'SOC', name: 'Adi Soemarmo International Airport', city: 'Solo', type: 'airport' },
      { code: 'KJT', name: 'Kertajati International Airport', city: 'Majalengka', type: 'airport' },
      { code: 'BWX', name: 'Banyuwangi Airport', city: 'Banyuwangi', type: 'airport' },
      { code: 'DHX', name: 'Kediri Airport', city: 'Kediri', type: 'airport' },
    ],
    seaports: [
      { code: 'JKT', name: 'Tanjung Priok Port', city: 'Jakarta', type: 'seaport' },
      { code: 'SKL', name: 'Sunda Kelapa Port', city: 'Jakarta', type: 'seaport' },
      { code: 'ACL', name: 'Marina Ancol Port', city: 'Jakarta', type: 'seaport' },
      { code: 'PMB', name: 'Patimban Port', city: 'Subang', type: 'seaport' },
      { code: 'CRB', name: 'Cirebon Port', city: 'Cirebon', type: 'seaport' },
      { code: 'CIW', name: 'Ciwandan Port', city: 'Cilegon', type: 'seaport' },
      { code: 'CXP', name: 'Tanjung Intan Port', city: 'Cilacap', type: 'seaport' },
      { code: 'TES', name: 'Tanjung Emas Port', city: 'Semarang', type: 'seaport' },
      { code: 'TJP', name: 'Tanjung Perak Port', city: 'Surabaya', type: 'seaport' },
      { code: 'PRN', name: 'Panarukan Port', city: 'Situbondo', type: 'seaport' },
      { code: 'PAZ', name: 'Pasuruan Port', city: 'Pasuruan', type: 'seaport' },
      { code: 'PRO', name: 'Probolinggo Port', city: 'Probolinggo', type: 'seaport' },
      { code: 'BJU', name: 'Tanjung Wangi Port', city: 'Banyuwangi', type: 'seaport' },
    ],
  },
  {
    id: 'bali-nusa-tenggara',
    name: 'Bali & Nusa Tenggara',
    description:
      'Bali is Indonesia\'s most famous tourist destination, with Ngurah Rai International Airport (DPS) welcoming millions of visitors each year. Lombok\'s Zainuddin Abdul Majid Airport and Labuan Bajo\'s Komodo Airport serve travelers exploring Eastern Indonesia\'s stunning islands, beaches, and Komodo National Park.',
    airports: [
      { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', type: 'airport' },
      { code: 'LOP', name: 'Zainuddin Abdul Majid International Airport', city: 'Lombok', type: 'airport' },
      { code: 'LBJ', name: 'Komodo Airport', city: 'Labuan Bajo', type: 'airport' },
      { code: 'KOE', name: 'El Tari Airport', city: 'Kupang', type: 'airport' },
      { code: 'WII', name: 'Wini Border Crossing', city: 'Atambua', type: 'airport' },
      { code: 'MTA', name: 'Motaain Border Crossing', city: 'Atambua', type: 'airport' },
      { code: 'MTS', name: 'Motamasin Border Crossing', city: 'Atambua', type: 'airport' },
      { code: 'NPN', name: 'Napan Border Crossing', city: 'Atambua', type: 'airport' },
    ],
    seaports: [
      { code: 'BOA', name: 'Benoa Port', city: 'Bali', type: 'seaport' },
      { code: 'PBI', name: 'Padang Bai Port', city: 'Bali', type: 'seaport' },
      { code: 'CEB', name: 'Celukan Bawang Port', city: 'Bali', type: 'seaport' },
      { code: 'LBR', name: 'Lembar Port', city: 'Lombok', type: 'seaport' },
      { code: 'BEN', name: 'Benete Port', city: 'Sumbawa', type: 'seaport' },
      { code: 'LBO', name: 'Labuan Bajo Port', city: 'Labuan Bajo', type: 'seaport' },
      { code: 'TEN', name: 'Tenau Port', city: 'Kupang', type: 'seaport' },
      { code: 'TKMB', name: 'Medana Bay Marina', city: 'Lombok', type: 'seaport' },
    ],
  },
  {
    id: 'sumatra',
    name: 'Sumatra',
    description:
      'Sumatra is Indonesia\'s largest island fully within the country, featuring major entry points at Kualanamu Airport in Medan and Sultan Mahmud Badaruddin II Airport in Palembang. The island\'s western coast ports and northern Aceh region serve both commercial shipping and tourism, including access to the famous Lake Toba.',
    airports: [
      { code: 'KNO', name: 'Kualanamu International Airport', city: 'Medan', type: 'airport' },
      { code: 'BTJ', name: 'Sultan Iskandar Muda Airport', city: 'Banda Aceh', type: 'airport' },
      { code: 'PLM', name: 'Sultan Mahmud Badaruddin II Airport', city: 'Palembang', type: 'airport' },
      { code: 'PDG', name: 'Minangkabau International Airport', city: 'Padang', type: 'airport' },
      { code: 'PKU', name: 'Sultan Syarif Kasim II Airport', city: 'Pekanbaru', type: 'airport' },
      { code: 'TKG', name: 'Radin Inten II Airport', city: 'Bandar Lampung', type: 'airport' },
      { code: 'DTB', name: 'Raja Sisingamangaraja XII Airport', city: 'Silangit', type: 'airport' },
    ],
    seaports: [
      { code: 'BLW', name: 'Belawan Port', city: 'Medan', type: 'seaport' },
      { code: 'DUM', name: 'Dumai Port', city: 'Dumai', type: 'seaport' },
      { code: 'PLO', name: 'Boom Baru Port', city: 'Palembang', type: 'seaport' },
      { code: 'TBR', name: 'Teluk Bayur Port', city: 'Padang', type: 'seaport' },
      { code: 'PJG', name: 'Panjang Port', city: 'Bandar Lampung', type: 'seaport' },
      { code: 'SBA', name: 'Sabang Port', city: 'Sabang', type: 'seaport' },
      { code: 'MLH', name: 'Malahayati Port', city: 'Aceh', type: 'seaport' },
      { code: 'KGH', name: 'Lhokseumawe Port', city: 'Lhokseumawe', type: 'seaport' },
      { code: 'KUA', name: 'Kuala Langsa Port', city: 'Langsa', type: 'seaport' },
      { code: 'KTJ', name: 'Kuala Tanjung Port', city: 'Batubara', type: 'seaport' },
      { code: 'TSH', name: 'Teluk Nibung Port', city: 'Tanjung Balai', type: 'seaport' },
      { code: 'GNS', name: 'Gunung Sitoli Port', city: 'Nias', type: 'seaport' },
      { code: 'SLG', name: 'Sibolga Port', city: 'Sibolga', type: 'seaport' },
      { code: 'BCP', name: 'Bagan Siapi-Api Port', city: 'Rokan Hilir', type: 'seaport' },
      { code: 'ENO', name: 'Kuala Enok Port', city: 'Indragiri Hilir', type: 'seaport' },
      { code: 'SSI', name: 'Siak Sri Indrapura Port', city: 'Siak', type: 'seaport' },
      { code: 'SGP', name: 'Sungai Pakning Port', city: 'Bengkalis', type: 'seaport' },
      { code: 'TMD', name: 'Tanjung Medang Port', city: 'Bengkalis', type: 'seaport' },
      { code: 'SUQ', name: 'Sungai Guntung Port', city: 'Indragiri Hilir', type: 'seaport' },
      { code: 'TBH', name: 'Tembilahan Port', city: 'Indragiri Hilir', type: 'seaport' },
      { code: 'DJM', name: 'Jambi Port', city: 'Jambi', type: 'seaport' },
      { code: 'MSK', name: 'Muara Sabak Port', city: 'Tanjung Jabung Timur', type: 'seaport' },
      { code: 'KTK', name: 'Kuala Tungkal Port', city: 'Tanjung Jabung Barat', type: 'seaport' },
      { code: 'PBA', name: 'Pulau Baai Port', city: 'Bengkulu', type: 'seaport' },
      { code: 'PGX', name: 'Pangkal Balam Port', city: 'Bangka', type: 'seaport' },
      { code: 'BLN', name: 'Tanjung Gudang Port', city: 'Bangka', type: 'seaport' },
      { code: 'TGN', name: 'Tanjung Kalian Port', city: 'Bangka', type: 'seaport' },
      { code: 'TPD', name: 'Tanjung Pandan Port', city: 'Belitung', type: 'seaport' },
      { code: 'PLCL', name: 'Calang Port', city: 'Aceh Jaya', type: 'seaport' },
    ],
  },
  {
    id: 'kalimantan',
    name: 'Kalimantan',
    description:
      'Kalimantan (Indonesian Borneo) serves as a key entry point through Sultan Aji Muhammad Sulaiman Airport in Balikpapan and Syamsudin Noor Airport in Banjarmasin. The region\'s extensive coastline features numerous commercial ports supporting the island\'s major natural resource industries.',
    airports: [
      { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman Airport', city: 'Balikpapan', type: 'airport' },
      { code: 'BDJ', name: 'Syamsudin Noor Airport', city: 'Banjarmasin', type: 'airport' },
      { code: 'AAP', name: 'Aji Pangeran Tumenggung Pranoto Airport', city: 'Samarinda', type: 'airport' },
      { code: 'PNK', name: 'Supadio Airport', city: 'Pontianak', type: 'airport' },
      { code: 'TRK', name: 'Juwata Airport', city: 'Tarakan', type: 'airport' },
    ],
    seaports: [
      { code: 'BPP', name: 'Semayang Port', city: 'Balikpapan', type: 'seaport' },
      { code: 'SRI', name: 'Samarinda Port', city: 'Samarinda', type: 'seaport' },
      { code: 'TRI', name: 'Tri Sakti Port', city: 'Banjarmasin', type: 'seaport' },
      { code: 'TAB', name: 'Taboneo Port', city: 'Banjarmasin', type: 'seaport' },
      { code: 'KBU', name: 'Kota Baru Port', city: 'Kota Baru', type: 'seaport' },
      { code: 'SMQ', name: 'Sampit Port', city: 'Sampit', type: 'seaport' },
      { code: 'KUM', name: 'Kumai Port', city: 'Kumai', type: 'seaport' },
      { code: 'PNK', name: 'Dwi Kora Port', city: 'Pontianak', type: 'seaport' },
      { code: 'SNE', name: 'Sintete Port', city: 'Sambas', type: 'seaport' },
      { code: 'TRK', name: 'Malundung Port', city: 'Tarakan', type: 'seaport' },
      { code: 'SPA', name: 'Tanjung Harapan Port', city: 'Nunukan', type: 'seaport' },
    ],
  },
  {
    id: 'sulawesi',
    name: 'Sulawesi',
    description:
      'Sulawesi features Sultan Hasanuddin International Airport in Makassar as its primary international gateway, along with Sam Ratulangi Airport in Manado serving travelers to North Sulawesi\'s world-renowned diving destinations. The island\'s ports connect key trading routes across Eastern Indonesia.',
    airports: [
      { code: 'UPG', name: 'Sultan Hasanuddin International Airport', city: 'Makassar', type: 'airport' },
      { code: 'MDC', name: 'Sam Ratulangi International Airport', city: 'Manado', type: 'airport' },
      { code: 'PLW', name: 'Mutiara SIS Al Jufri Airport', city: 'Palu', type: 'airport' },
      { code: 'BTW', name: 'Bersujud Airport', city: 'Morowali', type: 'airport' },
    ],
    seaports: [
      { code: 'MAK', name: 'Soekarno-Hatta Port', city: 'Makassar', type: 'seaport' },
      { code: 'BIT', name: 'Samudera Bitung Port', city: 'Bitung', type: 'seaport' },
      { code: 'MDO', name: 'Manado Port', city: 'Manado', type: 'seaport' },
      { code: 'GNG', name: 'Garongkong Port', city: 'Barru', type: 'seaport' },
      { code: 'PAP', name: 'Nusantara Pare-Pare Port', city: 'Pare-Pare', type: 'seaport' },
      { code: 'KDI', name: 'Kendari Port', city: 'Kendari', type: 'seaport' },
      { code: 'PTL', name: 'Pantoloan Port', city: 'Palu', type: 'seaport' },
      { code: 'AGK', name: 'Anggrek Port', city: 'Gorontalo', type: 'seaport' },
      { code: 'PLLU', name: 'Labuan Uki Port', city: 'Bolaang Mongondow', type: 'seaport' },
      { code: 'PLBT', name: 'Tanjung Buton Port', city: 'Siak', type: 'seaport' },
    ],
  },
  {
    id: 'riau-islands',
    name: 'Riau Islands',
    description:
      'The Riau Islands province, located just south of Singapore, is one of Indonesia\'s busiest entry regions for international travelers. Batam\'s Hang Nadim Airport and numerous ferry terminals — including Batam Centre, Harbour Bay, and Sekupang — handle millions of passengers crossing from Singapore and Malaysia each year.',
    airports: [
      { code: 'BTH', name: 'Hang Nadim International Airport', city: 'Batam', type: 'airport' },
      { code: 'TNJ', name: 'Raja Haji Fisabilillah Airport', city: 'Tanjung Pinang', type: 'airport' },
      { code: 'TJQ', name: 'H.A.S. Hanandjoeddin Airport', city: 'Tanjung Pandan', type: 'airport' },
    ],
    seaports: [
      { code: 'BCR', name: 'Batam Centre Ferry Terminal', city: 'Batam', type: 'seaport' },
      { code: 'CTT', name: 'Harbour Bay Ferry Terminal', city: 'Batam', type: 'seaport' },
      { code: 'SKP', name: 'Sekupang Port', city: 'Batam', type: 'seaport' },
      { code: 'NON', name: 'Nongsa Port', city: 'Batam', type: 'seaport' },
      { code: 'BUR', name: 'Batu Ampar Port', city: 'Batam', type: 'seaport' },
      { code: 'BPD', name: 'Belakang Padang Port', city: 'Batam', type: 'seaport' },
      { code: 'BKG', name: 'Bengkong Port', city: 'Batam', type: 'seaport' },
      { code: 'KAB', name: 'Kabil Port', city: 'Batam', type: 'seaport' },
      { code: 'SNB', name: 'Teluk Senimba Marina Port', city: 'Batam', type: 'seaport' },
      { code: 'SBP', name: 'Sri Bintan Pura Port', city: 'Tanjung Pinang', type: 'seaport' },
      { code: 'LAI', name: 'Bandar Bentan Telani Lagoi Port', city: 'Bintan', type: 'seaport' },
      { code: 'BLS', name: 'Bandar Sri Setia Raja Port', city: 'Bintan', type: 'seaport' },
      { code: 'TPN', name: 'Sri Bayintan Port', city: 'Bintan', type: 'seaport' },
      { code: 'LBM', name: 'Seri Udana Lobam Port', city: 'Bintan', type: 'seaport' },
      { code: 'TAN', name: 'Tanjung Uban Port', city: 'Bintan', type: 'seaport' },
      { code: 'TBK', name: 'Tanjung Balai Karimun Port', city: 'Karimun', type: 'seaport' },
      { code: 'STA', name: 'Selat Lampa Port', city: 'Natuna', type: 'seaport' },
      { code: 'TMP', name: 'Tarempa Port', city: 'Anambas', type: 'seaport' },
    ],
  },
  {
    id: 'papua-maluku',
    name: 'Papua & Maluku',
    description:
      'Papua and Maluku represent Indonesia\'s easternmost regions, with Sentani Airport in Jayapura and Pattimura Airport in Ambon as the primary gateways. These regions offer access to pristine natural environments, including Raja Ampat\'s world-class diving sites, and require customs declarations at all entry points.',
    airports: [
      { code: 'DJJ', name: 'Sentani Airport', city: 'Jayapura', type: 'airport' },
      { code: 'AMQ', name: 'Pattimura Airport', city: 'Ambon', type: 'airport' },
      { code: 'SOQ', name: 'Domine Edward Osok Airport', city: 'Sorong', type: 'airport' },
      { code: 'BIK', name: 'Frans Kaisiepo Airport', city: 'Biak', type: 'airport' },
      { code: 'MKQ', name: 'Mopah Airport', city: 'Merauke', type: 'airport' },
    ],
    seaports: [
      { code: 'DJY', name: 'Jayapura Port', city: 'Jayapura', type: 'seaport' },
      { code: 'SOQ', name: 'Sorong Port', city: 'Sorong', type: 'seaport' },
      { code: 'AMB', name: 'Yos Sudarso Ambon Port', city: 'Ambon', type: 'seaport' },
      { code: 'BIA', name: 'Biak Port', city: 'Biak', type: 'seaport' },
      { code: 'MKE', name: 'Merauke Port', city: 'Merauke', type: 'seaport' },
      { code: 'TTE', name: 'Achmad Yani Port', city: 'Ternate', type: 'seaport' },
      { code: 'TUA', name: 'Tual Port', city: 'Tual', type: 'seaport' },
      { code: 'SXK', name: 'Saumlaki Port', city: 'Saumlaki', type: 'seaport' },
      { code: 'AMA', name: 'Amamapare Port', city: 'Timika', type: 'seaport' },
      { code: 'THA', name: 'Nusantara Port', city: 'Ternate', type: 'seaport' },
      { code: 'LSM', name: 'Lauren Say Port', city: 'Maluku', type: 'seaport' },
    ],
  },
];

export function getStats() {
  let totalAirports = 0;
  let totalSeaports = 0;
  for (const region of regions) {
    totalAirports += region.airports.length;
    totalSeaports += region.seaports.length;
  }
  return { totalAirports, totalSeaports, totalRegions: regions.length };
}
