import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { categorias } from './categorias';
import { relations } from 'drizzle-orm';    

export const tasks = pgTable('tasks', {
    id: uuid('id').primaryKey().defaultRandom(),
    titulo: varchar('titulo', { length: 100 }).notNull().unique(),
    hecha: boolean('hecha').notNull().default(false),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    deletedAt: timestamp('deleted_at'),

    categoriaId: uuid('categoria_id').references(() => categorias.id),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
    categoria: one(categorias, {
        fields: [tasks.categoriaId],
        references: [categorias.id],
    }),
}));
export type Task = typeof tasks.$inferSelect;
export type NuevaTask = typeof tasks.$inferInsert;