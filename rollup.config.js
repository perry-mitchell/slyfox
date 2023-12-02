import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default {
    // external: externals,
    input: "source/index.ts",
    output: [
        {
            file: "./dist/test/slyfox.js",
            format: "umd",
            name: "SlyFox"
        }
    ],
    plugins: [
        typescript({
            tsconfig: "tsconfig.json"
        }),
        resolve({ extensions: [".js", ".ts"] })
    ]
};
