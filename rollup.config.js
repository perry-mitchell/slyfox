import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";

export default {
    input: "source/index.ts",
    output: [
        {
            file: "./dist/umd/index.js",
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
