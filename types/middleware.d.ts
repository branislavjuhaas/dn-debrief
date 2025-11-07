declare module "#app" {
  interface PageMeta {
    auth?: boolean;
    guest?: boolean;
    roles?: string[];
  }
}

export {};
