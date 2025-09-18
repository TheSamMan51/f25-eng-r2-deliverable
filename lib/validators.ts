import { z } from "zod";

export const updateSpeciesSchema = z.object({
  scientific_name: z.string().min(1),
  common_name: z.string().optional(),
  kingdom: z.string().optional(),
  total_population: z.coerce.number().nonnegative().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
});
