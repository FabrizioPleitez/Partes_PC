import { defineConfig } from "vite";
import path, { resolve } from "node:path";
import * as glob from "glob";

import { ViteMinifyPlugin } from "vite-plugin-minify";
import HtmlCssPurgePlugin from "vite-plugin-purgecss";
import HandlebarsPlugin from "vite-plugin-handlebars";

import { getData } from "./src/data";

function obtenerEntradas() {
    return Object.fromEntries(
        glob
            .sync("./**/*.html", {
                ignore: ["./dist/**", "./node_modules/**"],
            })
            .map((file) => {
                return [
                    file.slice(0, file.length - path.extname(file).length),
                    resolve(__dirname, file),
                ];
            })
    );
}

export default defineConfig({
    appType: "mpa",

    base: "/Partes_PC/",

    build: {
        minify: true,
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: obtenerEntradas(),
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js'
            }
        },
    },

    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        }
    },

    plugins: [
        HandlebarsPlugin({
            partialDirectory: resolve(__dirname, "src", "partials"),
            context: (page) => {
                return getData(page);
            },
        }),
        HtmlCssPurgePlugin(),
        ViteMinifyPlugin(),
    ],
});