import type { IconifyIconCustomizeCallback } from "@nuxt/icon/runtime/components/shared.js";

export const recolor: IconifyIconCustomizeCallback = (
  content: string,
  _name: string | undefined,
  _prefix: string | undefined,
  _provider: string | undefined,
) => {
  return content.replace(/fill="[^"]*"/g, `fill="#ffffff"`);
};
