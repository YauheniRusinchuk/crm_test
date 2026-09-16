import type { Product, Supplier, Shipment, Delivery, User, AppState, StatusLog } from "./types";

const DATA_VERSION = "3";

export const DEFAULT_CATEGORIES = ["Электрика", "Хранение", "Оборудование", "Упаковка", "СИЗ", "Прочее"];

export const seedUsers: User[] = [
  {
    id: "u1", name: "Михаил Орлов", email: "admin@warehq.ru", password: "admin123",
    role: "admin", department: "Управление", phone: "+7 495 100-00-01",
    createdAt: "2023-01-15", active: true,
  },
  {
    id: "u2", name: "Анна Смирнова", email: "manager@warehq.ru", password: "pass123",
    role: "manager", department: "Логистика", phone: "+7 495 100-00-02",
    createdAt: "2023-03-20", active: true,
  },
  {
    id: "u3", name: "Дмитрий Козлов", email: "operator@warehq.ru", password: "pass123",
    role: "operator", department: "Склад", phone: "+7 495 100-00-03",
    createdAt: "2023-06-11", active: true,
  },
  {
    id: "u4", name: "Елена Попова", email: "elena@warehq.ru", password: "pass123",
    role: "operator", department: "Склад", phone: "+7 495 100-00-04",
    createdAt: "2024-01-05", active: true,
  },
  {
    id: "u5", name: "Иван Новиков", email: "ivan@warehq.ru", password: "pass123",
    role: "manager", department: "Закупки", phone: "+7 495 100-00-05",
    createdAt: "2024-02-18", active: false,
  },
];

export const seedSuppliers: Supplier[] = [
  {
    id: "sup1", name: "ЭлектроПарт Про", contact: "Сергей Белов", email: "s.belov@electropart.ru",
    phone: "+7 812 300-10-20", address: "г. Санкт-Петербург, ул. Промышленная, 14",
    country: "Россия", rating: 5, totalOrders: 42, active: true, createdAt: "2022-05-10",
  },
  {
    id: "sup2", name: "СейфГир Снаб", contact: "Ольга Тихонова", email: "o.tikhonova@safegear.ru",
    phone: "+7 495 200-30-40", address: "г. Москва, ул. Складская, 7",
    country: "Россия", rating: 4, totalOrders: 27, active: true, createdAt: "2022-11-01",
  },
  {
    id: "sup3", name: "ПакРайт Индастриз", contact: "Пётр Зайцев", email: "p.zaitsev@packright.ru",
    phone: "+7 343 400-50-60", address: "г. Екатеринбург, пр. Уральский, 88",
    country: "Россия", rating: 4, totalOrders: 19, active: true, createdAt: "2023-02-14",
  },
  {
    id: "sup4", name: "СторСмарт ООО", contact: "Наталья Федорова", email: "n.fedorova@storsmart.ru",
    phone: "+7 383 500-60-70", address: "г. Новосибирск, ул. Торговая, 3",
    country: "Россия", rating: 3, totalOrders: 11, active: true, createdAt: "2023-08-22",
  },
];

export const seedProducts: Product[] = [
  { id: "p1",  sku: "WH-001", name: "Кабельная катушка (промышленная)", category: "Электрика",   unit: "шт.",  stock: 142, minStock: 50,  maxStock: 300, costPrice: 2200,  sellPrice: 3800,  supplierId: "sup1", location: "А1-01", barcode: "4607178250011", photo: "https://images.unsplash.com/photo-1763926025680-7966e45e48f5?w=400&h=400&fit=crop&auto=format", description: "Промышленная кабельная катушка для стационарной проводки, диаметр 200 мм." },
  { id: "p2",  sku: "WH-002", name: "Паллет усиленный",                 category: "Хранение",    unit: "шт.",  stock: 38,  minStock: 40,  maxStock: 200, costPrice: 1600,  sellPrice: 2700,  supplierId: "sup4", location: "Б3-12", barcode: "4607178250022", photo: "https://images.unsplash.com/photo-1768158988512-ad31657fe5b8?w=400&h=400&fit=crop&auto=format", description: "Деревянный паллет повышенной грузоподъёмности до 1500 кг, EUR 1200×800." },
  { id: "p3",  sku: "WH-003", name: "Аккумулятор для погрузчика",        category: "Оборудование", unit: "шт.",  stock: 11,  minStock: 15,  maxStock: 50,  costPrice: 28000, sellPrice: 44000, supplierId: "sup1", location: "В2-05", barcode: "4607178250033", photo: "https://images.unsplash.com/photo-1777026321659-64941fb943dd?w=400&h=400&fit=crop&auto=format", description: "Тяговый аккумулятор 48В / 400 Ач для вилочных погрузчиков." },
  { id: "p4",  sku: "WH-004", name: "Стретч-плёнка (рулон)",             category: "Упаковка",    unit: "рул.", stock: 280, minStock: 100, maxStock: 600, costPrice: 380,   sellPrice: 760,   supplierId: "sup3", location: "А2-08", barcode: "4607178250044", photo: "https://images.unsplash.com/photo-1564887583610-b246d9838f04?w=400&h=400&fit=crop&auto=format", description: "Стретч-плёнка 500мм × 300м, 20 мкм, первичное сырьё." },
  { id: "p5",  sku: "WH-005", name: "Каска защитная",                    category: "СИЗ",         unit: "шт.",  stock: 57,  minStock: 30,  maxStock: 150, costPrice: 820,   sellPrice: 1600,  supplierId: "sup2", location: "Г1-03", barcode: "4607178250055", photo: "https://images.unsplash.com/photo-1781157080615-ffde66c035a5?w=400&h=400&fit=crop&auto=format", description: "Защитная каска класс E, диэлектрическая, цвет жёлтый, ГОСТ 12.4.207." },
  { id: "p6",  sku: "WH-006", name: "Принтер этикеток",                  category: "Оборудование", unit: "шт.",  stock: 6,   minStock: 10,  maxStock: 30,  costPrice: 16500, sellPrice: 26500, supplierId: "sup1", location: "Д0-01", barcode: "4607178250066", photo: "https://images.unsplash.com/photo-1781899710894-f9ecfea088f3?w=400&h=400&fit=crop&auto=format", description: "Термотрансферный принтер 203 DPI, скорость 127 мм/с, USB + LAN." },
  { id: "p7",  sku: "WH-007", name: "Антистатичные пакеты (уп. 100шт)", category: "Упаковка",    unit: "уп.",  stock: 92,  minStock: 50,  maxStock: 300, costPrice: 1100,  sellPrice: 2000,  supplierId: "sup3", location: "А3-14", barcode: "4607178250077", photo: "https://images.unsplash.com/photo-1605718317361-f9326fd262ca?w=400&h=400&fit=crop&auto=format", description: "Антистатичные zip-пакеты 200×300 мм, толщина 75 мкм, 100 шт/уп." },
  { id: "p8",  sku: "WH-008", name: "Стеллаж металлический",             category: "Хранение",    unit: "шт.",  stock: 24,  minStock: 20,  maxStock: 80,  costPrice: 7900,  sellPrice: 12500, supplierId: "sup4", location: "Б1-07", barcode: "4607178250088", photo: "https://images.unsplash.com/photo-1758609554462-c415542ce531?w=400&h=400&fit=crop&auto=format", description: "Складской стеллаж 5-ярусный, грузоподъёмность 200 кг/полку, В2000×Ш1000×Г500." },
  { id: "p9",  sku: "WH-009", name: "Перчатки рабочие (пара)",           category: "СИЗ",         unit: "пара", stock: 210, minStock: 80,  maxStock: 500, costPrice: 120,   sellPrice: 250,   supplierId: "sup2", location: "Г1-02", barcode: "4607178250099", photo: "https://images.unsplash.com/photo-1662309376159-b95fb193d96b?w=400&h=400&fit=crop&auto=format", description: "Перчатки комбинированные кожаные, размеры M/L/XL." },
  { id: "p10", sku: "WH-010", name: "Стеллаж архивный",                  category: "Хранение",    unit: "шт.",  stock: 15,  minStock: 8,   maxStock: 60,  costPrice: 4200,  sellPrice: 7100,  supplierId: "sup4", location: "Б2-10", barcode: "4607178250100", photo: "https://images.unsplash.com/photo-1770910195585-825a1181a704?w=400&h=400&fit=crop&auto=format", description: "Архивный стеллаж полочный, В2300×Ш1000×Г400, нагрузка 80 кг/полку." },
  { id: "p11", sku: "WH-011", name: "Тележка складская (250 кг)",        category: "Оборудование", unit: "шт.",  stock: 9,   minStock: 5,   maxStock: 25,  costPrice: 6800,  sellPrice: 11200, supplierId: "sup4", location: "В1-01", barcode: "4607178250111", photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop&auto=format", description: "Платформенная тележка с поручнем, грузоподъёмность 250 кг, колёса d=150 мм." },
  { id: "p12", sku: "WH-012", name: "Коробка картонная Т-24 (10 шт)",   category: "Упаковка",    unit: "уп.",  stock: 540, minStock: 200, maxStock: 1200,costPrice: 290,   sellPrice: 550,   supplierId: "sup3", location: "А1-15", barcode: "4607178250122", photo: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop&auto=format", description: "Гофрокартонная коробка Т-24, формат 400×300×300 мм, пакет 10 шт." },
  { id: "p13", sku: "WH-013", name: "Жилет сигнальный (кл. 2)",         category: "СИЗ",         unit: "шт.",  stock: 83,  minStock: 40,  maxStock: 200, costPrice: 340,   sellPrice: 680,   supplierId: "sup2", location: "Г2-01", barcode: "4607178250133", photo: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=400&fit=crop&auto=format", description: "Жилет сигнальный класс 2 EN 471, цвет оранжевый, размеры S–3XL." },
  { id: "p14", sku: "WH-014", name: "УЗО 40А двухполюсное",             category: "Электрика",   unit: "шт.",  stock: 64,  minStock: 30,  maxStock: 150, costPrice: 1850,  sellPrice: 3200,  supplierId: "sup1", location: "А1-04", barcode: "4607178250144", photo: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=400&h=400&fit=crop&auto=format", description: "Устройство защитного отключения 40А/30мА, 2P, IEC 61008." },
  { id: "p15", sku: "WH-015", name: "Термоусадочная трубка 10 мм (бух)",category: "Электрика",   unit: "шт.",  stock: 48,  minStock: 20,  maxStock: 120, costPrice: 760,   sellPrice: 1400,  supplierId: "sup1", location: "А1-06", barcode: "4607178250155", photo: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop&auto=format", description: "ТУТ 2:1, диаметр 10/5 мм, длина 100 м, чёрная." },
  { id: "p16", sku: "WH-016", name: "Пузырчатая плёнка (рулон 50м)",    category: "Упаковка",    unit: "рул.", stock: 130, minStock: 60,  maxStock: 400, costPrice: 650,   sellPrice: 1200,  supplierId: "sup3", location: "А2-11", barcode: "4607178250166", photo: "https://images.unsplash.com/photo-1602052577122-f73b9710adba?w=400&h=400&fit=crop&auto=format", description: "Воздушно-пузырчатая плёнка 3-слойная, ширина 600 мм, 50 м/рул." },
  { id: "p17", sku: "WH-017", name: "Очки защитные (антизапотевающие)", category: "СИЗ",         unit: "шт.",  stock: 155, minStock: 50,  maxStock: 400, costPrice: 280,   sellPrice: 590,   supplierId: "sup2", location: "Г1-05", barcode: "4607178250177", photo: "https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=400&h=400&fit=crop&auto=format", description: "Очки защитные открытые, антизапотевающее покрытие, прозрачная линза." },
  { id: "p18", sku: "WH-018", name: "Сканер штрихкодов Honeywell",      category: "Оборудование", unit: "шт.",  stock: 8,   minStock: 4,   maxStock: 20,  costPrice: 12000, sellPrice: 19500, supplierId: "sup1", location: "Д0-03", barcode: "4607178250188", photo: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?w=400&h=400&fit=crop&auto=format", description: "1D/2D сканер, USB + BT, IP54, дальность 30 см." },
  { id: "p19", sku: "WH-019", name: "Мешок полипропиленовый (уп. 50шт)",category: "Упаковка",    unit: "уп.",  stock: 200, minStock: 80,  maxStock: 600, costPrice: 480,   sellPrice: 900,   supplierId: "sup3", location: "А3-02", barcode: "4607178250199", photo: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop&auto=format", description: "Мешок 50×80 см, 55 г/м², белый, 50 шт/уп." },
  { id: "p20", sku: "WH-020", name: "Стеллаж мобильный с колёсами",     category: "Хранение",    unit: "шт.",  stock: 7,   minStock: 3,   maxStock: 20,  costPrice: 9500,  sellPrice: 15800, supplierId: "sup4", location: "Б1-12", barcode: "4607178250200", photo: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop&auto=format", description: "Мобильный стеллаж 4 полки, размер 900×400×1800, колёса с блокировкой." },
  { id: "p21", sku: "WH-021", name: "Автомат выключатель 16А",          category: "Электрика",   unit: "шт.",  stock: 220, minStock: 80,  maxStock: 500, costPrice: 290,   sellPrice: 550,   supplierId: "sup1", location: "А1-08", barcode: "4607178250211", photo: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=400&fit=crop&auto=format", description: "Автоматический выключатель 1P 16А класс C, IEC 60898." },
  { id: "p22", sku: "WH-022", name: "Скотч упаковочный (рулон 50м)",    category: "Упаковка",    unit: "рул.", stock: 680, minStock: 200, maxStock: 1500,costPrice: 95,    sellPrice: 180,   supplierId: "sup3", location: "А2-03", barcode: "4607178250222", photo: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400&h=400&fit=crop&auto=format", description: "Скотч акриловый прозрачный 48 мм × 50 м, 40 мкм." },
  { id: "p23", sku: "WH-023", name: "Ботинки защитные S3 (пара)",       category: "СИЗ",         unit: "пара", stock: 34,  minStock: 20,  maxStock: 100, costPrice: 3200,  sellPrice: 5800,  supplierId: "sup2", location: "Г2-05", barcode: "4607178250233", photo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop&auto=format", description: "Ботинки кожаные класс S3 SRC, стальной подносок и стелька, антискользящая подошва." },
  { id: "p24", sku: "WH-024", name: "Терминал сбора данных (ТСД)",      category: "Оборудование", unit: "шт.",  stock: 5,   minStock: 3,   maxStock: 15,  costPrice: 38000, sellPrice: 62000, supplierId: "sup1", location: "Д0-05", barcode: "4607178250244", photo: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=400&fit=crop&auto=format", description: "Промышленный ТСД Android 11, 2D-камера, IP65, Wi-Fi + BT." },
  { id: "p25", sku: "WH-025", name: "Поддон пластиковый 1200×800",      category: "Хранение",    unit: "шт.",  stock: 60,  minStock: 25,  maxStock: 150, costPrice: 2100,  sellPrice: 3500,  supplierId: "sup4", location: "Б3-01", barcode: "4607178250255", photo: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=400&fit=crop&auto=format", description: "Пластиковый паллет 1200×800×160, грузоподъём 1000 кг." },
  { id: "p26", sku: "WH-026", name: "Распределительный щит ЩРН-12",    category: "Электрика",   unit: "шт.",  stock: 18,  minStock: 8,   maxStock: 50,  costPrice: 2800,  sellPrice: 4900,  supplierId: "sup1", location: "А1-10", barcode: "4607178250266", photo: "https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=400&h=400&fit=crop&auto=format", description: "Щит навесной на 12 модулей, IP41, металл, с дверью." },
  { id: "p27", sku: "WH-027", name: "Наушники противошумные (SNR 33)",  category: "СИЗ",         unit: "шт.",  stock: 74,  minStock: 30,  maxStock: 200, costPrice: 650,   sellPrice: 1250,  supplierId: "sup2", location: "Г1-07", barcode: "4607178250277", photo: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop&auto=format", description: "Наушники противошумные с оголовьем, SNR 33 дБ, EN 352-1." },
  { id: "p28", sku: "WH-028", name: "Конвейерная лента (1 м)",          category: "Оборудование", unit: "м",    stock: 45,  minStock: 20,  maxStock: 120, costPrice: 1400,  sellPrice: 2600,  supplierId: "sup4", location: "В2-08", barcode: "4607178250288", photo: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=400&fit=crop&auto=format", description: "Резиновая конвейерная лента ширина 500 мм, толщина 8 мм." },
];

export const seedShipments: Shipment[] = [
  { id: "s1",  ref: "ОТГ-2024-001", destination: "Казань, Татарстан",          carrier: "СДЭК",           trackingNumber: "CDEK-8847221", items: [{ productId: "p1",  qty: 20 }, { productId: "p4",  qty: 50  }], status: "delivered",  date: "2024-07-10", deliveredDate: "2024-07-13", notes: "Плановая поставка по договору №12-А", managerId: "u2" },
  { id: "s2",  ref: "ОТГ-2024-002", destination: "Екатеринбург, Урал",          carrier: "Деловые Линии",  trackingNumber: "DL-5534981",   items: [{ productId: "p5",  qty: 15 }, { productId: "p8",  qty: 4   }], status: "dispatched", date: "2024-07-18", notes: "Срочная отгрузка, приоритет А",      managerId: "u2" },
  { id: "s3",  ref: "ОТГ-2024-003", destination: "Новосибирск, СФО",            carrier: "Почта России",   trackingNumber: "",              items: [{ productId: "p3",  qty: 3  }],                                   status: "draft",      date: "2024-07-22", notes: "",                                   managerId: "u1" },
  { id: "s4",  ref: "ОТГ-2024-004", destination: "Краснодар, ЮФО",              carrier: "СДЭК",           trackingNumber: "CDEK-9912743", items: [{ productId: "p7",  qty: 30 }, { productId: "p4",  qty: 80  }], status: "dispatched", date: "2024-07-20", notes: "Доставка до двери",                   managerId: "u2" },
  { id: "s5",  ref: "ОТГ-2024-005", destination: "Нижний Новгород, ПФО",        carrier: "Деловые Линии",  trackingNumber: "DL-6621054",   items: [{ productId: "p9",  qty: 100}, { productId: "p5",  qty: 20  }], status: "delivered",  date: "2024-07-05", deliveredDate: "2024-07-08", notes: "",       managerId: "u2" },
  { id: "s6",  ref: "ОТГ-2024-006", destination: "Ростов-на-Дону, ЮФО",        carrier: "ПЭК",            trackingNumber: "PEK-3345612",  items: [{ productId: "p12", qty: 50 }, { productId: "p22", qty: 100 }], status: "delivered",  date: "2024-06-28", deliveredDate: "2024-07-02", notes: "",       managerId: "u2" },
  { id: "s7",  ref: "ОТГ-2024-007", destination: "Уфа, Башкортостан",           carrier: "СДЭК",           trackingNumber: "CDEK-7721003", items: [{ productId: "p11", qty: 2  }, { productId: "p20", qty: 1   }], status: "delivered",  date: "2024-06-15", deliveredDate: "2024-06-20", notes: "",       managerId: "u1" },
  { id: "s8",  ref: "ОТГ-2024-008", destination: "Самара, ПФО",                 carrier: "Энергия",        trackingNumber: "EN-1198745",   items: [{ productId: "p13", qty: 25 }, { productId: "p17", qty: 40  }], status: "delivered",  date: "2024-06-10", deliveredDate: "2024-06-14", notes: "",       managerId: "u2" },
  { id: "s9",  ref: "ОТГ-2024-009", destination: "Пермь, ПФО",                  carrier: "Деловые Линии",  trackingNumber: "DL-7743291",   items: [{ productId: "p14", qty: 10 }, { productId: "p21", qty: 50  }], status: "dispatched", date: "2024-07-21", notes: "Хрупкий груз, осторожно",            managerId: "u2" },
  { id: "s10", ref: "ОТГ-2024-010", destination: "Воронеж, ЦФО",                carrier: "Почта России",   trackingNumber: "",              items: [{ productId: "p23", qty: 8  }],                                   status: "draft",      date: "2024-07-23", notes: "",                                   managerId: "u1" },
  { id: "s11", ref: "ОТГ-2024-011", destination: "Красноярск, СФО",             carrier: "СДЭК",           trackingNumber: "CDEK-6634512", items: [{ productId: "p9",  qty: 80 }, { productId: "p27", qty: 30  }], status: "delivered",  date: "2024-05-30", deliveredDate: "2024-06-05", notes: "",       managerId: "u2" },
  { id: "s12", ref: "ОТГ-2024-012", destination: "Омск, СФО",                   carrier: "ПЭК",            trackingNumber: "PEK-4456123",  items: [{ productId: "p16", qty: 20 }, { productId: "p19", qty: 10  }], status: "delivered",  date: "2024-05-22", deliveredDate: "2024-05-28", notes: "",       managerId: "u2" },
  { id: "s13", ref: "ОТГ-2024-013", destination: "Челябинск, УрФО",             carrier: "Деловые Линии",  trackingNumber: "DL-8812674",   items: [{ productId: "p2",  qty: 10 }, { productId: "p25", qty: 15  }], status: "dispatched", date: "2024-07-19", notes: "",                                   managerId: "u1" },
  { id: "s14", ref: "ОТГ-2024-014", destination: "Тюмень, УрФО",                carrier: "СДЭК",           trackingNumber: "CDEK-5523987", items: [{ productId: "p6",  qty: 3  }, { productId: "p18", qty: 2   }], status: "cancelled",  date: "2024-07-08", notes: "Клиент отменил заказ",               managerId: "u2" },
  { id: "s15", ref: "ОТГ-2024-015", destination: "Иркутск, СФО",                carrier: "Почта России",   trackingNumber: "PR-9934521",   items: [{ productId: "p15", qty: 15 }, { productId: "p1",  qty: 5   }], status: "delivered",  date: "2024-05-14", deliveredDate: "2024-05-21", notes: "",       managerId: "u2" },
  { id: "s16", ref: "ОТГ-2024-016", destination: "Хабаровск, ДФО",              carrier: "СДЭК",           trackingNumber: "CDEK-4412876", items: [{ productId: "p24", qty: 2  }],                                   status: "dispatched", date: "2024-07-17", notes: "Хрупкий, страховка включена",        managerId: "u1" },
  { id: "s17", ref: "ОТГ-2024-017", destination: "Владивосток, ДФО",            carrier: "DHL",            trackingNumber: "DHL-7823410",  items: [{ productId: "p4",  qty: 60 }, { productId: "p12", qty: 80  }], status: "delivered",  date: "2024-04-25", deliveredDate: "2024-05-03", notes: "",       managerId: "u2" },
  { id: "s18", ref: "ОТГ-2024-018", destination: "Томск, СФО",                  carrier: "Энергия",        trackingNumber: "EN-2234891",   items: [{ productId: "p7",  qty: 20 }, { productId: "p16", qty: 10  }], status: "delivered",  date: "2024-04-18", deliveredDate: "2024-04-23", notes: "",       managerId: "u2" },
  { id: "s19", ref: "ОТГ-2024-019", destination: "Барнаул, СФО",                carrier: "Деловые Линии",  trackingNumber: "DL-9921345",   items: [{ productId: "p10", qty: 5  }, { productId: "p8",  qty: 3   }], status: "delivered",  date: "2024-04-10", deliveredDate: "2024-04-16", notes: "",       managerId: "u1" },
  { id: "s20", ref: "ОТГ-2024-020", destination: "Архангельск, СЗФО",           carrier: "Почта России",   trackingNumber: "PR-5543219",   items: [{ productId: "p5",  qty: 10 }, { productId: "p9",  qty: 50  }], status: "delivered",  date: "2024-03-28", deliveredDate: "2024-04-06", notes: "",       managerId: "u2" },
  { id: "s21", ref: "ОТГ-2024-021", destination: "Мурманск, СЗФО",              carrier: "ПЭК",            trackingNumber: "PEK-6612345",  items: [{ productId: "p26", qty: 6  }, { productId: "p21", qty: 30  }], status: "delivered",  date: "2024-03-15", deliveredDate: "2024-03-22", notes: "",       managerId: "u2" },
  { id: "s22", ref: "ОТГ-2024-022", destination: "Калининград, СЗФО",           carrier: "DHL",            trackingNumber: "DHL-3345678",  items: [{ productId: "p17", qty: 20 }, { productId: "p13", qty: 15  }], status: "dispatched", date: "2024-07-16", notes: "",                                   managerId: "u1" },
  { id: "s23", ref: "ОТГ-2024-023", destination: "Сочи, ЮФО",                  carrier: "СДЭК",           trackingNumber: "CDEK-3301985", items: [{ productId: "p22", qty: 200}, { productId: "p19", qty: 5   }], status: "delivered",  date: "2024-03-05", deliveredDate: "2024-03-10", notes: "",       managerId: "u2" },
  { id: "s24", ref: "ОТГ-2024-024", destination: "Астрахань, ЮФО",              carrier: "Деловые Линии",  trackingNumber: "DL-1123456",   items: [{ productId: "p28", qty: 15 }],                                   status: "draft",      date: "2024-07-24", notes: "Требуется подтверждение клиента",    managerId: "u1" },
  { id: "s25", ref: "ОТГ-2024-025", destination: "Волгоград, ЮФО",              carrier: "ПЭК",            trackingNumber: "PEK-7789023",  items: [{ productId: "p11", qty: 3  }, { productId: "p20", qty: 2   }], status: "cancelled",  date: "2024-06-01", notes: "Технический сбой",                    managerId: "u2" },
];

export const seedDeliveries: Delivery[] = [
  { id: "d1",  ref: "ПОС-2024-001", supplierId: "sup1", items: [{ productId: "p1",  qty: 100 }, { productId: "p6",  qty: 5  }], status: "received", expectedDate: "2024-07-05", receivedDate: "2024-07-06", invoiceNumber: "СФ-2024-778", notes: "Принято без замечаний" },
  { id: "d2",  ref: "ПОС-2024-002", supplierId: "sup2", items: [{ productId: "p5",  qty: 50  }],                                  status: "partial",  expectedDate: "2024-07-15", invoiceNumber: "СФ-2024-819", notes: "Получено 30 из 50 шт, остаток ожидается" },
  { id: "d3",  ref: "ПОС-2024-003", supplierId: "sup3", items: [{ productId: "p4",  qty: 200 }, { productId: "p7",  qty: 40  }], status: "expected", expectedDate: "2024-07-25", invoiceNumber: "СФ-2024-852", notes: "" },
  { id: "d4",  ref: "ПОС-2024-004", supplierId: "sup4", items: [{ productId: "p8",  qty: 10  }, { productId: "p2",  qty: 20  }], status: "expected", expectedDate: "2024-07-28", invoiceNumber: "СФ-2024-860", notes: "" },
  { id: "d5",  ref: "ПОС-2024-005", supplierId: "sup1", items: [{ productId: "p14", qty: 30  }, { productId: "p21", qty: 100 }], status: "received", expectedDate: "2024-06-20", receivedDate: "2024-06-21", invoiceNumber: "СФ-2024-741", notes: "" },
  { id: "d6",  ref: "ПОС-2024-006", supplierId: "sup2", items: [{ productId: "p9",  qty: 200 }, { productId: "p13", qty: 60  }], status: "received", expectedDate: "2024-06-10", receivedDate: "2024-06-12", invoiceNumber: "СФ-2024-703", notes: "Принято с актом" },
  { id: "d7",  ref: "ПОС-2024-007", supplierId: "sup3", items: [{ productId: "p12", qty: 100 }, { productId: "p22", qty: 300 }], status: "received", expectedDate: "2024-06-05", receivedDate: "2024-06-05", invoiceNumber: "СФ-2024-681", notes: "" },
  { id: "d8",  ref: "ПОС-2024-008", supplierId: "sup4", items: [{ productId: "p25", qty: 30  }, { productId: "p10", qty: 10  }], status: "expected", expectedDate: "2024-08-02", invoiceNumber: "СФ-2024-891", notes: "Внеплановая закупка" },
  { id: "d9",  ref: "ПОС-2024-009", supplierId: "sup1", items: [{ productId: "p15", qty: 20  }, { productId: "p26", qty: 8   }], status: "received", expectedDate: "2024-05-28", receivedDate: "2024-05-30", invoiceNumber: "СФ-2024-654", notes: "" },
  { id: "d10", ref: "ПОС-2024-010", supplierId: "sup2", items: [{ productId: "p17", qty: 100 }, { productId: "p27", qty: 50  }], status: "received", expectedDate: "2024-05-15", receivedDate: "2024-05-16", invoiceNumber: "СФ-2024-622", notes: "" },
  { id: "d11", ref: "ПОС-2024-011", supplierId: "sup3", items: [{ productId: "p16", qty: 50  }, { productId: "p19", qty: 20  }], status: "received", expectedDate: "2024-05-02", receivedDate: "2024-05-04", invoiceNumber: "СФ-2024-598", notes: "" },
  { id: "d12", ref: "ПОС-2024-012", supplierId: "sup1", items: [{ productId: "p3",  qty: 5   }, { productId: "p18", qty: 3   }], status: "expected", expectedDate: "2024-08-05", invoiceNumber: "СФ-2024-902", notes: "Ожидается с заводского склада" },
  { id: "d13", ref: "ПОС-2024-013", supplierId: "sup4", items: [{ productId: "p11", qty: 5   }, { productId: "p20", qty: 3   }], status: "received", expectedDate: "2024-04-20", receivedDate: "2024-04-22", invoiceNumber: "СФ-2024-561", notes: "" },
  { id: "d14", ref: "ПОС-2024-014", supplierId: "sup2", items: [{ productId: "p23", qty: 20  }],                                  status: "cancelled",expectedDate: "2024-04-10", invoiceNumber: "СФ-2024-532", notes: "Поставщик отменил отгрузку" },
  { id: "d15", ref: "ПОС-2024-015", supplierId: "sup3", items: [{ productId: "p4",  qty: 150 }, { productId: "p22", qty: 200 }], status: "received", expectedDate: "2024-04-05", receivedDate: "2024-04-07", invoiceNumber: "СФ-2024-510", notes: "" },
  { id: "d16", ref: "ПОС-2024-016", supplierId: "sup1", items: [{ productId: "p6",  qty: 10  }, { productId: "p24", qty: 3   }], status: "received", expectedDate: "2024-03-25", receivedDate: "2024-03-26", invoiceNumber: "СФ-2024-482", notes: "Комплектация проверена" },
  { id: "d17", ref: "ПОС-2024-017", supplierId: "sup4", items: [{ productId: "p2",  qty: 50  }, { productId: "p8",  qty: 15  }], status: "received", expectedDate: "2024-03-12", receivedDate: "2024-03-15", invoiceNumber: "СФ-2024-451", notes: "" },
  { id: "d18", ref: "ПОС-2024-018", supplierId: "sup2", items: [{ productId: "p5",  qty: 30  }, { productId: "p13", qty: 40  }], status: "received", expectedDate: "2024-03-01", receivedDate: "2024-03-03", invoiceNumber: "СФ-2024-428", notes: "" },
  { id: "d19", ref: "ПОС-2024-019", supplierId: "sup1", items: [{ productId: "p1",  qty: 80  }, { productId: "p15", qty: 30  }], status: "received", expectedDate: "2024-02-20", receivedDate: "2024-02-22", invoiceNumber: "СФ-2024-391", notes: "" },
  { id: "d20", ref: "ПОС-2024-020", supplierId: "sup3", items: [{ productId: "p7",  qty: 60  }, { productId: "p19", qty: 15  }], status: "received", expectedDate: "2024-02-08", receivedDate: "2024-02-10", invoiceNumber: "СФ-2024-362", notes: "" },
  { id: "d21", ref: "ПОС-2024-021", supplierId: "sup4", items: [{ productId: "p10", qty: 8   }, { productId: "p25", qty: 20  }], status: "expected", expectedDate: "2024-08-10", invoiceNumber: "СФ-2024-915", notes: "" },
  { id: "d22", ref: "ПОС-2024-022", supplierId: "sup1", items: [{ productId: "p28", qty: 30  }],                                  status: "expected", expectedDate: "2024-08-08", invoiceNumber: "СФ-2024-910", notes: "Новый поставщик оборудования" },
  { id: "d23", ref: "ПОС-2024-023", supplierId: "sup2", items: [{ productId: "p17", qty: 80  }, { productId: "p27", qty: 40  }], status: "partial",  expectedDate: "2024-07-20", invoiceNumber: "СФ-2024-873", notes: "Поступило 50% партии" },
  { id: "d24", ref: "ПОС-2024-024", supplierId: "sup3", items: [{ productId: "p16", qty: 40  }, { productId: "p12", qty: 80  }], status: "received", expectedDate: "2024-01-25", receivedDate: "2024-01-28", invoiceNumber: "СФ-2024-310", notes: "" },
  { id: "d25", ref: "ПОС-2024-025", supplierId: "sup1", items: [{ productId: "p21", qty: 150 }, { productId: "p14", qty: 20  }], status: "received", expectedDate: "2024-01-15", receivedDate: "2024-01-17", invoiceNumber: "СФ-2024-285", notes: "" },
];

export const STORAGE_KEY = "warehq_state";

function inferShipmentHistory(s: Shipment): StatusLog[] {
  if (s.history?.length) return s.history;
  const h: StatusLog[] = [{ status: "draft", at: s.date }];
  if (s.status === "dispatched" || s.status === "delivered") h.push({ status: "dispatched", at: s.date });
  if (s.status === "delivered") h.push({ status: "delivered", at: s.deliveredDate ?? s.date });
  if (s.status === "cancelled") h.push({ status: "cancelled", at: s.date });
  return h;
}

function inferDeliveryHistory(d: Delivery): StatusLog[] {
  if (d.history?.length) return d.history;
  const h: StatusLog[] = [{ status: "expected", at: d.expectedDate }];
  if (d.status === "partial") h.push({ status: "partial", at: d.receivedDate ?? d.expectedDate });
  if (d.status === "received") h.push({ status: "received", at: d.receivedDate ?? d.expectedDate });
  if (d.status === "cancelled") h.push({ status: "cancelled", at: d.expectedDate });
  return h;
}

function withHistory(state: AppState): AppState {
  return {
    ...state,
    shipments: (state.shipments ?? []).map(s => ({ ...s, history: inferShipmentHistory(s) })),
    deliveries: (state.deliveries ?? []).map(d => ({ ...d, history: inferDeliveryHistory(d) })),
  };
}

function withCategories(state: AppState): AppState {
  const fromProducts = (state.products ?? []).map(p => p.category).filter(Boolean);
  const merged = [...new Set([...DEFAULT_CATEGORIES, ...(state.categories ?? []), ...fromProducts])];
  return { ...state, categories: merged };
}

export function loadState(): AppState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.__version !== DATA_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return withHistory(withCategories(parsed));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, __version: DATA_VERSION }));
  } catch { /* ignore */ }
}

export function defaultState(): AppState {
  return {
    currentUser: null,
    users: seedUsers,
    products: seedProducts,
    suppliers: seedSuppliers,
    shipments: seedShipments.map(s => ({ ...s, history: inferShipmentHistory(s) })),
    deliveries: seedDeliveries.map(d => ({ ...d, history: inferDeliveryHistory(d) })),
    companyName: "СкладПро ООО",
    currency: "₽",
    categories: DEFAULT_CATEGORIES,
  };
}
