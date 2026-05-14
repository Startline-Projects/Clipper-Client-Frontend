import type { BarberCategoryTag } from '@/lib/schemas/enums';

/**
 * Ordered list of selectable barber category / specialty tags.
 * Mirrors the API's `BarberCategoryTag` enum.
 */
export const BARBER_CATEGORY_TAGS: BarberCategoryTag[] = [
  'SKIN_FADES',
  'BEARD_SPECIALIST',
  'SHAVES',
  'ALL_GENDER_CUTS',
  'WOMENS_HAIRCUTS',
  'KIDS_CUTS',
  'CURLY_HAIR_SPECIALIST',
  'AFRO_HAIR_SPECIALIST',
  'LOCS_DREADLOCKS',
  'BRAIDS',
  'HAIR_DESIGN',
  'MOBILE_BARBER',
  'IN_HOUSE_SERVICES',
];

const LABELS: Record<BarberCategoryTag, string> = {
  ALL_GENDER_CUTS: 'All-Gender Cuts',
  KIDS_CUTS: 'Kids Cuts',
  CURLY_HAIR_SPECIALIST: 'Curly Hair',
  AFRO_HAIR_SPECIALIST: 'Afro Hair',
  BRAIDS: 'Braids',
  BEARD_SPECIALIST: 'Beard Specialist',
  SKIN_FADES: 'Skin Fades',
  WOMENS_HAIRCUTS: "Women's Haircuts",
  LOCS_DREADLOCKS: 'Locs & Dreadlocks',
  HAIR_DESIGN: 'Hair Design',
  SHAVES: 'Shaves',
  MOBILE_BARBER: 'Mobile Barber',
  IN_HOUSE_SERVICES: 'In-House Services',
};

/** Human-readable label for a category tag. Falls back to the raw value. */
export function categoryLabel(tag: BarberCategoryTag): string {
  return LABELS[tag] ?? tag;
}
