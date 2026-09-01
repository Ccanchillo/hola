import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  // Cambiamos serial por uuid y le indicamos que genere un valor aleatorio por defecto
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
});