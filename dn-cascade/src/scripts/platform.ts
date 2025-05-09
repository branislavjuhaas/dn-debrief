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
 * Maps a host environment name to a user-friendly platform logo.
 * @param host - The host environment name.
 * @returns The user-friendly platform logo URL.
 */
const logo = (host: string) => {
  switch (host) {
    case "dn-cascade":
      return "/logos/dn-cascade.svg";
    case "dn-cascade-dev":
      return "/logos/dn-cascade-dev.svg";
    case "debrief":
      return "/logos/debrief.svg";
    case "barca":
      return "/logos/barca.svg";
    default:
      return "/logos/dn-cascade.svg";
  }
};

/**
 * Platform information including name and version.
 */
const platform = {
  name: name(host()),
  logo: logo(host()),
  version: version,
};

export default platform;
