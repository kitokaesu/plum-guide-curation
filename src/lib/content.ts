export const PROPERTY_IMAGE_CHOICES = [
  {
    label: "Stone barn",
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    label: "Cliffside villa",
    url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80",
  },
  {
    label: "Warm interior",
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    label: "Pool house",
    url: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=1600&q=80",
  },
  {
    label: "City loft",
    url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=80",
  },
  {
    label: "Country house",
    url: "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1600&q=80",
  },
];

import { makeT, type Locale } from "./i18n";

/** The four Plum Test pillars, in the visitor's language. */
export function plumTestCriteria(locale: Locale) {
  const t = makeT(locale);
  return [
    { title: t("criteria.design.title"), description: t("criteria.design.body") },
    { title: t("criteria.comfort.title"), description: t("criteria.comfort.body") },
    { title: t("criteria.kitchen.title"), description: t("criteria.kitchen.body") },
    { title: t("criteria.host.title"), description: t("criteria.host.body") },
  ];
}

export const PLUM_TEST_CRITERIA = [
  {
    title: "Design & character",
    description:
      "A home with a point of view — considered interiors, original detail, and pieces with a story.",
  },
  {
    title: "Comfort & function",
    description:
      "Beds you want to sleep in, water pressure that works, and every room set up for real life.",
  },
  {
    title: "Kitchen & essentials",
    description:
      "Sharp knives, proper glassware, good coffee, and the small things guests always forget.",
  },
  {
    title: "Host hospitality",
    description:
      "A host who answers quickly, shares the local secrets, and treats guests like friends.",
  },
];
