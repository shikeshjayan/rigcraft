// Curated Unsplash photo IDs - all verified returning HTTP 200
// via https://images.unsplash.com/photo-<id>

const photo = (id, params = "q=80&w=800&auto=format&fit=crop") =>
  `https://images.unsplash.com/photo-${id}?${params}`;

const PRODUCT_PARAMS = "q=80&w=800&auto=format&fit=crop";
const DESKTOP_PARAMS = "q=80&w=1920&h=600&fit=crop";
const MOBILE_PARAMS = "q=80&w=640&h=640&fit=crop";

export const IMAGE_POOLS = {
  cpu: [
    "1591488320449-011701bb6704",
    "1590779033100-9f60a05a013d",
    "1591799264318-7e6ef8ddb7ea",
    "1558655146-9f40138edfeb",
    "1544735716-392fe2489ffa",
  ],
  gpu: [
    "1591405351990-4726e331f141",
    "1587202372775-e229f172b9d7",
    "1555680202-c86f0e12f086",
    "1603287681836-b174ce5074c2",
    "1600185365483-26d7a4cc7519",
  ],
  motherboard: [
    "1518770660439-4636190af475",
    "1591799264318-7e6ef8ddb7ea",
    "1558655146-9f40138edfeb",
    "1544735716-392fe2489ffa",
  ],
  ram: [
    "1562979314-bee7453e911c",
    "1533227268428-f9ed0900fb3b",
    "1562778612-e1e0cda9915c",
    "1558655146-9f40138edfeb",
  ],
  storage: [
    "1618354691373-d851c5c3a990",
    "1541140532154-b024d705b90a",
    "1571171637578-41bc2dd41cd2",
    "1558494949-ef010cbdcc31",
  ],
  psu: [
    "1555617981-dac3880eac6e",
    "1546519638-68e109498ffc",
    "1588702547923-7093a6c3ba33",
    "1544197150-b99a580bb7a8",
  ],
  case: [
    "1598550476439-6847785fcea6",
    "1553406830-ef2513450d76",
    "1597872200969-2b65d56bd16b",
    "1598488035139-bdbb2231ce04",
    "1587440871875-191322ee64b0",
  ],
  cooler: [
    "1587202372775-e229f172b9d7",
    "1603287681836-b174ce5074c2",
    "1547394765-185e1e68f34e",
    "1597872200969-2b65d56bd16b",
    "1553406830-ef2513450d76",
  ],
  accessory: [
    "1606220945770-b5b6c2c55bf1",
    "1618384887929-16ec33fab9ef",
    "1611186871348-b1ce696e52c9",
    "1587829741301-dc798b83add3",
    "1595225476474-87563907a212",
    "1542838132-92c53300491e",
    "1527864550417-7fd91fc51a46",
    "1573148195900-7845dcb9b127",
    "1583394838336-acd977736f90",
    "1599669454699-248893623440",
    "1558618666-fcd25c85cd64",
  ],
  software: [
    "1555066931-4365d14bab8c",
    "1461749280684-dccba630e2f6",
    "1607799279861-4dd421887fb3",
    "1517430816045-df4b7de11d1d",
    "1504384308090-c894fdcc538d",
    "1498050108023-c5249f4df085",
    "1526374965328-7f61d4dc18c5",
    "1527443224154-c4a3942d3acf",
    "1522071820081-009f0129c71c",
    "1516321497487-e288fb19713f",
  ],
  prebuilt: [
    "1547394765-185e1e68f34e",
    "1553406830-ef2513450d76",
    "1597872200969-2b65d56bd16b",
    "1603287681836-b174ce5074c2",
    "1593305841991-05c297ba4575",
    "1552820728-8b83bb6b773f",
    "1550745165-9bc0b252726f",
    "1598488035139-bdbb2231ce04",
    "1587440871875-191322ee64b0",
    "1593640408182-31c70c8268f5",
    "1517336714731-489689fd1ca8",
    "1598550476439-6847785fcea6",
  ],
};

export const CATEGORY_IMAGES = {
  "CPU / Processors": "1591488320449-011701bb6704",
  "Graphics Cards": "1591405351990-4726e331f141",
  Motherboards: "1518770660439-4636190af475",
  "Memory (RAM)": "1562979314-bee7453e911c",
  "Storage (SSD / HDD)": "1618354691373-d851c5c3a990",
  "Power Supplies": "1555617981-dac3880eac6e",
  "PC Cases": "1598550476439-6847785fcea6",
  Cooling: "1587202372775-e229f172b9d7",
  Accessories: "1542838132-92c53300491e",
  "Software & OS": "1555066931-4365d14bab8c",
};

export const DEAL_IMAGES = [
  "1547394765-185e1e68f34e",
  "1553406830-ef2513450d76",
  "1603287681836-b174ce5074c2",
  "1593305841991-05c297ba4575",
  "1552820728-8b83bb6b773f",
  "1598488035139-bdbb2231ce04",
  "1587440871875-191322ee64b0",
  "1517430816045-df4b7de11d1d",
  "1550745165-9bc0b252726f",
];

export const buildProductImages = (poolName, name, index) => {
  const pool = IMAGE_POOLS[poolName] || IMAGE_POOLS.prebuilt;
  const primary = photo(pool[index % pool.length], PRODUCT_PARAMS);
  const secondary = photo(pool[(index + 1) % pool.length], PRODUCT_PARAMS);
  return [
    { url: primary, publicId: null, alt: name, isPrimary: true },
    { url: secondary, publicId: null, alt: `${name} (alternate)`, isPrimary: false },
  ];
};

export const buildCategoryImage = (categoryName) =>
  photo(CATEGORY_IMAGES[categoryName] || "1518770660439-4636190af475", PRODUCT_PARAMS);

export const buildDealBanner = (index) => ({
  desktop: photo(DEAL_IMAGES[index % DEAL_IMAGES.length], DESKTOP_PARAMS),
  mobile: photo(DEAL_IMAGES[index % DEAL_IMAGES.length], MOBILE_PARAMS),
});
