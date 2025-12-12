import { StackServerApp } from "@stackframe/stack";

export const stackServerApp = new StackServerApp({
    tokenStore: "nextjs-cookie",
    urls: {
        baseUrl: process.env.NEXT_PUBLIC_STACK_URL || "http://localhost:3000",
    },
});
