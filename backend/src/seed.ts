import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

const email = process.env.ADMIN_EMAIL;
const name = process.env.ADMIN_NAME || "Admin";

if (email) {
	const existing = await db.select().from(users).where(eq(users.email, email));
	if (existing.length === 0) {
		await db.insert(users).values({
			id: crypto.randomUUID(),
			email,
			name,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		console.log(`Admin user created: ${email}`);
	} else {
		console.log(`Admin user already exists: ${email}`);
	}
}

process.exit(0);
