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
  type InsertStoreCategory,
  type ItemCategory,
  type InsertItemCategory,
  type Tax,
  type InsertTax,
  type Item,
  type InsertItem,
  type ItemPrice,
  type InsertItemPrice,
  type Combo,
  type InsertCombo,
  type ComboItem,
  type InsertComboItem,
  type ComboPrice,
  type InsertComboPrice
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

  // Item categories
  getItemCategories(): Promise<ItemCategory[]>;
  getItemCategory(id: string): Promise<ItemCategory | undefined>;
  createItemCategory(category: InsertItemCategory): Promise<ItemCategory>;
  updateItemCategory(id: string, category: Partial<InsertItemCategory>): Promise<ItemCategory | undefined>;
  deleteItemCategory(id: string): Promise<boolean>;

  // Taxes
  getTaxes(): Promise<Tax[]>;
  getTax(id: string): Promise<Tax | undefined>;
  createTax(tax: InsertTax): Promise<Tax>;
  updateTax(id: string, tax: Partial<InsertTax>): Promise<Tax | undefined>;
  deleteTax(id: string): Promise<boolean>;

  // Items
  getItems(): Promise<Item[]>;
  getItem(id: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: string, item: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: string): Promise<boolean>;
  getItemByBarcode(barcode: string): Promise<Item | undefined>;
  getItemByQrCode(qrCode: string): Promise<Item | undefined>;

  // Item prices
  getItemPrices(itemId?: string): Promise<ItemPrice[]>;
  getItemPrice(id: string): Promise<ItemPrice | undefined>;
  createItemPrice(price: InsertItemPrice): Promise<ItemPrice>;
  updateItemPrice(id: string, price: Partial<InsertItemPrice>): Promise<ItemPrice | undefined>;
  deleteItemPrice(id: string): Promise<boolean>;

  // Combos
  getCombos(): Promise<Combo[]>;
  getCombo(id: string): Promise<Combo | undefined>;
  createCombo(combo: InsertCombo): Promise<Combo>;
  updateCombo(id: string, combo: Partial<InsertCombo>): Promise<Combo | undefined>;
  deleteCombo(id: string): Promise<boolean>;

  // Combo items
  getComboItems(comboId: string): Promise<ComboItem[]>;
  createComboItem(comboItem: InsertComboItem): Promise<ComboItem>;
  updateComboItem(id: string, comboItem: Partial<InsertComboItem>): Promise<ComboItem | undefined>;
  deleteComboItem(id: string): Promise<boolean>;

  // Combo prices
  getComboPrices(comboId?: string): Promise<ComboPrice[]>;
  createComboPrice(price: InsertComboPrice): Promise<ComboPrice>;
  updateComboPrice(id: string, price: Partial<InsertComboPrice>): Promise<ComboPrice | undefined>;
  deleteComboPrice(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private storeCategories: Map<string, StoreCategory>;
  private stores: Map<string, Store>;
  private itemCategories: Map<string, ItemCategory>;
  private taxes: Map<string, Tax>;
  private items: Map<string, Item>;
  private itemPrices: Map<string, ItemPrice>;
  private combos: Map<string, Combo>;
  private comboItems: Map<string, ComboItem>;
  private comboPrices: Map<string, ComboPrice>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.storeCategories = new Map();
    this.stores = new Map();
    this.itemCategories = new Map();
    this.taxes = new Map();
    this.items = new Map();
    this.itemPrices = new Map();
    this.combos = new Map();
    this.comboItems = new Map();
    this.comboPrices = new Map();
    
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
    // Check for duplicate name
    const existingByName = Array.from(this.storeCategories.values())
      .find(cat => cat.name.toLowerCase() === insertCategory.name.toLowerCase());
    if (existingByName) {
      throw new Error(`Store category with name '${insertCategory.name}' already exists`);
    }

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

    // Check for duplicate name (excluding current category)
    if (updateData.name) {
      const existingByName = Array.from(this.storeCategories.values())
        .find(cat => cat.id !== id && cat.name.toLowerCase() === updateData.name!.toLowerCase());
      if (existingByName) {
        throw new Error(`Another store category with name '${updateData.name}' already exists`);
      }
    }

    const updatedCategory: StoreCategory = {
      ...category,
      ...updateData,
    };
    this.storeCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteStoreCategory(id: string): Promise<boolean> {
    // Check if category is used by stores
    const usedByStores = Array.from(this.stores.values())
      .some(store => store.categoryId === id);
    if (usedByStores) {
      throw new Error('Cannot delete store category because it is used by one or more stores');
    }

    // Check if category is used by item prices
    const usedByItemPrices = Array.from(this.itemPrices.values())
      .some(price => price.storeCategoryId === id);
    if (usedByItemPrices) {
      throw new Error('Cannot delete store category because it has associated item prices');
    }

    // Check if category is used by combo prices
    const usedByComboPrices = Array.from(this.comboPrices.values())
      .some(price => price.storeCategoryId === id);
    if (usedByComboPrices) {
      throw new Error('Cannot delete store category because it has associated combo prices');
    }

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
    // Validate store pin uniqueness
    const existingByPin = Array.from(this.stores.values())
      .find(store => store.storePin === insertStore.storePin);
    if (existingByPin) {
      throw new Error(`Store with PIN '${insertStore.storePin}' already exists`);
    }

    // Validate referenced store category exists
    if (insertStore.categoryId) {
      const category = await this.getStoreCategory(insertStore.categoryId);
      if (!category) {
        throw new Error(`Store category with ID '${insertStore.categoryId}' does not exist`);
      }
    }

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

    // Validate store pin uniqueness (excluding current store)
    if (updateData.storePin) {
      const existingByPin = Array.from(this.stores.values())
        .find(s => s.id !== id && s.storePin === updateData.storePin);
      if (existingByPin) {
        throw new Error(`Another store with PIN '${updateData.storePin}' already exists`);
      }
    }

    // Validate referenced store category exists
    if (updateData.categoryId) {
      const category = await this.getStoreCategory(updateData.categoryId);
      if (!category) {
        throw new Error(`Store category with ID '${updateData.categoryId}' does not exist`);
      }
    }

    const updatedStore: Store = {
      ...store,
      ...updateData,
    };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }

  async deleteStore(id: string): Promise<boolean> {
    // For now, we don't have direct foreign key constraints to stores
    // But in the future, we might want to check for orders linked to stores
    return this.stores.delete(id);
  }

  // Item category methods
  async getItemCategories(): Promise<ItemCategory[]> {
    return Array.from(this.itemCategories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getItemCategory(id: string): Promise<ItemCategory | undefined> {
    return this.itemCategories.get(id);
  }

  async createItemCategory(insertCategory: InsertItemCategory): Promise<ItemCategory> {
    // Check for duplicate name
    const existingByName = Array.from(this.itemCategories.values())
      .find(cat => cat.name.toLowerCase() === insertCategory.name.toLowerCase());
    if (existingByName) {
      throw new Error(`Item category with name '${insertCategory.name}' already exists`);
    }

    const id = randomUUID();
    const category: ItemCategory = {
      ...insertCategory,
      id,
      image: insertCategory.image || null,
      color: insertCategory.color || null,
      shape: insertCategory.shape || null,
      sortOrder: insertCategory.sortOrder || 0,
      isActive: insertCategory.isActive ?? true,
      createdAt: new Date(),
    };
    this.itemCategories.set(id, category);
    return category;
  }

  async updateItemCategory(id: string, updateData: Partial<InsertItemCategory>): Promise<ItemCategory | undefined> {
    const category = this.itemCategories.get(id);
    if (!category) return undefined;

    // Check for duplicate name (excluding current category)
    if (updateData.name) {
      const existingByName = Array.from(this.itemCategories.values())
        .find(cat => cat.id !== id && cat.name.toLowerCase() === updateData.name!.toLowerCase());
      if (existingByName) {
        throw new Error(`Another item category with name '${updateData.name}' already exists`);
      }
    }

    const updatedCategory: ItemCategory = {
      ...category,
      ...updateData,
    };
    this.itemCategories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteItemCategory(id: string): Promise<boolean> {
    // Check if category is used by items
    const usedByItems = Array.from(this.items.values())
      .some(item => item.categoryIds && item.categoryIds.includes(id));
    if (usedByItems) {
      throw new Error('Cannot delete item category because it is used by one or more items');
    }

    // Check if category is used by combos
    const usedByCombos = Array.from(this.combos.values())
      .some(combo => combo.categoryIds && combo.categoryIds.includes(id));
    if (usedByCombos) {
      throw new Error('Cannot delete item category because it is used by one or more combos');
    }

    return this.itemCategories.delete(id);
  }

  // Tax methods
  async getTaxes(): Promise<Tax[]> {
    return Array.from(this.taxes.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getTax(id: string): Promise<Tax | undefined> {
    return this.taxes.get(id);
  }

  async createTax(insertTax: InsertTax): Promise<Tax> {
    // Check for duplicate name
    const existingByName = Array.from(this.taxes.values())
      .find(tax => tax.name.toLowerCase() === insertTax.name.toLowerCase());
    if (existingByName) {
      throw new Error(`Tax with name '${insertTax.name}' already exists`);
    }

    // Validate tax rate bounds
    const rate = parseFloat(insertTax.rate);
    if (rate < 0 || rate > 100) {
      throw new Error('Tax rate must be between 0% and 100%');
    }

    const id = randomUUID();
    const tax: Tax = {
      ...insertTax,
      id,
      sortOrder: insertTax.sortOrder || 0,
      isActive: insertTax.isActive ?? true,
      createdAt: new Date(),
    };
    this.taxes.set(id, tax);
    return tax;
  }

  async updateTax(id: string, updateData: Partial<InsertTax>): Promise<Tax | undefined> {
    const tax = this.taxes.get(id);
    if (!tax) return undefined;

    // Check for duplicate name (excluding current tax)
    if (updateData.name) {
      const existingByName = Array.from(this.taxes.values())
        .find(t => t.id !== id && t.name.toLowerCase() === updateData.name!.toLowerCase());
      if (existingByName) {
        throw new Error(`Another tax with name '${updateData.name}' already exists`);
      }
    }

    // Validate tax rate bounds if being updated
    if (updateData.rate !== undefined) {
      const rate = parseFloat(updateData.rate);
      if (rate < 0 || rate > 100) {
        throw new Error('Tax rate must be between 0% and 100%');
      }
    }

    const updatedTax: Tax = {
      ...tax,
      ...updateData,
    };
    this.taxes.set(id, updatedTax);
    return updatedTax;
  }

  async deleteTax(id: string): Promise<boolean> {
    // Check if tax is used by items
    const usedByItems = Array.from(this.items.values())
      .some(item => item.taxIds && item.taxIds.includes(id));
    if (usedByItems) {
      throw new Error('Cannot delete tax because it is used by one or more items');
    }

    // Check if tax is used by combos
    const usedByCombos = Array.from(this.combos.values())
      .some(combo => combo.taxIds && combo.taxIds.includes(id));
    if (usedByCombos) {
      throw new Error('Cannot delete tax because it is used by one or more combos');
    }

    return this.taxes.delete(id);
  }

  // Item methods
  async getItems(): Promise<Item[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<Item | undefined> {
    return this.items.get(id);
  }

  async createItem(insertItem: InsertItem): Promise<Item> {
    // Validate barcode uniqueness
    if (insertItem.barcode) {
      const existingByBarcode = await this.getItemByBarcode(insertItem.barcode);
      if (existingByBarcode) {
        throw new Error(`Item with barcode '${insertItem.barcode}' already exists`);
      }
    }

    // Validate QR code uniqueness
    if (insertItem.qrCode) {
      const existingByQr = await this.getItemByQrCode(insertItem.qrCode);
      if (existingByQr) {
        throw new Error(`Item with QR code '${insertItem.qrCode}' already exists`);
      }
    }

    // Validate referenced categories exist
    if (insertItem.categoryIds) {
      for (const categoryId of insertItem.categoryIds) {
        const category = await this.getItemCategory(categoryId);
        if (!category) {
          throw new Error(`Item category with ID '${categoryId}' does not exist`);
        }
      }
    }

    // Validate referenced taxes exist
    if (insertItem.taxIds) {
      for (const taxId of insertItem.taxIds) {
        const tax = await this.getTax(taxId);
        if (!tax) {
          throw new Error(`Tax with ID '${taxId}' does not exist`);
        }
      }
    }

    // Validate bounds
    if (insertItem.masterPackSize && insertItem.masterPackSize < 1) {
      throw new Error('Master pack size must be at least 1');
    }
    if (insertItem.lowStockValue && insertItem.lowStockValue < 0) {
      throw new Error('Low stock value cannot be negative');
    }

    const id = randomUUID();
    const item: Item = {
      ...insertItem,
      id,
      barcode: insertItem.barcode || null,
      qrCode: insertItem.qrCode || null,
      soldBy: insertItem.soldBy || "piece",
      masterPackSize: insertItem.masterPackSize || 1,
      lowStockValue: insertItem.lowStockValue || 10,
      image: insertItem.image || null,
      color: insertItem.color || null,
      shape: insertItem.shape || null,
      categoryIds: insertItem.categoryIds || [],
      taxIds: insertItem.taxIds || [],
      isActive: insertItem.isActive ?? true,
      createdAt: new Date(),
    };
    this.items.set(id, item);
    return item;
  }

  async updateItem(id: string, updateData: Partial<InsertItem>): Promise<Item | undefined> {
    const item = this.items.get(id);
    if (!item) return undefined;

    // Validate barcode uniqueness (excluding current item)
    if (updateData.barcode) {
      const existingByBarcode = await this.getItemByBarcode(updateData.barcode);
      if (existingByBarcode && existingByBarcode.id !== id) {
        throw new Error(`Another item with barcode '${updateData.barcode}' already exists`);
      }
    }

    // Validate QR code uniqueness (excluding current item)
    if (updateData.qrCode) {
      const existingByQr = await this.getItemByQrCode(updateData.qrCode);
      if (existingByQr && existingByQr.id !== id) {
        throw new Error(`Another item with QR code '${updateData.qrCode}' already exists`);
      }
    }

    // Validate referenced categories exist
    if (updateData.categoryIds) {
      for (const categoryId of updateData.categoryIds) {
        const category = await this.getItemCategory(categoryId);
        if (!category) {
          throw new Error(`Item category with ID '${categoryId}' does not exist`);
        }
      }
    }

    // Validate referenced taxes exist
    if (updateData.taxIds) {
      for (const taxId of updateData.taxIds) {
        const tax = await this.getTax(taxId);
        if (!tax) {
          throw new Error(`Tax with ID '${taxId}' does not exist`);
        }
      }
    }

    // Validate bounds
    if (updateData.masterPackSize && updateData.masterPackSize < 1) {
      throw new Error('Master pack size must be at least 1');
    }
    if (updateData.lowStockValue && updateData.lowStockValue < 0) {
      throw new Error('Low stock value cannot be negative');
    }

    const updatedItem: Item = {
      ...item,
      ...updateData,
    };
    this.items.set(id, updatedItem);
    return updatedItem;
  }

  async deleteItem(id: string): Promise<boolean> {
    // Check if item is used by item prices
    const usedByItemPrices = Array.from(this.itemPrices.values())
      .some(price => price.itemId === id);
    if (usedByItemPrices) {
      throw new Error('Cannot delete item because it has associated prices');
    }

    // Check if item is used by combo items
    const usedByComboItems = Array.from(this.comboItems.values())
      .some(comboItem => comboItem.itemId === id);
    if (usedByComboItems) {
      throw new Error('Cannot delete item because it is used in one or more combos');
    }

    return this.items.delete(id);
  }

  async getItemByBarcode(barcode: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(item => item.barcode === barcode);
  }

  async getItemByQrCode(qrCode: string): Promise<Item | undefined> {
    return Array.from(this.items.values()).find(item => item.qrCode === qrCode);
  }

  // Item price methods
  async getItemPrices(itemId?: string): Promise<ItemPrice[]> {
    const prices = Array.from(this.itemPrices.values());
    return itemId ? prices.filter(price => price.itemId === itemId) : prices;
  }

  async getItemPrice(id: string): Promise<ItemPrice | undefined> {
    return this.itemPrices.get(id);
  }

  async createItemPrice(insertPrice: InsertItemPrice): Promise<ItemPrice> {
    // Validate referenced item exists
    const item = await this.getItem(insertPrice.itemId);
    if (!item) {
      throw new Error(`Item with ID '${insertPrice.itemId}' does not exist`);
    }

    // Validate referenced store category exists
    const storeCategory = await this.getStoreCategory(insertPrice.storeCategoryId);
    if (!storeCategory) {
      throw new Error(`Store category with ID '${insertPrice.storeCategoryId}' does not exist`);
    }

    // Check for duplicate price entry (same item + store category)
    const existingPrice = Array.from(this.itemPrices.values())
      .find(p => p.itemId === insertPrice.itemId && p.storeCategoryId === insertPrice.storeCategoryId);
    if (existingPrice) {
      throw new Error('Price already exists for this item and store category combination');
    }

    // Validate price values
    const sellPrice = parseFloat(insertPrice.sellPrice);
    if (sellPrice <= 0) {
      throw new Error('Sell price must be greater than 0');
    }

    if (insertPrice.purchasePrice) {
      const purchasePrice = parseFloat(insertPrice.purchasePrice);
      if (purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than 0');
      }
    }

    const id = randomUUID();
    const price: ItemPrice = {
      ...insertPrice,
      id,
      purchasePrice: insertPrice.purchasePrice || null,
      isAvailable: insertPrice.isAvailable ?? true,
    };
    this.itemPrices.set(id, price);
    return price;
  }

  async updateItemPrice(id: string, updateData: Partial<InsertItemPrice>): Promise<ItemPrice | undefined> {
    const price = this.itemPrices.get(id);
    if (!price) return undefined;

    // Validate referenced item exists if being updated
    if (updateData.itemId) {
      const item = await this.getItem(updateData.itemId);
      if (!item) {
        throw new Error(`Item with ID '${updateData.itemId}' does not exist`);
      }
    }

    // Validate referenced store category exists if being updated
    if (updateData.storeCategoryId) {
      const storeCategory = await this.getStoreCategory(updateData.storeCategoryId);
      if (!storeCategory) {
        throw new Error(`Store category with ID '${updateData.storeCategoryId}' does not exist`);
      }
    }

    // Check for duplicate if item or store category being changed
    if (updateData.itemId || updateData.storeCategoryId) {
      const newItemId = updateData.itemId || price.itemId;
      const newStoreCategoryId = updateData.storeCategoryId || price.storeCategoryId;
      
      const existingPrice = Array.from(this.itemPrices.values())
        .find(p => p.id !== id && p.itemId === newItemId && p.storeCategoryId === newStoreCategoryId);
      if (existingPrice) {
        throw new Error('Another price already exists for this item and store category combination');
      }
    }

    // Validate price values
    if (updateData.sellPrice !== undefined) {
      const sellPrice = parseFloat(updateData.sellPrice);
      if (sellPrice <= 0) {
        throw new Error('Sell price must be greater than 0');
      }
    }

    if (updateData.purchasePrice) {
      const purchasePrice = parseFloat(updateData.purchasePrice);
      if (purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than 0');
      }
    }

    const updatedPrice: ItemPrice = {
      ...price,
      ...updateData,
    };
    this.itemPrices.set(id, updatedPrice);
    return updatedPrice;
  }

  async deleteItemPrice(id: string): Promise<boolean> {
    return this.itemPrices.delete(id);
  }

  // Combo methods
  async getCombos(): Promise<Combo[]> {
    return Array.from(this.combos.values());
  }

  async getCombo(id: string): Promise<Combo | undefined> {
    return this.combos.get(id);
  }

  async createCombo(insertCombo: InsertCombo): Promise<Combo> {
    // Validate referenced categories exist
    if (insertCombo.categoryIds) {
      for (const categoryId of insertCombo.categoryIds) {
        const category = await this.getItemCategory(categoryId);
        if (!category) {
          throw new Error(`Item category with ID '${categoryId}' does not exist`);
        }
      }
    }

    // Validate referenced taxes exist
    if (insertCombo.taxIds) {
      for (const taxId of insertCombo.taxIds) {
        const tax = await this.getTax(taxId);
        if (!tax) {
          throw new Error(`Tax with ID '${taxId}' does not exist`);
        }
      }
    }

    const id = randomUUID();
    const combo: Combo = {
      ...insertCombo,
      id,
      image: insertCombo.image || null,
      color: insertCombo.color || null,
      shape: insertCombo.shape || null,
      categoryIds: insertCombo.categoryIds || [],
      taxIds: insertCombo.taxIds || [],
      isComboOnly: insertCombo.isComboOnly ?? false,
      isActive: insertCombo.isActive ?? true,
      createdAt: new Date(),
    };
    this.combos.set(id, combo);
    return combo;
  }

  async updateCombo(id: string, updateData: Partial<InsertCombo>): Promise<Combo | undefined> {
    const combo = this.combos.get(id);
    if (!combo) return undefined;

    // Validate referenced categories exist
    if (updateData.categoryIds) {
      for (const categoryId of updateData.categoryIds) {
        const category = await this.getItemCategory(categoryId);
        if (!category) {
          throw new Error(`Item category with ID '${categoryId}' does not exist`);
        }
      }
    }

    // Validate referenced taxes exist
    if (updateData.taxIds) {
      for (const taxId of updateData.taxIds) {
        const tax = await this.getTax(taxId);
        if (!tax) {
          throw new Error(`Tax with ID '${taxId}' does not exist`);
        }
      }
    }

    const updatedCombo: Combo = {
      ...combo,
      ...updateData,
    };
    this.combos.set(id, updatedCombo);
    return updatedCombo;
  }

  async deleteCombo(id: string): Promise<boolean> {
    // Check if combo has associated items
    const hasComboItems = Array.from(this.comboItems.values())
      .some(comboItem => comboItem.comboId === id);
    if (hasComboItems) {
      throw new Error('Cannot delete combo because it has associated items');
    }

    // Check if combo has associated prices
    const hasComboPrices = Array.from(this.comboPrices.values())
      .some(price => price.comboId === id);
    if (hasComboPrices) {
      throw new Error('Cannot delete combo because it has associated prices');
    }

    return this.combos.delete(id);
  }

  // Combo item methods
  async getComboItems(comboId: string): Promise<ComboItem[]> {
    return Array.from(this.comboItems.values()).filter(item => item.comboId === comboId);
  }

  async createComboItem(insertComboItem: InsertComboItem): Promise<ComboItem> {
    // Validate referenced combo exists
    const combo = await this.getCombo(insertComboItem.comboId);
    if (!combo) {
      throw new Error(`Combo with ID '${insertComboItem.comboId}' does not exist`);
    }

    // Validate referenced item exists
    const item = await this.getItem(insertComboItem.itemId);
    if (!item) {
      throw new Error(`Item with ID '${insertComboItem.itemId}' does not exist`);
    }

    // Check for duplicate combo item (same combo + item)
    const existingComboItem = Array.from(this.comboItems.values())
      .find(ci => ci.comboId === insertComboItem.comboId && ci.itemId === insertComboItem.itemId);
    if (existingComboItem) {
      throw new Error('Item is already added to this combo');
    }

    // Validate quantity
    if (insertComboItem.quantity && insertComboItem.quantity < 1) {
      throw new Error('Quantity must be at least 1');
    }

    const id = randomUUID();
    const comboItem: ComboItem = {
      ...insertComboItem,
      id,
      quantity: insertComboItem.quantity || 1,
    };
    this.comboItems.set(id, comboItem);
    return comboItem;
  }

  async updateComboItem(id: string, updateData: Partial<InsertComboItem>): Promise<ComboItem | undefined> {
    const comboItem = this.comboItems.get(id);
    if (!comboItem) return undefined;

    const updatedComboItem: ComboItem = {
      ...comboItem,
      ...updateData,
    };
    this.comboItems.set(id, updatedComboItem);
    return updatedComboItem;
  }

  async deleteComboItem(id: string): Promise<boolean> {
    return this.comboItems.delete(id);
  }

  // Combo price methods
  async getComboPrices(comboId?: string): Promise<ComboPrice[]> {
    const prices = Array.from(this.comboPrices.values());
    return comboId ? prices.filter(price => price.comboId === comboId) : prices;
  }

  async createComboPrice(insertPrice: InsertComboPrice): Promise<ComboPrice> {
    // Validate referenced combo exists
    const combo = await this.getCombo(insertPrice.comboId);
    if (!combo) {
      throw new Error(`Combo with ID '${insertPrice.comboId}' does not exist`);
    }

    // Validate referenced store category exists
    const storeCategory = await this.getStoreCategory(insertPrice.storeCategoryId);
    if (!storeCategory) {
      throw new Error(`Store category with ID '${insertPrice.storeCategoryId}' does not exist`);
    }

    // Check for duplicate price entry (same combo + store category)
    const existingPrice = Array.from(this.comboPrices.values())
      .find(p => p.comboId === insertPrice.comboId && p.storeCategoryId === insertPrice.storeCategoryId);
    if (existingPrice) {
      throw new Error('Price already exists for this combo and store category combination');
    }

    // Validate price values
    const sellPrice = parseFloat(insertPrice.sellPrice);
    if (sellPrice <= 0) {
      throw new Error('Sell price must be greater than 0');
    }

    if (insertPrice.purchasePrice) {
      const purchasePrice = parseFloat(insertPrice.purchasePrice);
      if (purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than 0');
      }
    }

    const id = randomUUID();
    const price: ComboPrice = {
      ...insertPrice,
      id,
      purchasePrice: insertPrice.purchasePrice || null,
      isAvailable: insertPrice.isAvailable ?? true,
    };
    this.comboPrices.set(id, price);
    return price;
  }

  async updateComboPrice(id: string, updateData: Partial<InsertComboPrice>): Promise<ComboPrice | undefined> {
    const price = this.comboPrices.get(id);
    if (!price) return undefined;

    // Validate referenced combo exists if being updated
    if (updateData.comboId) {
      const combo = await this.getCombo(updateData.comboId);
      if (!combo) {
        throw new Error(`Combo with ID '${updateData.comboId}' does not exist`);
      }
    }

    // Validate referenced store category exists if being updated
    if (updateData.storeCategoryId) {
      const storeCategory = await this.getStoreCategory(updateData.storeCategoryId);
      if (!storeCategory) {
        throw new Error(`Store category with ID '${updateData.storeCategoryId}' does not exist`);
      }
    }

    // Check for duplicate if combo or store category being changed
    if (updateData.comboId || updateData.storeCategoryId) {
      const newComboId = updateData.comboId || price.comboId;
      const newStoreCategoryId = updateData.storeCategoryId || price.storeCategoryId;
      
      const existingPrice = Array.from(this.comboPrices.values())
        .find(p => p.id !== id && p.comboId === newComboId && p.storeCategoryId === newStoreCategoryId);
      if (existingPrice) {
        throw new Error('Another price already exists for this combo and store category combination');
      }
    }

    // Validate price values
    if (updateData.sellPrice !== undefined) {
      const sellPrice = parseFloat(updateData.sellPrice);
      if (sellPrice <= 0) {
        throw new Error('Sell price must be greater than 0');
      }
    }

    if (updateData.purchasePrice) {
      const purchasePrice = parseFloat(updateData.purchasePrice);
      if (purchasePrice <= 0) {
        throw new Error('Purchase price must be greater than 0');
      }
    }

    const updatedPrice: ComboPrice = {
      ...price,
      ...updateData,
    };
    this.comboPrices.set(id, updatedPrice);
    return updatedPrice;
  }

  async deleteComboPrice(id: string): Promise<boolean> {
    return this.comboPrices.delete(id);
  }
}

export const storage = new MemStorage();
