import { Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { drizzle, NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from 'pg';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
    private pool!: Pool;
    private db!: NodePgDatabase;
    private conexionLista: Promise<void>;

    constructor() {
        this.conexionLista = this.inicializar();
    }

    private async inicializar() {
        try {
            this.pool = new Pool({
                connectionString: process.env.DATABASE_URL,
                max: 30,
                idleTimeoutMillis: 60000,
                connectionTimeoutMillis: 5000,
            });

            this.db = drizzle({ client: this.pool });
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async onModuleInit() {
        await this.conexionLista;
    }

    getDB(): NodePgDatabase {
        if (!this.db) {
            throw new InternalServerErrorException('Falló la conexión a la base de datos');
        }
        return this.db;
    }

    async onModuleDestroy() {
        await this.pool?.end();
    }
}