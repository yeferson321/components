// src/pages/api/auth/register.ts

import type { APIRoute } from "astro";
import { z } from 'astro/zod';
import { createServerClient } from '@/lib/supabase';
import PBKDF2Lite from 'pbkdf2-lite';
import { normalize, NAME_PATTERN, REPEATED_CHARS_PATTERN, LETTER_PATTERN, NUMBER_PATTERN, SPECIAL_PATTERN, WHITESPACE_PATTERN, fieldLimits } from 'ui/behaviors';

const withNormalize = <T extends z.ZodType>(schema: T) => z.preprocess((value) => (typeof value === 'string' ? normalize(value) : value), schema);

const registerSchema = z.object({
    email: withNormalize(
        z.string()
            .trim()
            .min(fieldLimits.email.minLength)
            .max(fieldLimits.email.maxLength)
            .email()
            .refine((v) => !WHITESPACE_PATTERN.test(v))
    ),
    name: withNormalize(
        z.string()
            .trim()
            .min(fieldLimits.name.minLength)
            .max(fieldLimits.name.maxLength)
            .refine((v) => NAME_PATTERN.test(v))
            .refine((v) => !/ {2,}/.test(v))
    ),
    password: withNormalize(
        z.string()
            .min(fieldLimits.password.minLength)
            .max(fieldLimits.password.maxLength)
            .refine((v) => !WHITESPACE_PATTERN.test(v))
            .refine((v) => !REPEATED_CHARS_PATTERN.test(v))
            .refine((v) => LETTER_PATTERN.test(v))
            .refine((v) => NUMBER_PATTERN.test(v))
            .refine((v) => SPECIAL_PATTERN.test(v))
    ),
});

const supabase = createServerClient();
const hasher = new PBKDF2Lite();

export const POST: APIRoute = async ({ request, cookies }) => {
    const body = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    const apiKey = request.headers.get('Authorization') ?? '';

    console.log('API Key:', apiKey);
// if (!safeEqual(apiKey, import.meta.env.REGISTER_API_KEY)) {
//     return json({ success: false, error: 'UNAUTHORIZED' }, 401);
// }



    if (!parsed.success) {
        return Response.json({ success: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    const { email, name, password } = parsed.data;

    const { error } = await supabase.from('accounts').insert({
        email,
        name,
        password_hash: await hasher.hash(password),
    });

    if (error) {
        return error.code === '23505'
            ? Response.json({ success: false, error: 'CONFLICT' }, { status: 409 })
            : Response.json({ success: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 500 });
    }

    cookies.set('sesion_id', crypto.randomUUID(), {
        maxAge: 3600,
        path: '/',
        httpOnly: true,
        secure: import.meta.env.PROD,
        sameSite: 'lax',
    });

    return Response.json({ success: true }, { status: 201 });
};