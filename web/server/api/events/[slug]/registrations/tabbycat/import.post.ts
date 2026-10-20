import { execute, importHandler } from "#server/integrations/tabbycat/service";

export default defineEventHandler(importHandler(execute));
