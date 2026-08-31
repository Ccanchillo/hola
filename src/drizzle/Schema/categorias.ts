import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

import { relations } from 'drizzle-orm';
import { tasks } from './tasks';
import { usuarios } from './usuarios';

export const categorias = pgTable('categorias', {
    id: uuid('id').primaryKey().defaultRandom(),
    nombre: varchar('nombre', { length: 50 }).notNull().unique(),
    usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),

});

export const categoriasRelations = relations(categorias, ({ many }) => ({ 
    tasks: many(tasks),
}));
export type Categoria = typeof categorias.$inferSelect;
export type NuevaCategoria = typeof categorias.$inferInsert;
