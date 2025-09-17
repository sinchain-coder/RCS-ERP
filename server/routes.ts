import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertUserSchema } from "@shared/schema";

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
