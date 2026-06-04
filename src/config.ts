import dotenv from 'dotenv';

dotenv.config();

export const TARGET_MALLS = [
  'Siam Paragon',
  'Siam Center',
  'Siam Discovery',
  'CentralWorld',
  'Iconsiam',
  'EmQuartier',
  'EmSphere',
  'Emporium',
  'Mega Bangna',
  'Central Westgate',
  'Central Eastville',
  'Central Ladprao',
  'Central Rama 9',
  'Central Chidlom',
  'Central Pinklao',
  'Central Bangna',
  'Fashion Island',
  'The Mall Bangkapi',
  'The Mall Bangkhae',
  'The Mall Ngamwongwan',
  'Terminal 21 Asok',
  'Terminal 21 Rama 3',
  'Samyan Mitrtown',
  'Silom Edge',
  'The Em District',
  'Siam Square One'
];

export const KEYWORDS = [
  'ร้านเปิดใหม่',
  'สาขาใหม่',
  'คีออส',
  'เปิดใหม่',
  'เตรียมพบกับ',
  'ฉลองเปิดสาขาใหม่',
  'new opening',
  'new branch',
  'kiosk',
  'coming soon',
  'open now',
  'grand opening',
  'new shop',
  'store opening',
  'now open'
];

export const GOOGLE_GENAI_API_KEY = process.env.GOOGLE_GENAI_API_KEY || '';
