<!-- BEGIN:nuxt-agent-rules -->

# Nuxt: ALWAYS read docs before coding

This project uses Nuxt v4.5.2. Before any Nuxt work, find and read the relevant doc in `.nuxt-docs/`. Your training data may be outdated — the docs are the source of truth.

```
API|.nuxt-docs/4.api/1.components/1.client-only.md|api,components,client only,placeholderTag,fallbackTag
API|.nuxt-docs/4.api/1.components/1.dev-only.md|api,components,dev only
API|.nuxt-docs/4.api/1.components/1.nuxt-client-fallback.md|api,components,nuxt client fallback,placeholderTag,fallbackTag
API|.nuxt-docs/4.api/1.components/10.nuxt-picture.md|api,components,nuxt picture,webp
API|.nuxt-docs/4.api/1.components/11.teleports.md|api,components,teleports,ClientOnly
API|.nuxt-docs/4.api/1.components/12.nuxt-route-announcer.md|api,components,nuxt route announcer,atomic,politeness
API|.nuxt-docs/4.api/1.components/13.nuxt-time.md|api,components,nuxt time,datetime,Date
API|.nuxt-docs/4.api/1.components/2.nuxt-page.md|api,components,nuxt page,useRoute,transition
API|.nuxt-docs/4.api/1.components/3.nuxt-layout.md|api,components,nuxt layout,default,name
API|.nuxt-docs/4.api/1.components/4.nuxt-link.md|api,components,nuxt link,encodeURI,encodeURIComponent
API|.nuxt-docs/4.api/1.components/5.nuxt-loading-indicator.md|api,components,nuxt loading indicator,color,errorColor
API|.nuxt-docs/4.api/1.components/6.nuxt-error-boundary.md|api,components,nuxt error boundary,onErrorCaptured,error
API|.nuxt-docs/4.api/1.components/7.nuxt-welcome.md|api,components,nuxt welcome
API|.nuxt-docs/4.api/1.components/8.nuxt-island.md|api,components,nuxt island,name,lazy
API|.nuxt-docs/4.api/1.components/9.nuxt-img.md|api,components,nuxt img,src,width
API|.nuxt-docs/4.api/2.composables/on-prehydrate.md|api,composables,on prehydrate,onPrehydrate,callback
API|.nuxt-docs/4.api/2.composables/use-app-config.md|api,composables,use app config
API|.nuxt-docs/4.api/2.composables/use-async-data.md|api,composables,use async data,useAsyncData,data
API|.nuxt-docs/4.api/2.composables/use-cookie.md|api,composables,use cookie,useCookie,name
API|.nuxt-docs/4.api/2.composables/use-error.md|api,composables,use error,useError,Ref
API|.nuxt-docs/4.api/2.composables/use-fetch.md|api,composables,use fetch,useAsyncData,$fetch
API|.nuxt-docs/4.api/2.composables/use-head-safe.md|api,composables,use head safe,useHeadSafe,useHead
API|.nuxt-docs/4.api/2.composables/use-head.md|api,composables,use head,useHead,useHeadSafe
API|.nuxt-docs/4.api/2.composables/use-hydration.md|api,composables,use hydration,useHydration,useState
API|.nuxt-docs/4.api/2.composables/use-lazy-async-data.md|api,composables,use lazy async data,useLazyAsyncData,useAsyncData
API|.nuxt-docs/4.api/2.composables/use-lazy-fetch.md|api,composables,use lazy fetch,useLazyFetch,useFetch
API|.nuxt-docs/4.api/2.composables/use-loading-indicator.md|api,composables,use loading indicator,duration,throttle
API|.nuxt-docs/4.api/2.composables/use-nuxt-app.md|api,composables,use nuxt app,useNuxtApp,ssrContext
API|.nuxt-docs/4.api/2.composables/use-nuxt-data.md|api,composables,use nuxt data,useNuxtData,useAsyncData
API|.nuxt-docs/4.api/2.composables/use-preview-mode.md|api,composables,use preview mode,usePreviewMode,useAsyncData
API|.nuxt-docs/4.api/2.composables/use-request-event.md|api,composables,use request event,useRequestEvent
API|.nuxt-docs/4.api/2.composables/use-request-fetch.md|api,composables,use request fetch,useRequestFetch,connection
API|.nuxt-docs/4.api/2.composables/use-request-header.md|api,composables,use request header,useRequestHeader,authorization
API|.nuxt-docs/4.api/2.composables/use-request-headers.md|api,composables,use request headers,useRequestHeaders,authorization
API|.nuxt-docs/4.api/2.composables/use-request-url.md|api,composables,use request url,useRequestURL,localhost
API|.nuxt-docs/4.api/2.composables/use-response-header.md|api,composables,use response header,useResponseHeader,defineNuxtRouteMiddleware
API|.nuxt-docs/4.api/2.composables/use-route-announcer.md|api,composables,use route announcer,politeness,off
API|.nuxt-docs/4.api/2.composables/use-route.md|api,composables,use route,$route,useRoute
API|.nuxt-docs/4.api/2.composables/use-router.md|api,composables,use router,$router,useRouter
API|.nuxt-docs/4.api/2.composables/use-runtime-config.md|api,composables,use runtime config,runtimeConfig,useRuntimeConfig
API|.nuxt-docs/4.api/2.composables/use-runtime-hook.md|api,composables,use runtime hook,name
API|.nuxt-docs/4.api/2.composables/use-seo-meta.md|api,composables,use seo meta,name,property
API|.nuxt-docs/4.api/2.composables/use-server-seo-meta.md|api,composables,use server seo meta,useSeoMeta,useServerSeoMeta
API|.nuxt-docs/4.api/2.composables/use-state.md|api,composables,use state,useState,shallowRef
API|.nuxt-docs/4.api/3.utils/$fetch.md|api,utils,$fetch,useAsyncData,useFetch
API|.nuxt-docs/4.api/3.utils/abort-navigation.md|api,utils,abort navigation,abortNavigation,err
API|.nuxt-docs/4.api/3.utils/add-route-middleware.md|api,utils,add route middleware,name,RouteMiddleware
API|.nuxt-docs/4.api/3.utils/call-once.md|api,utils,call once,callOnce,navigation
API|.nuxt-docs/4.api/3.utils/clear-error.md|api,utils,clear error,clearError,useError
API|.nuxt-docs/4.api/3.utils/clear-nuxt-data.md|api,utils,clear nuxt data,keys,useAsyncData
API|.nuxt-docs/4.api/3.utils/clear-nuxt-state.md|api,utils,clear nuxt state,useState,keys
API|.nuxt-docs/4.api/3.utils/create-error.md|api,utils,create error,err,createError
API|.nuxt-docs/4.api/3.utils/define-lazy-hydration-component.md|api,utils,define lazy hydration component,defineLazyHydrationComponent,hydrateOnVisible
API|.nuxt-docs/4.api/3.utils/define-nuxt-component.md|api,utils,define nuxt component,defineNuxtComponent,defineComponent
API|.nuxt-docs/4.api/3.utils/define-nuxt-plugin.md|api,utils,define nuxt plugin,defineNuxtPlugin,NuxtApp
API|.nuxt-docs/4.api/3.utils/define-nuxt-route-middleware.md|api,utils,define nuxt route middleware,middleware,RouteMiddleware
API|.nuxt-docs/4.api/3.utils/define-page-meta.md|api,utils,define page meta,definePageMeta,meta
API|.nuxt-docs/4.api/3.utils/define-route-rules.md|api,utils,define route rules,path,alias
API|.nuxt-docs/4.api/3.utils/navigate-to.md|api,utils,navigate to,navigateTo,await
API|.nuxt-docs/4.api/3.utils/on-before-route-leave.md|api,utils,on before route leave
API|.nuxt-docs/4.api/3.utils/on-before-route-update.md|api,utils,on before route update
API|.nuxt-docs/4.api/3.utils/on-nuxt-ready.md|api,utils,on nuxt ready,onNuxtReady,defineNuxtPlugin
API|.nuxt-docs/4.api/3.utils/prefetch-components.md|api,utils,prefetch components,prefetchComponents,preloadComponents
API|.nuxt-docs/4.api/3.utils/preload-components.md|api,utils,preload components,preloadComponents
API|.nuxt-docs/4.api/3.utils/preload-route-components.md|api,utils,preload route components,NuxtLink,navigateTo
API|.nuxt-docs/4.api/3.utils/prerender-routes.md|api,utils,prerender routes,prerenderRoutes,$fetch
API|.nuxt-docs/4.api/3.utils/refresh-cookie.md|api,utils,refresh cookie,refreshCookie,useCookie
API|.nuxt-docs/4.api/3.utils/refresh-nuxt-data.md|api,utils,refresh nuxt data,refreshNuxtData,asyncData
API|.nuxt-docs/4.api/3.utils/reload-nuxt-app.md|api,utils,reload nuxt app,reloadNuxtApp,state
API|.nuxt-docs/4.api/3.utils/set-page-layout.md|api,utils,set page layout,setPageLayout,defineNuxtRouteMiddleware
API|.nuxt-docs/4.api/3.utils/set-response-status.md|api,utils,set response status,setResponseStatus
API|.nuxt-docs/4.api/3.utils/show-error.md|api,utils,show error,showError,error
API|.nuxt-docs/4.api/3.utils/update-app-config.md|api,utils,update app config
API|.nuxt-docs/4.api/4.commands/add.md|api,commands,add,TEMPLATE,NAME
API|.nuxt-docs/4.api/4.commands/analyze.md|api,commands,analyze,default,production
API|.nuxt-docs/4.api/4.commands/build-module.md|api,commands,build module,dist,rootDir
API|.nuxt-docs/4.api/4.commands/build.md|api,commands,build,production,development
API|.nuxt-docs/4.api/4.commands/cleanup.md|api,commands,cleanup
API|.nuxt-docs/4.api/4.commands/dev.md|api,commands,dev,production,development
API|.nuxt-docs/4.api/4.commands/devtools.md|api,commands,devtools,COMMAND
API|.nuxt-docs/4.api/4.commands/generate.md|api,commands,generate,prerender,production
API|.nuxt-docs/4.api/4.commands/info.md|api,commands,info
API|.nuxt-docs/4.api/4.commands/init.md|api,commands,init
API|.nuxt-docs/4.api/4.commands/module.md|api,commands,module,MODULENAME,Pinia
API|.nuxt-docs/4.api/4.commands/prepare.md|api,commands,prepare,postinstall,production
API|.nuxt-docs/4.api/4.commands/preview.md|api,commands,preview,build,start
API|.nuxt-docs/4.api/4.commands/test.md|api,commands,test
API|.nuxt-docs/4.api/4.commands/typecheck.md|api,commands,typecheck,production
API|.nuxt-docs/4.api/4.commands/upgrade.md|api,commands,upgrade,stable
API|.nuxt-docs/4.api/5.kit/1.modules.md|api,kit,modules,defineNuxtModule,moduleDependencies
API|.nuxt-docs/4.api/5.kit/10.runtime-config.md|api,kit,runtime config,useRuntimeConfig,updateRuntimeConfig
API|.nuxt-docs/4.api/5.kit/10.templates.md|api,kit,templates,addTemplate,addTypeTemplate
API|.nuxt-docs/4.api/5.kit/11.nitro.md|api,kit,nitro,useNitro,addServerHandler
API|.nuxt-docs/4.api/5.kit/12.resolving.md|api,kit,resolving,resolvePath,resolveAlias
API|.nuxt-docs/4.api/5.kit/13.logging.md|api,kit,logging,useLogger,tag
API|.nuxt-docs/4.api/5.kit/14.builder.md|api,kit,builder,extendViteConfig,extendWebpackConfig
API|.nuxt-docs/4.api/5.kit/15.examples.md|api,kit,examples
API|.nuxt-docs/4.api/5.kit/16.layers.md|api,kit,layers,getLayerDirectories,nuxt
API|.nuxt-docs/4.api/5.kit/2.programmatic.md|api,kit,programmatic,loadNuxt,loadOptions
API|.nuxt-docs/4.api/5.kit/3.compatibility.md|api,kit,compatibility,checkNuxtCompatibility,assertNuxtCompatibility
API|.nuxt-docs/4.api/5.kit/4.autoimports.md|api,kit,autoimports,addImports,addImportsDir
API|.nuxt-docs/4.api/5.kit/5.components.md|api,kit,components,addComponentsDir,addComponent
API|.nuxt-docs/4.api/5.kit/6.context.md|api,kit,context,useNuxt,tryUseNuxt
API|.nuxt-docs/4.api/5.kit/7.pages.md|api,kit,pages,extendPages,name
API|.nuxt-docs/4.api/5.kit/8.layout.md|api,kit,layout,addLayout,error
API|.nuxt-docs/4.api/5.kit/9.head.md|api,kit,head,setGlobalHead,AppHeadMetaObject
API|.nuxt-docs/4.api/5.kit/9.plugins.md|api,kit,plugins,addPlugin,addPluginTemplate
API|.nuxt-docs/4.api/6.advanced/1.hooks.md|api,advanced,hooks,vueApp,err
API|.nuxt-docs/4.api/6.advanced/2.import-meta.md|api,advanced,import meta,defineNuxtModule,nitro
API|.nuxt-docs/4.api/6.nuxt-config.md|api,nuxt config,rootDir,baseURL,buildAssetsDir
API|.nuxt-docs/4.api/index.md|api,index
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/0.nuxt.md|directory structure,nuxt
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/0.output.md|directory structure,output
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.assets.md|directory structure,app,assets
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.components.md|directory structure,app,components,pathPrefix,resolveComponent
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.composables.md|directory structure,app,composables,useState,useNuxtApp
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.layouts.md|directory structure,app,layouts,layout,name
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.middleware.md|directory structure,app,middleware,definePageMeta,myMiddleware
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.pages.md|directory structure,app,pages,$route,useRoute
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.plugins.md|directory structure,app,plugins,nuxtApp,parallel
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/1.utils.md|directory structure,app,utils
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/3.app-config.md|directory structure,app,app config,srcDir,theme
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/3.app.md|directory structure,app,NuxtPage,NuxtLayout
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.app/3.error.md|directory structure,app,error,definePageMeta,NuxtLayout
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.content.md|directory structure,content,useAsyncData,useRoute
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.layers.md|directory structure,layers,srcDir
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.modules.md|directory structure,modules,hello,defineEventHandler,defineNuxtModule
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.node_modules.md|directory structure,node_modules,npm,yarn,pnpm
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.public.md|directory structure,public,useSeoMeta
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.server.md|directory structure,server,defineEventHandler,eventHandler,Promise
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/1.shared.md|directory structure,shared,defineEventHandler,nitro,server/api
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/2.env.md|directory structure,env,runtimeConfig,appConfig
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/2.gitignore.md|directory structure,gitignore,nitro
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/2.nuxtignore.md|directory structure,nuxtignore,rootDir,ignoreOptions,ignorePrefix
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/2.nuxtrc.md|directory structure,nuxtrc,setups
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/3.nuxt-config.md|directory structure,nuxt config,defineNuxtConfig
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/3.package.md|directory structure,package
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/3.tsconfig.md|directory structure,tsconfig,app,shared,node
DIRECTORY_STRUCTURE|.nuxt-docs/2.directory-structure/index.md|directory structure,index
GETTING_STARTED|.nuxt-docs/1.getting-started/01.introduction.md|getting started,introduction,routeRules,nitro,server/api
GETTING_STARTED|.nuxt-docs/1.getting-started/02.installation.md|getting started,installation
GETTING_STARTED|.nuxt-docs/1.getting-started/03.configuration.md|getting started,configuration,defineNuxtConfig,c12,$meta
GETTING_STARTED|.nuxt-docs/1.getting-started/04.views.md|getting started,views,NuxtPage,NuxtLayout,nitro
GETTING_STARTED|.nuxt-docs/1.getting-started/05.assets.md|getting started,assets
GETTING_STARTED|.nuxt-docs/1.getting-started/06.styling.md|getting started,styling,css,url,unhead
GETTING_STARTED|.nuxt-docs/1.getting-started/07.routing.md|getting started,routing,href,useRoute,setup
GETTING_STARTED|.nuxt-docs/1.getting-started/08.seo-meta.md|getting started,seo meta,useHead,viewport,charset
GETTING_STARTED|.nuxt-docs/1.getting-started/09.transitions.md|getting started,transitions,pageTransition,definePageMeta,layoutTransition
GETTING_STARTED|.nuxt-docs/1.getting-started/10.data-fetching.md|getting started,data fetching,useFetch,useAsyncData,$fetch
GETTING_STARTED|.nuxt-docs/1.getting-started/11.state-management.md|getting started,state management,useState,ref,setup
GETTING_STARTED|.nuxt-docs/1.getting-started/12.error-handling.md|getting started,error handling,onErrorCaptured,manual,clearError
GETTING_STARTED|.nuxt-docs/1.getting-started/13.server.md|getting started,server,text,json,html
GETTING_STARTED|.nuxt-docs/1.getting-started/14.layers.md|getting started,layers,srcDir,main,extends
GETTING_STARTED|.nuxt-docs/1.getting-started/15.prerendering.md|getting started,prerendering,crawlLinks,routeRules,defineRouteRules
GETTING_STARTED|.nuxt-docs/1.getting-started/16.deployment.md|getting started,deployment,PORT,HOST,pm2
GETTING_STARTED|.nuxt-docs/1.getting-started/17.testing.md|getting started,testing,jsdom,vitest,cucumber
GETTING_STARTED|.nuxt-docs/1.getting-started/18.upgrade.md|getting started,upgrade,applyToEnvironment,extendViteConfig,server
GUIDE|.nuxt-docs/3.guide/0.index.md|guide,index
GUIDE|.nuxt-docs/3.guide/1.concepts/1.rendering.md|guide,concepts,rendering,counter,handleClick
GUIDE|.nuxt-docs/3.guide/1.concepts/10.vuejs-development.md|guide,concepts,vuejs development,data,methods
GUIDE|.nuxt-docs/3.guide/1.concepts/2.nuxt-lifecycle.md|guide,concepts,nuxt lifecycle,unhead,validate
GUIDE|.nuxt-docs/3.guide/1.concepts/3.auto-imports.md|guide,concepts,auto imports,server,imports
GUIDE|.nuxt-docs/3.guide/1.concepts/4.server-engine.md|guide,concepts,server engine,next,$fetch
GUIDE|.nuxt-docs/3.guide/1.concepts/5.modules.md|guide,concepts,modules,buildModules,defineNuxtConfig
GUIDE|.nuxt-docs/3.guide/1.concepts/7.esm.md|guide,concepts,esm,module,exports
GUIDE|.nuxt-docs/3.guide/1.concepts/8.typescript.md|guide,concepts,typescript,app,server
GUIDE|.nuxt-docs/3.guide/1.concepts/9.code-style.md|guide,concepts,code style
GUIDE|.nuxt-docs/3.guide/2.best-practices/hydration.md|guide,best practices,hydration,useCookie,NuxtTime
GUIDE|.nuxt-docs/3.guide/2.best-practices/performance.md|guide,best practices,performance,useFetch,useAsyncData
GUIDE|.nuxt-docs/3.guide/2.best-practices/plugins.md|guide,best practices,plugins,async,parallel
GUIDE|.nuxt-docs/3.guide/3.ai/1.mcp.md|guide,mcp,Nuxt,None,servers
GUIDE|.nuxt-docs/3.guide/3.ai/2.llms-txt.md|guide,llms txt
GUIDE|.nuxt-docs/3.guide/4.modules/1.getting-started.md|guide,modules,getting started,src,playground
GUIDE|.nuxt-docs/3.guide/4.modules/2.module-anatomy.md|guide,modules,module anatomy,nuxt,defineNuxtModule
GUIDE|.nuxt-docs/3.guide/4.modules/3.recipes-basics.md|guide,modules,recipes basics,experimental,runtimeConfig
GUIDE|.nuxt-docs/3.guide/4.modules/4.recipes-advanced.md|guide,modules,recipes advanced,hooks,close
GUIDE|.nuxt-docs/3.guide/4.modules/5.testing.md|guide,modules,testing,defineNuxtConfig,$fetch
GUIDE|.nuxt-docs/3.guide/4.modules/6.best-practices.md|guide,modules,best practices,useData,useModal
GUIDE|.nuxt-docs/3.guide/4.modules/7.ecosystem.md|guide,modules,ecosystem
GUIDE|.nuxt-docs/3.guide/4.modules/index.md|guide,modules,index
GUIDE|.nuxt-docs/3.guide/5.recipes/1.custom-routing.md|guide,recipes,custom routing,routes,definePageMeta
GUIDE|.nuxt-docs/3.guide/5.recipes/2.vite-plugin.md|guide,recipes,vite plugin,addVitePlugin,applyToEnvironment
GUIDE|.nuxt-docs/3.guide/5.recipes/3.custom-usefetch.md|guide,recipes,custom usefetch,$fetch,useFetch
GUIDE|.nuxt-docs/3.guide/5.recipes/4.sessions-and-authentication.md|guide,recipes,sessions and authentication,nuxt,modules
GUIDE|.nuxt-docs/3.guide/6.going-further/1.events.md|guide,going further,events,hook,callHook
GUIDE|.nuxt-docs/3.guide/6.going-further/1.experimental-features.md|guide,going further,experimental features,useFetch,useAsyncData
GUIDE|.nuxt-docs/3.guide/6.going-further/1.features.md|guide,going further,features,silent,routeRules
GUIDE|.nuxt-docs/3.guide/6.going-further/1.internals.md|guide,going further,internals,nuxt,nuxtApp
GUIDE|.nuxt-docs/3.guide/6.going-further/10.runtime-config.md|guide,going further,runtime config,runtimeConfig,apiBase
GUIDE|.nuxt-docs/3.guide/6.going-further/11.nightly-release-channel.md|guide,going further,nightly release channel,main,latest
GUIDE|.nuxt-docs/3.guide/6.going-further/2.hooks.md|guide,going further,hooks,defineNuxtConfig,defineNuxtPlugin
GUIDE|.nuxt-docs/3.guide/6.going-further/4.kit.md|guide,going further,kit,dependencies,nuxt
GUIDE|.nuxt-docs/3.guide/6.going-further/6.nuxt-app.md|guide,going further,nuxt app,NuxtApp,defineNuxtRouteMiddleware
GUIDE|.nuxt-docs/3.guide/6.going-further/7.layers.md|guide,going further,layers,extends,auth
GUIDE|.nuxt-docs/3.guide/6.going-further/9.debugging.md|guide,going further,debugging,dev,srcDir
GUIDE|.nuxt-docs/3.guide/6.going-further/index.md|guide,going further,index
```

<!-- END:nuxt-agent-rules -->

# Project Overview & Architecture Guide

## Tech Stack
- **Framework**: Nuxt 4 (v4.5.2) with Vue 3 (Composition API, `<script setup lang="ts">`)
- **UI & Design**: Nuxt UI v4 (`@nuxt/ui`), Tailwind CSS v4, Motion V (`motion-v`), Lucide/Phosphor icons (`ph:*`)
- **Database & ORM**: PostgreSQL via Drizzle ORM (`drizzle-orm`, `drizzle-kit`), Postgres.js driver
- **Authentication**: Better-Auth (`better-auth`) with custom permissions (`server/auth/permissions.ts`)
- **API & Docs**: Nitro engine with auto-generated OpenAPI endpoints (`/_docs/openapi.json`, Scalar UI at `/api/docs`)
- **Linter & Tooling**: Vite+ (`vp check`), `vue-tsc`, `pnpm`

## Directory Map

```text
web/
├── app/                      # Nuxt 4 frontend directory
│   ├── assets/               # Global CSS (`main.css`), media
│   ├── components/           # Vue components (profile/, event/, modal/, editor/)
│   ├── composables/          # Client composables (`use-auth-session.ts`, `use-feed.ts`, etc.)
│   ├── layouts/              # Layout templates (`default.vue`, `manage.vue`, `content.vue`)
│   ├── middleware/           # Route middleware (`auth.ts`, `anonymous.ts`, `profile.global.ts`)
│   ├── pages/                # Route components (file-based routing)
│   ├── types/                # Frontend-specific types
│   ├── utils/                # Client utility functions (auth client, payments)
│   ├── app.vue               # Root application entry
│   └── app.config.ts         # App UI & branding configuration
├── server/                   # Nitro backend directory
│   ├── api/                  # API endpoints (`[feature]/index.get.ts`, `.post.ts`, etc.)
│   ├── auth/                 # Better-auth configuration & role/permission logic
│   ├── db/                   # Drizzle ORM setup
│   │   ├── schema/           # Schema tables (auth, clubs, events, payments, settings, relations)
│   │   └── migrations/       # SQL migrations generated by drizzle-kit
│   ├── routes/               # Custom server routes (e.g. verify, payment callbacks)
│   └── utils/                # Server helper utilities (auth, storage, mail, settings)
├── shared/                   # Shared layer across frontend (app/) and backend (server/)
│   ├── types/                # Shared domain types (event, user, club, payment)
│   └── utils/                # Shared utilities (date formatting, translations, string normalization)
└── drizzle.config.ts         # Drizzle configuration
```

## Navigation & Architecture Rules

1. **Nuxt 4 Structure (`app/`, `server/`, `shared/`)**:
   - Client code belongs exclusively in `app/`.
   - Server code belongs exclusively in `server/`. Never import server code into `app/`.
   - Shared business logic, types, and pure helper functions belong in `shared/`. Both `app/` and `server/` can import from `~~/shared/*`.

2. **UI & Styling with Nuxt UI v4**:
   - Prefer Nuxt UI v4 components (`<UButton>`, `<UInput>`, `<UModal>`, etc.).
   - Follow Tailwind CSS v4 conventions for styling.
   - For icons, use the `ph:` phosphor prefix (e.g., `ph:plus`, `ph:arrow-up-right`).

3. **Data Access & Database (Drizzle ORM)**:
   - Tables are modularized in `server/db/schema/*.ts`.
   - Relations are explicitly declared in `server/db/schema/relations.ts`.
   - Always run `pnpm db:generate` whenever schema definitions are modified.

4. **Authentication & Authorization**:
   - Authentication is handled by Better-Auth (`server/auth/auth.ts`).
   - Server route access must be checked using helpers in `server/auth/permissions.ts` and `server/utils/auth.ts`.
   - Frontend auth checks rely on `app/composables/use-auth-session.ts` and middleware in `app/middleware/`.

5. **Language & Localization**:
   - The user-facing application interface is primarily in **Slovak (`sk`)**.
   - Code, variable names, database column names, commit messages, and documentation should remain in **English**.

## Key Commands

```sh
pnpm dev             # Start local development server
pnpm check           # Run Vite+ linter and Nuxt/Vue typecheck (vp check && nuxt typecheck)
pnpm check:fix       # Automatically fix linting and formatting issues
pnpm db:generate     # Generate new Drizzle migration files after editing schemas
pnpm db:migrate      # Apply pending migrations to the database
pnpm build           # Build for production
```
