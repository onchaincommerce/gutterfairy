'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownLink,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
  EthBalance,
} from '@coinbase/onchainkit/identity';
import { useSendCalls, useAccount } from 'wagmi';
import { base } from 'wagmi/chains';
import { useProducts, useProductCounts } from '../hooks/useProducts';

interface ProductItem {
  name: string;
  price: string;
  priceInWei: string;
  images: string[];
  id: string;
  description: string;
  size: string;
  measurements: string;
  category: string;
}

export default function App() {
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: string]: number}>({});
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [modalProduct, setModalProduct] = useState<ProductItem | null>(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  const { sendCalls, data, error, isPending } = useSendCalls();
  const { isConnected } = useAccount();

  // Fetch products from database
  const { products, loading: productsLoading, error: productsError, refetch } = useProducts();
  const { getProductCount } = useProductCounts();

  const heroImages = [
    {
      src: "/hero_image.png",
      alt: "Gutter Fairy - Sustainable Vintage Fashion"
    },
    {
      src: "/Hero_image2.png", 
      alt: "Gutter Fairy - Curated Vintage Collection"
    },
    {
      src: "/hero_image3.png",
      alt: "Gutter Fairy - Unique Vintage Finds"
    }
  ];

  // Filter products based on active filter (only one filter active at a time)
  const filteredProducts = activeFilter === 'ALL' 
    ? products 
    : activeFilter === 'VINTAGE COLLECTION'
    ? products.filter(product => product.name.toLowerCase().includes('vintage'))
    : products.filter(product => product.category === activeFilter);

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1);
    // Scroll to products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
    // Scroll to products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to products section
    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Hero carousel navigation with seamless infinite loop
  const goToPreviousHero = () => {
    setCurrentHeroIndex((prevIndex) => prevIndex - 1);
  };

  const goToNextHero = () => {
    setCurrentHeroIndex((prevIndex) => prevIndex + 1);
  };

  const goToHero = (index: number) => {
    setCurrentHeroIndex(index);
  };

  // Hero carousel auto-rotation with seamless loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => prevIndex + 1);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle seamless loop transitions
  useEffect(() => {
    if (currentHeroIndex === -1) {
      // Jump from clone of last image to real last image instantly
      const timeoutId = setTimeout(() => {
        setCurrentHeroIndex(heroImages.length - 1);
      }, 50);
      return () => clearTimeout(timeoutId);
    } else if (currentHeroIndex === heroImages.length) {
      // Jump from clone of first image to real first image instantly
      const timeoutId = setTimeout(() => {
        setCurrentHeroIndex(0);
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [currentHeroIndex, heroImages.length]);

  // Preload images for better performance
  useEffect(() => {
    const imageUrls = products.flatMap(product => product.images);
    // Also preload hero images
    const heroUrls = heroImages.map(hero => hero.src);
    [...imageUrls, ...heroUrls].forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [products, heroImages]);

  // Handle scroll-based header visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Show header when at top of page
      if (currentScrollY < 10) {
        setIsHeaderVisible(true);
      }
      // Hide header when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsHeaderVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY]);

  // Improved callback URL function
  function getCallbackURL() {
    const baseUrl = "https://20b1-47-224-252-214.ngrok-free.app";
    return `${baseUrl}/api/profiles/callback`;
  }

  // Enhanced purchase function with better error handling
  async function handlePurchase(product: ProductItem) {
    if (!isConnected) {
      alert("Connect your wallet first!");
      return;
    }

    try {
      setSelectedProduct(product);
      console.log(`Initiating purchase for ${product.name}`);

      // Improved data callback configuration
      const callbackConfig = {
        requests: [
          { 
            type: "email" as const, 
            optional: false,
            description: "Email for order updates"
          },
          { 
            type: "physicalAddress" as const, 
            optional: false,
            description: "Shipping address"
          }
        ],
        callbackURL: getCallbackURL(),
        version: "1.0"
      };

      console.log('Callback config:', callbackConfig);

      // Send transaction with enhanced capabilities
      // Note: This is still sending ETH - you'd need to integrate with USDC contract for real USDC payments
      await sendCalls({
        calls: [
          {
            to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045",
            value: BigInt(product.priceInWei) * BigInt(1000000000000), // Convert USDC amount to wei equivalent for demo
            data: "0x",
          },
        ],
        chainId: base.id,
        capabilities: {
          dataCallback: callbackConfig,
        },
      });

    } catch (err) {
      console.error('Purchase failed:', err);
      setSelectedProduct(null);
      alert(`Transaction failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }

  // Enhanced success handling
  useEffect(() => {
    if (data) {
      console.log('Transaction successful:', data);
      
      // Check for profile data
      const capabilities = data.capabilities;
      if (capabilities?.dataCallback) {
        console.log('Profile data collected:', capabilities.dataCallback);
        alert("Purchase successful! Your data has been recorded. Check console for details.");
      } else {
        alert("Purchase successful!");
      }
      
      setSelectedProduct(null);
    }
  }, [data]);

  // Enhanced error handling
  useEffect(() => {
    if (error) {
      console.error('Transaction error details:', error);
      setSelectedProduct(null);
      
      // More specific error messages
      if (error.message.includes('User rejected')) {
        alert("Transaction cancelled by user");
      } else if (error.message.includes('insufficient funds')) {
        alert("Insufficient funds for this purchase");
      } else if (error.message.includes('400')) {
        alert("Profile data collection failed - but your purchase may still be processing!");
      } else {
        alert(`Transaction failed: ${error.message}`);
      }
    }
  }, [error]);

  // Loading state
  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #67e8f9 0%, #5eead4 15%, #a7f3d0 30%, #d8b4fe 60%, #c4b5fd 80%, #ddd6fe 100%)'
      }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white font-bold">Loading products...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (productsError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{
        background: 'linear-gradient(180deg, #67e8f9 0%, #5eead4 15%, #a7f3d0 30%, #d8b4fe 60%, #c4b5fd 80%, #ddd6fe 100%)'
      }}>
        <div className="text-center">
          <p className="text-white font-bold mb-4">Error loading products: {productsError}</p>
          <button 
            onClick={refetch}
            className="px-6 py-3 bg-white text-gray-800 font-bold rounded-lg hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Rest of the component remains the same...
  // (Include all the existing JSX structure)
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* All existing JSX from the original page.tsx */}
      {/* ... */}
    </div>
  );
} 