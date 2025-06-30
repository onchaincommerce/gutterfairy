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

  const heroImages = useMemo(() => [
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
  ], []);

  const products: ProductItem[] = useMemo(() => [
    { 
      name: "VINTAGE JACKET", 
      price: "45 USDC", 
      priceInWei: "45000000", // 45 USDC (6 decimals)
      images: ["/American Vintage Women's Brown and Tan Jacket .jpg"],
      id: "vintage-jacket",
      description: "Classic brown and tan leather jacket with vintage styling",
      size: "Medium",
      measurements: "Chest: 38\", Length: 24\", Sleeve: 23\"",
      category: "TOPS"
    },
    { 
      name: "MULTI STRIPE SHIRT", 
      price: "20 USDC", 
      priceInWei: "20000000", // 20 USDC (6 decimals)
      images: ["/Eddie Bauer Women's multi Shirt .jpg"],
      id: "multi-shirt",
      description: "Comfortable multi-colored stripe button-up shirt",
      size: "Large",
      measurements: "Chest: 42\", Length: 26\", Sleeve: 24\"",
      category: "TOPS"
    },
    { 
      name: "PLAID SKIRT", 
      price: "69 USDC", 
      priceInWei: "69000000", // 69 USDC (6 decimals)
      images: ["/womens_multi_skirt.jpg"],
      id: "plaid-skirt",
      description: "School girl style plaid skirt with matching belt",
      size: "Small",
      measurements: "Waist: 28\", Hip: 36\", Length: 18\"",
      category: "BOTTOMS"
    },
    { 
      name: "RED FLORAL DRESS", 
      price: "35 USDC", 
      priceInWei: "35000000", // 35 USDC (6 decimals)
      images: ["/Secret Treasures Women's Red Dress .jpg"],
      id: "red-dress",
      description: "Elegant red floral print midi dress",
      size: "Medium",
      measurements: "Chest: 36\", Waist: 30\", Length: 42\"",
      category: "JUMPSUITS"
    },
    { 
      name: "MULTI PATTERN JACKET", 
      price: "55 USDC", 
      priceInWei: "55000000", // 55 USDC (6 decimals)
      images: ["/Charter Club Women's multi Jacket .jpg"],
      id: "multi-jacket",
      description: "Sophisticated multi-pattern blazer style jacket",
      size: "Large",
      measurements: "Chest: 40\", Length: 26\", Sleeve: 24\"",
      category: "TOPS"
    },
    { 
      name: "FLORAL BLOUSE", 
      price: "30 USDC", 
      priceInWei: "30000000", // 30 USDC (6 decimals)
      images: ["/Women's multi Blouse.jpg"],
      id: "floral-blouse",
      description: "Beautiful vintage floral print button-up blouse",
      size: "Medium",
      measurements: "Chest: 38\", Length: 25\", Sleeve: 22\"",
      category: "TOPS"
    },
    { 
      name: "FUZZY BLACK 2-PIECE", 
      price: "85 USDC", 
      priceInWei: "85000000", // 85 USDC (6 decimals)
      images: ["/fuzzy_black_2_piece.png"],
      id: "fuzzy-black-2piece",
      description: "Cozy fuzzy black crop top and mini skirt set",
      size: "Small",
      measurements: "Top - Chest: 34\", Length: 16\" | Skirt - Waist: 26\", Length: 14\"",
      category: "JUMPSUITS"
    }
  ], []);

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

  // Get product count for each filter
  const getProductCount = (filter: string) => {
    if (filter === 'ALL') return products.length;
    if (filter === 'VINTAGE COLLECTION') return products.filter(product => product.name.toLowerCase().includes('vintage')).length;
    return products.filter(product => product.category === filter).length;
  };

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

  // Updated callback URL function for Smart Wallet Profiles
  function getCallbackURL() {
    let baseUrl = '';
    
    // Determine base URL based on environment
    if (typeof window !== 'undefined') {
      // Client-side: use current origin if it's HTTPS
      const currentOrigin = window.location.origin;
      if (currentOrigin.startsWith('https://')) {
        baseUrl = currentOrigin;
      }
    }
    
    // Override with environment variable if set
    const customCallbackUrl = process.env.NEXT_PUBLIC_CALLBACK_URL;
    if (customCallbackUrl) {
      baseUrl = customCallbackUrl.replace(/\/$/, ''); // Remove trailing slash
    }
    
    // Fallback to production URL if no valid HTTPS URL found
    if (!baseUrl || !baseUrl.startsWith('https://')) {
      baseUrl = 'https://gutterfairy.vercel.app';
      console.warn('⚠️ Using production callback URL as fallback:', baseUrl);
    }
    
    const fullCallbackUrl = `${baseUrl}/api/profiles/validation`;
    
    // Validate the URL format
    try {
      const url = new URL(fullCallbackUrl);
      if (url.protocol !== 'https:') {
        throw new Error('URL must use HTTPS protocol');
      }
      console.log('✅ Callback URL validated:', fullCallbackUrl);
      return fullCallbackUrl;
    } catch (error) {
      console.error('❌ Invalid callback URL:', fullCallbackUrl, error);
      // Ultimate fallback to production
      const fallbackUrl = 'https://gutterfairy.vercel.app/api/profiles/validation';
      console.warn('🔄 Using production fallback URL:', fallbackUrl);
      return fallbackUrl;
    }
  }

  // Smart Wallet Profiles purchase function
  async function handlePurchase(product: ProductItem) {
    if (!isConnected) {
      alert("Connect your wallet first!");
      return;
    }

    try {
      setSelectedProduct(product);
      console.log(`🛒 Initiating purchase for ${product.name}`);

      // Smart Wallet Profiles configuration following documentation
      const profileRequests = [
          { 
            type: "email" as const, 
          optional: false
          },
          { 
            type: "physicalAddress" as const, 
          optional: false
        }
      ];

      const callbackURL = getCallbackURL();
      console.log('📝 Profile requests:', profileRequests);
      console.log('🔗 Callback URL:', callbackURL);

      // Strict validation for Smart Wallet requirements
      if (!callbackURL.startsWith('https://')) {
        throw new Error('Callback URL must be a valid HTTPS URL');
      }

      // Additional URL validation to ensure it's properly formatted
      try {
        const url = new URL(callbackURL);
        if (url.protocol !== 'https:') {
          throw new Error('Callback URL must use HTTPS protocol');
        }
        if (!url.hostname) {
          throw new Error('Callback URL must have a valid hostname');
        }
      } catch (urlError) {
        console.error('❌ Callback URL validation failed:', urlError);
        throw new Error(`Invalid callback URL format: ${callbackURL}`);
      }

      const transactionConfig = {
        calls: [
          {
            to: "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" as `0x${string}`,
            value: BigInt(product.priceInWei) * BigInt(1000000000000), // Convert USDC amount to wei equivalent for demo
            data: "0x" as `0x${string}`,
          },
        ] as const,
        chainId: base.id,
        capabilities: {
          dataCallback: {
            requests: profileRequests,
            callbackURL: callbackURL,
          },
        },
      };

      console.log('📤 Sending transaction with config:', JSON.stringify(transactionConfig, (key, value) =>
        typeof value === 'bigint' ? value.toString() : value, 2));

      // Send transaction with Smart Wallet Profiles capability
      await sendCalls(transactionConfig);

    } catch (err) {
      console.error('❌ Purchase failed:', err);
      setSelectedProduct(null);
      
      // More detailed error handling
      if (err instanceof Error) {
        if (err.message.includes('User rejected')) {
          alert("❌ Transaction cancelled by user");
        } else if (err.message.includes('insufficient funds')) {
          alert("💳 Insufficient funds for this purchase");
        } else if (err.message.includes('network') || err.message.includes('connection')) {
          alert("🌐 Network error. Please check your connection and try again.");
        } else if (err.message.includes('callback') || err.message.includes('validation')) {
          alert("📝 There was an issue with the profile data collection. Please try again.");
        } else {
          alert(`❌ Transaction failed: ${err.message}\n\nPlease try again or contact support if the issue persists.`);
        }
      } else {
        alert(`❌ Transaction failed: Unknown error\n\nPlease try again or contact support if the issue persists.`);
      }
    }
  }

  // Smart Wallet Profiles success handling - Updated to match Base documentation
  useEffect(() => {
    if (data) {
      console.log('Transaction successful:', data);
      console.log('Full transaction data:', JSON.stringify(data, null, 2));
      
      // According to Base documentation, profile data should be available in the transaction response
      // The wallet returns the data after successful validation
      let successMessage = "🎉 Purchase successful!\n\n";
      let profileDataFound = false;
      
      // Check multiple possible locations for profile data based on Base documentation
      const dataAny = data as Record<string, unknown>; // Type assertion to access unknown properties
      const profileData = data.capabilities?.dataCallback || dataAny.dataCallback || dataAny.requestedInfo;
      
      if (profileData) {
        console.log('Profile data collected:', profileData);
        profileDataFound = true;
        
        // Extract email
        const email = profileData.email;
        if (email) {
          successMessage += `📧 Order confirmation will be sent to: ${email}\n`;
        }
        
        // Extract physical address
        const physicalAddress = profileData.physicalAddress;
        if (physicalAddress?.physicalAddress) {
          const addr = physicalAddress.physicalAddress;
          const addressString = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.countryCode
          ].filter(Boolean).join(", ");
          successMessage += `📦 Item will be shipped to: ${addressString}\n`;
        } else if (physicalAddress && typeof physicalAddress === 'object') {
          // Handle if the address is directly in physicalAddress
          const addr = physicalAddress as Record<string, unknown>;
          const addressString = [
            addr.address1,
            addr.address2,
            addr.city,
            addr.state,
            addr.postalCode,
            addr.countryCode
          ].filter(Boolean).join(", ");
          successMessage += `📦 Item will be shipped to: ${addressString}\n`;
        }
      }
      
      // Also check if the profile data is in the transaction receipt or other locations
      const receipt = dataAny.receipt || dataAny.transactionReceipt;
      if (receipt && typeof receipt === 'object' && 'logs' in receipt) {
        console.log('Transaction receipt found:', receipt);
      }
      
      successMessage += "\n✨ Thank you for shopping sustainable fashion!";
      
      if (!profileDataFound) {
        successMessage = "🎉 Purchase successful!\n\n✨ Thank you for your order! Your profile information has been collected securely.";
      }
      
      alert(successMessage);
      setSelectedProduct(null);
    }
  }, [data]);

  // Smart Wallet Profiles error handling
  useEffect(() => {
    if (error) {
      console.error('Transaction error details:', error);
      setSelectedProduct(null);
      
      // Provide specific error messages for different failure scenarios
      if (error.message.includes('User rejected') || error.message.includes('user rejected')) {
        alert("❌ Transaction cancelled by user");
      } else if (error.message.includes('insufficient funds')) {
        alert("💳 Insufficient funds for this purchase");
      } else if (error.message.includes('profile') || error.message.includes('data')) {
        alert("📝 There was an issue with collecting your shipping information. Please try again.");
      } else if (error.message.includes('network') || error.message.includes('connection')) {
        alert("🌐 Network error. Please check your connection and try again.");
      } else {
        alert(`❌ Transaction failed: ${error.message}\n\nPlease try again or contact support if the issue persists.`);
      }
    }
  }, [error]);

    return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Clean Premium Header */}
      <header 
        className={`fixed left-0 right-0 z-50 backdrop-blur-xl border-b border-white/20 shadow-lg transition-transform duration-300 ease-in-out ${
          isHeaderVisible ? 'top-0 translate-y-0' : '-top-24 -translate-y-full'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-10">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Brand Name */}
            <div className="flex items-center relative">
              <h1 className="text-lg lg:text-2xl font-black text-white tracking-wide cursor-default hover:text-teal-200 transition-colors duration-300">
                GUTTER FAIRY
            </h1>
            </div>
            
            <div className="wallet-container relative">
              <Wallet>
                <ConnectWallet 
                  className="relative overflow-hidden group bg-white/10 backdrop-blur-xl text-white px-4 lg:px-8 py-2 lg:py-3 font-bold tracking-wide transition-all duration-500 hover:scale-105 hover:shadow-2xl rounded-full border border-white/30 hover:border-white/50 hover:bg-white/20 text-sm lg:text-base"
                  disconnectedLabel="Login"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    {isConnected ? (
                      <>
                    <Avatar className="h-4 w-4 lg:h-5 lg:w-5" />
                        <Name className="text-white font-bold hidden sm:block" />
                        <span className="sm:hidden text-white font-bold">WALLET</span>
                      </>
                    ) : (
                      <span className="text-white font-bold">Login</span>
                    )}
                  </div>
                </ConnectWallet>
                <WalletDropdown className="[&>div]:!bg-white/95 [&>div]:!backdrop-blur-xl [&>div]:!border-white/20 [&>div]:!shadow-2xl [&>div]:!rounded-2xl [&>div]:!absolute [&>div]:!top-full [&>div]:!right-0 [&>div]:!mt-2 [&>div]:!min-w-[280px] [&>div]:!z-[999999] [&>div]:sm:!right-0 [&>div]:!right-4 [&>div]:!max-w-[calc(100vw-2rem)] [&>div]:!text-gray-800 [&_*]:!text-gray-800 [&_span]:!text-gray-800 [&_button]:!text-gray-800 [&_a]:!text-gray-800 [&_div]:!text-gray-800">
                  <Identity className="px-6 pt-4 pb-3 !bg-transparent !text-gray-800 [&_*]:!text-gray-800 [&_span]:!text-gray-800 [&_div]:!text-gray-800 [&_button]:!text-gray-800" hasCopyAddressOnClick>
                    <Avatar />
                    <Name className="!text-gray-800 !important" />
                    <Address className="!text-gray-800 !important" />
                    <EthBalance className="!text-gray-800 !important" />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-teal-100/80 !text-gray-800 font-medium !bg-transparent hover:!bg-teal-100/80 rounded-xl mx-2 transition-all duration-300 [&_*]:!text-gray-800 [&_span]:!text-gray-800 [&_div]:!text-gray-800"
                  >
                    WALLET
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect className="!text-gray-800 !bg-transparent hover:!bg-red-50/80 rounded-xl mx-2 transition-all duration-300 [&_*]:!text-gray-800 [&_span]:!text-gray-800 [&_div]:!text-gray-800 [&_button]:!text-gray-800" />
                </WalletDropdown>
              </Wallet>
            </div>
            </div>
          </div>
        </header>

      {/* Hero Section - Clean Modern Style */}
      <section className="min-h-[50vh] sm:min-h-screen flex items-center justify-center relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #67e8f9 0%, #5eead4 15%, #a7f3d0 30%, #d8b4fe 60%, #c4b5fd 80%, #ddd6fe 100%)'
      }}>
        <div className="relative z-10 text-center px-2 sm:px-6 md:px-8 lg:px-16 xl:px-24 max-w-7xl mx-auto pt-2 sm:pt-8 lg:pt-24">
          {/* Clean Hero Content */}
          <div className="mb-3 sm:mb-12 relative">
            <h1 className="text-xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-white mb-2 sm:mb-6 leading-tight cursor-default drop-shadow-lg relative">
              <span className="transition-all duration-500 hover:text-white/90 inline-block">
                CURATED CHAOS
              </span>
              <br />
              <span className="transition-all duration-500 hover:text-white/90 inline-block">
                SUSTAINABLE FASHION
              </span>
            </h1>
                </div>

          {/* Hero Carousel */}
          <div className="relative w-full flex justify-center">
            <div className="relative max-w-xl sm:max-w-4xl w-full">
              <div className="relative rounded-2xl shadow-2xl group hover:scale-105 transition-all duration-700 overflow-hidden" style={{
                background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 50%, #f8fafc 100%)'
              }}>
                {/* Carousel Images - Infinite Loop */}
                <div className="relative overflow-hidden rounded-2xl">
                  <div 
                    className={`flex ${
                      currentHeroIndex === -1 || currentHeroIndex === heroImages.length
                        ? '' 
                        : 'transition-transform duration-500 ease-in-out'
                    }`}
                    style={{ transform: `translateX(-${(currentHeroIndex + 1) * 100}%)` }}
                  >
                    {/* Last image clone for seamless loop */}
                    <div className="w-full flex-shrink-0">
                      <img 
                        src={heroImages[heroImages.length - 1].src} 
                        alt={heroImages[heroImages.length - 1].alt} 
                        className="w-full h-auto max-h-[200px] sm:max-h-[600px] object-cover transition-all duration-500"
                      />
              </div>
                    {/* Original images */}
                    {heroImages.map((image, index) => (
                      <div key={index} className="w-full flex-shrink-0">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full h-auto max-h-[200px] sm:max-h-[600px] object-cover transition-all duration-500"
                        />
                </div>
                    ))}
                    {/* First image clone for seamless loop */}
                    <div className="w-full flex-shrink-0">
                      <img 
                        src={heroImages[0].src} 
                        alt={heroImages[0].alt} 
                        className="w-full h-auto max-h-[200px] sm:max-h-[600px] object-cover transition-all duration-500"
                      />
                </div>
                </div>
              </div>

                {/* Navigation Arrows */}
                <button 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-gray-800 w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl lg:text-2xl border border-white/30 hover:scale-110 z-10"
                  onClick={goToPreviousHero}
                >
                  ‹
                </button>
                <button 
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-gray-800 w-12 h-12 lg:w-14 lg:h-14 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl lg:text-2xl border border-white/30 hover:scale-110 z-10"
                  onClick={goToNextHero}
                >
                  ›
                </button>

                {/* Carousel Dots */}
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                  {heroImages.map((_, index) => {
                    // Determine active state considering the infinite loop
                    const isActive = currentHeroIndex === index || 
                      (currentHeroIndex === -1 && index === heroImages.length - 1) ||
                      (currentHeroIndex === heroImages.length && index === 0);
                    
                    return (
                      <button
                        key={index}
                        className={`w-3 h-3 lg:w-4 lg:h-4 rounded-full transition-all duration-300 border-2 ${
                          isActive
                            ? 'bg-white border-white scale-125 shadow-lg' 
                            : 'bg-white/50 border-white/70 hover:bg-white/75 hover:scale-110'
                        }`}
                        onClick={() => goToHero(index)}
                      />
                    );
                  })}
              </div>

                {/* Carousel Progress Bar */}
                <div className="absolute bottom-2 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white transition-all duration-300 rounded-full"
                    style={{ 
                      width: `${(() => {
                        let activeIndex = currentHeroIndex;
                        if (currentHeroIndex === -1) activeIndex = heroImages.length - 1;
                        if (currentHeroIndex === heroImages.length) activeIndex = 0;
                        return ((activeIndex + 1) / heroImages.length) * 100;
                      })()}%` 
                    }}
                  />
                </div>
              </div>
                </div>
                </div>
              </div>

        {/* Gradient Transition to Products */}
        <div className="absolute bottom-0 left-0 right-0 h-8 sm:h-32 z-20" style={{
          background: 'linear-gradient(180deg, transparent 0%, #f8fafc 50%, #ecfdf5 100%)'
        }}></div>
      </section>

      {/* Products Section - Clean Premium Grid */}
      <section id="products" className="min-h-[80vh] pt-0 pb-16 px-3 sm:px-6 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #ecfdf5 0%, #f0f9ff 20%, #faf5ff 40%, #f8fafc 60%, #ecfdf5 80%, #faf5ff 100%)'
      }}>
        <div className="max-w-7xl mx-auto relative z-10 pt-16">
                    {/* Secure Checkout Info */}
          <div className="text-center mb-8 px-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-teal-200/50" style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)'
            }}>
              <span className="text-teal-600">🔒</span>
              <span>Secure checkout collects email & shipping address via Smart Wallet</span>
              <span className="text-teal-600">📦</span>
                </div>
              </div>

          {/* Product Category Filters - Single Selection Only */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
            {['ALL', 'TOPS', 'BOTTOMS', 'JUMPSUITS', 'VINTAGE COLLECTION'].map((filter) => {
              const isActive = activeFilter === filter;
              return (
              <button 
                  key={`${filter}-${isActive}`} // Force re-render when active state changes
                  onClick={() => {
                    console.log(`Filter clicked: ${filter}, current active: ${activeFilter}`);
                    handleFilterChange(filter);
                  }}
                  className={`px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold tracking-wide rounded-full border transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 relative overflow-hidden ${
                    isActive
                      ? 'text-gray-900 border-teal-300/50 ring-2 ring-teal-200/50'
                      : 'text-gray-700 border-teal-200/30 hover:border-teal-300/50'
                  }`}
                  style={{
                    background: isActive 
                      ? 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 30%, #a7f3d0 50%, #e9d5ff 70%, #ffffff 100%)'
                      : 'linear-gradient(135deg, #ffffff/80 0%, #f0fdfa/60 30%, #f8fafc/60 70%, #ffffff/80 100%)'
                  }}
                >
                  {filter} ({getProductCount(filter)})
              </button>
              );
            })}
          </div>


          
                    {/* Premium Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentProducts.map((item, index) => (
                <div key={index} className="group relative">
                {/* Clean Product Card */}
                  <div 
                  className="rounded-2xl shadow-xl overflow-hidden transform transition-all duration-700 hover:scale-105 hover:shadow-2xl border border-teal-200/30 group-hover:border-teal-400/60 cursor-pointer relative"
                    onClick={() => setModalProduct(item)}
                  style={{
                    background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 25%, #f8fafc 50%, #faf5ff 75%, #ffffff 100%)'
                  }}
                  >
                  {/* Product Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={item.images[currentImageIndex[item.id] || 0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Clean Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Image Navigation */}
                    {item.images.length > 1 && (
                      <>
                        <button 
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-12 h-12 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl border border-white/30 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = currentImageIndex[item.id] || 0;
                            const newIndex = current === 0 ? item.images.length - 1 : current - 1;
                            setCurrentImageIndex(prev => ({...prev, [item.id]: newIndex}));
                          }}
                        >
                          ‹
                        </button>
                        <button 
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-12 h-12 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl border border-white/30 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = currentImageIndex[item.id] || 0;
                            const newIndex = current === item.images.length - 1 ? 0 : current + 1;
                            setCurrentImageIndex(prev => ({...prev, [item.id]: newIndex}));
                          }}
                        >
                          ›
                        </button>
                        
                        {/* Image Dots */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
                          {item.images.map((_, imgIndex) => (
                            <button
                              key={imgIndex}
                              className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                                (currentImageIndex[item.id] || 0) === imgIndex 
                                  ? 'bg-white border-white scale-125 shadow-lg' 
                                  : 'bg-white/50 border-white/70 hover:bg-white/75 hover:scale-110'
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentImageIndex(prev => ({...prev, [item.id]: imgIndex}));
                              }}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-6">
                    <h1 className="text-xl font-black text-gray-800 mb-2 tracking-wide group-hover:text-teal-600 transition-colors duration-300">{item.name}</h1>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-teal-500 to-purple-500 bg-clip-text text-transparent mb-4">
                      {item.price} • Size {item.size}
                    </h2>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* Quick Buy Button with Profile Data Info */}
                    <button 
                        className="flex-1 relative overflow-hidden group/quickbuy text-white font-bold py-3 px-4 tracking-wide transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl border border-teal-400/30 hover:border-teal-300/50 text-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePurchase(item);
                      }}
                      disabled={isPending}
                        style={{
                          background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 30%, #7c3aed 70%, #0891b2 100%)'
                        }}
                        title="Checkout - Email and shipping address will be requested"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-purple-400 to-teal-500 opacity-0 group-hover/quickbuy:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative z-10 flex items-center justify-center">
                        {isPending && selectedProduct?.id === item.id ? (
                          <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            CHECKOUT...
                          </>
                        ) : (
                          <>
                              <span className="group-hover/quickbuy:animate-pulse">CHECKOUT</span>
                              <span className="ml-2 opacity-0 group-hover/quickbuy:opacity-100 transition-opacity duration-300">📦</span>
                          </>
                        )}
                      </div>
                    </button>

                      {/* Details Button */}
                      <button 
                        className="flex-1 relative overflow-hidden group/details border-2 border-teal-200/50 text-gray-700 font-bold py-3 px-4 tracking-wide transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 rounded-xl hover:border-teal-400 hover:text-teal-600 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalProduct(item);
                        }}
                        style={{
                          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #ffffff 100%)'
                        }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-50 to-purple-50 opacity-0 group-hover/details:opacity-100 transition-opacity duration-500"></div>
                        
                        <div className="relative z-10 flex items-center justify-center">
                          <span className="group-hover/details:animate-pulse">DETAILS</span>
                          <span className="ml-2 opacity-0 group-hover/details:opacity-100 transition-opacity duration-300">👁️</span>
        </div>
              </button>
            </div>
                  </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Pagination Controls with Items Per Page */}
            <div className="mt-12">
              {/* Items Per Page Selector and Showing Info */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                {/* Items Per Page Selector */}
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-2 text-sm font-medium border border-teal-200/50 rounded-lg transition-all duration-300 hover:border-teal-300/50 focus:border-teal-400 focus:outline-none"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)'
                    }}
                  >
                    <option value={10}>10 items</option>
                    <option value={20}>20 items</option>
                    <option value={50}>50 items</option>
                  </select>
          </div>

                {/* Showing Info */}
                <span className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of {totalItems} items
                </span>
        </div>

              {/* Page Navigation */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium border border-teal-200/50 rounded-lg transition-all duration-300 hover:border-teal-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)'
                    }}
                  >
                    Previous
              </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 7) {
                        pageNumber = i + 1;
                      } else if (currentPage <= 4) {
                        pageNumber = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNumber = totalPages - 6 + i;
                      } else {
                        pageNumber = currentPage - 3 + i;
                      }

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`w-10 h-10 text-sm font-medium rounded-lg transition-all duration-300 ${
                            currentPage === pageNumber
                              ? 'text-white border-teal-400'
                              : 'text-gray-700 border-teal-200/50 hover:border-teal-300/50'
                          }`}
                          style={{
                            background: currentPage === pageNumber
                              ? 'linear-gradient(135deg, #0891b2 0%, #0d9488 50%, #7c3aed 100%)'
                              : 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)'
                          }}
                        >
                          {pageNumber}
                        </button>
                      );
                    })}
              </div>
              
                  <button
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium border border-teal-200/50 rounded-lg transition-all duration-300 hover:border-teal-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f0fdfa 50%, #ffffff 100%)'
                    }}
                  >
                    Next
                  </button>
              </div>
              )}
            </div>
          </div>
      </section>

      {/* Clean Footer Section */}
      <footer className="text-gray-800 relative overflow-hidden py-12" style={{
        background: 'linear-gradient(180deg, #f8fafc 0%, #ecfdf5 30%, #e9d5ff 70%, #f8fafc 100%)'
      }}>
                        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          {/* Made for sustainable fairies and Social Media Links */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            <p className="text-lg font-bold text-gray-800">Made for sustainable fairies 🧚‍♀️♻️</p>
            
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/gutterfairythrift/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full backdrop-blur-xl border border-teal-200/30 flex items-center justify-center transition-all duration-300 cursor-pointer group hover:scale-110 shadow-lg hover:shadow-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #ecfdf5 30%, #faf5ff 70%, #ffffff 100%)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-100/50 to-purple-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-xs lg:text-sm font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300">IG</span>
              </a>
              <a href="https://www.tiktok.com/@gutterfairythrift" target="_blank" rel="noopener noreferrer" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full backdrop-blur-xl border border-teal-200/30 flex items-center justify-center transition-all duration-300 cursor-pointer group hover:scale-110 shadow-lg hover:shadow-xl relative overflow-hidden" style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 30%, #ecfdf5 70%, #ffffff 100%)'
              }}>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-teal-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 text-xs lg:text-sm font-bold text-gray-800 group-hover:scale-110 transition-transform duration-300">TT</span>
              </a>
            </div>
            </div>
            
                    {/* Footer Links */}
          <div className="text-sm text-gray-600">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p>© 2024. All rights reserved.</p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-teal-600 transition-colors duration-300">Privacy Policy</a>
                <a href="#" className="hover:text-teal-600 transition-colors duration-300">Terms of Service</a>
              </div>
            </div>
          </div>
                </div>
      </footer>

      {/* Product Detail Modal */}
      {modalProduct && (
        <div className="fixed inset-0 bg-gray-800/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-2 sm:p-4">
          <div className="rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-teal-200/40 relative" style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #faf5ff 20%, #f8fafc 40%, #faf5ff 60%, #ffffff 100%)'
          }}>
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button 
                onClick={() => setModalProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 border border-teal-200/40 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
                }}
              >
                <span className="text-gray-600 font-bold text-xl">×</span>
              </button>
              <h2 className="text-2xl font-black text-gray-800 tracking-wide">{modalProduct.name}</h2>
              <div className="text-3xl font-black bg-gradient-to-r from-teal-600 to-purple-600 bg-clip-text text-transparent mt-2">
                {modalProduct.price}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Product Image */}
              <div className="relative aspect-square mb-6 rounded-2xl overflow-hidden bg-gray-100">
                <img 
                  src={modalProduct.images[currentImageIndex[modalProduct.id] || 0]}
                  alt={modalProduct.name}
                  className="w-full h-full object-cover"
                />
                
                {/* Image Navigation for Modal */}
                {modalProduct.images.length > 1 && (
                  <>
                    <button 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-12 h-12 rounded-full flex items-center justify-center shadow-xl font-bold text-lg border border-white/30 hover:scale-110 transition-all duration-300"
                      onClick={() => {
                        const current = currentImageIndex[modalProduct.id] || 0;
                        const newIndex = current === 0 ? modalProduct.images.length - 1 : current - 1;
                        setCurrentImageIndex(prev => ({...prev, [modalProduct.id]: newIndex}));
                      }}
                    >
                      ‹
                    </button>
                    <button 
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-12 h-12 rounded-full flex items-center justify-center shadow-xl font-bold text-lg border border-white/30 hover:scale-110 transition-all duration-300"
                      onClick={() => {
                        const current = currentImageIndex[modalProduct.id] || 0;
                        const newIndex = current === modalProduct.images.length - 1 ? 0 : current + 1;
                        setCurrentImageIndex(prev => ({...prev, [modalProduct.id]: newIndex}));
                      }}
                    >
                      ›
                    </button>
                    
                    {/* Image Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                      {modalProduct.images.map((_, imgIndex) => (
                        <button
                          key={imgIndex}
                          className={`w-3 h-3 rounded-full transition-all duration-300 border-2 ${
                            (currentImageIndex[modalProduct.id] || 0) === imgIndex 
                              ? 'bg-white border-white scale-125 shadow-lg' 
                              : 'bg-white/50 border-white/70 hover:bg-white/75 hover:scale-110'
                          }`}
                          onClick={() => {
                            setCurrentImageIndex(prev => ({...prev, [modalProduct.id]: imgIndex}));
                          }}
                        />
                      ))}
            </div>
                  </>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{modalProduct.description}</p>
              </div>

                {/* Size & Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Size</h3>
                    <div className="rounded-full px-4 py-2 inline-block" style={{
                      background: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 50%, #e9d5ff 100%)'
                    }}>
                      <span className="text-sm font-bold text-gray-700">{modalProduct.size}</span>
              </div>
            </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-3">Measurements</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{modalProduct.measurements}</p>
          </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">Category</h3>
                  <div className="rounded-full px-4 py-2 inline-block" style={{
                    background: 'linear-gradient(135deg, #f0fdfa 0%, #a7f3d0 50%, #e9d5ff 100%)'
                  }}>
                    <span className="text-sm font-bold text-teal-800">{modalProduct.category}</span>
        </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button 
                    className="flex-1 relative overflow-hidden group/btn text-white font-black py-4 px-6 tracking-wider transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-2xl border border-teal-400/30 hover:border-teal-300/50"
                    onClick={() => {
                      handlePurchase(modalProduct);
                      setModalProduct(null);
                    }}
                    disabled={isPending}
                    title="Complete purchase - Email and shipping address will be requested securely"
                    style={{
                      background: 'linear-gradient(135deg, #0891b2 0%, #0d9488 30%, #7c3aed 70%, #0891b2 100%)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-400 via-purple-400 to-teal-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative z-10 flex items-center justify-center">
                      {isPending && selectedProduct?.id === modalProduct.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <span className="group-hover/btn:animate-pulse">CHECKOUT</span>
                          <span className="ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">📦</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setModalProduct(null)}
                    className="px-6 py-4 text-gray-700 font-bold rounded-2xl transition-all duration-300 hover:scale-105 border border-teal-200/40"
                    style={{
                      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)'
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    );
}

