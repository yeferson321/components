import { EncryptJWT, jwtDecrypt, type JWTPayload } from 'jose';

// atob en vez de Buffer: corre igual en Node y en runtimes de edge (Cloudflare Workers).
const decodeKey = (secret: string): Uint8Array => {
    const clean = secret.trim();

    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(clean)) {
        throw new Error('JWT_ENCRYPTION_KEY no es base64 válido — revisá cómo la estás leyendo (ver locals.runtime.env en Cloudflare)');
    }

    return Uint8Array.from(atob(clean), (char) => char.charCodeAt(0));
};

type ApiTokenPayload = JWTPayload & { apiKey: string };

// apiKey y encryptionKey se reciben como parámetro a propósito: este módulo no
// tiene acceso a Astro.locals, así que quien lo llama (frontmatter o endpoint)
// es responsable de leer el env correcto según el runtime (ver nota más abajo).
export const createApiToken = async (apiKey: string, encryptionKey: string): Promise<string> => {
    return new EncryptJWT({ apiKey } satisfies ApiTokenPayload)
        .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
        .setIssuedAt()
        .setExpirationTime('5m') // margen para que el usuario llene el formulario
        .encrypt(decodeKey(encryptionKey));
};

// jwtDecrypt ya rechaza tokens vencidos o con cifrado inválido (tira). El chequeo
// de apiKey es una capa extra, no estrictamente necesaria: si descifra, ya probaste
// que lo generó tu propio servidor.
export const verifyApiToken = async (token: string, apiKey: string, encryptionKey: string): Promise<boolean> => {
    try {
        const { payload } = await jwtDecrypt<ApiTokenPayload>(token, decodeKey(encryptionKey));
        return payload.apiKey === apiKey;
    } catch {
        return false;
    }
};