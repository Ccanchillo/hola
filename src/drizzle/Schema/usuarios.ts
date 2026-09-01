import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks';
import { categorias } from './categorias';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  // Asignamos 'USER' como nivel por defecto
  rol: varchar('rol', { length: 50 }).default('ADMIN').notNull(), 
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  tasks: many(tasks),
  categorias: many(categorias),
}));