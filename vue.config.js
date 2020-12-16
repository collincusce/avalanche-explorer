const colors = require('colors')
// Inject SCSS variables into Vue components
let scssVars = ''
scssVars += `$VUE_APP_DEFAULT_NETWORKID: ${process.env.VUE_APP_DEFAULT_NETWORKID}; `
for (const e in process.env) {
    if (/VUE_APP_SCSS_/i.test(e)) {
        scssVars += `$${e}: ${process.env[e]}; `
    }
}
scssVars += `@import "@/_main.scss"; `
scssVars += `@import "@/_background.scss"; `

/**
 * This just displays the urls being provided by .env file
 */
console.log(`
${colors.green('.Env configs are:')}
    Ortelius url: ${colors.magenta(process.env.VUE_APP_ORTELIUS_URL)}
    Avalanche GO url: ${colors.magenta(process.env.VUE_APP_AVALANCHE_GO_URL)}
`)

module.exports = {
    devServer: {
        https: !process.env.USE_HTTP,
        port: process.env.VUE_APP_HTTP_PORT,
    },
    transpileDependencies: ['vuetify'],
    css: {
        loaderOptions: {
            scss: {
                prependData: scssVars,
            },
        },
    },
}
