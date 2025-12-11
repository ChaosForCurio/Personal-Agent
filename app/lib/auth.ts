// lib/auth.ts
import { useStackApp } from '@stackframe/stack';

export function getStackAuth() {
    return useStackApp();
}