import { auth } from "~~/server/auth/auth";

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event));
});
