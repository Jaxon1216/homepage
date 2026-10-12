export type Properties = Record<string, string | number | boolean>;

// This registry is also the runtime property allowlist. Unknown events/keys are dropped.
export const eventFields = {
  page_context: ['article_slug', 'resume_version'],
  navigation_click: ['target_path', 'placement'],
  section_view: ['section_id'],
  page_engaged: ['active_seconds'],
  page_attention: ['threshold_seconds'],
  mobile_menu_toggle: ['state'],
  theme_change: ['from_theme', 'to_theme'],
  project_impression: ['project_id', 'category'],
  project_click: ['project_id', 'category', 'destination', 'placement'],
  contact_click: ['channel', 'placement', 'resume_version'],
  friend_link_click: ['target_id', 'target_host', 'placement'],
  outbound_click: ['target_host', 'target_path', 'placement', 'article_slug', 'resume_version'],
  github_chart_view: ['placement'],
  blog_filter_change: ['from_tag', 'to_tag', 'result_count'],
  article_card_impression: ['article_slug', 'position', 'active_tag'],
  article_open_click: ['article_slug', 'position', 'active_tag', 'placement'],
  article_read_start: ['article_slug'],
  article_read_depth: ['article_slug', 'depth'],
  article_read_time: ['article_slug', 'threshold_seconds'],
  article_read_qualified: ['article_slug', 'required_seconds'],
  article_toc_click: ['article_slug', 'heading_id', 'heading_level'],
  article_link_click: ['article_slug', 'target_path'],
  media_open: ['article_slug', 'media_type', 'media_id'],
  media_close: ['article_slug', 'media_type', 'media_id', 'reason'],
  comments_view: ['article_slug'],
  comments_load: ['article_slug'],
  resume_version_view: ['version_id'],
  resume_version_change: ['from_version', 'to_version'],
  resume_section_view: ['version_id', 'section_id'],
  reading_stage_view: ['stage_id'],
  book_impression: ['book_id', 'stage_id'],
  book_open: ['book_id', 'stage_id', 'cluster_id'],
  book_close: ['book_id', 'stage_id', 'reason'],
  reading_cluster_change: ['stage_id', 'from_cluster', 'to_cluster'],
  not_found_view: ['requested_path'],
  app_error: ['error_code', 'digest'],
  error_retry_click: ['error_code'],
  resource_error: ['resource_type', 'resource_id', 'error_code'],
} as const;
export type EventName = keyof typeof eventFields;
export type EventProperties<N extends EventName> = Partial<Record<(typeof eventFields)[N][number], string | number | boolean>>;

export function clickAttributes<N extends EventName>(event: N, props: EventProperties<N>) {
  return { 'data-analytics-click': event, 'data-analytics-props': JSON.stringify(props) };
}
export function viewAttributes<N extends EventName>(event: N, props: EventProperties<N>, mode: 'area' | 'start' = 'area') {
  return { 'data-analytics-view': event, 'data-analytics-view-props': JSON.stringify(props), 'data-analytics-view-mode': mode };
}
