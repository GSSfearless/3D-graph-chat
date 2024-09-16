const { i18n } = require('./next-i18next.config');

module.exports = {
    i18n,
    env: {
      SERPER_API_KEY: process.env.SERPER_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    },
  };