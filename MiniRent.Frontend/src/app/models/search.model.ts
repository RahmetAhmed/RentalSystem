export interface SearchResult {
  id: number;
  title: string;
  type: string;
  additionalInfo?: string;
}

export interface SearchResponse {
  query: string;
  properties: SearchResult[];
  inquiries: SearchResult[];
}
