import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import HomePage from '../components/HomePage';
import ProductPage from '../components/ProductPage';
import CartPage from '../components/CartPage';
import CheckoutPage from '../components/CheckoutPage';
import WhatsAppButton from '../components/WhatsAppButton';
import FirebaseService from '../services/FirebaseService';
import '../styles/animations.css';

const FenzoEcommerce = () => {
  function effectivePrice(p, settings){
    const original = Number(p?.price||0);
    if (Number(p?.offerPrice||0) > 0) return Number(p.offerPrice);
    const offerPercent = Number(p?.offerPercent||0);
    const globalPercent = settings?.globalOfferEnabled ? Number(settings?.globalOfferPercent||0) : 0;
    const applied = Math.max(offerPercent, globalPercent);
    if (applied > 0) return Math.round(original*(100-applied)/100);
    return original;
  }
  const [currentPage, setCurrentPage] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // URL-STATE-SYNC-FIX
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(()=>{
    const p = location.pathname;
    if (p === '/cart') setCurrentPage('cart');
    else if (p === '/checkout') setCurrentPage('checkout');
    else if (p.startsWith('/product/')) {
      const id = decodeURIComponent(p.split('/').pop());
      const apply = ()=>{
        const found = products.find(x => String(x.id||x.code) === id);
        if (found) { setSelectedProduct(found); setCurrentPage('product'); return true; }
        return false;
      };
      if (!apply()){
        const iv = setInterval(()=>{ if (apply()) clearInterval(iv); }, 200);
        setTimeout(()=>clearInterval(iv), 5000);
      }
    } else setCurrentPage('home');
  }, [location.pathname, products]);

  useEffect(()=>{
    if (currentPage === 'cart') navigate('/cart');
    else if (currentPage === 'checkout') navigate('/checkout');
    else if (currentPage === 'product' && selectedProduct){
      const pid = encodeURIComponent(String(selectedProduct.id||selectedProduct.code));
      navigate('/product/'+pid);
    } else if (currentPage === 'home') navigate('/');
  }, [currentPage, selectedProduct]);  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: ''
  });

  // Load products and settings on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [productsData, settingsData] = await Promise.all([
        FirebaseService.getProducts(),
        FirebaseService.getSettings()
      ]);
      
      setProducts(productsData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Search products
  const searchProducts = () => {
    if (!searchQuery.trim()) return products;
    
    const filtered = products.filter(p => {
      const q = (searchQuery || '').toLowerCase();
      const name = String(p.name||'').toLowerCase();
      const code = String(p.code||'').toLowerCase();
      const desc = String(p.description||p.details||'').toLowerCase();
      return name.includes(q) || code.includes(q) || desc.includes(q);
    });
    return filtered.length > 0 ? filtered : products;
  };

  // Add product to cart
  const addToCart = (product, size, color) => {
    const cartItem = {
      ...product,
      selectedSize: size,
      selectedColor: color,
      quantity: 1,
      cartId: `${product.id}-${size}-${color}-${Date.now()}`
    };
    
    setCart([...cart, cartItem]);
  };

  // Remove item from cart
  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  // Calculate totals
const getTotalPrice = () => {
  return cart.reduce((sum, item) => {
    const unit = effectivePrice(item, settings);
    const quantity = Number(item.quantity) || 1;
    return sum + (unit * quantity);
  }, 0);
};

const getDeliveryCharge = () => {
  if (cart.length === 0) return 0;
  
  const totalPrice = getTotalPrice();
  const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold) || 1000;
  const deliveryEnabled = settings.deliveryChargeEnabled !== false; // default true
  
  // Free delivery if total exceeds threshold or delivery is disabled
  if (!deliveryEnabled || totalPrice >= freeDeliveryThreshold) {
    return 0;
  }
  
  // Get the highest delivery charge from all cart items
  const maxDeliveryCharge = Math.max(
    ...cart.map(item => Number(item.deliveryCharge) || 0)
  );
  
  return maxDeliveryCharge;
};

const getGrandTotal = () => {
  return getTotalPrice() + getDeliveryCharge();
};

  // Handle checkout and WhatsApp redirect
  const handleCheckout = () => {
    let message = '*New Order from Fenzo*%0A%0A';
    
    cart.forEach((item, idx) => {
      message += `*Product ${idx + 1}:*%0A`;
      message += `Name: ${item.name}%0A`;
      message += `Code: ${item.code}%0A`;
      message += `Price: ৳${item.price}%0A`;
      message += `Size: ${item.selectedSize}%0A`;
      message += `Color: ${item.selectedColor}%0A`;
      message += `Quantity: ${item.quantity}%0A`;
      if (item.deliveryCharge > 0) {
        message += `Delivery: ৳${item.deliveryCharge}%0A`;
      }
      message += `%0A`;
    });
    
    message += `*Order Summary:*%0A`;
    message += `Subtotal: ৳${getTotalPrice()}%0A`;
    if (getDeliveryCharge() > 0) {
      message += `Delivery Charge: ৳${getDeliveryCharge()}%0A`;
    }
    message += `*Grand Total: ৳${getGrandTotal()}*%0A%0A`;
    
    message += `*Customer Info:*%0A`;
    message += `Name: ${checkoutData.name}%0A`;
    message += `Phone: ${checkoutData.phone}%0A`;
    message += `Address: ${checkoutData.address}%0A`;
    message += `Payment Method: ${checkoutData.paymentMethod}`;

    const whatsappNumber = settings.whatsappPrimary || process.env.REACT_APP_WHATSAPP_PRIMARY;
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    
    // Clear cart and checkout data
    setCart([]);
    setCheckoutData({ name: '', phone: '', address: '', paymentMethod: '' });
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading Fenzo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setCurrentPage={setCurrentPage}
        facebookPage={settings.facebookPage || process.env.REACT_APP_FACEBOOK_PAGE}
      />
      
      {currentPage === 'home' && (
        <HomePage 
          products={searchProducts()}
          setSelectedProduct={setSelectedProduct}
          setCurrentPage={setCurrentPage}
        />
      )}
      
      {currentPage === 'product' && (
        <ProductPage 
          product={selectedProduct}
          setCurrentPage={setCurrentPage}
          addToCart={addToCart}
        />
      )}
      
      {currentPage === 'cart' && (
        <CartPage 
          cart={cart}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          getDeliveryCharge={getDeliveryCharge}
          getGrandTotal={getGrandTotal}
          setCurrentPage={setCurrentPage}
          settings={settings}
        />
      )}
      
      {currentPage === 'checkout' && (
        <CheckoutPage 
          cart={cart}
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
          getTotalPrice={getTotalPrice}
          getDeliveryCharge={getDeliveryCharge}
          getGrandTotal={getGrandTotal}
          handleCheckout={handleCheckout}
        />
      )}
      
      <WhatsAppButton 
        primaryNumber={settings.whatsappPrimary || process.env.REACT_APP_WHATSAPP_PRIMARY}
        secondaryNumber={settings.whatsappSecondary || process.env.REACT_APP_WHATSAPP_SECONDARY}
      />
    </div>
  );
};

export default FenzoEcommerce;