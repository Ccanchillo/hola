import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const Usuario = createParamDecorator (
    (data: string | undefined, ctx: ExecutionContext) => {
        const peticion = ctx.switchToHttp().getRequest();
        const usuario = peticion.usuario;

        return data ? usuario?.[data] : usuario;
    }
)