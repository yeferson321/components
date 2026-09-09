import { ActionError, defineAction } from "astro:actions";
import { z } from "astro/zod";

import PBKDF2Lite from "pbkdf2-lite";

import { createServerClient } from "../lib/supabase";
const supabase = createServerClient();

import { normalize, FIELD_LIMITS, NAME_PATTERN, hasWhitespace, hasDoubleSpaces, hasRepeatedChars, isValidEmailShape, getPasswordRequirements } from "@/components/common/form/rules";

const hasher = new PBKDF2Lite();

const normalized = (schema: z.ZodString) =>
    z.preprocess((value) => (typeof value === "string" ? normalize(value) : value), schema);

const email = normalized(
    z.string()
        .min(FIELD_LIMITS.email.minLength).max(FIELD_LIMITS.email.maxLength)
        .refine(isValidEmailShape)
);

const name = normalized(
    z.string()
        .min(FIELD_LIMITS.name.minLength).max(FIELD_LIMITS.name.maxLength)
        .refine((value) => NAME_PATTERN.test(value) && !hasDoubleSpaces(value))
);

const password = normalized(
    z.string()
        .min(FIELD_LIMITS.password.minLength).max(FIELD_LIMITS.password.maxLength)
        .refine((value) => !hasWhitespace(value))
        .refine((value) => !hasRepeatedChars(value))
        .refine((value) => {
            const req = getPasswordRequirements(value);
            return req.letter && req.number && req.special;
        })
);

export const register = defineAction({
    input: z.object({ email, name, password }),

    handler: async ({ email, name, password }, context) => {
        const account = {
            email,
            name,
            password_hash: await hasher.hash(password),
        };

        const { data, error } = await supabase.from('accounts').insert(account)

        if (error) {
            throw new ActionError({
                code: error.code === '23505' ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
                message: 'No se pudo completar el registro',
            });
        }
        // const sesionId = crypto.randomUUID();

        // context.cookies.set('sesion_id', sesionId, {
        //     maxAge: 3600,      // 1 hora, en segundos
        //     path: '/',
        //     httpOnly: true,
        //     secure: ENV.PROD,
        //     sameSite: 'lax',
        // });

        // const cookie = context.cookies.get('sesion_id');

        // console.log("hola", cookie, ENV.PROD)

        return {
            success: true,
        };
    }
})