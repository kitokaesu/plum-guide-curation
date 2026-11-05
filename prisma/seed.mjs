/**
 * Plum Guide seed script.
 * Run with: npm run db:seed
 *
 * Resets all application data and inserts demo users, vetted homes, calendar
 * availability, bookings, cancellations and Plum Test inspection slots.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";

const prisma = new PrismaClient();

const DAY = 86_400_000;
const CLEANING_FEE = 180;
const SERVICE_RATE = 0.08;

const now = new Date();
const TODAY = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
);

const addDays = (base, days) => new Date(base.getTime() + days * DAY);
const dateKey = (d) => d.toISOString().slice(0, 10);
const money = (n) => Math.round(n * 100) / 100;

function atHour(offset, hour, minute = 0) {
  const d = addDays(TODAY, offset);
  d.setUTCHours(hour, minute, 0, 0);
  return d;
}

function quote(nights, nightly) {
  const subtotal = money(nights * nightly);
  const service = money(subtotal * SERVICE_RATE);
  return {
    nightlySubtotal: subtotal,
    cleaningFee: CLEANING_FEE,
    serviceFee: service,
    totalPrice: money(subtotal + CLEANING_FEE + service),
  };
}

const usedRefs = new Set();
function reference() {
  let ref = "";
  do {
    ref = `PLM-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  } while (usedRefs.has(ref));
  usedRefs.add(ref);
  return ref;
}

const users = [
  {
    key: "amelia",
    fullName: "Amelia Hart",
    email: "guest@plumguide.com",
    password: "Guest123!",
    role: "GUEST",
  },
  {
    key: "noah",
    fullName: "Noah Bennett",
    email: "noah@example.com",
    password: "Guest123!",
    role: "GUEST",
  },
  {
    key: "eleanor",
    fullName: "Eleanor Whitfield",
    email: "host@plumguide.com",
    password: "Host123!",
    role: "HOST",
  },
  {
    key: "rafael",
    fullName: "Rafael Mendes",
    email: "rafael@plumguide.com",
    password: "Host123!",
    role: "HOST",
  },
  {
    key: "ingrid",
    fullName: "Ingrid Solberg",
    email: "ingrid@plumguide.com",
    password: "Host123!",
    role: "HOST",
  },
  {
    key: "margot",
    fullName: "Margot Bell",
    email: "specialist@plumguide.com",
    password: "Specialist123!",
    role: "SPECIALIST",
  },
  {
    key: "julian",
    fullName: "Julian Okafor",
    email: "julian@plumguide.com",
    password: "Specialist123!",
    role: "SPECIALIST",
  },
  {
    key: "sofia",
    fullName: "Sofia Marchetti",
    email: "sofia@plumguide.com",
    password: "Specialist123!",
    role: "SPECIALIST",
  },
  {
    key: "priya",
    fullName: "Priya Raman",
    email: "admin@plumguide.com",
    password: "Admin123!",
    role: "ADMIN",
  },
];

const properties = [
  {
    key: "gilded-barn",
    host: "eleanor",
    title: "The Gilded Barn",
    location: "Cotswolds, England",
    nightlyRate: 680,
    status: "APPROVED",
    plumScore: 96,
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
    tagline: "A honey-stone barn with a copper bath and meadow views.",
    description:
      "Hidden at the end of a hawthorn lane, The Gilded Barn pairs original oak beams with a quietly modern interior. Mornings begin with coffee on the south terrace; evenings end beside the open fire with a bottle from the village merchant. The kitchen is a proper cook's kitchen — limestone counters, a range big enough for Sunday lunch, and a pantry stocked by your host.",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    blocked: [
      [15, 17],
      [58, 60],
    ],
    customPrices: { 30: 745, 31: 745, 32: 745 },
  },
  {
    key: "villa-fico",
    host: "eleanor",
    title: "Villa Fico",
    location: "Amalfi Coast, Italy",
    nightlyRate: 1240,
    status: "APPROVED",
    plumScore: 98,
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
    tagline: "Cliffside terraces, a fig-tree pergola and the Tyrrhenian below.",
    description:
      "A 1920s villa restored by a Milanese architect, Villa Fico tumbles down the cliff in a series of terraces. The infinity pool appears to spill into the sea; the pergola is strung with vines and lanterns. Inside, cool plaster walls, hand-painted tiles and a kitchen built for long lunches. A private path leads to the water in four minutes.",
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    blocked: [[50, 54]],
    customPrices: { 70: 1420, 71: 1420 },
  },
  {
    key: "casa-do-sol",
    host: "rafael",
    title: "Casa do Sol",
    location: "Comporta, Portugal",
    nightlyRate: 540,
    status: "APPROVED",
    plumScore: 91,
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
    tagline: "Barefoot luxury among the pines and rice fields.",
    description:
      "Whitewashed walls, rattan, and a pool that catches the last of the afternoon light. Casa do Sol is Comporta at its most effortless: linen everywhere, an outdoor shower, and a kitchen that opens straight onto the terrace. The beach is a ten-minute cycle through the pines, and the village market is five minutes further.",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    blocked: [],
    customPrices: {},
  },
  {
    key: "olive-stone",
    host: "ingrid",
    title: "Olive & Stone",
    location: "Provence, France",
    nightlyRate: 720,
    status: "APPROVED",
    plumScore: 93,
    imageUrl:
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1600&q=80",
    tagline: "A restored mas with lavender, stone and a long shaded table.",
    description:
      "This eighteenth-century mas has been in the same family for four generations. Thick stone walls keep the summer heat at bay; the courtyard is planted with lavender and old olive trees. The long table under the plane tree seats twelve, and the local chef will come and cook if you ask nicely.",
    bedrooms: 5,
    bathrooms: 3,
    maxGuests: 10,
    blocked: [[25, 27]],
    customPrices: {},
  },
  {
    key: "aegean-retreat",
    host: "ingrid",
    title: "The Aegean Retreat",
    location: "Santorini, Greece",
    nightlyRate: 980,
    status: "APPROVED",
    plumScore: 95,
    imageUrl:
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80",
    tagline: "Cave-cut rooms, a sunset pool and nothing but caldera.",
    description:
      "Carved into the cliff above Oia, The Aegean Retreat is a study in white and blue. The plunge pool faces due west; the terrace has shaded daybeds and a bar stocked with assyrtiko. Bedrooms are cool cave rooms with linen sheets and hand-thrown ceramics. Breakfast arrives in a basket each morning.",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    blocked: [[33, 35]],
    customPrices: { 45: 1080, 46: 1080 },
  },
  {
    key: "deia-house",
    host: "rafael",
    title: "Deià House",
    location: "Mallorca, Spain",
    nightlyRate: 860,
    status: "APPROVED",
    plumScore: 89,
    imageUrl:
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1600&q=80",
    tagline: "A stone finca above Deià, all terraces and tramuntana air.",
    description:
      "Perched above the village with the Tramuntana behind it, Deià House is a sequence of stone terraces, olive trees and quiet corners. The main house has a generous kitchen and two fires; the guest annexe opens onto the pool. Walk into Deià for dinner, or stay put and watch the light change over the hills.",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 7,
    blocked: [[42, 44]],
    customPrices: {},
  },
  {
    key: "fitzroy-loft",
    host: "eleanor",
    title: "The Fitzroy Loft",
    location: "London, England",
    nightlyRate: 450,
    status: "APPROVED",
    plumScore: 88,
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
    tagline: "A gallery-like loft in a converted Victorian warehouse.",
    description:
      "Double-height windows, polished concrete and a mezzanine library: The Fitzroy Loft is a proper city bolt-hole. It sits in a quiet courtyard off one of the most interesting streets in the East End, with the best coffee in London at the end of the road. Perfect for a couple, or for two who like their own space.",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    blocked: [[20, 22]],
    customPrices: {},
  },
  {
    key: "sahara-skies",
    host: "rafael",
    title: "Sahara Skies Villa",
    location: "Marrakech, Morocco",
    nightlyRate: 610,
    status: "APPROVED",
    plumScore: 92,
    imageUrl:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
    tagline: "An ochre-walled riad with a courtyard of orange trees.",
    description:
      "Behind a studded door in the medina, Sahara Skies opens into a courtyard of citrus trees and zellige tile. The roof terrace looks out over the Atlas on a clear day; the hammam is a proper one. Breakfast is served wherever you happen to be sitting, and the house car will take you to the desert for sunset.",
    bedrooms: 4,
    bathrooms: 4,
    maxGuests: 8,
    blocked: [],
    customPrices: {},
  },
  {
    key: "tulum-garden",
    host: "ingrid",
    title: "Tulum Garden House",
    location: "Tulum, Mexico",
    nightlyRate: 395,
    status: "APPROVED",
    plumScore: 87,
    imageUrl:
      "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80",
    tagline: "Jungle garden, cenote swims and a very good hammock.",
    description:
      "A low-slung house in the jungle, ten minutes from the beach. The garden is the point: palms, a small cenote-fed pool, and more hammocks than guests. Interiors are simple and beautiful — parota wood, local textiles, ceiling fans. Come here to do very little, beautifully.",
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    blocked: [],
    customPrices: {},
  },
  {
    key: "cliffside-atelier",
    host: "eleanor",
    title: "Cliffside Atelier",
    location: "Mykonos, Greece",
    nightlyRate: 1050,
    status: "INSPECTION_PENDING",
    plumScore: null,
    imageUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=80",
    tagline: "An artist's house on the rocks, awaiting its Plum Test.",
    description:
      "Built by a painter in the 1970s and recently restored, Cliffside Atelier is a whitewashed house with a studio, a broad terrace and unbeatable sunset views. The host has submitted it for Plum Test inspection — a specialist will visit shortly to assess it against our 150-point standard.",
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    blocked: [],
    customPrices: {},
  },
  {
    key: "redwood-cabin",
    host: "rafael",
    title: "The Redwood Cabin",
    location: "Big Sur, USA",
    nightlyRate: 780,
    status: "INSPECTION_PENDING",
    plumScore: null,
    imageUrl:
      "https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&w=1600&q=80",
    tagline: "Redwood decks, a wood stove and Pacific fog.",
    description:
      "A cedar cabin tucked into a grove of redwoods, with a deck that hangs over the ravine. Inside: a wood stove, a record player, and shelves of books left by previous guests. The host is awaiting the Plum Test before opening dates to guests.",
    bedrooms: 2,
    bathrooms: 1,
    maxGuests: 4,
    blocked: [],
    customPrices: {},
  },
  {
    key: "park-lane-penthouse",
    host: "eleanor",
    title: "Park Lane Penthouse",
    location: "London, England",
    nightlyRate: 1500,
    status: "REJECTED",
    plumScore: 72,
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80",
    tagline: "A glossy penthouse that fell short of the Plum standard.",
    description:
      "A high-floor penthouse with hotel-style finishes. The Plum Test found inconsistencies in the guest-facing essentials and a lack of the lived-in character our guests expect. The host may address the report and reapply for inspection.",
    bedrooms: 3,
    bathrooms: 3,
    maxGuests: 6,
    blocked: [],
    customPrices: {},
  },
  {
    key: "tuscan-farmhouse",
    host: "eleanor",
    title: "The Tuscan Farmhouse",
    location: "Tuscany, Italy",
    nightlyRate: 690,
    status: "DRAFT",
    plumScore: null,
    imageUrl:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
    tagline: "A new submission, still being prepared by its host.",
    description:
      "A stone farmhouse with a pool and views across the Val d'Orcia. The host is still completing the listing and has not yet requested a Plum Test.",
    bedrooms: 4,
    bathrooms: 3,
    maxGuests: 8,
    blocked: [],
    customPrices: {},
  },
];

const bookingsSeed = [
  {
    key: "fico-upcoming",
    property: "villa-fico",
    guest: "amelia",
    checkIn: 21,
    checkOut: 26,
    status: "CONFIRMED",
  },
  {
    key: "fitzroy-soon",
    property: "fitzroy-loft",
    guest: "amelia",
    checkIn: 5,
    checkOut: 8,
    status: "CONFIRMED",
  },
  {
    key: "barn-past",
    property: "gilded-barn",
    guest: "amelia",
    checkIn: -45,
    checkOut: -40,
    status: "COMPLETED",
  },
  {
    key: "deia-past",
    property: "deia-house",
    guest: "noah",
    checkIn: -20,
    checkOut: -15,
    status: "COMPLETED",
  },
  {
    key: "casa-future",
    property: "casa-do-sol",
    guest: "noah",
    checkIn: 40,
    checkOut: 44,
    status: "CONFIRMED",
  },
  {
    key: "aegean-cancelled-half",
    property: "aegean-retreat",
    guest: "noah",
    checkIn: 10,
    checkOut: 14,
    status: "CANCELLED",
    cancellation: {
      percent: 50,
      reason: "A change to our travel dates — we hope to rebook in the spring.",
      by: "noah",
    },
  },
  {
    key: "olive-cancelled-full",
    property: "olive-stone",
    guest: "amelia",
    checkIn: 60,
    checkOut: 63,
    status: "CANCELLED",
    cancellation: {
      percent: 100,
      reason: "Family circumstances mean we can no longer travel.",
      by: "amelia",
    },
  },
];

const completedInspections = [
  {
    property: "gilded-barn",
    specialist: "margot",
    offset: -80,
    score: 96,
    notes:
      "Exceptional restoration. Original beams intact, kitchen equipment complete, linen quality outstanding. Host responded to every question within minutes.",
  },
  {
    property: "villa-fico",
    specialist: "sofia",
    offset: -120,
    score: 98,
    notes:
      "Best-in-class example of the Amalfi standard. All 150 checks passed. Pool safety signage and guest welcome book both exemplary.",
  },
  {
    property: "casa-do-sol",
    specialist: "julian",
    offset: -60,
    score: 91,
    notes:
      "Warm, characterful home. Slight wear on the outdoor furniture was noted and the host has confirmed replacement before the season.",
  },
  {
    property: "olive-stone",
    specialist: "sofia",
    offset: -90,
    score: 93,
    notes:
      "Authentic family mas, very well maintained. Kitchen stocked to standard, all bathrooms recently renovated. Recommended.",
  },
  {
    property: "aegean-retreat",
    specialist: "margot",
    offset: -110,
    score: 95,
    notes:
      "Superb caldera position and immaculate interiors. Water pressure and air conditioning verified in all rooms.",
  },
  {
    property: "deia-house",
    specialist: "julian",
    offset: -70,
    score: 89,
    notes:
      "Beautiful house with strong host hospitality. Access road is steep — noted clearly in the listing, as required.",
  },
  {
    property: "fitzroy-loft",
    specialist: "margot",
    offset: -30,
    score: 88,
    notes:
      "Distinctive city home, very good bed and linen quality. Street noise is audible in the second bedroom; disclosed to guests.",
  },
  {
    property: "sahara-skies",
    specialist: "sofia",
    offset: -50,
    score: 92,
    notes:
      "Excellent riad with a genuinely exceptional roof terrace. Hammam serviced recently. Host has a strong local network for guests.",
  },
  {
    property: "tulum-garden",
    specialist: "julian",
    offset: -40,
    score: 87,
    notes:
      "Simple and beautiful, exactly as described. Wi-Fi tested at 120 Mbps. Recommended with a note on the uneven garden path.",
  },
  {
    property: "park-lane-penthouse",
    specialist: "sofia",
    offset: -25,
    score: 72,
    notes:
      "Photography flatters the property. Several essential checks failed: insufficient kitchen equipment, no guest welcome information, and a bathroom extractor fault. Re-inspection possible after remediation.",
  },
];

const availableSlots = [
  { specialist: "margot", offset: 2, hour: 10 },
  { specialist: "margot", offset: 6, hour: 14 },
  { specialist: "margot", offset: 12, hour: 9, minute: 30 },
  { specialist: "julian", offset: 3, hour: 11 },
  { specialist: "julian", offset: 9, hour: 15 },
  { specialist: "julian", offset: 16, hour: 10 },
  { specialist: "sofia", offset: 4, hour: 9 },
  { specialist: "sofia", offset: 11, hour: 13 },
  { specialist: "sofia", offset: 18, hour: 14, minute: 30 },
];

const bookedSlots = [
  {
    specialist: "margot",
    property: "cliffside-atelier",
    offset: 4,
    hour: 11,
    minute: 30,
  },
  {
    specialist: "julian",
    property: "redwood-cabin",
    offset: 7,
    hour: 10,
  },
];

async function main() {
  console.log("Resetting Plum Guide data…");

  // Order matters for foreign keys.
  await prisma.cancellation.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.availabilityCalendar.deleteMany();
  await prisma.inspectionSlot.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const userMap = new Map();
  for (const user of users) {
    const passwordHash = bcrypt.hashSync(user.password, 10);
    const created = await prisma.user.create({
      data: {
        fullName: user.fullName,
        email: user.email,
        passwordHash,
        role: user.role,
      },
    });
    userMap.set(user.key, created);
  }
  console.log(`  users: ${userMap.size}`);

  const propertyMap = new Map();
  for (const property of properties) {
    const host = userMap.get(property.host);
    const created = await prisma.property.create({
      data: {
        hostId: host.id,
        title: property.title,
        location: property.location,
        nightlyRate: property.nightlyRate,
        status: property.status,
        plumScore: property.plumScore,
        imageUrl: property.imageUrl,
        tagline: property.tagline,
        description: property.description,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        maxGuests: property.maxGuests,
      },
    });
    propertyMap.set(property.key, { ...created, seed: property });
  }
  console.log(`  properties: ${propertyMap.size}`);

  // 150 days of availability for each home, with blocked ranges and seasonal pricing.
  let calendarRows = 0;
  for (const property of properties) {
    const record = propertyMap.get(property.key);
    const blocked = new Set();
    for (const [start, end] of property.blocked) {
      for (let offset = start; offset <= end; offset += 1) blocked.add(offset);
    }
    for (let offset = 0; offset < 150; offset += 1) {
      await prisma.availabilityCalendar.create({
        data: {
          propertyId: record.id,
          date: addDays(TODAY, offset),
          isAvailable: !blocked.has(offset),
          customPrice: property.customPrices[offset] ?? null,
        },
      });
      calendarRows += 1;
    }
  }
  console.log(`  availability rows: ${calendarRows}`);

  const bookingMap = new Map();
  for (const seed of bookingsSeed) {
    const property = propertyMap.get(seed.property);
    const guest = userMap.get(seed.guest);
    const checkIn = addDays(TODAY, seed.checkIn);
    const checkOut = addDays(TODAY, seed.checkOut);
    const nights = Math.round((checkOut - checkIn) / DAY);
    const totals = quote(nights, Number(property.nightlyRate));

    const booking = await prisma.booking.create({
      data: {
        reference: reference(),
        propertyId: property.id,
        guestId: guest.id,
        checkIn,
        checkOut,
        nights,
        ...totals,
        status: seed.status,
        createdAt: addDays(checkIn, -32),
      },
    });
    bookingMap.set(seed.key, booking);

    if (seed.status === "CONFIRMED" || seed.status === "COMPLETED") {
      // Lock each night in the availability calendar and in the night ledger
      // that prevents overlapping reservations.
      for (let i = 0; i < nights; i += 1) {
        const night = addDays(checkIn, i);
        await prisma.availabilityCalendar.upsert({
          where: {
            propertyId_date: { propertyId: property.id, date: night },
          },
          update: { isAvailable: false },
          create: { propertyId: property.id, date: night, isAvailable: false },
        });
        await prisma.bookingNight.create({
          data: {
            bookingId: booking.id,
            propertyId: property.id,
            date: night,
          },
        });
      }
    }

    if (seed.cancellation) {
      await prisma.cancellation.create({
        data: {
          bookingId: booking.id,
          cancelledBy: userMap.get(seed.cancellation.by).id,
          reason: seed.cancellation.reason,
          refundAmount: money((totals.totalPrice * seed.cancellation.percent) / 100),
          refundPercent: seed.cancellation.percent,
          createdAt: addDays(checkIn, -20),
        },
      });
    }
  }
  console.log(`  bookings: ${bookingMap.size}`);

  for (const inspection of completedInspections) {
    const property = propertyMap.get(inspection.property);
    const specialist = userMap.get(inspection.specialist);
    await prisma.inspectionSlot.create({
      data: {
        specialistId: specialist.id,
        propertyId: property.id,
        slotDatetime: atHour(inspection.offset, 10, 30),
        status: "COMPLETED",
        score: inspection.score,
        reportNotes: inspection.notes,
        completedAt: atHour(inspection.offset, 13),
      },
    });
  }

  for (const slot of availableSlots) {
    await prisma.inspectionSlot.create({
      data: {
        specialistId: userMap.get(slot.specialist).id,
        slotDatetime: atHour(slot.offset, slot.hour, slot.minute ?? 0),
        status: "AVAILABLE",
      },
    });
  }

  for (const slot of bookedSlots) {
    await prisma.inspectionSlot.create({
      data: {
        specialistId: userMap.get(slot.specialist).id,
        propertyId: propertyMap.get(slot.property).id,
        slotDatetime: atHour(slot.offset, slot.hour, slot.minute ?? 0),
        status: "BOOKED",
      },
    });
  }

  console.log(`  inspection slots: ${completedInspections.length + availableSlots.length + bookedSlots.length}`);
  console.log("\nSeed complete. Demo accounts (password in brackets):");
  console.log("  guest@plumguide.com       [Guest123!]");
  console.log("  host@plumguide.com        [Host123!]");
  console.log("  specialist@plumguide.com  [Specialist123!]");
  console.log("  admin@plumguide.com       [Admin123!]");
  console.log(`\nDemo dates start ${dateKey(TODAY)}.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
