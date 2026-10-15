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
    icon: 'Laptop',
    description: 'Headphones, laptops, monitors, accessories & gadgets',
    status: 'Active'
  },
  {
    id: 'books',
    name: 'Books',
    slug: 'books',
    itemCount: 512,
    icon: 'BookOpen',
    description: 'Novels, textbooks, language guides & design publications',
    status: 'Active'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    slug: 'clothing',
    itemCount: 280,
    icon: 'Shirt',
    description: 'Jackets, casual wear, shoes, bags & minimalist apparel',
    status: 'Active'
  },
  {
    id: 'household',
    name: 'Household Items',
    slug: 'household',
    itemCount: 419,
    icon: 'Coffee',
    description: 'Kitchenware, ceramic sets, planters & cozy home decor',
    status: 'Active'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    slug: 'furniture',
    itemCount: 198,
    icon: 'Armchair',
    description: 'Desks, ergonomic chairs, coffee tables, shelves & lamps',
    status: 'Active'
  },
  {
    id: 'other',
    name: 'Other Items',
    slug: 'other',
    itemCount: 164,
    icon: 'Grid',
    description: 'Musical instruments, craft tools, sports gear & hobby goods',
    status: 'Active'
  }
];

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
