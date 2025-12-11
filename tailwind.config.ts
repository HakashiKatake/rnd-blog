import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        // Custom neobrutal utilities
        function ({ addUtilities }: any) {
            addUtilities({
                '.border-brutal': {
                    'border-width': '2px',
                    'border-color': '#000000',
                    'border-style': 'solid',
                },
                '.border-brutal-thick': {
                    'border-width': '4px',
                    'border-color': '#000000',
                    'border-style': 'solid',
                },
                '.shadow-brutal': {
                    'box-shadow': '4px 4px 0 0 rgba(0, 0, 0, 1)',
                },
                '.shadow-brutal-sm': {
                    'box-shadow': '2px 2px 0 0 rgba(0, 0, 0, 1)',
                },
                '.shadow-brutal-lg': {
                    'box-shadow': '6px 6px 0 0 rgba(0, 0, 0, 1)',
                },
                '.shadow-brutal-xl': {
                    'box-shadow': '8px 8px 0 0 rgba(0, 0, 0, 1)',
                },
                '.text-outlined': {
                    'color': 'transparent',
                    '-webkit-text-stroke': '2px currentColor',
                    'text-stroke': '2px currentColor',
                },
            });
        },
    ],
};

export default config;
