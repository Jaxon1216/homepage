export const ARTICLE_HEADING_OFFSET = 96;

export function getActiveHeadingIndex(
  positions: number[],
  offset: number,
  atArticleEnd: boolean
): number {
  if (positions.length === 0) return -1;
  if (atArticleEnd) return positions.length - 1;
  for (let index = positions.length - 1; index >= 0; index--) {
    if (positions[index] <= offset + 1) return index;
  }
  return 0;
}

export function getTocScrollTop(
  scrollTop: number,
  viewportHeight: number,
  itemTop: number,
  itemHeight: number,
  scrollHeight: number
): number {
  // Keep the directory still while any part of the current item is visible.
  if (itemTop + itemHeight > scrollTop && itemTop < scrollTop + viewportHeight) {
    return scrollTop;
  }
  const padding = Math.min(40, viewportHeight * 0.1);
  let target = scrollTop;
  if (itemHeight > viewportHeight - padding * 2 || itemTop + itemHeight <= scrollTop) {
    target = itemTop - padding;
  } else if (itemTop >= scrollTop + viewportHeight) {
    target = itemTop + itemHeight - viewportHeight + padding;
  }
  return Math.max(0, Math.min(target, scrollHeight - viewportHeight));
}
