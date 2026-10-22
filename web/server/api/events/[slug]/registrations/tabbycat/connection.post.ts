import { importHandler, connect } from "#server/integrations/tabbycat/service";

export default defineEventHandler(importHandler(connect));
