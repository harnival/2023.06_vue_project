const { defineConfig } = require('@vue/cli-service');
const path = require(path);

module.exports = defineConfig({
  pluginOptions: {
  },
  pwa:{
    name: 'Cheezz - vue project',
    themeColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'yellow',
  },
  chainWebpack: config => {
    config.resolve.alias
      .set('@', path.resolve(__dirname, './src/'))
  }
})
