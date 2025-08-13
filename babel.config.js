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
            '@assets': './src/assets',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@animations': './src/assets/animations',
            '@contexts': './src/contexts',
            '@images': './src/assets/images',
            '@fonts': './src/assets/fonts',
            '@utils': './src/utils',
            '@types': './src/types'
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
