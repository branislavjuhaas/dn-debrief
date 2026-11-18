/**
 * Optional campaign banner shown above the site header.
 *
 * Managed by admins on the content management page and rendered on every page
 * until the visitor dismisses it for the current browser session.
 */
export type CampaignBanner = {
  enabled: boolean;
  title: string;
  text: string;
  url: string;
  linkLabel: string;
};
