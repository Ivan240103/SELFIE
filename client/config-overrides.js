module.exports = function override(config) {
  config.ignoreWarnings = [
    {
      module: /node_modules\/rrule/, // Ignore warnings from the rrule library
    },
  ];
  return config;
};
