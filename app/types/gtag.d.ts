interface GtagConfig {
  page_path?: string;
  event_category?: string;
  event_label?: string;
  [key: string]: string | undefined;
}

interface Window {
  gtag: (
    command: 'config' | 'event',
    targetId: string,
    config?: GtagConfig
  ) => void;
} 