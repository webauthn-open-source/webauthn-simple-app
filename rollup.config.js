const env = process.env.NODE_ENV; // eslint-disable-line no-process-env

export default [
    {
        input: "index.js",
        output: [
            {
                file: "dist/webauthn-simple-app.umd.js",
                format: "umd",
                name: "WebAuthnSimpleApp",
                sourcemap: (env === "development")
            },
            {
                file: "dist/webauthn-simple-app.esm.js",
                format: "es",
                sourcemap: (env === "development")
            },
            {
                file: "dist/webauthn-simple-app.cjs.js",
                format: "cjs",
                name: "WebAuthnSimpleApp",
                sourcemap: (env === "development")
            }
        ]
    }
];
