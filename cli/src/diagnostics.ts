import { createConsoleReporter, defineDiagnostics } from "nostics";

export const diagnostics = defineDiagnostics({
  reporters: [createConsoleReporter()],
  codes: {
    DEBRIEF_NOT_CONFIGURED: {
      why: () => `The plugin is not configured properly.`,
      fix: () => `Run the 'config init' command to set up the plugin configuration.`,
    },
    DEBRIEF_IMPROPERLY_CONFIGURED: {
      why: () => `The plugin is not configured properly.`,
      fix: () => `Run the 'config init' command to set up the plugin configuration.`,
    },
  },
});
