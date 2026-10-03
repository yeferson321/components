import { ActionError, defineAction } from 'astro:actions';
import { z } from 'astro/zod';
import { createServerClient } from '@/lib/supabase';
import PBKDF2Lite from 'pbkdf2-lite';
import { normalize, NAME_PATTERN, REPEATED_CHARS_PATTERN, LETTER_PATTERN, NUMBER_PATTERN, SPECIAL_PATTERN, WHITESPACE_PATTERN, fieldLimits } from 'ui/behaviors';

const withNormalize = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (typeof value === "string" ? normalize(value) : value), schema);

const emailSchema = withNormalize(
    z.string()
        .trim()
        .min(1, 'REQUIRED')
        .refine((v) => !WHITESPACE_PATTERN.test(v), 'NO_SPACES')
        .refine((v) => v.includes('@'), 'MISSING_AT')
        .email('INVALID')
        .min(fieldLimits.email.minLength, 'TOO_SHORT')
        .max(fieldLimits.email.maxLength, 'TOO_LONG')
);

const nameSchema = withNormalize(
    z.string()
        .trim()
        .min(1, 'REQUIRED')
        .refine((v) => !WHITESPACE_PATTERN.test(v) || !/ {2,}/.test(v), 'SPACES')
        .refine((v) => NAME_PATTERN.test(v), 'INVALID_CHARS')
        .min(fieldLimits.name.minLength, 'TOO_SHORT')
        .max(fieldLimits.name.maxLength, 'TOO_LONG')
);

const passwordSchema = withNormalize(
    z.string()
        .min(1, 'REQUIRED')
        .refine((v) => !WHITESPACE_PATTERN.test(v), 'NO_SPACES')
        .refine((v) => !REPEATED_CHARS_PATTERN.test(v), 'REPEATED_CHARACTERS')
        .refine((v) => LETTER_PATTERN.test(v), 'MISSING_LETTER')
        .refine((v) => NUMBER_PATTERN.test(v), 'MISSING_NUMBER')
        .refine((v) => SPECIAL_PATTERN.test(v), 'MISSING_SPECIAL')
        .min(fieldLimits.password.minLength, 'TOO_SHORT')
        .max(fieldLimits.password.maxLength, 'TOO_LONG')
);

const supabase = createServerClient();
const hasher = new PBKDF2Lite();

export const register = defineAction({
    input: z.object({
        email: emailSchema,
        name: nameSchema,
        password: passwordSchema,
    }),
    handler: async ({ email, name, password }, context) => {

        console.log(context.locals)

        // if (!context.locals.user) {
        //     throw new ActionError({ code: 'UNAUTHORIZED' });
        // }

        const account = {
            email,
            name,
            password_hash: await hasher.hash(password),
        };

        const { data, error } = await supabase.from('accounts').insert(account)

        if (error) {
            throw new ActionError({
                code: error.code === '23505' ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
                message: 'BAD_REQUEST',
            });
        }

        const sesionId = crypto.randomUUID();

        context.cookies.set('sesion_id', sesionId, {
            maxAge: 3600,      // 1 hora, en segundos
            path: '/',
            httpOnly: true,
            secure: import.meta.env.PROD,
            sameSite: 'lax',
        });

        return {
            success: true,
        };
    }
})