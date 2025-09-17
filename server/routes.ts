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
  insertComboPriceSchema,
  insertDispatchSchema,
  insertDispatchItemSchema,
  insertDispatchStepSchema,
  updateDispatchItemQuantitySchema,
  updateDispatchStepSchema,
  dispatchTypeEnum,
  dispatchStatusEnum,
  posStepEnum,
  wholesaleStepEnum,
  independentStepEnum
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
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Store category creation error:', error);
        res.status(400).json({ message: "Invalid store category data" });
      }
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
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Store category update error:', error);
        res.status(400).json({ message: "Failed to update store category" });
      }
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
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Store category deletion error:', error);
        res.status(500).json({ message: "Failed to delete store category" });
      }
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
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('does not exist')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Store creation error:', error);
          res.status(400).json({ message: "Invalid store data" });
        }
      } else {
        console.error('Store creation error:', error);
        res.status(400).json({ message: "Invalid store data" });
      }
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
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('does not exist')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Store update error:', error);
          res.status(400).json({ message: "Failed to update store" });
        }
      } else {
        console.error('Store update error:', error);
        res.status(400).json({ message: "Failed to update store" });
      }
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
      if (error instanceof Error && error.message.includes('already exists')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Item category creation error:', error);
        res.status(400).json({ message: "Invalid item category data" });
      }
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
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Item category deletion error:', error);
        res.status(500).json({ message: "Failed to delete item category" });
      }
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
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('must be between')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Tax creation error:', error);
          res.status(400).json({ message: "Invalid tax data" });
        }
      } else {
        console.error('Tax creation error:', error);
        res.status(400).json({ message: "Invalid tax data" });
      }
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
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('must be between')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Tax update error:', error);
          res.status(400).json({ message: "Failed to update tax" });
        }
      } else {
        console.error('Tax update error:', error);
        res.status(400).json({ message: "Failed to update tax" });
      }
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
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Tax deletion error:', error);
        res.status(500).json({ message: "Failed to delete tax" });
      }
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
      const item = await storage.createItem(itemData);
      res.json({ message: "Item created successfully", data: item });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('does not exist')) {
          res.status(400).json({ message: error.message });
        } else if (error.message.includes('must be at least') || error.message.includes('cannot be negative')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Item creation error:', error);
          res.status(400).json({ message: "Invalid item data" });
        }
      } else {
        console.error('Item creation error:', error);
        res.status(400).json({ message: "Invalid item data" });
      }
    }
  });

  app.put("/api/admin/items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const item = await storage.updateItem(id, updateData);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json({ message: "Item updated successfully", data: item });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already exists')) {
          res.status(409).json({ message: error.message });
        } else if (error.message.includes('does not exist')) {
          res.status(400).json({ message: error.message });
        } else if (error.message.includes('must be at least') || error.message.includes('cannot be negative')) {
          res.status(400).json({ message: error.message });
        } else {
          console.error('Item update error:', error);
          res.status(400).json({ message: "Failed to update item" });
        }
      } else {
        console.error('Item update error:', error);
        res.status(400).json({ message: "Failed to update item" });
      }
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
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(409).json({ message: error.message });
      } else {
        console.error('Item deletion error:', error);
        res.status(500).json({ message: "Failed to delete item" });
      }
    }
  });

  // Check barcode availability
  app.get("/api/admin/items/check-barcode/:barcode", async (req, res) => {
    try {
      const { barcode } = req.params;
      const existingItem = await storage.getItemByBarcode(barcode);
      res.json({ 
        available: !existingItem,
        existingItem: existingItem || null,
        message: existingItem ? "Barcode already exists" : "Barcode is available"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check barcode availability" });
    }
  });

  // Check QR code availability
  app.get("/api/admin/items/check-qr/:qr", async (req, res) => {
    try {
      const { qr } = req.params;
      const existingItem = await storage.getItemByQrCode(qr);
      res.json({ 
        available: !existingItem,
        existingItem: existingItem || null,
        message: existingItem ? "QR code already exists" : "QR code is available"
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to check QR code availability" });
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

  // Dispatch Management routes
  app.get("/api/admin/dispatches", async (req, res) => {
    try {
      const { type, status, orderId } = req.query;
      let dispatches;
      
      if (orderId) {
        dispatches = await storage.getDispatchesByOrder(orderId as string);
      } else if (status) {
        // Validate status using Zod enum
        const validatedStatus = dispatchStatusEnum.parse(status);
        dispatches = await storage.getDispatchesByStatus(validatedStatus);
      } else if (type) {
        // Validate type using Zod enum
        const validatedType = dispatchTypeEnum.parse(type);
        dispatches = await storage.getDispatches(validatedType);
      } else {
        dispatches = await storage.getDispatches();
      }
      
      res.json({ message: "Dispatches fetched successfully", data: dispatches });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispatches" });
    }
  });

  app.get("/api/admin/dispatches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const dispatch = await storage.getDispatch(id);
      if (!dispatch) {
        return res.status(404).json({ message: "Dispatch not found" });
      }
      res.json({ message: "Dispatch fetched successfully", data: dispatch });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispatch" });
    }
  });

  app.post("/api/admin/dispatches", async (req, res) => {
    try {
      const dispatchData = insertDispatchSchema.parse(req.body);
      const dispatch = await storage.createDispatch(dispatchData);
      res.json({ message: "Dispatch created successfully", data: dispatch });
    } catch (error) {
      res.status(400).json({ message: "Invalid dispatch data" });
    }
  });

  app.put("/api/admin/dispatches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const dispatch = await storage.updateDispatch(id, updateData);
      if (!dispatch) {
        return res.status(404).json({ message: "Dispatch not found" });
      }
      res.json({ message: "Dispatch updated successfully", data: dispatch });
    } catch (error) {
      res.status(400).json({ message: "Failed to update dispatch" });
    }
  });

  app.delete("/api/admin/dispatches/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteDispatch(id);
      if (!success) {
        return res.status(404).json({ message: "Dispatch not found" });
      }
      res.json({ message: "Dispatch deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete dispatch" });
    }
  });

  app.put("/api/admin/dispatches/:id/step", async (req, res) => {
    try {
      const { id } = req.params;
      const { stepName } = req.body;
      const dispatch = await storage.updateDispatchCurrentStep(id, stepName);
      if (!dispatch) {
        return res.status(404).json({ message: "Dispatch not found" });
      }
      res.json({ message: "Dispatch step updated successfully", data: dispatch });
    } catch (error) {
      res.status(400).json({ message: "Failed to update dispatch step" });
    }
  });

  app.post("/api/admin/dispatches/:id/initialize-steps", async (req, res) => {
    try {
      const { id } = req.params;
      const dispatch = await storage.getDispatch(id);
      if (!dispatch) {
        return res.status(404).json({ message: "Dispatch not found" });
      }

      // Validate dispatch type
      if (!['pos', 'wholesale', 'independent'].includes(dispatch.type)) {
        return res.status(400).json({ message: "Invalid dispatch type" });
      }

      const steps = await storage.initializeDispatchSteps(id, dispatch.type as 'pos' | 'wholesale' | 'independent');
      res.json({ message: "Dispatch steps initialized successfully", data: steps });
    } catch (error) {
      console.error('Initialize dispatch steps error:', error);
      res.status(400).json({ message: "Failed to initialize dispatch steps" });
    }
  });

  // Dispatch Items routes
  app.get("/api/admin/dispatch-items/:dispatchId", async (req, res) => {
    try {
      const { dispatchId } = req.params;
      const items = await storage.getDispatchItems(dispatchId);
      res.json({ message: "Dispatch items fetched successfully", data: items });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispatch items" });
    }
  });

  app.post("/api/admin/dispatch-items", async (req, res) => {
    try {
      const itemData = insertDispatchItemSchema.parse(req.body);
      const item = await storage.createDispatchItem(itemData);
      res.json({ message: "Dispatch item created successfully", data: item });
    } catch (error) {
      res.status(400).json({ message: "Invalid dispatch item data" });
    }
  });

  app.put("/api/admin/dispatch-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const item = await storage.updateDispatchItem(id, updateData);
      if (!item) {
        return res.status(404).json({ message: "Dispatch item not found" });
      }
      res.json({ message: "Dispatch item updated successfully", data: item });
    } catch (error) {
      res.status(400).json({ message: "Failed to update dispatch item" });
    }
  });

  app.put("/api/admin/dispatch-items/:id/quantity", async (req, res) => {
    try {
      const { id } = req.params;
      const { quantity } = updateDispatchItemQuantitySchema.parse(req.body);
      const item = await storage.updateDispatchItemQuantity(id, quantity);
      if (!item) {
        return res.status(404).json({ message: "Dispatch item not found" });
      }
      res.json({ message: "Dispatch item quantity updated successfully", data: item });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(400).json({ message: "Failed to update quantity" });
      }
    }
  });

  app.put("/api/admin/dispatch-items/:id/toggle", async (req, res) => {
    try {
      const { id } = req.params;
      const item = await storage.toggleDispatchItemCheck(id);
      if (!item) {
        return res.status(404).json({ message: "Dispatch item not found" });
      }
      res.json({ message: "Dispatch item check toggled successfully", data: item });
    } catch (error) {
      res.status(400).json({ message: "Failed to toggle item check" });
    }
  });

  // Dispatch Steps routes
  app.get("/api/admin/dispatch-steps/:dispatchId", async (req, res) => {
    try {
      const { dispatchId } = req.params;
      const steps = await storage.getDispatchSteps(dispatchId);
      res.json({ message: "Dispatch steps fetched successfully", data: steps });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dispatch steps" });
    }
  });

  app.put("/api/admin/dispatch-steps/:id/complete", async (req, res) => {
    try {
      const { id } = req.params;
      const { completedBy } = req.body;
      const step = await storage.completeDispatchStep(id, completedBy);
      if (!step) {
        return res.status(404).json({ message: "Dispatch step not found" });
      }
      res.json({ message: "Dispatch step completed successfully", data: step });
    } catch (error) {
      res.status(400).json({ message: "Failed to complete dispatch step" });
    }
  });

  app.post("/api/admin/dispatches/from-order/:orderId", async (req, res) => {
    try {
      const { orderId } = req.params;
      const { type } = req.body;
      
      // Get order details
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const orderItems = await storage.getOrderItems(orderId);
      
      // Create dispatch from order
      const dispatchData = insertDispatchSchema.parse({
        orderId,
        type: type || order.type,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        totalItems: orderItems.length,
        status: "pending"
      });

      const dispatch = await storage.createDispatch(dispatchData);

      // Create dispatch items from order items
      for (const orderItem of orderItems) {
        await storage.createDispatchItem({
          dispatchId: dispatch.id,
          orderItemId: orderItem.id,
          productId: orderItem.productId,
          itemName: orderItem.productId, // Will need to resolve product name
          orderedQuantity: orderItem.quantity,
          unitPrice: orderItem.unitPrice.toString(),
          isChecked: false
        });
      }

      res.json({ message: "Dispatch created from order successfully", data: dispatch });
    } catch (error) {
      res.status(400).json({ message: "Failed to create dispatch from order" });
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
      const { items, ...orderFields } = req.body;
      const orderData = { ...orderFields, type: "wholesale" };
      const validatedOrder = insertOrderSchema.parse(orderData);
      
      // Create the order first
      const order = await storage.createOrder(validatedOrder);
      
      // Create order items if items array is provided
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const orderItemData = {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.price.toString(), // Convert to string for decimal type
            subtotal: (item.quantity * item.price).toFixed(2), // Calculate subtotal
          };
          
          await storage.createOrderItem(orderItemData);
        }
      }
      
      res.json({ message: "Wholesale order created successfully", data: order });
    } catch (error) {
      console.error("Wholesale order creation error:", error);
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
