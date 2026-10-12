import { activeMilliseconds, isQualifiedRead, qualifiedReadingSeconds, readDepth } from './core';
import { getPageContext, trackEvent } from './client';
import { umamiConfig } from './config';

export function observeAttention() {
  const pageId = getPageContext()?.id;
  let previous = performance.now();
  let lastInput = previous;
  let active = 0;
  let reading = 0;
  let depth = 0;
  let visible = document.visibilityState === 'visible';
  let bodyVisible = false;
  const thresholds = [15, 30, 60, 120, 300];
  const tick = () => {
    if (getPageContext()?.id !== pageId) return;
    const now = performance.now();
    const elapsed = activeMilliseconds(previous, now, lastInput, visible);
    previous = now;
    active += elapsed;
    for (const threshold of thresholds) if (active >= threshold * 1000) trackEvent('page_attention', { threshold_seconds: threshold }, `${threshold}`);
    if (active >= 30000) trackEvent('page_engaged', { active_seconds: 30 }, 'engaged');
    const body = document.querySelector<HTMLElement>('[data-analytics-article]');
    if (!body || !umamiConfig.reading) return;
    const rect = body.getBoundingClientRect();
    const nextBodyVisible = rect.bottom > 64 && rect.top < innerHeight;
    // Count the preceding interval only if its start and end both show the article.
    if (bodyVisible && nextBodyVisible) reading += elapsed;
    bodyVisible = nextBodyVisible;
    if (visible && nextBodyVisible) depth = Math.max(depth, readDepth(rect.top, rect.bottom, innerHeight));
    for (const threshold of [25, 50, 75, 90]) if (depth >= threshold) trackEvent('article_read_depth', { depth: threshold }, `${threshold}`);
    if (reading >= 5000) trackEvent('article_read_start', {}, 'start');
    for (const threshold of thresholds) if (reading >= threshold * 1000) trackEvent('article_read_time', { threshold_seconds: threshold }, `${threshold}`);
    const estimatedSeconds = Number(body.dataset.analyticsReadingSeconds) || 300;
    const required = qualifiedReadingSeconds(estimatedSeconds);
    if (isQualifiedRead(depth, reading / 1000, required)) trackEvent('article_read_qualified', { required_seconds: required }, 'qualified');
  };
  const input = () => { tick(); lastInput = performance.now(); };
  const visibility = () => { tick(); visible = document.visibilityState === 'visible'; previous = performance.now(); };
  const resize = () => { tick(); };
  const interval = setInterval(tick, 1000);
  for (const event of ['scroll', 'pointerdown', 'keydown', 'touchstart']) window.addEventListener(event, input, { passive: true });
  window.addEventListener('resize', resize, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  tick();
  return () => {
    clearInterval(interval);
    for (const event of ['scroll', 'pointerdown', 'keydown', 'touchstart']) window.removeEventListener(event, input);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', visibility);
  };
}
