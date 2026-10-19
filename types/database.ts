export type Product = {
  id: string; name: string; slug: string; short_description: string | null; description: string | null;
  platform: string; category: string | null; genre: string | null; price_toman: number; original_price_toman: number | null;
  image_url: string | null; gallery: string[]; developer: string | null; publisher: string | null;
  release_date: string | null; edition: string | null; availability: 'in_stock' | 'out_of_stock' | 'preorder';
  featured: boolean; published: boolean; created_at: string; updated_at: string;
};
