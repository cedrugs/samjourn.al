import {
	pgTable,
	text,
	timestamp,
	date,
	pgEnum,
	unique,
	boolean,
} from "drizzle-orm/pg-core";

export const categoryEnum = pgEnum("category", ["journal", "quiet-time"]);
export const statusEnum = pgEnum("status", ["draft", "published"]);

export const users = pgTable("users", {
	id: text("id").primaryKey(),
	email: text("email").notNull().unique(),
	name: text("name"),
	emailVerified: boolean("email_verified").default(false),
	image: text("image"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const accounts = pgTable("accounts", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at"),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
	idToken: text("id_token"),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: text("id").primaryKey(),
	userId: text("user_id")
		.notNull()
		.references(() => users.id, { onDelete: "cascade" }),
	token: text("token").notNull().unique(),
	expiresAt: timestamp("expires_at").notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow(),
});

export const posts = pgTable(
	"posts",
	{
		id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
		category: categoryEnum("category").notNull(),
		date: date("date").notNull(),
		title: text("title"),
		content: text("content"),
		audioUrl: text("audio_url"),
		status: statusEnum("status").notNull().default("draft"),
		publishedAt: timestamp("published_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at").defaultNow().notNull(),
	},
	(table) => [unique("unique_category_date").on(table.category, table.date)]
);

export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Category = (typeof categoryEnum.enumValues)[number];
export type Status = (typeof statusEnum.enumValues)[number];
