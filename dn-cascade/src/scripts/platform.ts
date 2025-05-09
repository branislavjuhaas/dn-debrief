import { version } from "./../../package.json";

/**
 * Determines the host environment based on the current URL.
 * @returns The host environment name.
 */
const host = () => {
  const url = window.location.href;

  if (url.includes("dev") || url.includes("localhost")) {
    return "dn-cascade-dev";
  } else if (url.includes("debrief")) {
    return "debrief";
  } else if (url.includes("barca")) {
    return "barca";
  }
  return "dn-cascade";
};

/**
 * Maps a host environment name to a user-friendly platform name.
 * @param host - The host environment name.
 * @returns The user-friendly platform name.
 */
const name = (host: string) => {
  switch (host) {
    case "dn-cascade":
      return "DN Cascade";
    case "dn-cascade-dev":
      return "DN Cascade";
    case "debrief":
      return "DebrRIEF";
    case "barca":
      return "Barca";
    default:
      return "DN Cascade";
  }
};

/**
 * Platform information including name and version.
 */
const platform = {
  name: name(host()),
  version: version,
};

export default platform;
