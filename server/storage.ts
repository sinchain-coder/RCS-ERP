import { 
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct, 
  type Order, 
  type InsertOrder, 
  type OrderItem, 
  type InsertOrderItem,
  type Store,
  type InsertStore,
  type StoreCategory,
  type InsertStoreCategory 
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product management
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;
  
  // Order management
  getOrders(type?: string): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  
  // Order items
  getOrderItems(orderId: string): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Store categories
  getStoreCategories(): Promise<StoreCategory[]>;
  getStoreCategory(id: string): Promise<StoreCategory | undefined>;
  createStoreCategory(category: InsertStoreCategory): Promise<StoreCategory>;
  updateStoreCategory(id: string, category: Partial<InsertStoreCategory>): Promise<StoreCategory | undefined>;
  deleteStoreCategory(id: string): Promise<boolean>;

  // Stores
  getStores(): Promise<Store[]>;
  getStore(id: string): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: string, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private storeCategories: Map<string, StoreCategory>;
  private stores: Map<string, Store>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.storeCategories = new Map();
    this.stores = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample products for Indian sweets business
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        name: "Gulab Jamun",
        category: "sweets",
        price: "12.99",
        wholesalePrice: "10.99",
        stock: 50,
        description: "Traditional sweet made with milk solids",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Samosa",
        category: "snacks",
        price: "2.99",
        wholesalePrice: "2.49",
        stock: 100,
        description: "Crispy fried pastry with savory filling",
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Laddu",
        category: "sweets",
        price: "8.99",
        wholesalePrice: "7.49",
        stock: 75,
        description: "Round sweet made with flour and sugar",
        isActive: true,
        createdAt: new Date(),
      }
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      wholesalePrice: insertProduct.wholesalePrice || null,
      stock: insertProduct.stock || 0,
      isActive: insertProduct.isActive ?? true,
      createdAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updateData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct: Product = {
      ...product,
      ...updateData,
    };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  async getOrders(type?: string): Promise<Order[]> {
    const orders = Array.from(this.orders.values());
    return type ? orders.filter(order => order.type === type) : orders;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      ...insertOrder,
      id,
      status: insertOrder.status || "pending",
      customerName: insertOrder.customerName || null,
      customerPhone: insertOrder.customerPhone || null,
      createdAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status,
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      ...insertOrderItem,
      id,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Store category methods
  async getStoreCategories(): Promise<StoreCategory[]> {
    return Array.from(this.storeCategories.values());
  }

  async getStoreCategory(id: string): Promise<StoreCategory | undefined> {
    return this.storeCategories.get(id);
  }

  async createStoreCategory(insertCategory: InsertStoreCategory): Promise<StoreCategory> {
    const id = randomUUID();
    const category: StoreCategory = {
      ...insertCategory,
      id,
      image: insertCategory.image || null,
      color: insertCategory.color || null,
      shape: insertCategory.shape || null,
      isActive: insertCategory.isActive ?? true,
      createdAt: new Date(),
    };
    this.storeCategories.set(id, category);
    return category;
  }

  async updateStoreCategory(id: string, updateData: Partial<InsertStoreCategory>): Promise<StoreCategory | undefined> {
    const category = this.storeCategories.get(id);
    if (!category) return undefined;

    const updatedCategory: StoreCategory = {
      ...category,
      ...updateData,
    };
    this.storeCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteStoreCategory(id: string): Promise<boolean> {
    return this.storeCategories.delete(id);
  }

  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getStore(id: string): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = randomUUID();
    const store: Store = {
      ...insertStore,
      id,
      categoryId: insertStore.categoryId || null,
      upiQrCode: insertStore.upiQrCode || null,
      isActive: insertStore.isActive ?? true,
      createdAt: new Date(),
    };
    this.stores.set(id, store);
    return store;
  }

  async updateStore(id: string, updateData: Partial<InsertStore>): Promise<Store | undefined> {
    const store = this.stores.get(id);
    if (!store) return undefined;

    const updatedStore: Store = {
      ...store,
      ...updateData,
    };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  async deleteStore(id: string): Promise<boolean> {
    return this.stores.delete(id);
  }
}

export const storage = new MemStorage();
