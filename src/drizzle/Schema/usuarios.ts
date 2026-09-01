import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { tasks } from './tasks';
import { categorias } from './categorias';
import { relations } from 'drizzle-orm';

export const usuarios = pgTable('usuarios', {
    id: uuid('id').defaultRandom().primaryKey(),
    email: varchar('email', {length: 255}).notNull().unique(),
    password: varchar('password', {length: 255}).notNull(),
    rol: varchar('rol', {length: 50}).default('USUARIO').notNull(),
    creado: timestamp('creado').defaultNow(),
    actualizado: timestamp('actualizado').defaultNow(),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
    tasks: many(tasks),
    categorias: many(categorias),
}));