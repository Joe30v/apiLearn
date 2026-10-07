// Lets Jest run the TypeScript source (types are stripped, not type-checked)
module.exports = {
    presets: [
        ["@babel/preset-env", { targets: { node: "current" } }],
        "@babel/preset-typescript",
    ],
};
