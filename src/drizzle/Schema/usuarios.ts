import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', {length: 255}).notNull().unique(),
    password: varchar('password', {length: 255}).notNull(),
    creado: timestamp('creado').defaultNow(),
    actualizado: timestamp('actualizado').defaultNow(),
})