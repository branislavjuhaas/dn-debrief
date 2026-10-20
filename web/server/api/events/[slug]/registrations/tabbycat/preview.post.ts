import { importHandler, preview } from "#server/integrations/tabbycat/service";

export default defineEventHandler(importHandler(preview));
