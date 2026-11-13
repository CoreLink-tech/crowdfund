import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  real,
  blob,
  index,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

// ============================================================
// USERS & AUTH
// ============================================================

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone"),
    accountType: text("account_type", { enum: ["individual", "organization"] })
      .notNull()
      .default("individual"),
    role: text("role", { enum: ["user", "admin"] }).notNull().default("user"),
    status: text("status", { enum: ["active", "suspended", "deleted"] })
      .notNull()
      .default("active"),
    bio: text("bio"),
    location: text("location"),
    avatarUrl: text("avatar_url"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
    statusIdx: index("users_status_idx").on(table.status),
  })
);

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  name: text("name").notNull(),
  description: text("description"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  website: text("website"),
  logoUrl: text("logo_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const sessions = sqliteTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
  },
  (table) => ({
    userIdx: index("sessions_user_idx").on(table.userId),
    expiresIdx: index("sessions_expires_idx").on(table.expiresAt),
  })
);

export const verificationTokens = sqliteTable(
  "verification_tokens",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull().unique(),
    type: text("type", { enum: ["email_verification", "password_reset"] }).notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    tokenIdx: uniqueIndex("verification_tokens_token_idx").on(table.token),
    userTypeIdx: index("verification_tokens_user_type_idx").on(table.userId, table.type),
  })
);

// ============================================================
// CATEGORIES
// ============================================================

export const campaignCategories = sqliteTable("campaign_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================================
// CAMPAIGNS
// ============================================================

export const campaigns = sqliteTable(
  "campaigns",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    story: text("story").notNull(), // JSON array of paragraphs or markdown
    categoryId: text("category_id")
      .notNull()
      .references(() => campaignCategories.id),
    organizerId: text("organizer_id")
      .notNull()
      .references(() => users.id),
    location: text("location").notNull(),
    goalAmount: integer("goal_amount").notNull(), // in kobo (NGN * 100)
    raisedAmount: integer("raised_amount").notNull().default(0), // in kobo
    currency: text("currency").notNull().default("NGN"),
    coverImageUrl: text("cover_image_url"),
    videoUrl: text("video_url"),
    status: text("status", {
      enum: [
        "draft",
        "pending_review",
        "approved",
        "active",
        "rejected",
        "suspended",
        "completed",
        "cancelled",
      ],
    })
      .notNull()
      .default("draft"),
    rejectionReason: text("rejection_reason"),
    startDate: integer("start_date", { mode: "timestamp" }),
    endDate: integer("end_date", { mode: "timestamp" }),
    verified: integer("verified", { mode: "boolean" }).notNull().default(false),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    donorCount: integer("donor_count").notNull().default(0),
    viewCount: integer("view_count").notNull().default(0),
    howFundsUsed: text("how_funds_used"),
    reason: text("reason"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    submittedAt: integer("submitted_at", { mode: "timestamp" }),
    approvedAt: integer("approved_at", { mode: "timestamp" }),
    approvedBy: text("approved_by").references(() => users.id),
  },
  (table) => ({
    slugIdx: uniqueIndex("campaigns_slug_idx").on(table.slug),
    organizerIdx: index("campaigns_organizer_idx").on(table.organizerId),
    statusIdx: index("campaigns_status_idx").on(table.status),
    categoryIdx: index("campaigns_category_idx").on(table.categoryId),
    featuredIdx: index("campaigns_featured_idx").on(table.featured),
  })
);

export const campaignImages = sqliteTable("campaign_images", {
  id: text("id").primaryKey(),
  campaignId: text("campaign_id")
    .notNull()
    .references(() => campaigns.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: text("alt_text"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const campaignUpdates = sqliteTable(
  "campaign_updates",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => users.id),
    title: text("title").notNull(),
    content: text("content").notNull(),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    campaignIdx: index("campaign_updates_campaign_idx").on(table.campaignId),
  })
);

// ============================================================
// DONATIONS & PAYMENTS
// ============================================================

export const donations = sqliteTable(
  "donations",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    donorId: text("donor_id").references(() => users.id), // null for guest
    donorName: text("donor_name").notNull(),
    donorEmail: text("donor_email").notNull(),
    amount: integer("amount").notNull(), // kobo
    currency: text("currency").notNull().default("NGN"),
    isAnonymous: integer("is_anonymous", { mode: "boolean" }).notNull().default(false),
    message: text("message"),
    status: text("status", {
      enum: ["pending", "successful", "failed", "refunded"],
    })
      .notNull()
      .default("pending"),
    paymentProvider: text("payment_provider"),
    providerReference: text("provider_reference"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    verifiedAt: integer("verified_at", { mode: "timestamp" }),
  },
  (table) => ({
    campaignIdx: index("donations_campaign_idx").on(table.campaignId),
    donorIdx: index("donations_donor_idx").on(table.donorId),
    statusIdx: index("donations_status_idx").on(table.status),
    providerRefIdx: uniqueIndex("donations_provider_ref_idx").on(table.providerReference),
  })
);

export const paymentTransactions = sqliteTable(
  "payment_transactions",
  {
    id: text("id").primaryKey(),
    donationId: text("donation_id")
      .notNull()
      .references(() => donations.id),
    provider: text("provider").notNull(),
    providerReference: text("provider_reference").notNull().unique(),
    amount: integer("amount").notNull(),
    currency: text("currency").notNull().default("NGN"),
    status: text("status", {
      enum: ["initiated", "pending", "successful", "failed", "refunded"],
    })
      .notNull()
      .default("initiated"),
    rawResponse: text("raw_response"), // JSON
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    donationIdx: index("payment_tx_donation_idx").on(table.donationId),
    providerRefIdx: uniqueIndex("payment_tx_provider_ref_idx").on(table.providerReference),
  })
);

// ============================================================
// WITHDRAWALS
// ============================================================

export const withdrawalAccounts = sqliteTable("withdrawal_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountHolderName: text("account_holder_name").notNull(),
  bankName: text("bank_name").notNull(),
  accountNumberEncrypted: text("account_number_encrypted").notNull(), // encrypted
  accountNumberLast4: text("account_number_last4").notNull(),
  isDefault: integer("is_default", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const withdrawalRequests = sqliteTable(
  "withdrawal_requests",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    withdrawalAccountId: text("withdrawal_account_id")
      .notNull()
      .references(() => withdrawalAccounts.id),
    amount: integer("amount").notNull(), // kobo
    currency: text("currency").notNull().default("NGN"),
    status: text("status", {
      enum: ["pending", "approved", "processing", "completed", "rejected", "cancelled"],
    })
      .notNull()
      .default("pending"),
    rejectionReason: text("rejection_reason"),
    processedBy: text("processed_by").references(() => users.id),
    reference: text("reference"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    processedAt: integer("processed_at", { mode: "timestamp" }),
  },
  (table) => ({
    campaignIdx: index("withdrawal_requests_campaign_idx").on(table.campaignId),
    userIdx: index("withdrawal_requests_user_idx").on(table.userId),
    statusIdx: index("withdrawal_requests_status_idx").on(table.status),
  })
);

// ============================================================
// NOTIFICATIONS, REPORTS, AUDIT
// ============================================================

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // campaign_approved, donation_received, etc.
    title: text("title").notNull(),
    body: text("body").notNull(),
    data: text("data"), // JSON payload
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    readIdx: index("notifications_read_idx").on(table.userId, table.isRead),
  })
);

export const campaignReports = sqliteTable(
  "campaign_reports",
  {
    id: text("id").primaryKey(),
    campaignId: text("campaign_id")
      .notNull()
      .references(() => campaigns.id),
    reporterId: text("reporter_id").references(() => users.id),
    reporterEmail: text("reporter_email"),
    reason: text("reason", {
      enum: [
        "fraud_suspicion",
        "misleading_information",
        "impersonation",
        "inappropriate_content",
        "other",
      ],
    }).notNull(),
    details: text("details"),
    status: text("status", {
      enum: ["pending", "reviewed", "resolved", "dismissed"],
    })
      .notNull()
      .default("pending"),
    reviewedBy: text("reviewed_by").references(() => users.id),
    reviewNotes: text("review_notes"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
  },
  (table) => ({
    campaignIdx: index("campaign_reports_campaign_idx").on(table.campaignId),
    statusIdx: index("campaign_reports_status_idx").on(table.status),
  })
);

export const adminActions = sqliteTable("admin_actions", {
  id: text("id").primaryKey(),
  adminId: text("admin_id")
    .notNull()
    .references(() => users.id),
  action: text("action").notNull(), // approve_campaign, reject_campaign, suspend_user, etc.
  targetType: text("target_type").notNull(), // campaign, user, report
  targetId: text("target_id").notNull(),
  details: text("details"), // JSON
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").references(() => users.id),
    action: text("action").notNull(),
    resourceType: text("resource_type"),
    resourceId: text("resource_id"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    metadata: text("metadata"), // JSON
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    userIdx: index("audit_logs_user_idx").on(table.userId),
    createdIdx: index("audit_logs_created_idx").on(table.createdAt),
  })
);

// Type exports for convenience
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type Donation = typeof donations.$inferSelect;
export type NewDonation = typeof donations.$inferInsert;
export type Session = typeof sessions.$inferSelect;
