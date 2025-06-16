module.exports = function (api) {
    api.cache(true);
    return {
        presets: ['babel-preset-expo'],
        plugins: [
            [
                'module-resolver',
                {
                    root: ['./app'],
                    alias: {
                        '@assets': './src/app/assets',
                        '@components': './src/app/components',
                        '@hooks': './src/app/hooks',
                        '@animations': './src/app/assets/animations',
                    },
                },
            ],
        ],
    };
}