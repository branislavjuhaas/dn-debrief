import { describe, it, expect, vi, beforeEach } from "vite-plus/test";
import { runCommand } from "citty";
import consola from "consola";
import * as rc9 from "rc9";
import { init } from "../src/init.js";

vi.mock("rc9", () => ({
  writeUserConfig: vi.fn<typeof rc9.writeUserConfig>(),
}));

vi.mock("consola", () => ({
  default: {
    log: vi.fn<typeof consola.log>(),
    success: vi.fn<typeof consola.success>(),

    prompt: vi.fn<typeof consola.prompt>(),
  },
}));

describe("init command - validation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully accept all the parameters skipped", async () => {
    // Arrange: Tell consola to immediately skip when prompted for postgres URL
    vi.mocked(consola.prompt).mockResolvedValue(undefined as any);

    // Act: Run the initialization routine
    await runCommand(init, { rawArgs: [] });

    // Assert: Verify the prompt message was rendered to the user
    expect(consola.prompt).toHaveBeenCalledWith(
      "Database URL of the system's database:",
    );

    // Assert: Verify rc9 wrote the correct database value into the local config scope
    expect(rc9.writeUserConfig).toHaveBeenCalledWith(
      { database: undefined },
      ".debriefrc",
    );

    // Assert: Ensure success message gave confirmation feedback
    expect(consola.success).toHaveBeenCalledWith(
      "Working configuration for the user written",
    );
  });

  it("should successfully capture and persist a postgres connection string", async () => {
    const mockPostgresUrl =
      "postgresql://postgres:secret@localhost:5432/debrief_db";

    // Arrange: Tell consola to immediately return our postgres URL when prompted
    vi.mocked(consola.prompt).mockResolvedValue(mockPostgresUrl);

    // Act: Run the initialization routine
    await runCommand(init, { rawArgs: [] });

    // Assert: Verify the prompt message was rendered to the user
    expect(consola.prompt).toHaveBeenCalledWith(
      "Database URL of the system's database:",
    );

    // Assert: Verify rc9 wrote the correct database value into the local config scope
    expect(rc9.writeUserConfig).toHaveBeenCalledWith(
      { database: mockPostgresUrl },
      ".debriefrc",
    );

    // Assert: Ensure success message gave confirmation feedback
    expect(consola.success).toHaveBeenCalledWith(
      "Working configuration for the user written",
    );
  });
});
