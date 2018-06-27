import babel from 'rollup-plugin-babel'

const env = process.env.NODE_ENV;

const babelConf = {
    exclude: "node_modules/**",
    babelrc: false,
    presets:
        [
            ['env', {modules: false}]
        ]
};

export default {
    input: 'webauthn-simple-app.js',
    plugins: [
        babel(babelConf)
    ],
    output: [
        {
            file: 'dist/webauthn-simple-app.js',
            format: 'umd',
            name: 'WebAuthnSimpleApp',
            sourcemap: (env === 'development')
        },
        {
            file: 'dist/webauthn-simple-app.esm.js',
            format: 'es',
            sourcemap: (env === 'development')
        },
    ]
};
