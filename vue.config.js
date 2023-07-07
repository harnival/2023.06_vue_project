const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  pluginOptions: {
  },
  pwa:{
    name: 'Cheezz - vue project',
    themeColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'yellow',
  }
})
