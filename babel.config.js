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
            '@images': './src/app/assets/images',
            '@fonts': './src/app/assets/fonts',
            '@utils': './src/app/utils',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
