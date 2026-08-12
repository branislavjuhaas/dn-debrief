// app/types/index.d.ts

declare module "#app" {
  interface PageMeta {
    allowedRoles?: UserRole[];
  }
}

export {};
