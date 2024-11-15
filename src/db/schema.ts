import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const polls = sqliteTable('polls', {
  id: text('id').primaryKey(),
  question: text('question').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const pollOptions = sqliteTable('poll_options', {
  id: text('id').primaryKey(),
  pollId: text('poll_id').notNull().references(() => polls.id),
  text: text('text').notNull(),
  imageUrl: text('image_url'),
  votes: integer('votes').notNull().default(0),
});