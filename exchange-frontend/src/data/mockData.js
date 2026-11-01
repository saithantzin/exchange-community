// Enhanced Mock Dataset for Community-Based Item Exchange Platform (Mandalay & Yangon)

export const CATEGORIES = [
  {
    id: 'electronics',
    name: 'Electronics',
    count: '342 items',
    icon: 'bi-laptop',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    description: 'Headphones, laptops, monitors, accessories & gadgets'
  },
  {
    id: 'books',
    name: 'Books',
    count: '512 items',
    icon: 'bi-book',
    image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&q=80',
    description: 'Novels, textbooks, language guides & design publications'
  },
  {
    id: 'clothing',
    name: 'Clothing',
    count: '280 items',
    icon: 'bi-bag-check',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80',
    description: 'Jackets, casual wear, shoes, bags & minimalist apparel'
  },
  {
    id: 'household',
    name: 'Household Items',
    count: '419 items',
    icon: 'bi-cup-hot',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80',
    description: 'Kitchenware, ceramic sets, planters & cozy home decor'
  },
  {
    id: 'furniture',
    name: 'Furniture',
    count: '198 items',
    icon: 'bi-lamp',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80',
    description: 'Desks, ergonomic chairs, coffee tables, shelves & lamps'
  },
  {
    id: 'other',
    name: 'Other Items',
    count: '164 items',
    icon: 'bi-grid-3x3-gap',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80',
    description: 'Musical instruments, craft tools, sports gear & hobby goods'
  }
];

export const INITIAL_ITEMS = [
  {
    id: 1,
    title: 'Minimalist Teak Wood Coffee Table',
    category: 'furniture',
    categoryName: 'Furniture',
    condition: 'Like New',
    conditionColor: '#87571B',
    conditionBg: '#F9F1E2',
    defects: 'Very minor hairline buff mark on the lower underside frame; top surface is pristine.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Ergonomic Desk Chair or Bookshelf',
    description: 'Handcrafted solid teak coffee table with subtle matte organic wax finish. Kept in smoke-free home for 6 months. Sturdy mortise-and-tenon joinery.',
    ownerId: 2,
    owner: {
      id: 2,
      name: 'Thiri Myint',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 14,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      joined: 'Joined Feb 2024'
    },
    shippingOption: 'In-Person Meetup in Chanayethazan',
    allowIntercity: false,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=800&q=80',
    createdAt: '2026-10-10 11:20',
    featured: true
  },
  {
    id: 2,
    title: 'Sony WH-1000XM4 Noise Canceling Headphones',
    category: 'electronics',
    categoryName: 'Electronics',
    condition: 'Good',
    conditionColor: '#3E6347',
    conditionBg: '#EAF2EC',
    defects: 'Slight cosmetic scuffing on left headband pivot; ear pads intact, audio & ANC 100% functional.',
    city: 'Yangon (YGN)',
    cityCode: 'YGN',
    exchangePreference: 'Looking for: Kindle Paperwhite or MDY Mechanical Keyboard',
    description: 'Authentic silver/platinum edition with original hard travel case, USB-C cable, and 3.5mm cable. Battery holds 28+ hours playtime.',
    ownerId: 3,
    owner: {
      id: 3,
      name: 'Kyaw Zin Htet',
      city: 'Yangon (YGN)',
      rating: 5.0,
      exchanges: 22,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      joined: 'Joined Aug 2023'
    },
    shippingOption: 'Yangon pickup or Royal Express Intercity Shipping to MDY',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    createdAt: '2026-10-10 09:15',
    featured: true
  },
  {
    id: 3,
    title: 'Japanese Ceramic Drip Coffee & Pour-Over Set',
    category: 'household',
    categoryName: 'Household Items',
    condition: 'New',
    conditionColor: '#2C5B7C',
    conditionBg: '#E8F1F7',
    defects: 'None. Brand new in original packaging.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Fiction Book collection or Indoor Ceramic Planter',
    description: 'Unused ceramic dripper with wooden collar, 600ml borosilicate glass server, and unbleached filter pack. Received as duplicate gift.',
    ownerId: 4,
    owner: {
      id: 4,
      name: 'Su Sandar',
      city: 'Mandalay (MDY)',
      rating: 4.8,
      exchanges: 9,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      joined: 'Joined Nov 2024'
    },
    shippingOption: 'Local Mandalay Meetup (Maharaungmyay)',
    allowIntercity: false,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80',
    createdAt: '2026-10-09 16:40',
    featured: true
  },
  {
    id: 4,
    title: 'Kindle Paperwhite 11th Gen (6.8" Warm Light)',
    category: 'electronics',
    categoryName: 'Electronics',
    condition: 'Like New',
    conditionColor: '#87571B',
    conditionBg: '#F9F1E2',
    defects: 'None. Screen is free of scratches; comes with protective sleeve.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Sony Headphones or iPad Keyboard',
    description: '8GB storage with magnetic fabric cover. Zero screen scratches, battery holds charge for weeks. Factory reset and ready to register.',
    ownerId: 5,
    owner: {
      id: 5,
      name: 'Aung Thu',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 19,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
      joined: 'Joined May 2024'
    },
    shippingOption: 'Mandalay meetup or Intercity shipping to Yangon',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80',
    createdAt: '2026-10-09 12:10',
    featured: true
  },
  {
    id: 5,
    title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
    category: 'books',
    categoryName: 'Books',
    condition: 'Good',
    conditionColor: '#3E6347',
    conditionBg: '#EAF2EC',
    defects: 'Minor sun-fading on slipcase; interior pages are clean and binding is tight.',
    city: 'Yangon (YGN)',
    cityCode: 'YGN',
    exchangePreference: 'Looking for: Desk Lamp or Vintage Art Print',
    description: 'Includes Scandinavian Living, Bauhaus Design, and Sustainable Architecture monograph. High quality full-color photographic plates.',
    ownerId: 6,
    owner: {
      id: 6,
      name: 'May Thu Lin',
      city: 'Yangon (YGN)',
      rating: 5.0,
      exchanges: 31,
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80',
      joined: 'Joined Jan 2023'
    },
    shippingOption: 'In-Person Meetup in Bahan / Kamayut',
    allowIntercity: false,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    createdAt: '2026-10-08 15:30',
    featured: false
  },
  {
    id: 6,
    title: 'Linen Casual Overshirt & Canvas Field Jacket (Size L)',
    category: 'clothing',
    categoryName: 'Clothing',
    condition: 'Good',
    conditionColor: '#3E6347',
    conditionBg: '#EAF2EC',
    defects: 'Gently worn, no stains or seam damage. Dry cleaned.',
    city: 'Yangon (YGN)',
    cityCode: 'YGN',
    exchangePreference: 'Looking for: Leather Backpack or Size M Knitwear',
    description: '100% organic sand linen shirt and earthy cotton field jacket. Quality horn buttons and reinforced pockets.',
    ownerId: 7,
    owner: {
      id: 7,
      name: 'Zaw Min Oo',
      city: 'Yangon (YGN)',
      rating: 4.7,
      exchanges: 8,
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=120&q=80',
      joined: 'Joined Sep 2024'
    },
    shippingOption: 'Yangon delivery / pickup',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80',
    createdAt: '2026-10-07 18:00',
    featured: false
  },
  {
    id: 7,
    title: 'Vintage Solid Ashwood Dining Chair',
    category: 'furniture',
    categoryName: 'Furniture',
    condition: 'Fair',
    conditionColor: '#786F66',
    conditionBg: '#EFE8DE',
    defects: 'Surface patina on the armrest and minor wood grain weathering; structurally completely solid.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Small Indoor Plant Stand or Table Lamp',
    description: 'Sturdy solid ashwood frame. Classic Danish silhouette with ergonomic curved backrest.',
    ownerId: 8,
    owner: {
      id: 8,
      name: 'Tin Tin Hla',
      city: 'Mandalay (MDY)',
      rating: 4.8,
      exchanges: 11,
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&q=80',
      joined: 'Joined Jun 2024'
    },
    shippingOption: 'Local Mandalay pickup only (Heavy wood)',
    allowIntercity: false,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=800&q=80',
    createdAt: '2026-10-06 14:15',
    featured: false
  },
  {
    id: 8,
    title: 'Yamaha F310 Acoustic Guitar with Padded Gig Bag',
    category: 'other',
    categoryName: 'Other Items',
    condition: 'Good',
    conditionColor: '#3E6347',
    conditionBg: '#EAF2EC',
    defects: 'Light pickguard scuffs; straight neck, comfortable low string action.',
    city: 'Yangon (YGN)',
    cityCode: 'YGN',
    exchangePreference: 'Looking for: Audio Interface or Studio Microphone',
    description: 'Spruce top with rosewood fretboard. Fresh D\'Addario phosphor bronze strings installed. Comes with clip-on tuner and capo.',
    ownerId: 9,
    owner: {
      id: 9,
      name: 'Sai Nyi Nyi',
      city: 'Yangon (YGN)',
      rating: 4.9,
      exchanges: 17,
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&q=80',
      joined: 'Joined Dec 2023'
    },
    shippingOption: 'Yangon meetups or Intercity bus cargo to Mandalay',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800&q=80',
    createdAt: '2026-10-05 10:45',
    featured: false
  }
];

// Current Member's Own Listed Items (For Thant Zin, Member ID: 1)
export const CURRENT_USER_ITEMS = [
  {
    id: 101,
    title: 'Solid Teak Study Desk with Drawers',
    category: 'furniture',
    categoryName: 'Furniture',
    condition: 'Like New',
    conditionColor: '#87571B',
    conditionBg: '#F9F1E2',
    defects: 'Tiny pen indent on top corner, otherwise spotless teak wood with smooth pull drawers.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Minimalist Coffee Table or Office Chair',
    description: 'Custom made solid teak wood desk. Dimensions: 120cm x 60cm x 75cm. Used for 4 months in study room.',
    ownerId: 1,
    owner: {
      id: 1,
      name: 'Thant Zin',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 6,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      joined: 'Member since Jan 2024'
    },
    shippingOption: 'Mandalay local pickup (Chanayethazan)',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80',
    createdAt: '2026-10-08 14:00',
    featured: true
  },
  {
    id: 102,
    title: 'Logitech MX Master 3S Wireless Mouse',
    category: 'electronics',
    categoryName: 'Electronics',
    condition: 'Like New',
    conditionColor: '#87571B',
    conditionBg: '#F9F1E2',
    defects: 'Complete with USB receiver and charging cable. Zero button glitches.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: Mechanical Keyboard or Type-C USB Hub',
    description: 'Graphite color, quiet clicks, 8K DPI sensor. Works on glass and multi-device connection.',
    ownerId: 1,
    owner: {
      id: 1,
      name: 'Thant Zin',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 6,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      joined: 'Member since Jan 2024'
    },
    shippingOption: 'Local pickup or Royal Express to Yangon',
    allowIntercity: true,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80',
    createdAt: '2026-10-09 10:20',
    featured: false
  },
  {
    id: 103,
    title: 'Ceramic Handcrafted Tea Pot & 4 Cups Set',
    category: 'household',
    categoryName: 'Household Items',
    condition: 'New',
    conditionColor: '#2C5B7C',
    conditionBg: '#E8F1F7',
    defects: 'Unused, perfect glaze finish, no chips.',
    city: 'Mandalay (MDY)',
    cityCode: 'MDY',
    exchangePreference: 'Looking for: English Literature Novels or Desk Planter',
    description: 'Earth-toned matte ceramic tea set crafted by local artisanal studio. High temperature fired stoneware.',
    ownerId: 1,
    owner: {
      id: 1,
      name: 'Thant Zin',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 6,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
      joined: 'Member since Jan 2024'
    },
    shippingOption: 'Local handover in Mandalay',
    allowIntercity: false,
    status: 'Available',
    images: [
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80'
    ],
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80',
    createdAt: '2026-10-10 14:45',
    featured: false
  }
];

// Initial Exchange Requests (Incoming & Outgoing)
export const INITIAL_REQUESTS = [
  {
    id: 'REQ-204',
    type: 'incoming', // Requester from Yangon proposing intercity courier exchange
    isIntercity: true,
    requester: {
      id: 3,
      name: 'Kyaw Zin Htet',
      city: 'Yangon (Kamayut)',
      rating: 5.0,
      exchanges: 22,
      joined: 'Joined Aug 2023',
      phone: '09450987654',
      viber: '09450987654',
      telegram: '@kyawzin_htet',
      facebook: 'https://facebook.com/kyawzin.htet',
      bio: 'Software engineer cycling pre-loved tech gadgets, audio gear, and books. Always packages parcels with bubble wrap for express courier.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
      items: [
        {
          id: 2,
          title: 'Sony WH-1000XM4 Noise Canceling Headphones',
          category: 'Electronics',
          condition: 'Like New',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
        },
        {
          id: 5,
          title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
          category: 'Books',
          condition: 'Good',
          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'
        }
      ]
    },
    requestedItem: {
      id: 102,
      title: 'Logitech MX Master 3S Wireless Mouse',
      city: 'Mandalay (MDY)',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'
    },
    offeredItem: {
      id: 2,
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      city: 'Yangon (YGN)',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
      condition: 'Like New'
    },
    handoverMethod: 'Intercity Courier Delivery (Yangon ⇄ Mandalay)',
    message: 'Hello Thant Zin! I am in Yangon and would love to exchange my Sony WH-1000XM4 headphones for your Logitech MX Master 3S in Mandalay. We can ship via Royal Express or Elite Cargo and confirm receipt independently.',
    date: '2026-10-15 14:30',
    status: 'Pending'
  },
  {
    id: 'REQ-201',
    type: 'incoming', // Requester offered an item for Thant Zin's item
    isIntercity: false,
    requester: {
      id: 2,
      name: 'Thiri Myint',
      city: 'Mandalay (MDY)',
      rating: 4.9,
      exchanges: 14,
      joined: 'Joined Feb 2024',
      phone: '09791112233',
      bio: 'Gardener and botanist interested in home decor, solid woodcraft, and organic planters living in Chanayethazan, Mandalay.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
      items: [
        {
          id: 1,
          title: 'Minimalist Teak Wood Coffee Table',
          category: 'Furniture',
          condition: 'Like New',
          image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80'
        }
      ]
    },
    requestedItem: {
      id: 101,
      title: 'Solid Teak Study Desk with Drawers',
      city: 'Mandalay (MDY)',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'
    },
    offeredItem: {
      id: 1,
      title: 'Minimalist Teak Wood Coffee Table',
      city: 'Mandalay (MDY)',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80',
      condition: 'Like New'
    },
    handoverMethod: 'Local Handover (Chanayethazan)',
    message: 'Hello Thant Zin! I noticed you are looking for living furniture. My teak coffee table matches your desk wood grain nicely. Would you like to swap this weekend?',
    date: '2026-10-11 09:30',
    status: 'Pending'
  },
  {
    id: 'REQ-202',
    type: 'outgoing', // Thant Zin proposed an exchange for another member's item
    recipient: {
      id: 3,
      name: 'Kyaw Zin Htet',
      city: 'Yangon (YGN)',
      rating: 5.0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80'
    },
    requestedItem: {
      id: 2,
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      city: 'Yangon (YGN)',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
    },
    offeredItem: {
      id: 102,
      title: 'Logitech MX Master 3S Wireless Mouse',
      city: 'Mandalay (MDY)',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80',
      condition: 'Like New'
    },
    handoverMethod: 'In-Person Meetup',
    message: 'Hi Kyaw Zin, offering my mint MX Master 3S mouse for your Sony headphones. Can meet at any cafe in town.',
    date: '2026-10-10 16:15',
    status: 'Pending'
  },
  {
    id: 'REQ-203',
    type: 'incoming',
    isIntercity: false,
    requester: {
      id: 6,
      name: 'May Thu Lin',
      city: 'Yangon (YGN)',
      rating: 5.0,
      exchanges: 31,
      joined: 'Joined Jan 2023',
      phone: '09420001122',
      bio: 'Interior stylist offering vintage prints and ceramicware.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&q=80',
      items: [
        {
          id: 5,
          title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
          category: 'Books',
          condition: 'Good',
          image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'
        }
      ]
    },
    requestedItem: {
      id: 103,
      title: 'Ceramic Handcrafted Tea Pot & 4 Cups Set',
      city: 'Mandalay (MDY)',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80'
    },
    offeredItem: {
      id: 5,
      title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
      city: 'Yangon (YGN)',
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80',
      condition: 'Good'
    },
    handoverMethod: 'In-Person Meetup',
    message: 'I would love to trade my architecture art books for your handmade ceramic tea set! Can meet at a central mall.',
    date: '2026-10-09 11:00',
    status: 'Accepted'
  }
];

// Active Ongoing & Past Exchanges (Section 3.F & 3.G)
export const INITIAL_EXCHANGES = [
  {
    id: 'EXC-8801',
    status: 'In Transit',
    isIntercity: true,
    intercityStage: 4,
    deposits: {
      partyA: {
        itemTitle: 'Logitech MX Master 3S Wireless Mouse',
        category: 'Electronics',
        amount: 100000,
        status: 'Verified',
        paymentMethod: 'KBZPay',
        referenceNumber: 'KBZ-491204',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        submittedAt: '2026-10-08 11:20',
        verifiedAt: '2026-10-08 11:35'
      },
      partyB: {
        itemTitle: 'Sony WH-1000XM4 Noise Canceling Headphones',
        category: 'Electronics',
        amount: 100000,
        status: 'Verified',
        paymentMethod: 'WavePay',
        referenceNumber: 'WAVE-819441',
        slipImage: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&q=80',
        submittedAt: '2026-10-08 11:15',
        verifiedAt: '2026-10-08 11:30'
      }
    },
    courierArrangement: {
      confirmed: true,
      confirmedAt: '2026-10-09'
    },
    refundWorkflow: {
      initiated: false,
      status: 'Pending',
      partyA: {
        amount: 100000,
        walletType: 'KBZPay',
        accountNumber: '',
        accountName: '',
        status: 'Pending Details',
        requestedAt: null,
        transactionRef: null
      },
      partyB: {
        amount: 100000,
        walletType: 'WavePay',
        accountNumber: '09450987654',
        accountName: 'Kyaw Zin Htet',
        status: 'Processing Payout',
        requestedAt: 'Today',
        transactionRef: null
      }
    },
    handoverMethod: 'Intercity Courier Delivery',
    initiatedDate: '2026-10-08',
    itemA: {
      title: 'Logitech MX Master 3S Wireless Mouse',
      ownerName: 'Thant Zin (You)',
      ownerCity: 'Mandalay',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'
    },
    itemB: {
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      ownerName: 'Kyaw Zin Htet',
      ownerCity: 'Yangon',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
    },
    partyA: {
      name: 'Thant Zin (You)',
      city: 'Mandalay',
      courier: 'Royal Express',
      trackingNumber: 'RX-8921-MY',
      dispatched: true,
      confirmedReceipt: false
    },
    partyB: {
      name: 'Kyaw Zin Htet',
      city: 'Yangon',
      phone: '09450987654',
      viber: '09450987654',
      telegram: '@kyawzin_htet',
      facebook: 'https://facebook.com/kyawzin.htet',
      courier: 'Elite Cargo Express',
      trackingNumber: 'EC-7721-YM',
      dispatched: true,
      confirmedReceipt: true
    },
    courierTracking: {
      route: 'Mandalay ⇄ Yangon Express Transit',
      currentLocation: 'Yangon Central Cargo Sorting Hub',
      eta: 'Arriving Tomorrow'
    },
    isCompleted: false,
    disputeFiled: false
  },
  {
    id: 'EXC-8802',
    status: 'In Progress',
    isIntercity: false,
    handoverMethod: 'In-Person Meetup',
    initiatedDate: '2026-10-10',
    itemA: {
      title: 'Solid Teak Study Desk with Drawers',
      ownerName: 'Thant Zin (You)',
      ownerCity: 'Mandalay',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'
    },
    itemB: {
      title: 'Minimalist Teak Wood Coffee Table',
      ownerName: 'Thiri Myint',
      ownerCity: 'Mandalay',
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80'
    },
    meetupLocation: '73rd St Coffee Circle, Mandalay',
    isCompleted: false,
    disputeFiled: false
  },
  {
    id: 'EXC-7704',
    status: 'Completed',
    isIntercity: false,
    handoverMethod: 'In-Person Meetup',
    initiatedDate: '2026-09-24',
    completedDate: '2026-09-27',
    itemA: {
      title: 'Vintage Film Camera (Olympus OM-1)',
      ownerName: 'Thant Zin (You)',
      ownerCity: 'Mandalay',
      image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=80'
    },
    itemB: {
      title: 'Mechanical Keyboard (Keychron K2)',
      ownerName: 'Su Sandar',
      ownerCity: 'Mandalay',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80'
    },
    meetupLocation: 'Mingalar Mandalay Plaza',
    isCompleted: true,
    disputeFiled: false,
    reviewGiven: {
      rating: 5,
      comment: 'Super smooth local meetup in Chanayethazan. Keychron keyboard was in perfect condition as described!'
    }
  }
];

// Initial Disputes & Reports (Section 3.H)
export const INITIAL_DISPUTES = [
  {
    id: 'DISP-501',
    reportedItemTitle: 'Apple iPad 9th Gen (Listing #402)',
    reportedUser: 'Aung Kyaw (Yangon)',
    category: 'Misleading Condition / Battery Degradation',
    date: '2026-10-02',
    reason: 'Listed as Like New with 98% battery health, but upon receipt diagnostic shows 64% battery and cracked audio jack.',
    evidenceCount: 3,
    status: 'Admin Review Completed',
    adminResolution: 'Listing suspended. Offerer issued a formal warning for undisclosed defects. Trade cancelled.'
  }
];

// Initial Notifications (Section 3.J)
export const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    title: 'New Exchange Proposal Received',
    message: 'Thiri Myint proposed to exchange "Minimalist Teak Wood Coffee Table" for your "Solid Teak Study Desk".',
    time: '2 hours ago',
    type: 'request',
    link: '/requests',
    read: false
  },
  {
    id: 'NOTIF-2',
    title: 'Exchange Completed Notification',
    message: 'Kyaw Zin Htet confirmed completion of Exchange #EXC-8801 upon in-person meetup.',
    time: 'Yesterday',
    type: 'shipping',
    link: '/exchange/EXC-8801',
    read: false
  },
  {
    id: 'NOTIF-3',
    title: 'Smart Match Recommendation Found',
    message: 'New high-score match (98%) discovered in Mandalay for your Study Desk.',
    time: '2 days ago',
    type: 'match',
    link: '/matches',
    read: true
  }
];

export const SMART_MATCHES_DATA = [
  {
    id: 'match-101',
    matchScore: 98,
    matchType: 'Perfect Match (Local MDY)',
    memberItem: {
      id: 101,
      title: 'Solid Teak Study Desk with Drawers',
      city: 'Mandalay (MDY)',
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=400&q=80'
    },
    offeredItem: {
      id: 1,
      title: 'Minimalist Teak Wood Coffee Table',
      city: 'Mandalay (MDY)',
      condition: 'Like New',
      ownerName: 'Thiri Myint',
      ownerRating: 4.9,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=400&q=80'
    },
    matchReason: 'Direct category alignment (Furniture) • Identical condition (Like New) • Both in Mandalay for easy face-to-face inspection.',
    intercity: false
  },
  {
    id: 'match-102',
    matchScore: 94,
    matchType: 'Intercity Opportunity (MDY ⇄ YGN)',
    memberItem: {
      id: 102,
      title: 'Logitech MX Master 3S Wireless Mouse',
      city: 'Mandalay (MDY)',
      condition: 'Like New',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&q=80'
    },
    offeredItem: {
      id: 2,
      title: 'Sony WH-1000XM4 Noise Canceling Headphones',
      city: 'Yangon (YGN)',
      condition: 'Good',
      ownerName: 'Kyaw Zin Htet',
      ownerRating: 5.0,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80'
    },
    matchReason: 'Mutual tech wishlist cross-match! Owner is looking for peripheral gear, you desired audio equipment.',
    intercity: false,
    shippingNote: 'Convenient in-person meetup supported'
  },
  {
    id: 'match-103',
    matchScore: 89,
    matchType: 'Cross-Category Match',
    memberItem: {
      id: 103,
      title: 'Ceramic Handcrafted Tea Pot & 4 Cups Set',
      city: 'Mandalay (MDY)',
      condition: 'New',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&q=80'
    },
    offeredItem: {
      id: 5,
      title: 'Design & Architecture Hardcover Book Collection (5 Vols)',
      city: 'Yangon (YGN)',
      condition: 'Good',
      ownerName: 'May Thu Lin',
      ownerRating: 5.0,
      image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&q=80'
    },
    matchReason: 'Matches your registered reading interest list • High community rating on both sides • Equal estimated trade utility.',
    intercity: false,
    shippingNote: 'Safe direct handover recommended'
  }
];

export const TESTIMONIALS_DATA = [
  {
    id: 1,
    name: 'Aye Chan Moe',
    city: 'Mandalay (MDY)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&q=80',
    rating: 5,
    exchangeSummary: 'Exchanged Canon DSLR Lens for an Ultra-wide Monitor',
    comment: 'Meeting in person gave me complete peace of mind. We met at a cafe near 78th street, inspected each other\'s gear, and confirmed the swap right on our phones.'
  },
  {
    id: 2,
    name: 'Kaung Sett Naing',
    city: 'Yangon (YGN)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    rating: 5,
    exchangeSummary: 'Local Swap: Wooden Bookshelf for Coffee Table',
    comment: 'Swapping items directly within our community was seamless. We met at a central spot, verified our items, and completed the trade with zero hassle.'
  },
  {
    id: 3,
    name: 'Eaint Thet Phoo',
    city: 'Mandalay (MDY)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    rating: 5,
    exchangeSummary: 'Exchanged 8 University Textbooks for Kitchenware',
    comment: 'Instead of having heavy books gather dust in my closet after graduation, another student got them, and I received lovely coffee cups for my new flat. Truly sustainable!'
  }
];

export const PLATFORM_STATS = {
  itemsExchanged: '14,280',
  activeMembers: '6,420',
  landfillWastePreventedKg: '18,650',
  co2SavedTons: '28.4',
  averageRating: '4.9 / 5.0',
  intercitySwapsCompleted: '3,840'
};
