import { z } from "zod";

export const createCampaignSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(90),
  description: z.string().min(20, "Please write a longer description").max(500),
  story: z.string().min(50, "Please share more of your story").max(10000),
  categoryId: z.string().min(1, "Choose a category"),
  location: z.string().min(2).max(120),
  goalAmount: z.coerce
    .number()
    .min(1000, "Minimum goal is ₦1,000")
    .max(500_000_000, "Goal is too high"),
  coverImageUrl: z.string().url().optional().or(z.literal("")),
  howFundsUsed: z.string().max(2000).optional(),
  reason: z.string().max(1000).optional(),
  submitForReview: z.boolean().optional().default(false),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
