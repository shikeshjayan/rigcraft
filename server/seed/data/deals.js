const deals = [
  {
    title: "Summer Gaming Bonanza",
    description: "Up to 30% off on gaming components — CPUs, GPUs, and more. Build your dream rig this summer!",
    startDate: new Date("2025-06-01"),
    endDate: new Date("2026-08-31"),
    promotion: {
      topBar: [
        {
          enabled: true,
          text: " Summer Sale — Up to 30% off on gaming components!",
        },
        {
          enabled: true,
          text: " Free shipping on orders above ₹999!",
        },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Summer Gaming Bonanza",
          description: "Score unbeatable deals on CPUs, GPUs, RAM, and storage. Limited stock!",
        },
      ],
    },
    buttonText: "Shop Deals",
    buttonLink: "/products?tag=gaming",
    displayOrder: 1,
    isActive: true,
    isFeatured: true,
  },
  {
    title: "Free Assembly on Prebuilt PCs",
    description: "Get free professional assembly, stress testing, and cable management on all prebuilt PCs.",
    startDate: new Date("2025-01-01"),
    endDate: new Date("2026-12-31"),
    promotion: {
      topBar: [
        {
          enabled: true,
          text: " Free assembly & stress testing on all prebuilt PCs!",
        },
      ],
      homeOffer: [
        {
          enabled: false,
        },
      ],
    },
    buttonText: "View Prebuilt PCs",
    buttonLink: "/prebuilt-pcs",
    displayOrder: 2,
    isActive: true,
    isFeatured: false,
  },
  {
    title: "Bundle & Save",
    description: "Save big when you bundle a CPU + Motherboard + RAM combo. Extra 5% off on select bundles.",
    startDate: new Date("2025-03-01"),
    endDate: new Date("2026-09-30"),
    promotion: {
      topBar: [
        {
          enabled: false,
        },
      ],
      homeOffer: [
        {
          enabled: true,
          title: "Bundle & Save",
          description: "CPU + Motherboard + RAM combos starting at ₹15,000. Extra 5% off with code BUNDLE5!",
        },
      ],
    },
    buttonText: "Explore Bundles",
    buttonLink: "/builds",
    displayOrder: 3,
    isActive: true,
    isFeatured: false,
  },
];

export default deals;
