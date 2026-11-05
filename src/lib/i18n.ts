/**
 * Bilingual copy for the Plum Guide demo.
 *
 * `en` is the source of truth: its keys define `MessageKey`. The Portuguese
 * dictionary is a `Partial` map merged over the English one, so a missing
 * translation falls back to English instead of breaking a page.
 */

export const LOCALES = ["en", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "plum_locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  pt: "Português",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  pt: "PT",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** BCP-47 tag used for numbers, currency and dates. */
export function intlLocale(locale: Locale): string {
  return locale === "pt" ? "pt-PT" : "en-GB";
}

export const en = {
  // Shared
  "common.perNight": "per night",
  "common.from": "From",
  "common.total": "Total",
  "common.signIn": "Sign in",
  "common.signOut": "Sign out",
  "common.dashboard": "Dashboard",
  "common.join": "Join Plum",
  "common.language": "Language",
  "common.languageError": "Couldn't switch language. Please try again.",
  "common.nightOne": "night",
  "common.nightMany": "nights",
  "common.guestOne": "guest",
  "common.guestMany": "guests",
  "common.backHome": "Back home",
  "common.loading": "Working…",

  // Announcement banner + navigation
  "banner.kicker": "Now in euros",
  "banner.text": "Every nightly rate, fee and refund is shown in EUR (€).",
  "banner.cta": "Browse the collection →",
  "nav.brandTag": "The top 3%",
  "nav.homes": "Homes",
  "nav.test": "The Plum Test",
  "nav.hosts": "For hosts",

  // Footer
  "footer.blurb":
    "Only the top 3% of homes make it in. Every one is visited, tested and scored by a Plum specialist before a single guest arrives.",
  "footer.tagline": "Homes worth travelling for",
  "footer.explore": "Explore",
  "footer.vetted": "Vetted homes",
  "footer.how": "How booking works",
  "footer.account": "Your account",
  "footer.create": "Create an account",
  "footer.dashboards": "Dashboards",
  "footer.concierge": "Concierge",
  "footer.hours": "Mon–Fri, 9am–7pm GMT",
  "footer.note":
    "A demonstration build of Plum Guide's curation, inspection and booking platform. Payments are simulated.",
  "footer.priceNote": "Prices in euros (EUR) · Inspected by humans",
  "footer.rights": "© {year} Plum Guide",

  // Status and role labels
  "status.DRAFT": "Draft",
  "status.INSPECTION_PENDING": "Inspection scheduled",
  "status.APPROVED": "Plum Approved",
  "status.REJECTED": "Not approved",
  "status.CONFIRMED": "Confirmed",
  "status.CANCELLED": "Cancelled",
  "status.COMPLETED": "Completed",
  "status.AVAILABLE": "Available",
  "status.BOOKED": "Booked",
  "role.GUEST": "Guest",
  "role.HOST": "Host",
  "role.SPECIALIST": "Plum specialist",
  "role.ADMIN": "Administrator",

  // Refund policy
  "policy.over14": "More than 14 days before check-in",
  "policy.between": "7–14 days before check-in",
  "policy.under7": "Fewer than 7 days before check-in",
  "policy.refund100": "100% refund",
  "policy.refund50": "50% refund",
  "policy.refundNone": "No refund",

  // Home page
  "home.eyebrow": "Handpicked. Home-tested.",
  "home.titleTop": "The top 3% of homes.",
  "home.titleAccent": "Nothing less.",
  "home.intro":
    "Every Plum Guide home is visited in person and put through our 150-point Plum Test. Browse the ones that made it, see live availability, and book knowing someone has already checked under the bed.",
  "home.ctaExplore": "Explore vetted homes",
  "home.ctaHost": "Submit your home",
  "home.statHomes": "Homes in the collection",
  "home.statSpecialists": "Specialist inspectors",
  "home.statPoints": "Points in the Plum Test",
  "home.heroLocation": "Amalfi Coast, Italy",
  "home.heroScoreLabel": "Plum Test score",
  "home.strip1": "150 checks, performed in person",
  "home.strip2": "Live availability, updated as guests book",
  "home.strip3": "Clear cancellation terms, applied automatically",
  "home.collectionEyebrow": "The collection",
  "home.collectionTitle": "Homes that earned their place.",
  "home.viewAll": "View all {count} homes →",
  "home.testEyebrow": "The Plum Test",
  "home.testTitle": "Beautiful is not enough.",
  "home.testBody":
    "Our specialists visit every home and score it against 150 checks — from the pressure of the shower to the sharpness of the knives. Only homes that score 85 or above join the collection. Everyone else goes back to the host with notes.",
  "home.noteLabel": "Inspector's note",
  "home.noteQuote":
    "“Original beams intact, linen outstanding, and a host who replied in minutes. A clear pass.”",
  "home.noteAuthor": "Margot Bell · Plum specialist",
  "home.howEyebrow": "How booking works",
  "home.howTitle": "Checked dates. Clear terms.",
  "home.howBody":
    "No waiting for a host to reply. The calendar you see is the calendar our system holds — and it updates the moment a reservation is confirmed.",
  "home.step1Title": "Choose your nights",
  "home.step1Body":
    "Live calendars show exactly which nights are open, including host-set seasonal rates. Your total updates as you select.",
  "home.step2Title": "Confirm & pay",
  "home.step2Body":
    "Reservations are confirmed instantly with a reference you can quote to our concierge. No double bookings, ever.",
  "home.step3Title": "Cancel with clarity",
  "home.step3Body":
    "Self-service cancellation applies the policy automatically and releases your dates back to the calendar.",
  "home.policyEyebrow": "Cancellation policy",
  "home.policyTitle": "Refunds, without the guesswork.",
  "home.policyBody":
    "Calculated from your check-in date at the moment you cancel, shown before you confirm.",
  "home.hostsKicker": "For hosts",
  "home.hostsTitle": "Think your home belongs here?",
  "home.hostsBody":
    "Submit your home, choose a specialist and book your Plum Test slot in minutes. If it passes, you join a collection guests already trust.",
  "home.hostsCta": "List your home",
  "home.hostsSignIn": "Host sign in",
  "home.bottomEyebrow": "The collection is waiting",
  "home.bottomCount": "stays arranged so far — and counting.",
  "home.bottomCta": "Find your next home",

  // Plum Test criteria
  "criteria.design.title": "Design & character",
  "criteria.design.body":
    "A home with a point of view — considered interiors, original detail, and pieces with a story.",
  "criteria.comfort.title": "Comfort & function",
  "criteria.comfort.body":
    "Beds you want to sleep in, water pressure that works, and every room set up for real life.",
  "criteria.kitchen.title": "Kitchen & essentials",
  "criteria.kitchen.body":
    "Sharp knives, proper glassware, good coffee, and the small things guests always forget.",
  "criteria.host.title": "Host hospitality",
  "criteria.host.body":
    "A host who answers quickly, shares the local secrets, and treats guests like friends.",

  // Collection page
  "properties.eyebrow": "The collection",
  "properties.title": "Every home here passed the Plum Test.",
  "properties.subtitle":
    "{count} inspected {homes} with live availability, seasonal pricing and instant confirmation.",
  "properties.homeOne": "home",
  "properties.homeMany": "homes",
  "properties.whereTo": "Where to?",
  "properties.searchPlaceholder": "Try 'Amalfi', 'Lisbon' or 'Provence'",
  "properties.sortBy": "Sort by",
  "properties.sortCurated": "Curator's pick",
  "properties.sortPriceAsc": "Price: low to high",
  "properties.sortPriceDesc": "Price: high to low",
  "properties.search": "Search homes",
  "properties.clear": "Clear",
  "properties.noMatchEyebrow": "No matches",
  "properties.noMatchTitle": "We don't have an inspected home matching that search.",
  "properties.noMatchBody":
    "Try a broader location, or view the full collection. New homes join the collection as they pass inspection.",
  "properties.viewAll": "View all homes",
  "properties.cardSleeps": "sleeps",

  // Property detail
  "property.score": "Plum score {score}",
  "property.hostedBy": "Hosted by {name}",
  "property.bedrooms": "{count} bedrooms",
  "property.bathrooms": "{count} bathrooms",
  "property.sleeps": "Sleeps {count}",
  "property.wholeHome": "Whole home",
  "property.theHome": "The home",
  "property.test": "The Plum Test",
  "property.inspected": "Inspected in person, scored on 150 checks.",
  "property.awaiting": "Awaiting inspection.",
  "property.outOf": "out of 100",
  "property.approvedNote":
    "This home was below the automatic pass mark and was approved after manual review by the curation team.",
  "property.scheduled":
    "A Plum Test is booked with {name} for {date}.",
  "property.included": "Included",
  "property.includedTitle": "The essentials, already thought of.",
  "property.included1": "Professionally laundered linen and towels",
  "property.included2": "A stocked kitchen: coffee, oils, and proper knives",
  "property.included3": "Fast Wi-Fi and a workspace where it counts",
  "property.included4": "A local guide from your host, not a generic binder",
  "property.included5": "Concierge support throughout your stay",
  "property.included6": "Clear cancellation terms, applied automatically",
  "property.yourHost": "Your host",
  "property.hostingSince": "Hosting with Plum since {year}.",
  "property.hostNote":
    "Every host is interviewed as part of the Plum Test. Response times and guest feedback are reviewed continuously.",
  "property.cancellations": "Cancellations",
  "property.cancelTitle": "Leaving early? Here's the deal.",
  "property.cancelNote":
    "Refunds are calculated from your check-in date when you cancel, and are shown before you confirm. No phone calls required.",
  "property.liveNote": "Live availability. Reservations are confirmed instantly.",
  "property.inInspection": "This home is in inspection.",
  "property.rejected": "This home did not pass — yet.",
  "property.preparing": "This home is still being prepared.",
  "property.inInspectionBody":
    "A specialist is visiting to score it against the 150-point Plum Test. Dates will open the moment it is approved.",
  "property.rejectedBody":
    "Our specialist has shared notes with the host. If the home is improved, it can be re-inspected and relisted.",
  "property.preparingBody":
    "The host is finishing the listing and has not yet scheduled its Plum Test.",
  "property.inspectionBooked": "Inspection booked",
  "property.withSpecialist": "with {name}",
  "property.lastScore": "Last Plum Test score:",
  "property.passMark": "/ 100. The pass mark is 85.",
  "property.manageListing": "Manage this listing",
  "property.exploreApproved": "Explore approved homes",
  "property.breadcrumb": "The collection",

  // Booking widget
  "widget.checkIn": "Check-in",
  "widget.checkOut": "Check-out",
  "widget.addDate": "Add date",
  "widget.selectNights": "Select your nights",
  "widget.prevMonth": "Previous month",
  "widget.nextMonth": "Next month",
  "widget.legendSelected": "Selected",
  "widget.legendStay": "Your stay",
  "widget.legendUnavailable": "Unavailable",
  "widget.selectCheckOut": "Now choose your check-out date.",
  "widget.selectCheckIn": "Select a check-in date to see the live price for your stay.",
  "widget.cleaning": "Cleaning fee",
  "widget.service": "Service fee",
  "widget.confirm": "Confirm & Pay",
  "widget.confirming": "Confirming…",
  "widget.clearDates": "Clear dates",
  "widget.instant": "Instant confirmation",
  "widget.signInCheckout": "Sign in at checkout",
  "widget.demoNote":
    "Bookings for {title} are confirmed instantly. Payment is simulated in this demonstration.",
  "widget.errorMaxNights":
    "Stays are limited to {max} nights. Please choose a shorter range.",
  "widget.errorBlocked":
    "That range includes a night that is already taken. Please choose different dates.",
  "widget.errorChooseDates": "Choose your check-in and check-out dates first.",
  "widget.errorGeneric": "We could not confirm your reservation.",
  "widget.unavailable": "unavailable",
  "widget.priceLine": "{price} × {count}",

  // Cancellation dialog
  "cancel.button": "Cancel reservation",
  "cancel.eyebrow": "Cancellation",
  "cancel.title": "Cancel this reservation?",
  "cancel.description":
    "{title} · {from} to {to}. This cannot be undone — the dates will be released to other guests immediately.",
  "cancel.estimated": "Estimated refund",
  "cancel.full": "Full refund",
  "cancel.half": "50% refund",
  "cancel.none": "No refund due",
  "cancel.percentOf": "{percent}% of {amount}",
  "cancel.reasonLabel": "Why are you cancelling?",
  "cancel.reasonPlaceholder": "A change of plans, travel disruption, something else…",
  "cancel.reasonHint": "Shared with our concierge team. Minimum 10 characters.",
  "cancel.keep": "Keep reservation",
  "cancel.confirm": "Confirm cancellation",
  "cancel.confirming": "Cancelling…",
  "cancel.errorShort":
    "Please add a short reason (at least 10 characters) so we can help.",
  "cancel.errorGeneric": "We could not cancel this reservation.",
  "cancel.daysFull":
    "{days} days before check-in — inside the free cancellation window.",
  "cancel.daysHalf": "{days} days before check-in — half of the total is refundable.",
  "cancel.daysNone": "{days} days before check-in — inside the 7-day policy window.",
  "cancel.passed": "The check-in date has already passed.",

  // Sign in / sign up
  "login.eyebrow": "Welcome back",
  "login.title": "Sign in to Plum Guide.",
  "login.intro":
    "Manage your trips, listings, inspections or the whole collection.",
  "login.email": "Email address",
  "login.password": "Password",
  "login.button": "Sign in",
  "login.pending": "Signing in…",
  "login.newHere": "New to Plum Guide?",
  "login.create": "Create an account",
  "login.demoTitle": "Demo accounts",
  "login.demoHint": "Choose an account to fill the form, then press sign in.",
  "login.error": "Unable to sign in.",
  "signup.eyebrow": "Join Plum Guide",
  "signup.title": "A shorter list of better homes.",
  "signup.intro":
    "Create an account to book inspected homes, or to submit your own for the Plum Test.",
  "signup.name": "Full name",
  "signup.email": "Email address",
  "signup.password": "Password",
  "signup.passwordHint":
    "At least 8 characters. Use a mix of letters, numbers and symbols.",
  "signup.joiningAs": "I am joining as a…",
  "signup.guest": "Guest",
  "signup.guestBody": "Browse inspected homes and book your next stay.",
  "signup.host": "Host",
  "signup.hostBody": "Submit a home and schedule its Plum Test inspection.",
  "signup.button": "Create account",
  "signup.pending": "Creating account…",
  "signup.haveAccount": "Already have an account?",
  "signup.staffNote":
    "Specialist and administrator accounts are provisioned by Plum Guide. Sign in with a demo specialist or admin account to explore those portals.",
  "signup.errorPassword": "Choose a password with at least 8 characters.",
  "signup.errorGeneric": "Unable to create your account.",

  // Guest portal
  "guest.upcomingStays": "Upcoming stays",
  "guest.next": "Next: {location} in {days}",
  "guest.nothingBooked": "Nothing booked yet",
  "guest.nightsBooked": "Nights booked",
  "guest.nightsDetail": "Across confirmed and completed stays",
  "guest.lifetimeSpend": "Lifetime spend",
  "guest.spendDetail": "Excluding cancelled reservations",
  "guest.nextUp": "Next up",
  "guest.upcoming": "Upcoming trips",
  "guest.browseMore": "Browse more homes →",
  "guest.emptyTitle": "No trips on the horizon.",
  "guest.emptyBody":
    "When you book one of our inspected homes, your reservation and invoice will appear here.",
  "guest.explore": "Explore the collection",
  "guest.reference": "Reference",
  "guest.checkIn": "Check-in",
  "guest.checkOut": "Check-out",
  "guest.nights": "Nights",
  "guest.total": "Total",
  "guest.details": "Reservation details",
  "guest.invoice": "Download invoice",
  "guest.checkInToday": "Check-in today",
  "guest.checkInIn": "Check-in in {days}",
  "guest.history": "History",
  "guest.historyTitle": "Past & cancelled stays",
  "guest.historyEmpty": "Completed and cancelled reservations will be listed here.",
  "guest.documents": "Documents",
  "guest.hostedBy": "hosted by {name}",

  // Confirmation
  "conf.cancelledEyebrow": "Reservation cancelled",
  "conf.confirmedEyebrow": "Reservation confirmed",
  "conf.cancelledTitle": "Your reservation has been cancelled.",
  "conf.confirmedTitle": "Your stay is confirmed.",
  "conf.confirmedBody":
    "A confirmation has been sent to {email}. Keep your reference handy for anything you need from our concierge.",
  "conf.cancelledBody":
    "The dates have been released back to the calendar and your refund has been calculated under the cancellation policy.",
  "conf.reference": "Booking reference",
  "conf.viewHome": "View the home",
  "conf.checkIn": "Check-in",
  "conf.checkOut": "Check-out",
  "conf.from15": "From 15:00",
  "conf.by11": "By 11:00",
  "conf.stay": "Stay",
  "conf.maxGuests": "{count} maximum",
  "conf.price": "Price",
  "conf.nightlySubtotal": "Nightly subtotal",
  "conf.cleaning": "Cleaning fee",
  "conf.service": "Service fee",
  "conf.totalPaid": "Total paid",
  "conf.originalTotal": "Original total",
  "conf.refund": "Refund ({percent}%)",
  "conf.netCharged": "Net charged",
  "conf.guest": "Guest",
  "conf.reservedOn": "Reserved on",
  "conf.recorded": "Recorded {date}. Reason: “{reason}”",
  "conf.viewInvoice": "View invoice",
  "conf.myTrips": "My trips",
  "conf.demoNote":
    "Payment is simulated in this demonstration build. In production, a payment provider would authorise the card before confirmation.",

  // Invoice
  "inv.back": "Back to reservation",
  "inv.title": "Invoice",
  "inv.tagline": "Homes worth travelling for",
  "inv.issued": "Issued",
  "inv.status": "Status",
  "inv.billedTo": "Billed to",
  "inv.stay": "Stay",
  "inv.description": "Description",
  "inv.amount": "Amount",
  "inv.accommodation":
    "Accommodation · {nights} {nightsWord} at {rate} average",
  "inv.cleaning": "Cleaning and preparation",
  "inv.service": "Plum service fee",
  "inv.total": "Total",
  "inv.refundLine": "Refund · {percent}% policy",
  "inv.netCharged": "Net charged",
  "inv.footnoteOne":
    "Booking reference {reference}. Check-in from 15:00 on {checkIn}; check-out by 11:00 on {checkOut}.",
  "inv.footnoteTwo":
    "Hosted by {host}. Cancellation terms apply from the check-in date and are shown in your guest portal.",
  "inv.footnoteThree":
    "Payment method: card ending 4242 (simulated). VAT included where applicable.",
  "inv.generated": "Generated {date} · Plum Guide",

  // Dashboard shell
  "dash.portal": "{role} portal",
  "dash.greeting": "Good to see you, {name}.",
  "dash.menu": "Menu",
  "dash.navTrips": "My trips",
  "dash.navExplore": "Explore homes",
  "dash.navOverview": "Overview",
  "dash.navAdd": "Add a home",
  "dash.navInspections": "Inspections",
  "dash.navCollection": "The collection",
  "dash.navOperations": "Operations",

  // Not found
  "nf.title": "This page didn't pass the test.",
  "nf.body":
    "The page you were looking for has moved, been cancelled, or never existed. The collection is still where you left it.",
  "nf.cta": "Explore the collection",
} as const;

export type MessageKey = keyof typeof en;

const pt: Partial<Record<MessageKey, string>> = {
  "common.perNight": "por noite",
  "common.from": "Desde",
  "common.total": "Total",
  "common.signIn": "Entrar",
  "common.signOut": "Sair",
  "common.dashboard": "Painel",
  "common.join": "Aderir à Plum",
  "common.language": "Idioma",
  "common.languageError":
    "Não foi possível mudar de idioma. Tente novamente.",
  "common.nightOne": "noite",
  "common.nightMany": "noites",
  "common.guestOne": "hóspede",
  "common.guestMany": "hóspedes",
  "common.backHome": "Voltar ao início",
  "common.loading": "A processar…",

  "banner.kicker": "Agora em euros",
  "banner.text":
    "Todos os preços por noite, taxas e reembolsos são apresentados em EUR (€).",
  "banner.cta": "Explorar a coleção →",
  "nav.brandTag": "O top 3%",
  "nav.homes": "Casas",
  "nav.test": "O Plum Test",
  "nav.hosts": "Para anfitriões",

  "footer.blurb":
    "Só as melhores 3% das casas entram. Cada uma é visitada, testada e avaliada por um especialista Plum antes de receber o primeiro hóspede.",
  "footer.tagline": "Casas que valem a viagem",
  "footer.explore": "Explorar",
  "footer.vetted": "Casas verificadas",
  "footer.how": "Como funciona a reserva",
  "footer.account": "A sua conta",
  "footer.create": "Criar conta",
  "footer.dashboards": "Painéis",
  "footer.concierge": "Concierge",
  "footer.hours": "Seg–Sex, 9h–19h GMT",
  "footer.note":
    "Uma demonstração da plataforma de curadoria, inspeção e reservas da Plum Guide. Os pagamentos são simulados.",
  "footer.priceNote": "Preços em euros (EUR) · Inspecionado por pessoas",
  "footer.rights": "© {year} Plum Guide",

  "status.DRAFT": "Rascunho",
  "status.INSPECTION_PENDING": "Inspeção agendada",
  "status.APPROVED": "Aprovada Plum",
  "status.REJECTED": "Não aprovada",
  "status.CONFIRMED": "Confirmada",
  "status.CANCELLED": "Cancelada",
  "status.COMPLETED": "Concluída",
  "status.AVAILABLE": "Disponível",
  "status.BOOKED": "Reservado",
  "role.GUEST": "Hóspede",
  "role.HOST": "Anfitrião",
  "role.SPECIALIST": "Especialista Plum",
  "role.ADMIN": "Administrador",

  "policy.over14": "Mais de 14 dias antes do check-in",
  "policy.between": "7–14 dias antes do check-in",
  "policy.under7": "Menos de 7 dias antes do check-in",
  "policy.refund100": "Reembolso de 100%",
  "policy.refund50": "Reembolso de 50%",
  "policy.refundNone": "Sem reembolso",

  "home.eyebrow": "Escolhidas a dedo. Testadas em casa.",
  "home.titleTop": "As melhores 3% das casas.",
  "home.titleAccent": "Nada menos.",
  "home.intro":
    "Cada casa Plum Guide é visitada pessoalmente e submetida ao nosso Plum Test de 150 critérios. Veja as que passaram, consulte a disponibilidade em tempo real e reserve sabendo que alguém já verificou tudo.",
  "home.ctaExplore": "Explorar casas verificadas",
  "home.ctaHost": "Submeter a sua casa",
  "home.statHomes": "Casas na coleção",
  "home.statSpecialists": "Inspectores especialistas",
  "home.statPoints": "Pontos no Plum Test",
  "home.heroLocation": "Costa Amalfitana, Itália",
  "home.heroScoreLabel": "Pontuação Plum Test",
  "home.strip1": "150 verificações, feitas pessoalmente",
  "home.strip2": "Disponibilidade em tempo real, atualizada a cada reserva",
  "home.strip3": "Condições de cancelamento claras, aplicadas automaticamente",
  "home.collectionEyebrow": "A coleção",
  "home.collectionTitle": "Casas que conquistaram o seu lugar.",
  "home.viewAll": "Ver as {count} casas →",
  "home.testEyebrow": "O Plum Test",
  "home.testTitle": "Bonita não chega.",
  "home.testBody":
    "Os nossos especialistas visitam cada casa e avaliam-na em 150 critérios — da pressão do duche ao fio das facas. Só as casas com 85 ou mais entram na coleção. As restantes voltam para o anfitrião com notas.",
  "home.noteLabel": "Nota do inspetor",
  "home.noteQuote":
    "«Vigas originais intactas, roupa de cama excelente e um anfitrião que respondeu em minutos. Passou claramente.»",
  "home.noteAuthor": "Margot Bell · especialista Plum",
  "home.howEyebrow": "Como funciona a reserva",
  "home.howTitle": "Datas confirmadas. Condições claras.",
  "home.howBody":
    "Sem esperar pela resposta do anfitrião. O calendário que vê é o calendário do sistema — atualiza no momento em que a reserva é confirmada.",
  "home.step1Title": "Escolha as noites",
  "home.step1Body":
    "Os calendários em tempo real mostram exatamente que noites estão livres, incluindo preços sazonais definidos pelo anfitrião. O total atualiza à medida que escolhe.",
  "home.step2Title": "Confirme e pague",
  "home.step2Body":
    "As reservas são confirmadas de imediato, com uma referência que pode apresentar ao nosso concierge. Nunca há reservas duplicadas.",
  "home.step3Title": "Cancele com clareza",
  "home.step3Body":
    "O cancelamento aplica automaticamente a política e devolve as datas ao calendário.",
  "home.policyEyebrow": "Política de cancelamento",
  "home.policyTitle": "Reembolsos sem adivinhas.",
  "home.policyBody":
    "Calculados a partir da data de check-in no momento do cancelamento e mostrados antes de confirmar.",
  "home.hostsKicker": "Para anfitriões",
  "home.hostsTitle": "Acha que a sua casa pertence aqui?",
  "home.hostsBody":
    "Submeta a sua casa, escolha um especialista e agende o Plum Test em minutos. Se passar, entra numa coleção em que os hóspedes já confiam.",
  "home.hostsCta": "Anunciar a minha casa",
  "home.hostsSignIn": "Entrar como anfitrião",
  "home.bottomEyebrow": "A coleção está à sua espera",
  "home.bottomCount": "estadias já organizadas — e a crescer.",
  "home.bottomCta": "Encontrar a próxima casa",

  "criteria.design.title": "Design e carácter",
  "criteria.design.body":
    "Uma casa com personalidade — interiores pensados, detalhes originais e peças com história.",
  "criteria.comfort.title": "Conforto e funcionalidade",
  "criteria.comfort.body":
    "Camas em que apetece dormir, água com pressão e todas as divisões prontas para a vida real.",
  "criteria.kitchen.title": "Cozinha e essenciais",
  "criteria.kitchen.body":
    "Facas afiadas, copos adequados, bom café e as pequenas coisas que os hóspedes esquecem.",
  "criteria.host.title": "Hospitalidade do anfitrião",
  "criteria.host.body":
    "Um anfitrião que responde depressa, partilha segredos locais e trata os hóspedes como amigos.",

  "properties.eyebrow": "A coleção",
  "properties.title": "Todas as casas aqui passaram o Plum Test.",
  "properties.subtitle":
    "{count} {homes} inspecionadas, com disponibilidade em tempo real, preços sazonais e confirmação imediata.",
  "properties.homeOne": "casa",
  "properties.homeMany": "casas",
  "properties.whereTo": "Para onde?",
  "properties.searchPlaceholder": "Experimente 'Amalfi', 'Lisboa' ou 'Provença'",
  "properties.sortBy": "Ordenar por",
  "properties.sortCurated": "Escolha do curador",
  "properties.sortPriceAsc": "Preço: do mais baixo",
  "properties.sortPriceDesc": "Preço: do mais alto",
  "properties.search": "Pesquisar casas",
  "properties.clear": "Limpar",
  "properties.noMatchEyebrow": "Sem resultados",
  "properties.noMatchTitle": "Não temos nenhuma casa inspecionada para essa pesquisa.",
  "properties.noMatchBody":
    "Tente uma localização mais ampla ou veja a coleção completa. Novas casas entram na coleção à medida que passam a inspeção.",
  "properties.viewAll": "Ver todas as casas",
  "properties.cardSleeps": "até",

  "property.score": "Pontuação Plum {score}",
  "property.hostedBy": "Anfitrião: {name}",
  "property.bedrooms": "{count} quartos",
  "property.bathrooms": "{count} casas de banho",
  "property.sleeps": "Até {count} hóspedes",
  "property.wholeHome": "Casa inteira",
  "property.theHome": "A casa",
  "property.test": "O Plum Test",
  "property.inspected": "Inspecionada pessoalmente, avaliada em 150 critérios.",
  "property.awaiting": "A aguardar inspeção.",
  "property.outOf": "de 100",
  "property.approvedNote":
    "Esta casa ficou abaixo da nota mínima automática e foi aprovada após revisão manual da equipa de curadoria.",
  "property.scheduled": "Há um Plum Test agendado com {name} para {date}.",
  "property.included": "Incluído",
  "property.includedTitle": "O essencial, já pensado.",
  "property.included1": "Roupa de cama e toalhas lavadas profissionalmente",
  "property.included2": "Cozinha equipada: café, óleos e facas adequadas",
  "property.included3": "Wi-Fi rápido e uma secretária onde é preciso",
  "property.included4": "Um guia local do anfitrião, não uma pasta genérica",
  "property.included5": "Apoio de concierge durante toda a estadia",
  "property.included6": "Condições de cancelamento claras, aplicadas automaticamente",
  "property.yourHost": "O seu anfitrião",
  "property.hostingSince": "Anfitrião Plum desde {year}.",
  "property.hostNote":
    "Todos os anfitriões são entrevistados no âmbito do Plum Test. Os tempos de resposta e o feedback dos hóspedes são avaliados continuamente.",
  "property.cancellations": "Cancelamentos",
  "property.cancelTitle": "Vai sair mais cedo? Eis as condições.",
  "property.cancelNote":
    "Os reembolsos são calculados a partir da data de check-in no momento do cancelamento e são mostrados antes de confirmar. Sem chamadas.",
  "property.liveNote": "Disponibilidade em tempo real. Reservas confirmadas de imediato.",
  "property.inInspection": "Esta casa está em inspeção.",
  "property.rejected": "Esta casa não passou — ainda.",
  "property.preparing": "Esta casa ainda está a ser preparada.",
  "property.inInspectionBody":
    "Um especialista vai visitá-la para a avaliar no Plum Test de 150 pontos. As datas abrem no momento em que for aprovada.",
  "property.rejectedBody":
    "O nosso especialista partilhou notas com o anfitrião. Se a casa melhorar, pode ser reinspecionada e listada novamente.",
  "property.preparingBody":
    "O anfitrião está a terminar o anúncio e ainda não agendou o Plum Test.",
  "property.inspectionBooked": "Inspeção agendada",
  "property.withSpecialist": "com {name}",
  "property.lastScore": "Última pontuação do Plum Test:",
  "property.passMark": "/ 100. A nota mínima é 85.",
  "property.manageListing": "Gerir este anúncio",
  "property.exploreApproved": "Explorar casas aprovadas",
  "property.breadcrumb": "A coleção",

  "widget.checkIn": "Check-in",
  "widget.checkOut": "Check-out",
  "widget.addDate": "Adicionar data",
  "widget.selectNights": "Escolha as noites",
  "widget.prevMonth": "Mês anterior",
  "widget.nextMonth": "Mês seguinte",
  "widget.legendSelected": "Selecionado",
  "widget.legendStay": "A sua estadia",
  "widget.legendUnavailable": "Indisponível",
  "widget.selectCheckOut": "Agora escolha a data de check-out.",
  "widget.selectCheckIn":
    "Escolha uma data de check-in para ver o preço da sua estadia.",
  "widget.cleaning": "Taxa de limpeza",
  "widget.service": "Taxa de serviço",
  "widget.confirm": "Confirmar e pagar",
  "widget.confirming": "A confirmar…",
  "widget.clearDates": "Limpar datas",
  "widget.instant": "Confirmação imediata",
  "widget.signInCheckout": "Entrar no checkout",
  "widget.demoNote":
    "As reservas de {title} são confirmadas de imediato. O pagamento é simulado nesta demonstração.",
  "widget.errorMaxNights":
    "As estadias estão limitadas a {max} noites. Escolha um intervalo mais curto.",
  "widget.errorBlocked":
    "Esse intervalo inclui uma noite já ocupada. Escolha outras datas.",
  "widget.errorChooseDates": "Escolha primeiro as datas de check-in e check-out.",
  "widget.errorGeneric": "Não foi possível confirmar a sua reserva.",
  "widget.unavailable": "indisponível",
  "widget.priceLine": "{price} × {count}",

  "cancel.button": "Cancelar reserva",
  "cancel.eyebrow": "Cancelamento",
  "cancel.title": "Cancelar esta reserva?",
  "cancel.description":
    "{title} · {from} a {to}. Esta ação é definitiva — as datas ficam imediatamente disponíveis para outros hóspedes.",
  "cancel.estimated": "Reembolso estimado",
  "cancel.full": "Reembolso total",
  "cancel.half": "Reembolso de 50%",
  "cancel.none": "Sem reembolso",
  "cancel.percentOf": "{percent}% de {amount}",
  "cancel.reasonLabel": "Porque está a cancelar?",
  "cancel.reasonPlaceholder":
    "Mudança de planos, imprevisto de viagem, outra razão…",
  "cancel.reasonHint":
    "Partilhado com a equipa de concierge. Mínimo de 10 caracteres.",
  "cancel.keep": "Manter reserva",
  "cancel.confirm": "Confirmar cancelamento",
  "cancel.confirming": "A cancelar…",
  "cancel.errorShort":
    "Indique uma razão breve (pelo menos 10 caracteres) para podermos ajudar.",
  "cancel.errorGeneric": "Não foi possível cancelar esta reserva.",
  "cancel.daysFull":
    "{days} dias antes do check-in — dentro do período de cancelamento gratuito.",
  "cancel.daysHalf":
    "{days} dias antes do check-in — metade do total é reembolsável.",
  "cancel.daysNone":
    "{days} dias antes do check-in — dentro do período de 7 dias da política.",
  "cancel.passed": "A data de check-in já passou.",

  "login.eyebrow": "Bem-vindo de volta",
  "login.title": "Entrar na Plum Guide.",
  "login.intro":
    "Gerir as suas viagens, anúncios, inspeções ou toda a coleção.",
  "login.email": "Endereço de email",
  "login.password": "Palavra-passe",
  "login.button": "Entrar",
  "login.pending": "A entrar…",
  "login.newHere": "Novo na Plum Guide?",
  "login.create": "Criar conta",
  "login.demoTitle": "Contas de demonstração",
  "login.demoHint": "Escolha uma conta para preencher o formulário e clique em entrar.",
  "login.error": "Não foi possível entrar.",
  "signup.eyebrow": "Aderir à Plum Guide",
  "signup.title": "Uma lista mais curta de casas melhores.",
  "signup.intro":
    "Crie uma conta para reservar casas inspecionadas ou submeter a sua ao Plum Test.",
  "signup.name": "Nome completo",
  "signup.email": "Endereço de email",
  "signup.password": "Palavra-passe",
  "signup.passwordHint":
    "Pelo menos 8 caracteres. Combine letras, números e símbolos.",
  "signup.joiningAs": "Estou a aderir como…",
  "signup.guest": "Hóspede",
  "signup.guestBody": "Explore casas inspecionadas e reserve a próxima estadia.",
  "signup.host": "Anfitrião",
  "signup.hostBody": "Submeta uma casa e agende a inspeção Plum Test.",
  "signup.button": "Criar conta",
  "signup.pending": "A criar conta…",
  "signup.haveAccount": "Já tem conta?",
  "signup.staffNote":
    "As contas de especialista e administrador são criadas pela Plum Guide. Entre com uma conta de demonstração para explorar esses portais.",
  "signup.errorPassword": "Escolha uma palavra-passe com pelo menos 8 caracteres.",
  "signup.errorGeneric": "Não foi possível criar a sua conta.",

  "guest.upcomingStays": "Próximas estadias",
  "guest.next": "Próxima: {location} em {days}",
  "guest.nothingBooked": "Ainda sem reservas",
  "guest.nightsBooked": "Noites reservadas",
  "guest.nightsDetail": "Em estadias confirmadas e concluídas",
  "guest.lifetimeSpend": "Total gasto",
  "guest.spendDetail": "Excluindo reservas canceladas",
  "guest.nextUp": "A seguir",
  "guest.upcoming": "Próximas viagens",
  "guest.browseMore": "Explorar mais casas →",
  "guest.emptyTitle": "Sem viagens marcadas.",
  "guest.emptyBody":
    "Quando reservar uma das nossas casas inspecionadas, a reserva e a fatura aparecem aqui.",
  "guest.explore": "Explorar a coleção",
  "guest.reference": "Referência",
  "guest.checkIn": "Check-in",
  "guest.checkOut": "Check-out",
  "guest.nights": "Noites",
  "guest.total": "Total",
  "guest.details": "Detalhes da reserva",
  "guest.invoice": "Descarregar fatura",
  "guest.checkInToday": "Check-in hoje",
  "guest.checkInIn": "Check-in em {days}",
  "guest.history": "Histórico",
  "guest.historyTitle": "Estadias passadas e canceladas",
  "guest.historyEmpty":
    "As reservas concluídas e canceladas serão listadas aqui.",
  "guest.documents": "Documentos",
  "guest.hostedBy": "anfitrião: {name}",

  "conf.cancelledEyebrow": "Reserva cancelada",
  "conf.confirmedEyebrow": "Reserva confirmada",
  "conf.cancelledTitle": "A sua reserva foi cancelada.",
  "conf.confirmedTitle": "A sua estadia está confirmada.",
  "conf.confirmedBody":
    "Enviámos uma confirmação para {email}. Guarde a referência para qualquer contacto com o concierge.",
  "conf.cancelledBody":
    "As datas voltaram ao calendário e o reembolso foi calculado segundo a política de cancelamento.",
  "conf.reference": "Referência da reserva",
  "conf.viewHome": "Ver a casa",
  "conf.checkIn": "Check-in",
  "conf.checkOut": "Check-out",
  "conf.from15": "A partir das 15:00",
  "conf.by11": "Até às 11:00",
  "conf.stay": "Estadia",
  "conf.maxGuests": "máximo de {count}",
  "conf.price": "Preço",
  "conf.nightlySubtotal": "Subtotal das noites",
  "conf.cleaning": "Taxa de limpeza",
  "conf.service": "Taxa de serviço",
  "conf.totalPaid": "Total pago",
  "conf.originalTotal": "Total original",
  "conf.refund": "Reembolso ({percent}%)",
  "conf.netCharged": "Valor cobrado",
  "conf.guest": "Hóspede",
  "conf.reservedOn": "Reservado em",
  "conf.recorded": "Registado a {date}. Motivo: «{reason}»",
  "conf.viewInvoice": "Ver fatura",
  "conf.myTrips": "As minhas viagens",
  "conf.demoNote":
    "O pagamento é simulado nesta demonstração. Em produção, um fornecedor de pagamentos autorizaria o cartão antes da confirmação.",

  "inv.back": "Voltar à reserva",
  "inv.title": "Fatura",
  "inv.tagline": "Casas que valem a viagem",
  "inv.issued": "Emitida",
  "inv.status": "Estado",
  "inv.billedTo": "Faturado a",
  "inv.stay": "Estadia",
  "inv.description": "Descrição",
  "inv.amount": "Valor",
  "inv.accommodation":
    "Alojamento · {nights} {nightsWord} a {rate} em média",
  "inv.cleaning": "Limpeza e preparação",
  "inv.service": "Taxa de serviço Plum",
  "inv.total": "Total",
  "inv.refundLine": "Reembolso · política de {percent}%",
  "inv.netCharged": "Valor cobrado",
  "inv.footnoteOne":
    "Referência da reserva {reference}. Check-in a partir das 15:00 de {checkIn}; check-out até às 11:00 de {checkOut}.",
  "inv.footnoteTwo":
    "Anfitrião: {host}. As condições de cancelamento aplicam-se a partir da data de check-in e estão no seu portal de hóspede.",
  "inv.footnoteThree":
    "Método de pagamento: cartão terminado em 4242 (simulado). IVA incluído quando aplicável.",
  "inv.generated": "Gerado a {date} · Plum Guide",

  "dash.portal": "Portal de {role}",
  "dash.greeting": "Bem-vindo, {name}.",
  "dash.menu": "Menu",
  "dash.navTrips": "As minhas viagens",
  "dash.navExplore": "Explorar casas",
  "dash.navOverview": "Visão geral",
  "dash.navAdd": "Adicionar casa",
  "dash.navInspections": "Inspeções",
  "dash.navCollection": "A coleção",
  "dash.navOperations": "Operações",

  "nf.title": "Esta página não passou o teste.",
  "nf.body":
    "A página que procura mudou de lugar, foi cancelada ou nunca existiu. A coleção continua onde a deixou.",
  "nf.cta": "Explorar a coleção",
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  en,
  pt: { ...en, ...pt },
};

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match
  );
}

export function translate(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  return interpolate(messages[locale]?.[key] ?? en[key] ?? key, vars);
}

export type Translator = (
  key: MessageKey,
  vars?: Record<string, string | number>
) => string;

export function makeT(locale: Locale): Translator {
  return (key, vars) => translate(locale, key, vars);
}

/** "1 night" / "3 nights", in either language. */
export function nightsLabel(locale: Locale, count: number): string {
  return translate(locale, count === 1 ? "common.nightOne" : "common.nightMany");
}

export function guestsLabel(locale: Locale, count: number): string {
  return translate(locale, count === 1 ? "common.guestOne" : "common.guestMany");
}

export function roleLabel(locale: Locale, role: string): string {
  const key = `role.${role}` as MessageKey;
  return messages[locale]?.[key] ?? role;
}

export function statusLabel(locale: Locale, status: string): string {
  const key = `status.${status}` as MessageKey;
  return messages[locale]?.[key] ?? status.replaceAll("_", " ").toLowerCase();
}
