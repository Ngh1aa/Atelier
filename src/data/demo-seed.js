// ATELIER demo seed — the single source for every piece of user data in the prototype.
//
// There is no backend. On the first visit in a browser tab the commerce store copies
// this seed into sessionStorage; every later read and write uses that tab-local copy,
// so data survives navigation and reload but never leaves the tab. "Reset demo data"
// clears the copy and seeds again from here.
//
// Everything below is fictional demo content. No real customer, order, payment or
// account exists behind it.

export const DEMO_SEED_VERSION = 2;

const DAY = 24 * 60 * 60 * 1000;

function isoDaysAgo(now, days, hour = 10) {
  const date = new Date(now.getTime() - days * DAY);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

export function createDemoSeed(now = new Date()) {
  return {
    version: DEMO_SEED_VERSION,

    // Variant stock per product → colour → size. Zero means sold out; the PDP then
    // offers "Notify me". Stock is decremented by demo orders and restored on cancel.
    inventory: {
      "tailored-wool-blazer": { black: { XS: 4, S: 6, M: 2, L: 0, XL: 3 }, ivory: { XS: 0, S: 3, M: 5, L: 1, XL: 0 } },
      "cashmere-overcoat": { camel: { S: 5, M: 4, L: 3, XL: 2 }, charcoal: { S: 0, M: 2, L: 4, XL: 1 } },
      "merino-knit-dress": { black: { XS: 3, S: 7, M: 9, L: 2 }, oat: { XS: 0, S: 0, M: 3, L: 5 } },
      "silk-drape-blouse": { ivory: { XS: 2, S: 5, M: 6, L: 3 }, black: { XS: 4, S: 0, M: 1, L: 2 } },
      "linen-wide-trousers": { stone: { 26: 3, 28: 5, 30: 4, 32: 2, 34: 0 }, black: { 26: 0, 28: 2, 30: 6, 32: 3, 34: 1 } },
      "suede-chelsea-boots": { espresso: { XS: 2, S: 4, M: 4, L: 3 }, black: { XS: 1, S: 3, M: 0, L: 2 } },
      "viscose-wrap-top": { black: { XS: 3, S: 5, M: 4, L: 2 }, claret: { XS: 0, S: 0, M: 0, L: 0 } },
      "leather-minimal-tote": { black: { XS: 4, S: 6, M: 5, L: 3 }, cognac: { XS: 2, S: 0, M: 3, L: 1 } },
      "tailored-coat": { camel: { S: 3, M: 4, L: 2, XL: 1 } },
      "silk-gown": { midnight: { XS: 2, S: 3, M: 3, L: 1 } },
      "urban-knit": { cream: { S: 4, M: 6, L: 3, XL: 2 } },
      "silk-midnight-gown": { midnight: { XS: 1, S: 3, M: 2, L: 2, XL: 0 } },
    },

    // Promo codes accepted by the simulated Bag. "expired" and "minSubtotal" exist so
    // the invalid paths can be demonstrated.
    promoCodes: [
      { code: "ATELIER10", type: "percent", value: 10, label: "10% off the current edit" },
      { code: "WELCOME200", type: "fixed", value: 200000, minSubtotal: 3000000, label: "200.000 ₫ off orders from 3.000.000 ₫" },
      { code: "FALL2025", type: "percent", value: 15, expired: true, label: "Fall 2025 preview" },
    ],

    // One demo client. Passwords are demo-only and stored in this tab, never sent anywhere.
    accounts: [
      { email: "client@atelier.demo", password: "atelier-demo", fullName: "Linh Tran", phone: "0901 234 567", createdAt: isoDaysAgo(now, 120) },
    ],

    addresses: [
      { id: "ADDR-HOME", accountEmail: "client@atelier.demo", label: "Home", fullName: "Linh Tran", phone: "0901 234 567", address: "12 Nguyen Hue", apartment: "Apt 8B", district: "District 1", province: "Ho Chi Minh City", postalCode: "700000", isDefault: true },
      { id: "ADDR-STUDIO", accountEmail: "client@atelier.demo", label: "Studio", fullName: "Linh Tran", phone: "0901 234 567", address: "45 Hang Bai", apartment: "", district: "Hoan Kiem", province: "Ha Noi", postalCode: "100000", isDefault: false },
    ],

    // Two demo orders for the demo client: one delivered (eligible for return or
    // exchange), one still processing (eligible for cancellation).
    orders: [
      {
        id: "AT-DEMO-2041",
        reality: "SIMULATED_LOCAL",
        currency: "VND",
        status: "processing",
        accountEmail: "client@atelier.demo",
        customer: { email: "client@atelier.demo", phone: "0901 234 567", fullName: "Linh Tran" },
        address: { country: "Vietnam", address: "12 Nguyen Hue", apartment: "Apt 8B", district: "District 1", province: "Ho Chi Minh City", postalCode: "700000" },
        deliveryMethod: "standard",
        deliveryEstimate: "2–4 days after dispatch",
        paymentMethod: "cod",
        paymentStatus: "pending-local",
        fulfillmentStatus: "recorded-local",
        items: [
          { productId: "silk-drape-blouse", variantId: "silk-drape-blouse-ivory-s", name: "Sheer Collar Shirt", image: "./assets/products/pinkparks/sheer-collar-shirt.jpg", color: "Ivory", size: "S", quantity: 1, unitPrice: 1490000 },
        ],
        subtotal: 1490000, shippingFee: 0, discount: 0, total: 1490000,
        giftNote: "",
        serviceRequests: [],
        timeline: [{ status: "processing", at: isoDaysAgo(now, 1, 15) }],
        createdAt: isoDaysAgo(now, 1, 15),
      },
      {
        id: "AT-DEMO-1987",
        reality: "SIMULATED_LOCAL",
        currency: "VND",
        status: "delivered",
        accountEmail: "client@atelier.demo",
        customer: { email: "client@atelier.demo", phone: "0901 234 567", fullName: "Linh Tran" },
        address: { country: "Vietnam", address: "45 Hang Bai", apartment: "", district: "Hoan Kiem", province: "Ha Noi", postalCode: "100000" },
        deliveryMethod: "express",
        deliveryEstimate: "Delivered",
        paymentMethod: "bank-transfer",
        paymentStatus: "paid-simulated",
        fulfillmentStatus: "delivered-simulated",
        items: [
          { productId: "tailored-wool-blazer", variantId: "tailored-wool-blazer-black-s", name: "Belted Cropped Jacket", image: "./assets/products/pinkparks/belted-cropped-jacket.jpg", color: "Black", size: "S", quantity: 1, unitPrice: 3490000 },
          { productId: "linen-wide-trousers", variantId: "linen-wide-trousers-stone-28", name: "Layered Barrel Trousers", image: "./assets/products/pinkparks/layered-barrel-pants.jpg", color: "Stone", size: "28", quantity: 1, unitPrice: 1890000 },
        ],
        subtotal: 5380000, shippingFee: 250000, discount: 538000, total: 5092000,
        promoCode: "ATELIER10",
        giftNote: "",
        serviceRequests: [],
        timeline: [
          { status: "processing", at: isoDaysAgo(now, 9, 11) },
          { status: "shipped", at: isoDaysAgo(now, 8, 9) },
          { status: "delivered", at: isoDaysAgo(now, 6, 16) },
        ],
        createdAt: isoDaysAgo(now, 9, 11),
      },
    ],

    cart: [],
    wishlist: [],

    // Client Services fitting appointments: opening hours and the slots already taken.
    appointments: {
      services: [
        { id: "fitting", label: "Fitting consultation", minutes: 45 },
        { id: "styling", label: "Personal styling", minutes: 60 },
        { id: "alteration", label: "Alteration review", minutes: 30 },
      ],
      times: ["10:00", "11:30", "14:00", "15:30", "17:00"],
      daysAhead: 14,
      closedWeekdays: [0],
      // Day offsets from today and times that are already booked by other (fictional) clients.
      taken: [{ dayOffset: 1, time: "10:00" }, { dayOffset: 1, time: "14:00" }, { dayOffset: 2, time: "11:30" }],
      booked: [],
    },
  };
}
