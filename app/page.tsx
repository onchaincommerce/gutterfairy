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

  const { sendCalls, data, error, isPending } = useSendCalls();
  const { isConnected } = useAccount();

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

  // Filter products based on active filter
  const filteredProducts = activeFilter === 'ALL' 
    ? products 
    : activeFilter === 'VINTAGE COLLECTION'
    ? products.filter(product => product.name.toLowerCase().includes('vintage'))
    : products.filter(product => product.category === activeFilter);

  // Preload images for better performance
  useEffect(() => {
    const imageUrls = products.flatMap(product => product.images);
    imageUrls.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }, [products]);

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

    return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Particles */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-teal-400 rounded-full animate-ping opacity-70"></div>
        <div className="absolute top-40 right-20 w-3 h-3 bg-blue-400 rounded-full animate-pulse opacity-60" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-40 left-1/4 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-80" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-400 rounded-full animate-pulse opacity-50" style={{animationDelay: '3s'}}></div>
        <div className="absolute bottom-20 right-10 w-3 h-3 bg-yellow-400 rounded-full animate-ping opacity-60" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* Premium Glassmorphism Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-gradient-to-r from-blue-500/5 via-teal-500/5 via-blue-500/5 to-emerald-500/5 border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 lg:h-20">
            {/* Social Media Links */}
            <div className="flex items-center space-x-4">
              <a href="https://www.instagram.com/gutterfairythrift/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white transition-all duration-300 cursor-pointer group hover:scale-110 shadow-lg hover:shadow-xl">
                <span className="text-xs lg:text-sm font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">IG</span>
              </a>
              <a href="https://www.tiktok.com/@gutterfairythrift" target="_blank" rel="noopener noreferrer" className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/90 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:bg-white transition-all duration-300 cursor-pointer group hover:scale-110 shadow-lg hover:shadow-xl">
                <span className="text-xs lg:text-sm font-bold text-gray-900 group-hover:scale-110 transition-transform duration-300">TT</span>
              </a>
            </div>
            
            <div className="wallet-container relative">
              <Wallet>
                <ConnectWallet className="relative overflow-hidden group bg-white/90 backdrop-blur-xl text-gray-900 px-4 lg:px-8 py-2 lg:py-3 font-bold tracking-wide transition-all duration-500 hover:scale-105 hover:shadow-2xl rounded-full border border-white/30 hover:border-pink-300 hover:bg-white/95 text-sm lg:text-base">
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full"></div>
                  <div className="relative z-10 flex items-center gap-2">
                    <Avatar className="h-4 w-4 lg:h-5 lg:w-5" />
                    <Name className="text-gray-900 font-bold hidden sm:block" />
                    <span className="sm:hidden text-gray-900 font-bold">WALLET</span>
                    {/* Wallet sparkle */}
                    <div className="w-1 h-1 bg-yellow-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </ConnectWallet>
                <WalletDropdown className="[&>div]:!bg-white/95 [&>div]:!backdrop-blur-xl [&>div]:!border-white/20 [&>div]:!shadow-2xl [&>div]:!rounded-2xl [&>div]:!absolute [&>div]:!top-full [&>div]:!right-0 [&>div]:!mt-2 [&>div]:!min-w-[280px] [&>div]:!z-[999999] [&>div]:sm:!right-0 [&>div]:!right-4 [&>div]:!max-w-[calc(100vw-2rem)]">
                  <Identity className="px-6 pt-4 pb-3 !bg-transparent !text-gray-900" hasCopyAddressOnClick>
                    <Avatar />
                    <Name className="!text-gray-900" />
                    <Address className="!text-gray-700" />
                    <EthBalance className="!text-gray-700" />
                  </Identity>
                  <WalletDropdownLink
                    icon="wallet"
                    href="https://keys.coinbase.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:bg-gray-50/80 text-gray-900 font-medium !text-gray-900 !bg-transparent hover:!bg-gray-50/80 rounded-xl mx-2 transition-all duration-300"
                  >
                    WALLET
                  </WalletDropdownLink>
                  <WalletDropdownDisconnect className="!text-gray-900 !bg-transparent hover:!bg-red-50/80 rounded-xl mx-2 transition-all duration-300" />
                </WalletDropdown>
              </Wallet>
            </div>
            </div>
          </div>
        </header>

      {/* Hero Section - Ultra Premium with Enhanced Gradients */}
      <section className="min-h-screen bg-gradient-to-br from-blue-200 via-blue-300 via-teal-300 via-teal-200 via-blue-300 via-teal-300 to-emerald-300 flex items-start justify-center pt-20 md:items-center md:pt-0 relative overflow-hidden">
        {/* Enhanced Floating Glassmorphism Orbs */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/20 backdrop-blur-xl rounded-full animate-pulse opacity-60">
          <div className="absolute inset-2 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full"></div>
        </div>
        <div className="absolute bottom-32 right-20 w-48 h-48 bg-white/10 backdrop-blur-xl rounded-full animate-bounce opacity-40" style={{animationDuration: '3s'}}>
          <div className="absolute inset-4 bg-gradient-to-br from-blue-300/30 to-teal-300/30 rounded-full"></div>
        </div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-white/15 backdrop-blur-xl rounded-full animate-ping opacity-50">
          <div className="absolute inset-1 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full"></div>
        </div>
        
        {/* Enhanced Premium Diagonal Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-br from-blue-300 via-blue-200 via-indigo-300 to-purple-300 transform rotate-1 origin-bottom-left scale-110 shadow-2xl"></div>
        
        <div className="relative z-10 text-center px-4 sm:px-6 md:px-8 lg:px-12 max-w-7xl mx-auto flex flex-col justify-center items-center h-full lg:pt-28 xl:pt-32">
          {/* Hero Copy Above Carousel - Kawaii & Ethereal */}
          <div className="mb-8 relative">
            <h1 className="text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black text-white mb-4 tracking-wide leading-tight relative group cursor-default">
              {/* Ethereal glow background */}
                              <div className="absolute inset-0 text-2xl sm:text-3xl md:text-6xl lg:text-7xl font-black bg-gradient-to-r from-pink-300/30 via-purple-300/30 to-blue-300/30 bg-clip-text text-transparent blur-2xl -z-10">
                CURATED CHAOS<br />SUSTAINABLY SOURCED
                  </div>
                  
              {/* Main text with kawaii elements */}
              <span className="transition-all duration-500 hover:scale-105 hover:text-pink-200 inline-block relative">
                CURATED CHAOS
                {/* Kawaii sparkles */}
                <span className="absolute -top-3 -right-2 text-yellow-300 text-xl animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.1s'}}>✨</span>
                <span className="absolute -top-2 left-1/3 text-pink-300 text-sm animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.3s'}}>💫</span>
                <span className="absolute -bottom-1 left-1/4 text-purple-300 text-xs animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.5s'}}>⭐</span>
              </span>
              <br />
              <span className="transition-all duration-500 hover:scale-105 hover:text-emerald-200 inline-block relative">
                SUSTAINABLY SOURCED
                {/* More kawaii elements */}
                <span className="absolute -top-3 -left-2 text-emerald-300 text-lg animate-bounce opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.7s', animationDuration: '2s'}}>🌸</span>
                <span className="absolute -top-2 right-1/4 text-blue-300 text-sm animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '0.9s'}}>💎</span>
                <span className="absolute -bottom-1 right-1/3 text-teal-300 text-xs animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{animationDelay: '1.1s'}}>🦋</span>
              </span>
            </h1>
            
            {/* Floating kawaii elements around the text */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/4 text-pink-200 text-2xl animate-float opacity-70" style={{animationDelay: '0s', animationDuration: '4s'}}>☁️</div>
              <div className="absolute top-1/3 right-1/4 text-purple-200 text-xl animate-float opacity-60" style={{animationDelay: '1s', animationDuration: '5s'}}>🌙</div>
              <div className="absolute bottom-0 left-1/3 text-blue-200 text-lg animate-float opacity-80" style={{animationDelay: '2s', animationDuration: '3s'}}>⭐</div>
              <div className="absolute top-1/2 left-0 text-emerald-200 text-sm animate-float opacity-50" style={{animationDelay: '1.5s', animationDuration: '6s'}}>✨</div>
              <div className="absolute bottom-1/4 right-0 text-teal-200 text-lg animate-float opacity-70" style={{animationDelay: '2.5s', animationDuration: '4s'}}>💫</div>
                  </div>
                </div>

          {/* SEAMLESS Fairy Carousel - ONLY EXISTING ASSETS */}
          <div className="overflow-hidden relative w-full mb-16">
            <div className="flex animate-scroll-seamless space-x-6 items-center">
              
              {/* Existing Fairy Assets */}
              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_1a904efb-fd57-4a13-986f-8eb5953d4a0e_2.png" 
                    alt="Gutter Fairy" 
                    className="w-[500px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            
              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_afdaa008-1b02-4516-86b4-ea7126e9e773_3 2.png" 
                    alt="Gutter Fairy" 
                    className="w-72 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_bee608ac-b150-4073-bb0a-c178876ac405_1.png" 
                    alt="Gutter Fairy" 
                    className="w-[600px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_d7eb95ad-1711-4c60-ae75-bcaf6027f152_0 2.png" 
                    alt="Gutter Fairy" 
                    className="w-80 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_bee608ac-b150-4073-bb0a-c178876ac405_2.png" 
                    alt="Gutter Fairy" 
                    className="w-64 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_d7eb95ad-1711-4c60-ae75-bcaf6027f152_2 2.png" 
                    alt="Gutter Fairy" 
                    className="w-[550px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_afdaa008-1b02-4516-86b4-ea7126e9e773_0 2.png" 
                    alt="Gutter Fairy" 
                    className="w-76 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Product Images */}
              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/fuzzy_black_2_piece.png" 
                    alt="Fuzzy Black 2-Piece" 
                    className="w-[500px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/American Vintage Women's Brown and Tan Jacket .jpg" 
                    alt="Vintage Jacket" 
                    className="w-60 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-violet-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/Charter Club Women's multi Jacket .jpg" 
                    alt="Multi Pattern Jacket" 
                    className="w-[520px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/Eddie Bauer Women's multi Shirt .jpg" 
                    alt="Multi Stripe Shirt" 
                    className="w-72 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-lime-500/20 via-transparent to-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/Secret Treasures Women's Red Dress .jpg" 
                    alt="Red Floral Dress" 
                    className="w-[400px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/Women's multi Blouse.jpg" 
                    alt="Floral Blouse" 
                    className="w-80 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/womens_multi_skirt.jpg" 
                    alt="Plaid Skirt" 
                    className="w-[450px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/fairy.png" 
                    alt="Gutter Fairy Logo" 
                    className="w-64 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              {/* Duplicate the whole sequence for seamless looping */}
              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_1a904efb-fd57-4a13-986f-8eb5953d4a0e_2.png" 
                    alt="Gutter Fairy" 
                    className="w-[500px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
              </div>
            
              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_afdaa008-1b02-4516-86b4-ea7126e9e773_3 2.png" 
                    alt="Gutter Fairy" 
                    className="w-72 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 via-transparent to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_bee608ac-b150-4073-bb0a-c178876ac405_1.png" 
                    alt="Gutter Fairy" 
                    className="w-[600px] h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_d7eb95ad-1711-4c60-ae75-bcaf6027f152_0 2.png" 
                    alt="Gutter Fairy" 
                    className="w-80 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-green-500/20 via-transparent to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

              <div className="flex-shrink-0 group cursor-pointer">
                <div className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl">
                  <img 
                    src="/u4517633736_A_human-like_woman_based_on_the_uploaded_referenc_bee608ac-b150-4073-bb0a-c178876ac405_2.png" 
                    alt="Gutter Fairy" 
                    className="w-64 h-96 object-cover transition-all duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/20 via-transparent to-orange-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              </div>

            </div>
          </div>



        </div>
      </section>

      {/* Products Section - Premium Grid with Magnetic Effects */}
      <section id="products" className="min-h-[80vh] bg-gradient-to-br from-indigo-200 via-blue-200 via-blue-300 via-purple-200 to-purple-300 pt-8 pb-16 px-6 relative overflow-hidden">
        {/* Curved Premium Transition */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-blue-200 via-teal-300 to-emerald-200 transform -rotate-1 origin-top-right scale-110 shadow-2xl"></div>
        
        {/* Floating Glassmorphism Elements */}
        <div className="absolute top-32 right-32 w-40 h-40 bg-white/10 backdrop-blur-xl rounded-3xl animate-pulse opacity-50 rotate-12"></div>
        <div className="absolute bottom-40 left-32 w-56 h-56 bg-white/5 backdrop-blur-xl rounded-full animate-bounce opacity-30" style={{animationDuration: '4s'}}></div>
        
        {/* Premium Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-48">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".3" fill="url(#gradient1)"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".6" fill="url(#gradient1)"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="url(#gradient1)"></path>
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(168 85 247)" />
                <stop offset="100%" stopColor="rgb(147 51 234)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Product Category Filters */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12">
            {['ALL', 'TOPS', 'BOTTOMS', 'JUMPSUITS', 'VINTAGE COLLECTION', 'FOOTWEAR', 'HANDBAGS', 'ACCESSORIES'].map((filter) => (
              <button 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-2 sm:px-6 sm:py-3 text-xs sm:text-sm font-bold tracking-wide rounded-full border transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 ${
                  activeFilter === filter
                    ? 'bg-white/90 backdrop-blur-xl text-gray-900 border-white/30 hover:bg-white'
                    : 'bg-white/10 backdrop-blur-xl text-white border-white/20 hover:bg-white/20'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
          
                    {/* Premium Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredProducts.map((item, index) => (
                <div key={index} className="group relative">
                  {/* Magnetic Hover Effect Container */}
                  <div 
                    className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-700 hover:scale-105 hover:rotate-1 hover:shadow-4xl border border-white/20 group-hover:border-white/40 cursor-pointer"
                    onClick={() => setModalProduct(item)}
                  >
                  {/* Premium Image Container */}
                  <div className="relative aspect-square overflow-hidden">
                    <img 
                      src={item.images[currentImageIndex[item.id] || 0]}
                      alt={item.name}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                    
                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Enhanced Image Navigation */}
                    {item.images.length > 1 && (
                      <>
                        <button 
                          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl border border-white/30 hover:scale-110"
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
                          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-xl hover:bg-white text-black w-14 h-14 rounded-full flex items-center justify-center shadow-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 font-bold text-xl border border-white/30 hover:scale-110"
                          onClick={(e) => {
                            e.stopPropagation();
                            const current = currentImageIndex[item.id] || 0;
                            const newIndex = current === item.images.length - 1 ? 0 : current + 1;
                            setCurrentImageIndex(prev => ({...prev, [item.id]: newIndex}));
                          }}
                        >
                          ›
                        </button>
                        
                        {/* Premium Dots */}
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
                  
                  {/* Simplified Product Info */}
                  <div className="p-6">
                    <h1 className="text-xl font-black text-gray-900 mb-2 tracking-wide group-hover:text-purple-900 transition-colors duration-300">{item.name}</h1>
                    <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mb-4">
                      {item.price} • Size {item.size}
                    </h2>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      {/* Quick Buy Button */}
                      <button 
                        className="flex-1 relative overflow-hidden group/quickbuy bg-gradient-to-r from-gray-900 to-black text-white font-bold py-3 px-4 tracking-wide transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-xl border border-gray-700 hover:border-white/30 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePurchase(item);
                        }}
                        disabled={isPending}
                      >
                        {/* Animated Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-600 to-emerald-500 opacity-0 group-hover/quickbuy:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Button Content */}
                        <div className="relative z-10 flex items-center justify-center">
                          {isPending && selectedProduct?.id === item.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              PROCESSING...
                            </>
                          ) : (
                            <>
                              <span className="group-hover/quickbuy:animate-pulse">QUICK BUY</span>
                              <span className="ml-2 opacity-0 group-hover/quickbuy:opacity-100 transition-opacity duration-300">⚡</span>
                            </>
                          )}
                        </div>
                      </button>

                      {/* Details Button */}
                      <button 
                        className="flex-1 relative overflow-hidden group/details bg-white border-2 border-gray-300 text-gray-700 font-bold py-3 px-4 tracking-wide transition-all duration-500 shadow-lg hover:shadow-xl transform hover:scale-105 rounded-xl hover:border-purple-400 hover:text-purple-700 text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalProduct(item);
                        }}
                      >
                        {/* Hover Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-teal-50 opacity-0 group-hover/details:opacity-100 transition-opacity duration-500"></div>
                        
                        {/* Button Content */}
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
          </div>
      </section>


      {/* Enhanced Footer Section */}
      <footer className="bg-gradient-to-br from-teal-300 via-blue-200 to-emerald-300 text-gray-800 relative overflow-hidden">
        {/* Magical Background Effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-10 w-32 h-32 bg-teal-500/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-blue-500/10 rounded-full blur-xl animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-20">
          {/* Newsletter Signup - Moved to Top */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h4 className="text-xl font-bold mb-4 text-gray-800">Stay Magical ✨</h4>
            <p className="text-gray-700 mb-6">Subscribe for exclusive vintage finds and sustainable fashion updates</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                              <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-full bg-white/70 backdrop-blur-xl border border-gray-300 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-purple-400 transition-all duration-300"
                />
                <button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 text-white font-bold hover:from-blue-500 hover:to-teal-500 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>



          {/* Bottom Bar */}
          <div className="pt-8 border-t border-white/10">
            {/* Mobile Legal Links */}
            <div className="flex justify-center items-center space-x-6 text-sm mb-4 md:hidden">
              <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
                Terms of Service
              </a>
            </div>
            
            {/* Copyright and Desktop Legal Links */}
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-600 text-sm mb-4 md:mb-0">
                © 2024. All rights reserved. Made with 💜 for sustainable fashion.
              </div>
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
                  Privacy Policy
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-800 transition-colors duration-300">
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
                </div>
      </footer>

      {/* Product Detail Modal */}
      {modalProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100000] flex items-center justify-center p-4">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            {/* Modal Header */}
            <div className="relative p-6 border-b border-gray-200">
              <button 
                onClick={() => setModalProduct(null)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <span className="text-gray-600 font-bold text-xl">×</span>
              </button>
              <h2 className="text-2xl font-black text-gray-900 tracking-wide">{modalProduct.name}</h2>
              <div className="text-3xl font-black bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent mt-2">
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
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{modalProduct.description}</p>
              </div>

                {/* Size & Measurements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Size</h3>
                    <div className="bg-gray-100 rounded-full px-4 py-2 inline-block">
                      <span className="text-sm font-bold text-gray-600">{modalProduct.size}</span>
              </div>
            </div>
                  
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3">Measurements</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{modalProduct.measurements}</p>
          </div>
                </div>

                {/* Category */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">Category</h3>
                  <div className="bg-gradient-to-r from-blue-100 to-teal-100 rounded-full px-4 py-2 inline-block">
                    <span className="text-sm font-bold text-purple-700">{modalProduct.category}</span>
        </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <button 
                    className="flex-1 relative overflow-hidden group/btn bg-gradient-to-r from-gray-900 to-black text-white font-black py-4 px-6 tracking-wider transition-all duration-500 shadow-2xl hover:shadow-4xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none rounded-2xl border border-gray-700 hover:border-white/30"
                    onClick={() => {
                      handlePurchase(modalProduct);
                      setModalProduct(null);
                    }}
                    disabled={isPending}
                  >
                    {/* Animated Background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-teal-600 to-emerald-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Button Content */}
                    <div className="relative z-10 flex items-center justify-center">
                      {isPending && selectedProduct?.id === modalProduct.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <span className="group-hover/btn:animate-pulse">BUY NOW</span>
                          <span className="ml-2 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300">✨</span>
                        </>
                      )}
                    </div>
                  </button>
                  
                  <button 
                    onClick={() => setModalProduct(null)}
                    className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all duration-300 hover:scale-105"
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

