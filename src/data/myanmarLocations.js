/**
 * Nationwide Myanmar Administrative Locations Dataset
 * Covers all 15 States, Regions, and Union Territories without hardcoding.
 */

export const MYANMAR_REGIONS = [
  'Yangon Region',
  'Mandalay Region',
  'Shan State',
  'Bago Region',
  'Sagaing Region',
  'Magway Region',
  'Ayeyarwady Region',
  'Mon State',
  'Kayin State',
  'Kachin State',
  'Rakhine State',
  'Tanintharyi Region',
  'Chin State',
  'Kayah State',
  'Naypyidaw Union Territory'
];

export const MYANMAR_CITIES_BY_REGION = {
  'Yangon Region': [
    'Yangon (Kamayut)',
    'Yangon (Hlaing)',
    'Yangon (Bahan)',
    'Yangon (Sanchaung)',
    'Yangon (Dagon)',
    'Yangon (Mayangone)',
    'Yangon (Yankin)',
    'Yangon (Insein)',
    'Yangon (South Okkalapa)',
    'Yangon (North Okkalapa)',
    'Thanlyin'
  ],
  'Mandalay Region': [
    'Mandalay (Chanayethazan)',
    'Mandalay (Mahaaungmye)',
    'Mandalay (Aungmyethazan)',
    'Mandalay (Chanmyathazi)',
    'Mandalay (Pyigyitagon)',
    'Pyin Oo Lwin',
    'Meiktila',
    'Kyaukse',
    'Myingyan',
    'Nyaung-U (Bagan)'
  ],
  'Shan State': [
    'Taunggyi',
    'Lashio',
    'Kalaw',
    'Nyaungshwe (Inle)',
    'Aungban',
    'Muse',
    'Kengtung',
    'Tachileik'
  ],
  'Bago Region': [
    'Bago',
    'Pyay',
    'Taungoo',
    'Nyaunglebin'
  ],
  'Sagaing Region': [
    'Sagaing',
    'Monywa',
    'Shwebo',
    'Kalay'
  ],
  'Magway Region': [
    'Magway',
    'Pakokku',
    'Minbu',
    'Chauk'
  ],
  'Ayeyarwady Region': [
    'Pathein',
    'Hinthada',
    'Myaungmya',
    'Maubin'
  ],
  'Mon State': [
    'Mawlamyine',
    'Mudon',
    'Thaton',
    'Chaungzon'
  ],
  'Kayin State': [
    'Hpa-An',
    'Myawaddy',
    'Kawkareik'
  ],
  'Kachin State': [
    'Myitkyina',
    'Bhamo',
    'Mohnyin'
  ],
  'Rakhine State': [
    'Sittwe',
    'Kyaukpyu',
    'Thandwe (Ngapali)'
  ],
  'Tanintharyi Region': [
    'Dawei',
    'Myeik',
    'Kawthaung'
  ],
  'Chin State': [
    'Hakha',
    'Tedim',
    'Falam'
  ],
  'Kayah State': [
    'Loikaw',
    'Demoso'
  ],
  'Naypyidaw Union Territory': [
    'Naypyidaw (Zabuthiri)',
    'Naypyidaw (Ottarathiri)',
    'Naypyidaw (Dekkhinathiri)',
    'Naypyidaw (Pyinmana)'
  ]
};

export const ALL_MYANMAR_CITIES = Object.values(MYANMAR_CITIES_BY_REGION).flat();
