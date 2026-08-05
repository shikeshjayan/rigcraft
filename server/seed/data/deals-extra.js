// 6 additional deals -> brings total to 9. Products/prebuiltPCs refs are attached by
// seed-more.js using the productSkus / prebuiltSkus lists; banners use real Unsplash photos.

const deals = [
  {
    title: "Monsoon Mega Sale",
    description: "The rain is here and so are the discounts! Up to 40% off on components and prebuilt PCs all monsoon long.",
    startDate: new Date("2026-07-01"),
    endDate: new Date("2026-08-31"),
    promotion: {
      topBar: [
        { enabled: true, text: " Monsoon Mega Sale — Up to 40% off sitewide!" },
        { enabled: true, text: " Extra 5% off with code MONSOON5!" },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Monsoon Mega Sale",
          description: "Massive savings on CPUs, GPUs, and full gaming rigs. Rain or shine, build your dream PC!",
        },
      ],
    },
    buttonText: "Shop the Sale",
    buttonLink: "/products?tag=gaming",
    displayOrder: 4,
    isActive: true,
    isFeatured: true,
    productSkus: [
      "CPU-AMD-9600X",
      "CPU-INT-14400F",
      "GPU-GIG-RX6600",
      "GPU-NVD-RTX4060",
      "RAM-COR-32GD5",
      "STO-SAM-980P1T",
      "PSU-COR-CX650",
      "CASE-COR-4000D",
    ],
  },
  {
    title: "RTX Blackwell Launch",
    description: "The next generation of ray tracing is here. Explore RTX 50 series GPUs and builds powered by Blackwell.",
    startDate: new Date("2026-01-15"),
    endDate: new Date("2026-12-31"),
    promotion: {
      topBar: [
        { enabled: true, text: " RTX 50 Series is now in stock!" },
        { enabled: false },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "RTX Blackwell Launch",
          description: "DLSS 4, GDDR7 memory, and next-gen ray tracing. Upgrade to the RTX 5070 or RTX 5080 today.",
        },
      ],
    },
    buttonText: "Explore RTX 50 Series",
    buttonLink: "/products?tag=blackwell",
    displayOrder: 5,
    isActive: true,
    isFeatured: true,
    productSkus: ["GPU-NVD-RTX5070", "GPU-NVD-RTX5080"],
    prebuiltSkus: ["PBR-GAM-004"],
  },
  {
    title: "Creator Week",
    description: "Unleash your creativity with our creator and workstation builds. Save on rigs built for rendering, editing and music.",
    startDate: new Date("2026-03-01"),
    endDate: new Date("2026-12-31"),
    promotion: {
      topBar: [
        { enabled: true, text: " Creator Week — Workstation builds starting at ₹79,999!" },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Creator Week",
          description: "Rigged for 3D, video, music, and design. Pro-level performance for every creative workflow.",
        },
      ],
    },
    buttonText: "View Creator Builds",
    buttonLink: "/prebuilt-pcs?category=workstation",
    displayOrder: 6,
    isActive: true,
    isFeatured: false,
    prebuiltSkus: [
      "PBR-WKS-001",
      "PBR-WKS-002",
      "PBR-WKS-004",
      "PBR-WKS-006",
      "PBR-STR-007",
      "PBR-CREATOR-001",
    ],
  },
  {
    title: "Budget Build Fest",
    description: "Great PCs don't need huge budgets. Save on budget gaming rigs and value components this month.",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-12-31"),
    promotion: {
      topBar: [
        { enabled: false },
        { enabled: true, text: " Budget Builds from just ₹29,999!" },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Budget Build Fest",
          description: "1080p gaming and office PCs that won't break the bank. Quality parts, smart prices.",
        },
      ],
    },
    buttonText: "Shop Budget Builds",
    buttonLink: "/prebuilt-pcs?category=budget",
    displayOrder: 7,
    isActive: true,
    isFeatured: false,
    prebuiltSkus: ["PBR-BUD-001", "PBR-BUD-002", "PBR-BUD-007", "PBR-START-001"],
  },
  {
    title: "Storage Blowout",
    description: "Expand your digital world. Huge discounts on NVMe SSDs and hard drives for every build.",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-10-31"),
    promotion: {
      topBar: [
        { enabled: true, text: " Storage Blowout — Up to 25% off SSDs!" },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Storage Blowout",
          description: "Fast NVMe drives and big-capacity HDDs at blowout prices. More games, more files, more speed.",
        },
      ],
    },
    buttonText: "Shop Storage",
    buttonLink: "/products?tag=storage",
    displayOrder: 8,
    isActive: true,
    isFeatured: false,
    productSkus: [
      "STO-SAM-990P1T",
      "STO-SAM-990P2T",
      "STO-SAM-980P1T",
      "STO-SAM-870E1T",
      "STO-WD-SN850X2",
      "STO-WD-SN7701T",
      "STO-WD-BLUE2T",
      "STO-CRU-P3P1T",
      "STO-CRU-P31T",
      "STO-KIN-NV21T",
      "STO-SEA-BARR2T",
      "STO-ADX-SX82001",
    ],
  },
  {
    title: "Software & OS Bundle",
    description: "Get genuine Windows 11 and Office at bundle prices. Everything you need to go from build to productive.",
    startDate: new Date("2026-06-01"),
    endDate: new Date("2026-12-31"),
    promotion: {
      topBar: [
        { enabled: false },
        { enabled: true, text: " Windows 11 + Office bundles — save up to ₹2,500!" },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Software & OS Bundle",
          description: "Genuine Windows 11 Home, Office 2021, and security software. Licensed, delivered digitally, activated instantly.",
        },
      ],
    },
    buttonText: "Shop Software",
    buttonLink: "/products?tag=software",
    displayOrder: 9,
    isActive: true,
    isFeatured: false,
    productSkus: [
      "SOFT-MIC-WIN11H",
      "SOFT-MIC-OFFICE21",
      "SOFT-JET-IDEA",
      "SOFT-KAS-TS1Y",
    ],
  },
];

export default deals;
