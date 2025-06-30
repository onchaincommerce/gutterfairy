import { useState, useEffect } from 'react';

interface ProductItem {
  id: string;
  name: string;
  price: string;
  priceInWei: string;
  images: string[];
  description: string;
  size: string;
  measurements: string;
  category: string;
}

interface UseProductsResult {
  products: ProductItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(category?: string): UseProductsResult {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const url = category 
        ? `/api/products?category=${encodeURIComponent(category)}`
        : '/api/products';
        
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.products);
      } else {
        throw new Error(data.error || 'Failed to fetch products');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Error fetching products:', err);
      
      // Fallback to empty array on error
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const refetch = () => {
    fetchProducts();
  };

  return {
    products,
    loading,
    error,
    refetch
  };
}

// Hook for getting product counts by category
export function useProductCounts() {
  const { products, loading } = useProducts();
  
  const getProductCount = (filter: string) => {
    if (loading) return 0;
    
    if (filter === 'ALL') return products.length;
    if (filter === 'VINTAGE COLLECTION') {
      return products.filter(product => 
        product.name.toLowerCase().includes('vintage')
      ).length;
    }
    return products.filter(product => product.category === filter).length;
  };

  return { getProductCount, loading };
} 