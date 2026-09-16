import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks';
import { categorias } from './categorias';
import { roles } from './roles';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
// Elimina la columna de texto estático anterior
  rolId: uuid('rol_id').references(() => roles.id),//.notNull(),

  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
});

export const usuariosRelations = relations(usuarios, ({ many, one }) => ({
  rol: one(roles, {
    fields: [usuarios.rolId],
    references: [roles.id],
  }),
  tasks: many(tasks),
  categorias: many(categorias),
}));