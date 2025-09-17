import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertOrderSchema, 
  insertUserSchema, 
  insertStoreSchema, 
  insertStoreCategorySchema,
  insertItemCategorySchema,
  insertTaxSchema,
  insertItemSchema,
  insertItemPriceSchema,
  insertComboSchema,
  insertComboItemSchema,
  insertComboPriceSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      // In a real implementation, this would fetch all users
      res.json({ message: "Admin users endpoint", data: [] });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.json({ message: "User created successfully", data: user });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.get("/api/admin/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json({ message: "Products fetched successfully", data: products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.json({ message: "Product created successfully", data: product });
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.put("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const product = await storage.updateProduct(id, updateData);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product updated successfully", data: product });
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Store Categories routes
  app.get("/api/admin/store-categories", async (req, res) => {
    try {
      const categories = await storage.getStoreCategories();
      res.json({ message: "Store categories fetched successfully", data: categories });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch store categories" });
    }
  });

  app.post("/api/admin/store-categories", async (req, res) => {
    try {
      const categoryData = insertStoreCategorySchema.parse(req.body);
      const category = await storage.createStoreCategory(categoryData);
      res.json({ message: "Store category created successfully", data: category });
    } catch (error) {
      res.status(400).json({ message: "Invalid store category data" });
    }
  });

  app.put("/api/admin/store-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const category = await storage.updateStoreCategory(id, updateData);
      if (!category) {
        return res.status(404).json({ message: "Store category not found" });
      }
      res.json({ message: "Store category updated successfully", data: category });
    } catch (error) {
      res.status(400).json({ message: "Failed to update store category" });
    }
  });

  app.delete("/api/admin/store-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStoreCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Store category not found" });
      }
      res.json({ message: "Store category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete store category" });
    }
  });

  // Stores routes
  app.get("/api/admin/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json({ message: "Stores fetched successfully", data: stores });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stores" });
    }
  });

  app.get("/api/admin/stores/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const store = await storage.getStore(id);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json({ message: "Store fetched successfully", data: store });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch store" });
    }
  });

  app.post("/api/admin/stores", async (req, res) => {
    try {
      const storeData = insertStoreSchema.parse(req.body);
      const store = await storage.createStore(storeData);
      res.json({ message: "Store created successfully", data: store });
    } catch (error) {
      res.status(400).json({ message: "Invalid store data" });
    }
  });

  app.put("/api/admin/stores/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const store = await storage.updateStore(id, updateData);
      if (!store) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json({ message: "Store updated successfully", data: store });
    } catch (error) {
      res.status(400).json({ message: "Failed to update store" });
    }
  });

  app.delete("/api/admin/stores/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteStore(id);
      if (!success) {
        return res.status(404).json({ message: "Store not found" });
      }
      res.json({ message: "Store deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete store" });
    }
  });

  // Item Categories routes
  app.get("/api/admin/item-categories", async (req, res) => {
    try {
      const categories = await storage.getItemCategories();
      res.json({ message: "Item categories fetched successfully", data: categories });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item categories" });
    }
  });

  app.post("/api/admin/item-categories", async (req, res) => {
    try {
      const categoryData = insertItemCategorySchema.parse(req.body);
      const category = await storage.createItemCategory(categoryData);
      res.json({ message: "Item category created successfully", data: category });
    } catch (error) {
      res.status(400).json({ message: "Invalid item category data" });
    }
  });

  app.put("/api/admin/item-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const category = await storage.updateItemCategory(id, updateData);
      if (!category) {
        return res.status(404).json({ message: "Item category not found" });
      }
      res.json({ message: "Item category updated successfully", data: category });
    } catch (error) {
      res.status(400).json({ message: "Failed to update item category" });
    }
  });

  app.delete("/api/admin/item-categories/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteItemCategory(id);
      if (!success) {
        return res.status(404).json({ message: "Item category not found" });
      }
      res.json({ message: "Item category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item category" });
    }
  });

  // Taxes routes
  app.get("/api/admin/taxes", async (req, res) => {
    try {
      const taxes = await storage.getTaxes();
      res.json({ message: "Taxes fetched successfully", data: taxes });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch taxes" });
    }
  });

  app.post("/api/admin/taxes", async (req, res) => {
    try {
      const taxData = insertTaxSchema.parse(req.body);
      const tax = await storage.createTax(taxData);
      res.json({ message: "Tax created successfully", data: tax });
    } catch (error) {
      res.status(400).json({ message: "Invalid tax data" });
    }
  });

  app.put("/api/admin/taxes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const tax = await storage.updateTax(id, updateData);
      if (!tax) {
        return res.status(404).json({ message: "Tax not found" });
      }
      res.json({ message: "Tax updated successfully", data: tax });
    } catch (error) {
      res.status(400).json({ message: "Failed to update tax" });
    }
  });

  app.delete("/api/admin/taxes/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteTax(id);
      if (!success) {
        return res.status(404).json({ message: "Tax not found" });
      }
      res.json({ message: "Tax deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tax" });
    }
  });

  // Items routes
  app.get("/api/admin/items", async (req, res) => {
    try {
      const items = await storage.getItems();
      res.json({ message: "Items fetched successfully", data: items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/admin/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item fetched successfully", data: item });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/admin/items", async (req, res) => {
    try {
      const itemData = insertItemSchema.parse(req.body);
      
      // Check for duplicate barcode or QR code
      if (itemData.barcode) {
        const existingByBarcode = await storage.getItemByBarcode(itemData.barcode);
        if (existingByBarcode) {
          return res.status(400).json({ message: "Item with this barcode already exists" });
        }
      }
      if (itemData.qrCode) {
        const existingByQr = await storage.getItemByQrCode(itemData.qrCode);
        if (existingByQr) {
          return res.status(400).json({ message: "Item with this QR code already exists" });
        }
      }

      const item = await storage.createItem(itemData);
      res.json({ message: "Item created successfully", data: item });
    } catch (error) {
      res.status(400).json({ message: "Invalid item data" });
    }
  });

  app.put("/api/admin/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // Check for duplicate barcode or QR code (excluding current item)
      if (updateData.barcode) {
        const existingByBarcode = await storage.getItemByBarcode(updateData.barcode);
        if (existingByBarcode && existingByBarcode.id !== id) {
          return res.status(400).json({ message: "Another item with this barcode already exists" });
        }
      }
      if (updateData.qrCode) {
        const existingByQr = await storage.getItemByQrCode(updateData.qrCode);
        if (existingByQr && existingByQr.id !== id) {
          return res.status(400).json({ message: "Another item with this QR code already exists" });
        }
      }

      const item = await storage.updateItem(id, updateData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item updated successfully", data: item });
    } catch (error) {
      res.status(400).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/admin/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteItem(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // Item Prices routes
  app.get("/api/admin/item-prices", async (req, res) => {
    try {
      const { itemId } = req.query;
      const prices = await storage.getItemPrices(itemId as string);
      res.json({ message: "Item prices fetched successfully", data: prices });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item prices" });
    }
  });

  app.post("/api/admin/item-prices", async (req, res) => {
    try {
      const priceData = insertItemPriceSchema.parse(req.body);
      const price = await storage.createItemPrice(priceData);
      res.json({ message: "Item price created successfully", data: price });
    } catch (error) {
      res.status(400).json({ message: "Invalid item price data" });
    }
  });

  app.put("/api/admin/item-prices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const price = await storage.updateItemPrice(id, updateData);
      if (!price) {
        return res.status(404).json({ message: "Item price not found" });
      }
      res.json({ message: "Item price updated successfully", data: price });
    } catch (error) {
      res.status(400).json({ message: "Failed to update item price" });
    }
  });

  app.delete("/api/admin/item-prices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteItemPrice(id);
      if (!success) {
        return res.status(404).json({ message: "Item price not found" });
      }
      res.json({ message: "Item price deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item price" });
    }
  });

  // Combos routes
  app.get("/api/admin/combos", async (req, res) => {
    try {
      const combos = await storage.getCombos();
      res.json({ message: "Combos fetched successfully", data: combos });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch combos" });
    }
  });

  app.get("/api/admin/combos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const combo = await storage.getCombo(id);
      if (!combo) {
        return res.status(404).json({ message: "Combo not found" });
      }
      res.json({ message: "Combo fetched successfully", data: combo });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch combo" });
    }
  });

  app.post("/api/admin/combos", async (req, res) => {
    try {
      const comboData = insertComboSchema.parse(req.body);
      const combo = await storage.createCombo(comboData);
      res.json({ message: "Combo created successfully", data: combo });
    } catch (error) {
      res.status(400).json({ message: "Invalid combo data" });
    }
  });

  app.put("/api/admin/combos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const combo = await storage.updateCombo(id, updateData);
      if (!combo) {
        return res.status(404).json({ message: "Combo not found" });
      }
      res.json({ message: "Combo updated successfully", data: combo });
    } catch (error) {
      res.status(400).json({ message: "Failed to update combo" });
    }
  });

  app.delete("/api/admin/combos/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteCombo(id);
      if (!success) {
        return res.status(404).json({ message: "Combo not found" });
      }
      res.json({ message: "Combo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete combo" });
    }
  });

  // Combo Items routes
  app.get("/api/admin/combo-items/:comboId", async (req, res) => {
    try {
      const { comboId } = req.params;
      const items = await storage.getComboItems(comboId);
      res.json({ message: "Combo items fetched successfully", data: items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch combo items" });
    }
  });

  app.post("/api/admin/combo-items", async (req, res) => {
    try {
      const comboItemData = insertComboItemSchema.parse(req.body);
      const comboItem = await storage.createComboItem(comboItemData);
      res.json({ message: "Combo item created successfully", data: comboItem });
    } catch (error) {
      res.status(400).json({ message: "Invalid combo item data" });
    }
  });

  app.delete("/api/admin/combo-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteComboItem(id);
      if (!success) {
        return res.status(404).json({ message: "Combo item not found" });
      }
      res.json({ message: "Combo item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete combo item" });
    }
  });

  // Combo Prices routes
  app.get("/api/admin/combo-prices", async (req, res) => {
    try {
      const { comboId } = req.query;
      const prices = await storage.getComboPrices(comboId as string);
      res.json({ message: "Combo prices fetched successfully", data: prices });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch combo prices" });
    }
  });

  app.post("/api/admin/combo-prices", async (req, res) => {
    try {
      const priceData = insertComboPriceSchema.parse(req.body);
      const price = await storage.createComboPrice(priceData);
      res.json({ message: "Combo price created successfully", data: price });
    } catch (error) {
      res.status(400).json({ message: "Invalid combo price data" });
    }
  });

  app.put("/api/admin/combo-prices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const price = await storage.updateComboPrice(id, updateData);
      if (!price) {
        return res.status(404).json({ message: "Combo price not found" });
      }
      res.json({ message: "Combo price updated successfully", data: price });
    } catch (error) {
      res.status(400).json({ message: "Failed to update combo price" });
    }
  });

  app.delete("/api/admin/combo-prices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteComboPrice(id);
      if (!success) {
        return res.status(404).json({ message: "Combo price not found" });
      }
      res.json({ message: "Combo price deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete combo price" });
    }
  });

  // POS routes
  app.get("/api/pos/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json({ message: "POS products fetched successfully", data: products });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/pos/orders", async (req, res) => {
    try {
      const orderData = { ...req.body, type: "pos" };
      const validatedOrder = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrder);
      res.json({ message: "POS order created successfully", data: order });
    } catch (error) {
      res.status(400).json({ message: "Invalid order data" });
    }
  });

  app.get("/api/pos/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders("pos");
      res.json({ message: "POS orders fetched successfully", data: orders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch POS orders" });
    }
  });

  // Wholesale routes
  app.get("/api/wholesale/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      // Return products with wholesale pricing
      const wholesaleProducts = products.map(product => ({
        ...product,
        price: product.wholesalePrice || product.price
      }));
      res.json({ message: "Wholesale products fetched successfully", data: wholesaleProducts });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wholesale products" });
    }
  });

  app.post("/api/wholesale/orders", async (req, res) => {
    try {
      const orderData = { ...req.body, type: "wholesale" };
      const validatedOrder = insertOrderSchema.parse(orderData);
      const order = await storage.createOrder(validatedOrder);
      res.json({ message: "Wholesale order created successfully", data: order });
    } catch (error) {
      res.status(400).json({ message: "Invalid wholesale order data" });
    }
  });

  app.get("/api/wholesale/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders("wholesale");
      res.json({ message: "Wholesale orders fetched successfully", data: orders });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wholesale orders" });
    }
  });

  // General dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const products = await storage.getProducts();
      const posOrders = await storage.getOrders("pos");
      const wholesaleOrders = await storage.getOrders("wholesale");
      
      const stats = {
        totalProducts: products.length,
        posOrders: posOrders.length,
        wholesaleOrders: wholesaleOrders.length,
        totalOrders: posOrders.length + wholesaleOrders.length,
      };
      
      res.json({ message: "Dashboard stats fetched successfully", data: stats });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
