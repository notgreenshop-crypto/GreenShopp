import { 
  collection, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from '../config/firebase';

class FirebaseService {
  /**
   * Fetch all products from Firestore
   * @returns {Promise<Array>} Array of product objects
   */
  async getProducts() {
    try {
      const productsCol = collection(db, 'products');
      const q = query(productsCol, orderBy('createdAt', 'desc'));
      const productsSnapshot = await getDocs(q);
      
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Fetched ${products.length} products`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching products:', error);
      return [];
    }
  }

  /**
   * Fetch a single product by ID
   * @param {string} productId - The product ID
   * @returns {Promise<Object|null>} Product object or null
   */
  async getProduct(productId) {
    try {
      const productDoc = doc(db, 'products', productId);
      const productSnapshot = await getDoc(productDoc);
      
      if (productSnapshot.exists()) {
        const product = {
          id: productSnapshot.id,
          ...productSnapshot.data()
        };
        console.log(`✅ Fetched product: ${product.name}`);
        return product;
      } else {
        console.warn(`⚠️ Product not found: ${productId}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching product:', error);
      return null;
    }
  }

  /**
   * Search products by name or code
   * @param {string} searchQuery - Search term
   * @returns {Promise<Array>} Array of matching products
   */
  async searchProducts(searchQuery) {
    try {
      const productsCol = collection(db, 'products');
      
      // Search by name
      const qName = query(
        productsCol,
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff'),
        limit(20)
      );
      
      // Search by code
      const qCode = query(
        productsCol,
        where('code', '>=', searchQuery.toUpperCase()),
        where('code', '<=', searchQuery.toUpperCase() + '\uf8ff'),
        limit(20)
      );
      
      const [nameSnapshot, codeSnapshot] = await Promise.all([
        getDocs(qName),
        getDocs(qCode)
      ]);
      
      const results = new Map();
      
      nameSnapshot.docs.forEach(doc => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      codeSnapshot.docs.forEach(doc => {
        results.set(doc.id, { id: doc.id, ...doc.data() });
      });
      
      const products = Array.from(results.values());
      console.log(`✅ Found ${products.length} products for "${searchQuery}"`);
      return products;
    } catch (error) {
      console.error('❌ Error searching products:', error);
      return [];
    }
  }

  /**
   * Fetch app settings (payment methods, etc.)
   * @returns {Promise<Object>} Settings object
   */
  async getSettings() {
    try {
      const settingsDoc = doc(db, 'settings', 'app');
      const settingsSnapshot = await getDoc(settingsDoc);
      
      if (settingsSnapshot.exists()) {
        const settings = settingsSnapshot.data();
        console.log('✅ Fetched app settings');
        return settings;
      }
      
      console.warn('⚠️ Settings not found, using defaults');
      return {
        bKash: true,
        Nagad: true,
        cod: true,
        whatsappPrimary: process.env.REACT_APP_WHATSAPP_PRIMARY,
        whatsappSecondary: process.env.REACT_APP_WHATSAPP_SECONDARY,
        facebookPage: process.env.REACT_APP_FACEBOOK_PAGE
      };
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return {
        bKash: true,
        Nagad: true,
        cod: true,
        whatsappPrimary: process.env.REACT_APP_WHATSAPP_PRIMARY,
        whatsappSecondary: process.env.REACT_APP_WHATSAPP_SECONDARY,
        facebookPage: process.env.REACT_APP_FACEBOOK_PAGE
      };
    }
  }

  /**
   * Fetch featured products
   * @param {number} count - Number of products to fetch
   * @returns {Promise<Array>} Array of featured products
   */
  async getFeaturedProducts(count = 8) {
    try {
      const productsCol = collection(db, 'products');
      const q = query(
        productsCol,
        where('featured', '==', true),
        orderBy('createdAt', 'desc'),
        limit(count)
      );
      
      const productsSnapshot = await getDocs(q);
      const products = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Fetched ${products.length} featured products`);
      return products;
    } catch (error) {
      console.error('❌ Error fetching featured products:', error);
      // Fallback to regular products if featured query fails
      return this.getProducts();
    }
  }
}

// Export singleton instance
// Export singleton instance
const firebaseServiceInstance = new FirebaseService();
export default firebaseServiceInstance;