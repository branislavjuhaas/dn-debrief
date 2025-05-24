// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  modules: ["@nuxt/eslint", "nuxt-vuefire"],

  vuefire: {
    auth: {
      enabled: true,
      sessionCookie: true,
    },
    appCheck: {
      isTokenAutoRefreshEnabled: true,
      provider: "ReCaptchaV3",
      key: "6Letq2oqAAAAAChut_Xa1Xg9AHu_n76VKWt9cTlo",
    },
    config: {
      apiKey: "AIzaSyCG1YinvyCiYK2ppM6lNDoO1Jw8PXYToDE",
      authDomain: "dn-cascade.firebaseapp.com",
      databaseURL:
        "https://dn-cascade-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "dn-cascade",
      storageBucket: "dn-cascade.appspot.com",
      messagingSenderId: "302805903197",
      appId: "1:302805903197:web:96d3607464b5d0ce38eab4",
      measurementId: "G-8WDZKR0VPT",
    },
  },
});
