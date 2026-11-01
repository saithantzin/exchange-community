/**
 * Admin Mock Dataset for ReCirculate Community-Based Item Exchange Platform
 * Pure frontend UI data source without backend or API dependency.
 */

export const ADMIN_MEMBERS = [
  {
    id: 1,
    name: 'Thant Zin',
    email: 'thantzin@exchange.mm',
    phone: '09798123456',
    city: 'Mandalay (Chanayethazan)',
    region: 'Mandalay Region',
    status: 'Active',
    rating: 4.9,
    joinedDate: '2024-01-15',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    bio: 'Architecture student & woodcraft enthusiast living near 78th street, Mandalay.',
    itemsCount: 5,
    exchangesCount: 6,
    disputesCount: 0,
    items: [
      { id: 101, title: 'Minimalist Teak Coffee Table', category: 'Furniture', condition: 'Like New', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=200&q=80' },
      { id: 102, title: 'Sony WH-1000XM4 Headphones', category: 'Electronics', condition: 'Like New', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&q=80' }
    ]
  },
  {
    id: 2,
    name: 'Thiri Myint',
    email: 'thiri@exchange.mm',
    phone: '09791112233',
    city: 'Pyin Oo Lwin',
    region: 'Mandalay Region',
    status: 'Active',
    rating: 4.9,
    joinedDate: '2024-02-10',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    bio: 'Gardener and botanist interested in home decor and organic planters.',
    itemsCount: 8,
    exchangesCount: 14,
    disputesCount: 0,
    items: [
      { id: 103, title: 'Ceramic Planter Set', category: 'Household Items', condition: 'New', image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=200&q=80' }
    ]
  },
  {
    id: 3,
    name: 'Kyaw Zin Htet',
    email: 'kyawzin@exchange.mm',
    phone: '09450987654',
    city: 'Yangon (Kamayut)',
    region: 'Yangon Region',
    status: 'Active',
    rating: 5.0,
    joinedDate: '2023-08-20',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    bio: 'Software engineer cycling pre-loved tech gadgets, audio gear, and books.',
    itemsCount: 12,
    exchangesCount: 22,
    disputesCount: 0,
    items: [
      { id: 104, title: 'Mechanical Keyboard (Keychron K2)', category: 'Electronics', condition: 'Like New', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80' }
    ]
  },
  {
    id: 4,
    name: 'Nandar Win',
    email: 'nandar@exchange.mm',
    phone: '09250123456',
    city: 'Taunggyi',
    region: 'Shan State',
    status: 'Active',
    rating: 4.8,
    joinedDate: '2024-03-05',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&q=80',
    bio: 'Teacher and avid reader trading regional history monographs and stationery.',
    itemsCount: 4,
    exchangesCount: 7,
    disputesCount: 0,
    items: []
  },
  {
    id: 5,
    name: 'Aung Thu',
    email: 'aungthu@exchange.mm',
    phone: '09795554433',
    city: 'Monywa',
    region: 'Sagaing Region',
    status: 'Active',
    rating: 4.9,
    joinedDate: '2024-05-18',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    bio: 'Hardware tinkerer collecting ergonomic accessories and test equipment.',
    itemsCount: 6,
    exchangesCount: 19,
    disputesCount: 0,
    items: []
  },
  {
    id: 6,
    name: 'May Thu Lin',
    email: 'maythu@exchange.mm',
    phone: '09420001122',
    city: 'Mawlamyine',
    region: 'Mon State',
    status: 'Active',
    rating: 5.0,
    joinedDate: '2023-01-12',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80',
    bio: 'Interior stylist offering vintage prints and ceramicware.',
    itemsCount: 15,
    exchangesCount: 31,
    disputesCount: 0,
    items: []
  },
  {
    id: 7,
    name: 'Zaw Min Oo',
    email: 'zawmin@exchange.mm',
    phone: '09971239876',
    city: 'Pathein',
    region: 'Ayeyarwady Region',
    status: 'Suspended',
    rating: 3.5,
    joinedDate: '2024-09-01',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&q=80',
    bio: 'Trading home goods and decor items across delta towns.',
    itemsCount: 2,
    exchangesCount: 3,
    disputesCount: 1,
    suspensionReason: 'Multiple complaints regarding delay in dispatched tracking confirmations.',
    items: []
  },
  {
    id: 8,
    name: 'Aye Chan Myat',
    email: 'ayechan@exchange.mm',
    phone: '09261234567',
    city: 'Naypyidaw (Zabuthiri)',
    region: 'Naypyidaw Union Territory',
    status: 'Active',
    rating: 4.8,
    joinedDate: '2024-06-12',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    bio: 'Government staff recycling work gear, monitors and novels.',
    itemsCount: 7,
    exchangesCount: 11,
    disputesCount: 0,
    items: []
  }
];

export const ADMIN_CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    slug: 'electronics',
    itemCount: 342,
    depositAmount: 100000,
    icon: 'Laptop',
    description: 'Headphones, mobile phones, audio gear, accessories & gadgets',
    status: 'Active'
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    itemCount: 512,
    depositAmount: 20000,
    icon: 'BookOpen',
    description: 'Novels, textbooks, language guides & design publications',
    status: 'Active'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    itemCount: 280,
    depositAmount: 30000,
    icon: 'Shirt',
    description: 'Jackets, casual wear, shoes, bags & minimalist apparel',
    status: 'Active'
  },
  {
    id: 'household',
    name: 'Household Items',
    slug: 'household',
    itemCount: 419,
    depositAmount: 40000,
    icon: 'Coffee',
    description: 'Kitchenware, ceramic sets, planters & cozy home decor',
    status: 'Active'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    slug: 'furniture',
    itemCount: 198,
    depositAmount: 50000,
    icon: 'Armchair',
    description: 'Desks, ergonomic chairs, coffee tables, shelves & lamps',
    status: 'Active'
  },
  {
    id: 'other',
    name: 'Other Items',
    slug: 'other',
    itemCount: 164,
    depositAmount: 50000,
    icon: 'Grid',
    description: 'Musical instruments, craft tools, sports gear & hobby goods',
    status: 'Active'
  }
];

export const getCategoryDepositAmount = (categoryName) => {
  if (!categoryName) return 50000;
  const name = categoryName.toLowerCase();
  if (name.includes('laptop') || name.includes('computer')) return 150000;
  if (name.includes('electronic') || name.includes('phone') || name.includes('headphone') || name.includes('audio') || name.includes('mouse')) return 100000;
  if (name.includes('book')) return 20000;
  if (name.includes('cloth') || name.includes('apparel') || name.includes('fashion')) return 30000;
  if (name.includes('furniture') || name.includes('desk') || name.includes('table') || name.includes('chair')) return 50000;
  if (name.includes('house') || name.includes('kitchen') || name.includes('ceramic') || name.includes('decor')) return 40000;
  return 50000;
};

export const ADMIN_AUDIT_LOGS = [
  {
    id: 'AUD-9081',
    action: 'DISPUTE_INVESTIGATED',
    details: 'Dispute on EX-9014 reviewed: Parcel transit tracking re-verified with Elite Express.',
    admin: 'Kyaw Swar Hein (Admin)',
    timestamp: '2026-10-15 15:45:20',
    ip: '127.0.0.1'
  },
  {
    id: 'AUD-9080',
    action: 'TWO_SIDED_VERIFIED',
    details: 'Two-sided completion confirmed: Member A & B marked parcel arrival for EX-8801.',
    admin: 'System Auto-Engine',
    timestamp: '2026-10-15 14:30:12',
    ip: '127.0.0.1'
  },
  {
    id: 'AUD-9079',
    action: 'MEMBER_SUSPENDED',
    details: 'Suspended member #7 (Zaw Min Oo) due to repeated unverified dispatch reports.',
    admin: 'Kyaw Swar Hein (Admin)',
    timestamp: '2026-10-14 11:20:05',
    ip: '127.0.0.1'
  },
  {
    id: 'AUD-9078',
    action: 'CATEGORY_CREATED',
    details: 'Created new taxonomy sub-entry for Handcrafted Goods in Household catalog.',
    admin: 'Kyaw Swar Hein (Admin)',
    timestamp: '2026-10-12 09:14:33',
    ip: '127.0.0.1'
  }
];

export const ADMIN_REGISTRATION_DATA = [
  { month: 'May', members: 420 },
  { month: 'Jun', members: 580 },
  { month: 'Jul', members: 790 },
  { month: 'Aug', members: 920 },
  { month: 'Sep', members: 1150 },
  { month: 'Oct', members: 1420 }
];

export const ADMIN_ITEMS = [
  {
    id: 1,
    title: 'Minimalist Teak Wood Coffee Table',
    category: 'Furniture',
    condition: 'Like New',
    status: 'Available',
    city: 'Mandalay (Chanayethazan)',
    region: 'Mandalay Region',
    owner: { id: 1, name: 'Thant Zin', email: 'thantzin@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80',
    description: 'Custom handcrafted solid teak wood coffee table with natural matte wax finish. No scratches.',
    createdDate: '2026-10-01',
    views: 142,
    reportedCount: 0
  },
  {
    id: 2,
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'Electronics',
    condition: 'Like New',
    status: 'In Exchange',
    city: 'Yangon (Kamayut)',
    region: 'Yangon Region',
    owner: { id: 3, name: 'Kyaw Zin Htet', email: 'kyawzin@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    description: 'Black edition with original hard case, audio cable, and USB-C cord. Battery lasts 28+ hours.',
    createdDate: '2026-10-04',
    views: 310,
    reportedCount: 0
  },
  {
    id: 3,
    title: 'Logitech MX Master 3S Wireless Mouse',
    category: 'Electronics',
    condition: 'Good',
    status: 'In Exchange',
    city: 'Mandalay (Chanayethazan)',
    region: 'Mandalay Region',
    owner: { id: 1, name: 'Thant Zin', email: 'thantzin@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
    description: 'Ergonomic performance mouse. Quiet click version. Includes Bolt USB receiver and USB cable.',
    createdDate: '2026-10-05',
    views: 184,
    reportedCount: 0
  },
  {
    id: 4,
    title: 'Nordic Ceramic Tea & Coffee Set (6 Cups)',
    category: 'Household Items',
    condition: 'New',
    status: 'Available',
    city: 'Pyin Oo Lwin',
    region: 'Mandalay Region',
    owner: { id: 2, name: 'Thiri Myint', email: 'thiri@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80',
    description: 'Handmade matte earthenware tea set with wooden saucers and bamboo serving tray. Unused in box.',
    createdDate: '2026-10-06',
    views: 220,
    reportedCount: 0
  },
  {
    id: 5,
    title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
    category: 'Books',
    condition: 'Good',
    status: 'Available',
    city: 'Yangon (Bahan)',
    region: 'Yangon Region',
    owner: { id: 3, name: 'Kyaw Zin Htet', email: 'kyawzin@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
    description: 'Monographs on Scandinavian modernism, Bauhaus principles, and sustainable vernacular architecture.',
    createdDate: '2026-10-07',
    views: 95,
    reportedCount: 0
  },
  {
    id: 6,
    title: 'Ergonomic Mesh Swivel Task Chair',
    category: 'Furniture',
    condition: 'Fair',
    status: 'Available',
    city: 'Taunggyi',
    region: 'Shan State',
    owner: { id: 4, name: 'Nandar Win', email: 'nandar@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1580481077195-c3a824498322?w=400&q=80',
    description: 'Breathable backrest with adjustable lumbar support and roller wheels. Slight wear on armrests.',
    createdDate: '2026-10-08',
    views: 130,
    reportedCount: 0
  },
  {
    id: 7,
    title: 'Mechanical Keyboard (Keychron K2 Wireless)',
    category: 'Electronics',
    condition: 'Like New',
    status: 'Completed',
    city: 'Monywa',
    region: 'Sagaing Region',
    owner: { id: 5, name: 'Aung Thu', email: 'aungthu@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    description: 'Gateron Brown switches with RGB backlighting. Bluetooth 5.1 and Type-C cable.',
    createdDate: '2026-09-20',
    views: 412,
    reportedCount: 0
  },
  {
    id: 8,
    title: 'Unbranded Fake Smartwatch Listing',
    category: 'Electronics',
    condition: 'Poor',
    status: 'Deactivated',
    city: 'Pathein',
    region: 'Ayeyarwady Region',
    owner: { id: 7, name: 'Zaw Min Oo', email: 'zawmin@exchange.mm' },
    image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80',
    description: 'Counterfeit replica listed without proper disclosure.',
    createdDate: '2026-09-28',
    views: 35,
    reportedCount: 3,
    moderationNote: 'Removed by Admin: Inauthentic hardware listing without clear brand disclosure.'
  }
];

export const ADMIN_EXCHANGES = [
  {
    id: 'EXC-8801',
    status: 'Shipping',
    isIntercity: true,
    handoverMethod: 'Intercity Courier Delivery',
    initiatedDate: '2026-10-08',
    partyA: {
      memberId: 1,
      name: 'Thant Zin',
      email: 'thantzin@exchange.mm',
      city: 'Mandalay (Chanayethazan)',
      itemTitle: 'Logitech MX Master 3S Wireless Mouse',
      itemImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
      courier: 'Royal Express Courier',
      trackingNumber: 'RX-8921-MY',
      dispatched: true,
      confirmedReceipt: true,
      receiptDate: '2026-10-14 17:00'
    },
    partyB: {
      memberId: 3,
      name: 'Kyaw Zin Htet',
      email: 'kyawzin@exchange.mm',
      city: 'Yangon (Kamayut)',
      itemTitle: 'Sony WH-1000XM4 Noise Canceling Headphones',
      itemImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      courier: 'Elite Cargo Express',
      trackingNumber: 'EC-7721-YM',
      dispatched: true,
      confirmedReceipt: true,
      receiptDate: '2026-10-14 16:30'
    },
    deposits: {
      partyA: {
        amount: 100000,
        category: 'Electronics',
        status: 'Verified',
        paymentMethod: 'KBZPay',
        referenceNumber: 'KBZ-89102488',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        verifiedAt: '2026-10-08 14:20'
      },
      partyB: {
        amount: 100000,
        category: 'Electronics',
        status: 'Verified',
        paymentMethod: 'WavePay',
        referenceNumber: 'WV-99214412',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        verifiedAt: '2026-10-08 15:10'
      }
    },
    externalContacts: {
      partyA: {
        telegram: '@thantzin_mdy',
        viber: '+959798123456',
        facebook: 'facebook.com/thantzin.mm',
        preferredMethod: 'Telegram'
      },
      partyB: {
        telegram: '@kyawzin_ygn',
        viber: '+959450987654',
        facebook: 'facebook.com/kyawzinhtet',
        preferredMethod: 'Viber'
      }
    },
    refundWorkflow: {
      partyA: {
        status: 'Processing Payout',
        requestedAt: '2026-10-14 17:05',
        paymentProvider: 'KBZPay',
        accountNumber: '09798123456',
        accountName: 'Thant Zin',
        amount: 100000,
        refundTransactionRef: null,
        completedAt: null
      },
      partyB: {
        status: 'Processing Payout',
        requestedAt: '2026-10-14 16:45',
        paymentProvider: 'WavePay',
        accountNumber: '09450987654',
        accountName: 'Kyaw Zin Htet',
        amount: 100000,
        refundTransactionRef: null,
        completedAt: null
      }
    },
    courierTracking: {
      route: 'Mandalay ⇄ Yangon Express Transit',
      currentLocation: 'Yangon & Mandalay Delivered',
      eta: 'Delivered'
    },
    isCompleted: false,
    disputeFiled: false,
    history: [
      { date: '2026-10-08 10:15', event: 'Exchange proposal accepted by both members.' },
      { date: '2026-10-08 14:20', event: 'Admin approved Party A deposit of 100,000 MMK (KBZPay).' },
      { date: '2026-10-08 15:10', event: 'Admin approved Party B deposit of 100,000 MMK (WavePay). Contact details unlocked.' },
      { date: '2026-10-09 14:00', event: 'Party A uploaded Royal Express dispatch receipt (RX-8921-MY).' },
      { date: '2026-10-10 11:30', event: 'Party B uploaded Elite Cargo dispatch receipt (EC-7721-YM).' },
      { date: '2026-10-14 16:30', event: 'Party B confirmed parcel receipt in Yangon.' },
      { date: '2026-10-14 17:00', event: 'Party A confirmed parcel receipt in Mandalay. Both confirmed receipt.' },
      { date: '2026-10-14 17:05', event: 'Both participants submitted deposit refund payout accounts. Awaiting admin payout.' }
    ]
  },
  {
    id: 'EXC-9018',
    status: 'Deposit Review',
    isIntercity: true,
    handoverMethod: 'Intercity Courier Delivery',
    initiatedDate: '2026-10-14',
    partyA: {
      memberId: 1,
      name: 'Thant Zin',
      email: 'thantzin@exchange.mm',
      city: 'Mandalay (Chanayethazan)',
      itemTitle: 'Vintage Film Camera (Olympus OM-1)',
      itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      dispatched: false,
      confirmedReceipt: false
    },
    partyB: {
      memberId: 8,
      name: 'Aye Chan Myat',
      email: 'ayechan@exchange.mm',
      city: 'Naypyidaw (Zabuthiri)',
      itemTitle: 'Apple iPad 9th Gen 64GB WiFi',
      itemImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&q=80',
      dispatched: false,
      confirmedReceipt: false
    },
    deposits: {
      partyA: {
        amount: 100000,
        category: 'Electronics',
        status: 'Payment Submitted',
        paymentMethod: 'KBZPay',
        referenceNumber: 'KBZ-99120488',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        submittedAt: '2026-10-14 11:30'
      },
      partyB: {
        amount: 150000,
        category: 'Electronics',
        status: 'Verified',
        paymentMethod: 'WavePay',
        referenceNumber: 'WV-55210419',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        verifiedAt: '2026-10-14 10:15'
      }
    },
    externalContacts: {
      partyA: {
        telegram: '@thantzin_mdy',
        viber: '+959798123456',
        preferredMethod: 'Telegram'
      },
      partyB: {
        telegram: '@ayechan_npw',
        viber: '+959261234567',
        preferredMethod: 'Viber'
      }
    },
    refundWorkflow: null,
    isCompleted: false,
    disputeFiled: false,
    history: [
      { date: '2026-10-14 09:30', event: 'Exchange proposal accepted by Aye Chan Myat.' },
      { date: '2026-10-14 10:15', event: 'Admin approved Party B deposit of 150,000 MMK (WavePay).' },
      { date: '2026-10-14 11:30', event: 'Party A uploaded KBZPay slip (KBZ-99120488). Awaiting Admin verification.' }
    ]
  },
  {
    id: 'EXC-8802',
    status: 'Accepted',
    isIntercity: false,
    handoverMethod: 'In-Person Meetup',
    initiatedDate: '2026-10-10',
    partyA: {
      memberId: 1,
      name: 'Thant Zin',
      email: 'thantzin@exchange.mm',
      city: 'Mandalay',
      itemTitle: 'Solid Teak Study Desk with Drawers',
      itemImage: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80',
      dispatched: false,
      confirmedReceipt: false
    },
    partyB: {
      memberId: 2,
      name: 'Thiri Myint',
      email: 'thiri@exchange.mm',
      city: 'Mandalay',
      itemTitle: 'Minimalist Teak Wood Coffee Table',
      itemImage: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80',
      dispatched: false,
      confirmedReceipt: false
    },
    meetupLocation: '73rd St Coffee Circle, Mandalay',
    isCompleted: false,
    disputeFiled: false,
    history: [
      { date: '2026-10-10 14:20', event: 'Meetup exchange scheduled for Sunday at 73rd St Coffee Circle.' }
    ]
  },
  {
    id: 'EXC-7704',
    status: 'Completed',
    isIntercity: false,
    handoverMethod: 'In-Person Meetup',
    initiatedDate: '2026-09-24',
    completedDate: '2026-09-27',
    partyA: {
      memberId: 1,
      name: 'Thant Zin',
      email: 'thantzin@exchange.mm',
      city: 'Mandalay',
      itemTitle: 'Vintage Film Camera (Olympus OM-1)',
      itemImage: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80',
      confirmedReceipt: true,
      receiptDate: '2026-09-27 16:45'
    },
    partyB: {
      memberId: 5,
      name: 'Aung Thu',
      email: 'aungthu@exchange.mm',
      city: 'Mandalay',
      itemTitle: 'Mechanical Keyboard (Keychron K2)',
      itemImage: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
      confirmedReceipt: true,
      receiptDate: '2026-09-27 16:40'
    },
    meetupLocation: 'Mingalar Mandalay Plaza',
    isCompleted: true,
    disputeFiled: false,
    history: [
      { date: '2026-09-24 11:00', event: 'Exchange proposal submitted and accepted.' },
      { date: '2026-09-27 16:40', event: 'In-person inspection and handshake completed.' },
      { date: '2026-09-27 16:45', event: 'Both parties marked received. Status marked Completed.' }
    ]
  },
  {
    id: 'EXC-9014',
    status: 'Disputed',
    isIntercity: true,
    handoverMethod: 'Intercity Courier Delivery',
    initiatedDate: '2026-10-02',
    partyA: {
      memberId: 7,
      name: 'Zaw Min Oo',
      email: 'zawmin@exchange.mm',
      city: 'Pathein',
      itemTitle: 'Unbranded Fake Smartwatch Listing',
      itemImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80',
      courier: 'Delta Speed Express',
      trackingNumber: 'DS-4410-PY',
      dispatched: true,
      confirmedReceipt: false
    },
    partyB: {
      memberId: 6,
      name: 'May Thu Lin',
      email: 'maythu@exchange.mm',
      city: 'Mawlamyine',
      itemTitle: 'Ceramic Table Lamp & Linen Shade',
      itemImage: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&q=80',
      courier: 'Mon Express Line',
      trackingNumber: 'ME-9912-MM',
      dispatched: true,
      confirmedReceipt: true
    },
    isCompleted: false,
    disputeFiled: true,
    history: [
      { date: '2026-10-02 09:00', event: 'Exchange started.' },
      { date: '2026-10-12 18:20', event: 'Party B filed dispute: Received item differs heavily from listing photo and is defective.' }
    ]
  }
];

export const ADMIN_REPORTS = [
  {
    id: 'REP-401',
    type: 'Misleading Description',
    status: 'Under Review',
    exchangeId: 'EXC-9014',
    reportedItemId: 8,
    reportedItemTitle: 'Unbranded Fake Smartwatch Listing',
    reporter: { id: 6, name: 'May Thu Lin', email: 'maythu@exchange.mm' },
    reportedUser: { id: 7, name: 'Zaw Min Oo', email: 'zawmin@exchange.mm' },
    date: '2026-10-12 18:20',
    description: 'The smartwatch received does not match the photos. The screen is scratched and it does not charge. The owner is unresponsive.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&q=80'
    ],
    adminNotes: 'Checked courier tracking: Delivery arrived on Oct 11. Photos confirm visible scratches. Sender has been warned once before.',
    actionHistory: [
      { date: '2026-10-13 10:00', action: 'Report opened by system and assigned to moderator.', by: 'Auto-Dispatcher' },
      { date: '2026-10-14 11:20', action: 'Listing deactivated and member account placed on suspension pending return confirmation.', by: 'Kyaw Swar Hein (Admin)' }
    ]
  },
  {
    id: 'REP-402',
    type: 'Missing Parcel / Delayed Dispatch',
    status: 'Open',
    exchangeId: 'EXC-8801',
    reportedItemId: 3,
    reportedItemTitle: 'Logitech MX Master 3S Wireless Mouse',
    reporter: { id: 3, name: 'Kyaw Zin Htet', email: 'kyawzin@exchange.mm' },
    reportedUser: { id: 1, name: 'Thant Zin', email: 'thantzin@exchange.mm' },
    date: '2026-10-15 08:30',
    description: 'Courier tracking shows arrived in Yangon terminal 2 days ago but haven’t received delivery call yet.',
    evidenceImages: [],
    adminNotes: 'Contacted Royal Express dispatch manager in Kamayut hub. Delivery rescheduled for this afternoon.',
    actionHistory: [
      { date: '2026-10-15 08:35', action: 'Report filed by Kyaw Zin Htet.', by: 'Member' }
    ]
  },
  {
    id: 'REP-399',
    type: 'Damaged Item',
    status: 'Resolved',
    exchangeId: 'EXC-7610',
    reportedItemId: 9,
    reportedItemTitle: 'Ceramic Coffee Dripper & Glass Server',
    reporter: { id: 4, name: 'Nandar Win', email: 'nandar@exchange.mm' },
    reportedUser: { id: 2, name: 'Thiri Myint', email: 'thiri@exchange.mm' },
    date: '2026-09-18 14:15',
    description: 'Glass server cracked during highway transit due to inadequate bubble wrapping.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80'
    ],
    adminNotes: 'Both parties agreed amicably: sender dispatched replacement glass server. Replacement received intact on Sep 22.',
    actionHistory: [
      { date: '2026-09-18 15:00', action: 'Investigation opened.', by: 'Admin' },
      { date: '2026-09-23 11:00', action: 'Resolution confirmed by both parties. Case closed.', by: 'Admin' }
    ]
  }
];
