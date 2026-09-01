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