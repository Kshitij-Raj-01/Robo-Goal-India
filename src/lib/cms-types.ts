import { site, statistics, events, fixtures, media } from "./content";
export type CMSContent = {
  site: typeof site;
  statistics: typeof statistics;
  events: typeof events;
  fixtures: typeof fixtures;
  media: typeof media;
};
export const emptyContent: CMSContent = {
  site,
  statistics,
  events,
  fixtures,
  media,
};
export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  cover: string;
  seoTitle: string;
  seoDescription: string;
  publishedAt: string;
  updatedAt: string;
  html?: string;
};
