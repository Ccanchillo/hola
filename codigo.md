# BORRAR EL 01 EN .ENV

src/drizzle/Schema/usuarios.ts
```
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  // Cambiamos serial por uuid y le indicamos que genere un valor aleatorio por defecto
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
});
```
src/users/users.service.ts

```
import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { usuarios } from '../drizzle/Schema/usuarios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDB();
  }

  async crear(crearUsuarioDto: any) {
    const saltRounds = 10;
    const passwordHasheada = await bcrypt.hash(crearUsuarioDto.password, saltRounds);

    const nuevoUsuario = await this.db.insert(usuarios).values({
      email: crearUsuarioDto.email,
      password: passwordHasheada,
    }).returning();

    const { password, ...resultado } = nuevoUsuario[0];
    return resultado;
  }

  async buscarPorEmail(email: string) {
    const [resultado] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));
      
    return resultado;
  }
}

```
src/users/users.controller.ts
```
import { Controller, Post, Body } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post('registrar')
  async registrarUsuario(@Body() crearUsuarioDto: any) {
    return this.usuariosService.crear(crearUsuarioDto);
  }
}
```
src/users/users.module.ts
```
import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { DrizzleModule } from '../drizzle/drizzle.module'; // Ruta basada en tu repositorio[cite: 1]

@Module({
  imports: [DrizzleModule], 
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], 
})
export class UsuariosModule {}
```
src/auth/auth.service.ts
```
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    // 1. Buscamos el usuario en la BD
    const usuario = await this.usuariosService.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Comparamos las contraseñas
    const esValida = await bcrypt.compare(pass, usuario.password);
    if (!esValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generamos el JWT
    const payload = { sub: usuario.id, email: usuario.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
```
src/auth/auth.controller.ts
```
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: Record<string, any>) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}
```
src/auth/auth.module.ts
```
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.register({
      global: true,
      secret: 'CLAVE_SECRETA_PARA_PRACTICANTES', 
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

## .env y .env.example
JWT_SECRET=una_clave_secreta_muy_segura_y_larga

# VERSION REAL

src/app.module.ts
```
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsuariosModule } from './usuarios/usuarios.module';
// ... tus otras importaciones

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Esto permite usar ConfigService en cualquier módulo sin importarlo de nuevo
    }),
    AuthModule,
    UsuariosModule,
    // ... otros módulos
  ],
})
export class AppModule {}
```

src/auth/auth.module.ts
```
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UsuariosModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

# AUTH GUARD
src/auth/auth.guard.ts
```
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const peticion = context.switchToHttp().getRequest();
    const token = this.extraerToken(peticion);

    if (!token) {
      throw new UnauthorizedException('Acceso denegado: Token no proporcionado');
    }

    try {
      // Verificamos el token usando la misma firma secreta del .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Inyectamos los datos del usuario en la petición para usarlos en el controlador si es necesario
      peticion['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('Acceso denegado: Token inválido o expirado');
    }

    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}
```

# DECORADOR PERSONALIZADO
src/auth/decorators/usuario.decorator.ts
```
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Usuario = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const peticion = ctx.switchToHttp().getRequest();
    const usuario = peticion.usuario;

    // Si pasamos un campo específico (ej: @Usuario('id')), retorna solo ese campo. 
    // De lo contrario, retorna todo el objeto del payload.
    return data ? usuario?.[data] : usuario;
  },
);
```
#PEDAZOS DE CODIGO
src/auth/decorators/usuario.decorator.ts
TE DARA UN ERROR
```
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const Usuario = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const peticion = ctx.switchToHttp().getRequest();
    const usuario = peticion.usuario;

    // Si pasamos un campo específico (ej: @Usuario('id')), retorna solo ese campo. 
    // De lo contrario, retorna todo el objeto del payload.
    return data ? usuario?.[data] : usuario;
  },
);
```
src/categorias/categorias.controller.ts
TE SEGUIRA DANDO ERROR
```
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriasDto } from './dto/create-categorias.dto';
import { AuthGuard } from '../auth/auth.guard';
import { Usuario } from '../auth/decorators/usuario.decorator';

@UseGuards(AuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Post()
  crear(
    @Body() dto: CreateCategoriasDto,
    @Usuario('sub') idUsuario: string // 'sub' es donde guardamos el ID en el AuthModule
  ) {
    // Ahora puedes pasarle el ID del usuario al servicio para que lo asigne en la base de datos
    return this.categoriasService.crear(dto, idUsuario);
  }
}
```
src/drizzle/Schema/categorias.ts
```
usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
```
src/categorias/categorias.service.ts
```
async crear(dto: CreateCategoriasDto, idUsuario: string) {
    const [repetida] = await this.db
      .select()
      .from(categorias)
      .where(ilike(categorias.nombre, dto.nombre));

    if (repetida) {
      throw new ConflictException(`Ya existe "${dto.nombre}"`);
    }

    // Insertamos la categoría incluyendo el ID del usuario
    const [nuevaCategoria] = await this.db
      .insert(categorias)
      .values({
        ...dto,
        usuarioId: idUsuario, // Aquí vinculamos el registro al usuario
      })
      .returning();

    return nuevaCategoria;
  }
```


# NUEVO DESDE AQUI

src/drizzle/Schema/tasks.ts
```
import { pgTable, uuid, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { categorias } from './categorias';
import { usuarios } from './usuarios'; // Importar la tabla usuarios
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
    
    // Nueva columna obligatoria vinculada al usuario
    usuarioId: uuid('usuario_id').references(() => usuarios.id).notNull(),
});

export const tasksRelations = relations(tasks, ({ one }) => ({
    categoria: one(categorias, {
        fields: [tasks.categoriaId],
        references: [categorias.id],
    }),
    // Nueva relación a nivel de ORM para consultas avanzadas
    usuario: one(usuarios, {
        fields: [tasks.usuarioId],
        references: [usuarios.id],
    }),
}));

export type Task = typeof tasks.$inferSelect;
export type NuevaTask = typeof tasks.$inferInsert;
```
src/tasks/tasks.service.ts

```
obtenerTodas(idUsuario: string) {
    return this.db
      .select()
      .from(tasks)
      .where(eq(tasks.usuarioId, idUsuario));
  }
```

```
async crear(dto: CreateTasksDTO, idUsuario: string) {
    const [repetida] = await this.db
      .select()
      .from(tasks)
      .where(
        and(
          ilike(tasks.titulo, dto.titulo),
          isNull(tasks.deletedAt),
          eq(tasks.usuarioId, idUsuario) // Permite que otros usuarios usen el mismo título
        )
      );

    if (repetida) {
      // Yo no escribo el 409 el ConflictException lo hace por mi
      throw new ConflictException(`Ya existe "${dto.titulo}"`);
    }

    const [nueva] = await this.db
      .insert(tasks)
      .values({
        ...dto,
        usuarioId: idUsuario, // Vinculamos la tarea al creador
      })
      .returning();
      
    return nueva;
}
```
src/tasks/tasks.controller.ts
```
@Get()
  obtenerTodas(@Usuario('sub') idUsuario: string) {
    return this.tasksService.obtenerTodas(idUsuario);
  }

  @Post()
  crear(
    @Body() dto: CreateTasksDto,
    @Usuario('sub') idUsuario: string
  ) {
    return this.tasksService.crear(dto, idUsuario);
  }
```


# ROLES
src/drizzle/Schema/usuarios.ts
```
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { tasks } from './tasks';
import { categorias } from './categorias';

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  // Asignamos 'USER' como nivel por defecto
  rol: varchar('rol', { length: 50 }).default('USER').notNull(), 
  creadoEn: timestamp('creado_en').defaultNow(),
  actualizadoEn: timestamp('actualizado_en').defaultNow(),
});

export const usuariosRelations = relations(usuarios, ({ many }) => ({
  tasks: many(tasks),
  categorias: many(categorias),
}));
```
src/auth/auth.service.ts
```
const payload = { 
      sub: usuario.id, 
      email: usuario.email, 
      rol: usuario.rol // Inyectamos el rol aquí
    };
```
src/auth/decorators/roles.decorator.ts
```
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```
src/auth/guard/roles.guard.ts
```
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) {
      return true; // Acceso libre si no hay decorador @Roles
    }

    const peticion = context.switchToHttp().getRequest();
    const usuario = peticion.usuario; // Extraído previamente por el AuthGuard

    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException('Privilegios insuficientes (Requiere rol superior)');
    }

    return true;
  }
}
```
src/categorias/categorias.controller.ts
```
import { Controller, Delete, UseGuards, Param } from '@nestjs/common';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@UseGuards(AuthGuard, RolesGuard) // El orden es vital: primero valida token, luego rol
@Controller('categorias')
export class CategoriasController {
  
  @Delete(':id')
  @Roles('ADMIN') // Solo usuarios con rol ADMIN pueden ejecutar esto
  eliminar(@Param('id') id: string) {
    // Lógica del servicio
  }
}
```

# AHORA SI EL VERDADERO ROL
src/drizzle/Schema/roles.ts
```
import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { usuarios } from './usuarios'; // Importamos la tabla usuarios

export const roles = pgTable('roles', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: varchar('nombre', { length: 50 }).notNull().unique(), // Ej: 'ADMIN', 'MODERADOR'
  descripcion: varchar('descripcion', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios),
}));
```
src/drizzle/Schema/usuarios.ts
```
// Elimina la columna de texto estático anterior
rolId: uuid('rol_id').references(() => roles.id).notNull(),
```