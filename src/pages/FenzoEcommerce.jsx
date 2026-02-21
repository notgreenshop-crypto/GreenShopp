import React, { useState, useEffect, useCallback } from 'react';
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
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [checkoutData, setCheckoutData] = useState({
    name: '',
    phone: '',
    address: '',
    paymentMethod: ''
  });

  const location = useLocation();
  const navigate = useNavigate();

  // URL sync
  useEffect(()=>{
    const p = location.pathname;

    if (p === '/cart') setCurrentPage('cart');
    else if (p === '/checkout') setCurrentPage('checkout');
    else if (p.startsWith('/product/')) {
      const id = decodeURIComponent(p.split('/').pop());
      const found = products.find(x => String(x.id||x.code) === id);
      if (found) {
        setSelectedProduct(found);
        setCurrentPage('product');
      }
    } else setCurrentPage('home');

  }, [location.pathname, products]);

  // Navigation sync
  useEffect(()=>{
    if (currentPage === 'cart') navigate('/cart');
    else if (currentPage === 'checkout') navigate('/checkout');
    else if (currentPage === 'product' && selectedProduct){
      const pid = encodeURIComponent(String(selectedProduct.id||selectedProduct.code));
      navigate('/product/'+pid);
    }
    else if (currentPage === 'home') navigate('/');
  }, [currentPage, selectedProduct, navigate]);

  const loadInitialData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const searchProducts = () => {
    if (!searchQuery.trim()) return products;
    const q = searchQuery.toLowerCase();
    const filtered = products.filter(p =>
      String(p.name||'').toLowerCase().includes(q) ||
      String(p.code||'').toLowerCase().includes(q) ||
      String(p.description||p.details||'').toLowerCase().includes(q)
    );
    return filtered.length ? filtered : products;
  };

  const addToCart = (product, size, color) => {
    const cartItem = {
      ...product,
      selectedSize: size,
      selectedColor: color,
      quantity: 1,
      cartId: `${product.id}-${size}-${color}-${Date.now()}`
    };
    setCart(prev => [...prev, cartItem]);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const getTotalPrice = () =>
    cart.reduce((sum, item) => {
      const unit = effectivePrice(item, settings);
      const quantity = Number(item.quantity) || 1;
      return sum + (unit * quantity);
    }, 0);

  const getDeliveryCharge = () => {
    if (!cart.length) return 0;
    const totalPrice = getTotalPrice();
    const threshold = Number(settings.freeDeliveryThreshold) || 1000;
    const deliveryEnabled = settings.deliveryChargeEnabled !== false;

    if (!deliveryEnabled || totalPrice >= threshold) return 0;

    return Math.max(...cart.map(item => Number(item.deliveryCharge)||0));
  };

  const getGrandTotal = () =>
    getTotalPrice() + getDeliveryCharge();

  const handleCheckout = () => {
    let message = '*New Order from Fenzo*%0A%0A';

    cart.forEach((item, idx) => {
      message += `*Product ${idx+1}:*%0A`;
      message += `Name: ${item.name}%0A`;
      message += `Code: ${item.code}%0A`;
      message += `Price: ৳${effectivePrice(item, settings)}%0A`;
      message += `Size: ${item.selectedSize}%0A`;
      message += `Color: ${item.selectedColor}%0A`;
      message += `Quantity: ${item.quantity}%0A%0A`;
    });

    message += `*Grand Total: ৳${getGrandTotal()}*%0A%0A`;
    message += `Name: ${checkoutData.name}%0A`;
    message += `Phone: ${checkoutData.phone}%0A`;
    message += `Address: ${checkoutData.address}%0A`;
    message += `Payment: ${checkoutData.paymentMethod}`;

    const whatsappNumber =
      settings.whatsappPrimary ||
      process.env.REACT_APP_WHATSAPP_PRIMARY;

    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');

    setCart([]);
    setCheckoutData({ name:'', phone:'', address:'', paymentMethod:'' });
    setCurrentPage('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading Fenzo...
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        cart={cart}
        setCurrentPage={setCurrentPage}
        facebookPage={settings.facebookPage}
      />

      {currentPage === 'home' &&
        <HomePage
          products={searchProducts()}
          setSelectedProduct={setSelectedProduct}
          setCurrentPage={setCurrentPage}
        />
      }

      {currentPage === 'product' &&
        <ProductPage
          product={selectedProduct}
          setCurrentPage={setCurrentPage}
          addToCart={addToCart}
        />
      }

      {currentPage === 'cart' &&
        <CartPage
          cart={cart}
          removeFromCart={removeFromCart}
          getTotalPrice={getTotalPrice}
          getDeliveryCharge={getDeliveryCharge}
          getGrandTotal={getGrandTotal}
          setCurrentPage={setCurrentPage}
          settings={settings}
        />
      }

      {currentPage === 'checkout' &&
        <CheckoutPage
          cart={cart}
          checkoutData={checkoutData}
          setCheckoutData={setCheckoutData}
          getTotalPrice={getTotalPrice}
          getDeliveryCharge={getDeliveryCharge}
          getGrandTotal={getGrandTotal}
          handleCheckout={handleCheckout}
        />
      }

      <WhatsAppButton
        primaryNumber={settings.whatsappPrimary}
        secondaryNumber={settings.whatsappSecondary}
      />
    </div>
  );
};

export default FenzoEcommerce;
