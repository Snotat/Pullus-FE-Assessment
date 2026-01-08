declare module 'next-pwa' {
    import { NextConfig } from 'next';

    function withPWA(config): (nextConfig: NextConfig) => NextConfig;

    export default withPWA;
}