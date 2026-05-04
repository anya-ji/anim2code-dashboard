export interface Animation {
  id: string;
  title: string;
  url: string;
  animationType: "css" | "js" | "unknown";
  durationS: number;
  videoUrl: string;
  html?: string;
  css?: string;
  js?: string;
}
