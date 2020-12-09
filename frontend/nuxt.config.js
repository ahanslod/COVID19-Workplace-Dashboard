export default {
  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    title: "Dashboard",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" }
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }]
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: [],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: ["plugins/employees.js"],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/tailwindcss
    "@nuxtjs/tailwindcss"
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ["@nuxtjs/auth", "@nuxtjs/axios"],
  auth: {
    strategies: {
      local: {
        endpoints: {
          login: {
            url: "http://localhost:3000/api/auth/login",
            method: "post",
            propertyName: "accessToken"
          },
          logout: {
            url: "http://localhost:3000/api/auth/logout",
            method: "post"
          },
          user: {
            url: "http://localhost:3000/api/auth/user",
            method: "get",
            propertyName: "data"
          }
        }
      }
    }
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {}
};
