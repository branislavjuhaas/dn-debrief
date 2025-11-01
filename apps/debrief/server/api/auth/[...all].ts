import { auth } from "@repo/auth";

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
