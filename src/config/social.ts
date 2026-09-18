import { business } from "./business";

export const social = {
  instagram: business.instagram,
  facebook: business.facebook,
} as const;

// Messenger URLs remain optional environment values until verified.
