module.exports = function withModularHeaders(config) {
  return {
    ...config,
    plugins: [
      [
        "expo-build-properties",
        {
          ios: {
            useModularHeaders: true
          }
        }
      ]
    ]
  };
};
