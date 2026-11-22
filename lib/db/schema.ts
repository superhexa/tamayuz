import { pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const adminMembers = pgTable('admin_members', {
  email: text('email').primaryKey(),
  createdAt: timestamp('createdAt', { withTimezone: true }).notNull().defaultNow(),
  createdBy: text('createdBy').notNull(),
})
