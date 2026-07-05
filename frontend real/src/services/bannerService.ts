import { DEFAULT_SLIDES, mockBanners } from "../data";

export function getBanners() {
  return mockBanners;
}

export function getBannerById(id_banner: number | null | undefined) {
  if (id_banner == null) return null;
  return mockBanners.find((banner) => banner.id_banner === id_banner) ?? null;
}

export function getBannersLegacy() {
  return DEFAULT_SLIDES;
}
