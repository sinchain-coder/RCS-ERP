import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"), // admin, pos_user, wholesale_user
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // sweets, snacks, beverages
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  wholesalePrice: decimal("wholesale_price", { precision: 10, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  type: text("type").notNull(), // pos, wholesale
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const storeCategories = pgTable("store_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  image: text("image"), // Optional image URL
  color: text("color"), // Optional color for visual representation
  shape: text("shape"), // Optional shape for visual representation
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  categoryId: varchar("category_id").references(() => storeCategories.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  pincode: text("pincode").notNull(),
  state: text("state").notNull(),
  phone: text("phone").notNull(),
  storePin: text("store_pin").notNull(), // Used for POS login
  upiQrCode: text("upi_qr_code"), // UPI QR Code data/URL
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const itemCategories = pgTable("item_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  image: text("image"), // Optional image URL
  color: text("color"), // Optional color for visual representation
  shape: text("shape"), // Optional shape for visual representation
  sortOrder: integer("sort_order").notNull().default(0), // For POS ordering
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const taxes = pgTable("taxes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  rate: decimal("rate", { precision: 5, scale: 2 }).notNull(), // Tax percentage
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  displayName: text("display_name").notNull(), // Shown on POS
  barcode: text("barcode"), // Either barcode OR qrCode, not both
  qrCode: text("qr_code"), // Either barcode OR qrCode, not both
  soldBy: text("sold_by").notNull().default("piece"), // "piece" or "weight"
  masterPackSize: integer("master_pack_size").notNull().default(1),
  lowStockValue: integer("low_stock_value").notNull().default(10),
  image: text("image"), // Image URL OR use color + shape
  color: text("color"), // Optional color for visual representation
  shape: text("shape"), // Optional shape for visual representation
  categoryIds: text("category_ids").array(), // Multiple categories (array of IDs)
  taxIds: text("tax_ids").array(), // Multiple taxes (array of IDs)
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const itemPrices = pgTable("item_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: varchar("item_id").notNull().references(() => items.id),
  storeCategoryId: varchar("store_category_id").notNull().references(() => storeCategories.id),
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const combos = pgTable("combos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productName: text("product_name").notNull(),
  displayName: text("display_name").notNull(),
  image: text("image"),
  color: text("color"),
  shape: text("shape"),
  categoryIds: text("category_ids").array(),
  taxIds: text("tax_ids").array(),
  isComboOnly: boolean("is_combo_only").notNull().default(false), // Hidden from POS if true
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comboItems = pgTable("combo_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  comboId: varchar("combo_id").notNull().references(() => combos.id),
  itemId: varchar("item_id").notNull().references(() => items.id),
  quantity: integer("quantity").notNull().default(1),
});

export const comboPrices = pgTable("combo_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  comboId: varchar("combo_id").notNull().references(() => combos.id),
  storeCategoryId: varchar("store_category_id").notNull().references(() => storeCategories.id),
  sellPrice: decimal("sell_price", { precision: 10, scale: 2 }).notNull(),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }),
  isAvailable: boolean("is_available").notNull().default(true),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertStoreCategorySchema = createInsertSchema(storeCategories).omit({
  id: true,
  createdAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
  createdAt: true,
});

export const insertItemCategorySchema = createInsertSchema(itemCategories).omit({
  id: true,
  createdAt: true,
});

export const insertTaxSchema = createInsertSchema(taxes).omit({
  id: true,
  createdAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
}).refine(
  (data) => {
    // XOR validation: either barcode OR qrCode, not both
    const hasBarcode = data.barcode && data.barcode.trim() !== '';
    const hasQrCode = data.qrCode && data.qrCode.trim() !== '';
    return !(hasBarcode && hasQrCode); // Both cannot be present
  },
  {
    message: "Cannot have both barcode and QR code. Choose one or neither.",
    path: ["barcode"], // Show error on barcode field
  }
);

export const insertItemPriceSchema = createInsertSchema(itemPrices).omit({
  id: true,
});

export const insertComboSchema = createInsertSchema(combos).omit({
  id: true,
  createdAt: true,
});

export const insertComboItemSchema = createInsertSchema(comboItems).omit({
  id: true,
});

export const insertComboPriceSchema = createInsertSchema(comboPrices).omit({
  id: true,
});

// Dispatch Management Tables
export const dispatches = pgTable("dispatches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").references(() => orders.id), // Optional - can be independent dispatch
  type: text("type").notNull(), // "pos", "wholesale", "independent"
  status: text("status").notNull().default("pending"), // pending, in_progress, partially_dispatched, dispatched, delivered, cancelled
  currentStep: text("current_step").notNull().default("order_received"), // For step progression
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  storeId: varchar("store_id").references(() => stores.id), // For POS orders
  totalItems: integer("total_items").notNull().default(0),
  dispatchedItems: integer("dispatched_items").notNull().default(0),
  acknowledgementPhoto: text("acknowledgement_photo"), // For wholesale orders
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const dispatchItems = pgTable("dispatch_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchId: varchar("dispatch_id").notNull().references(() => dispatches.id),
  itemId: varchar("item_id").references(() => items.id), // For new item system
  productId: varchar("product_id").references(() => products.id), // For legacy products
  orderItemId: varchar("order_item_id").references(() => orderItems.id), // Link to original order item
  itemName: text("item_name").notNull(),
  orderedQuantity: integer("ordered_quantity").notNull(),
  dispatchedQuantity: integer("dispatched_quantity").notNull().default(0),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  isChecked: boolean("is_checked").notNull().default(false), // For checklist UI
  notes: text("notes"),
});

export const dispatchSteps = pgTable("dispatch_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dispatchId: varchar("dispatch_id").notNull().references(() => dispatches.id),
  stepName: text("step_name").notNull(), // order_received, printed, checked, dispatched, delivered, etc.
  stepOrder: integer("step_order").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  completedBy: varchar("completed_by").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDispatchSchema = createInsertSchema(dispatches).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDispatchItemSchema = createInsertSchema(dispatchItems).omit({
  id: true,
});

export const insertDispatchStepSchema = createInsertSchema(dispatchSteps).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertStoreCategory = z.infer<typeof insertStoreCategorySchema>;
export type StoreCategory = typeof storeCategories.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertItemCategory = z.infer<typeof insertItemCategorySchema>;
export type ItemCategory = typeof itemCategories.$inferSelect;
export type InsertTax = z.infer<typeof insertTaxSchema>;
export type Tax = typeof taxes.$inferSelect;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;
export type InsertItemPrice = z.infer<typeof insertItemPriceSchema>;
export type ItemPrice = typeof itemPrices.$inferSelect;
export type InsertCombo = z.infer<typeof insertComboSchema>;
export type Combo = typeof combos.$inferSelect;
export type InsertComboItem = z.infer<typeof insertComboItemSchema>;
export type ComboItem = typeof comboItems.$inferSelect;
export type InsertComboPrice = z.infer<typeof insertComboPriceSchema>;
export type ComboPrice = typeof comboPrices.$inferSelect;
export type InsertDispatch = z.infer<typeof insertDispatchSchema>;
export type Dispatch = typeof dispatches.$inferSelect;
export type InsertDispatchItem = z.infer<typeof insertDispatchItemSchema>;
export type DispatchItem = typeof dispatchItems.$inferSelect;
export type InsertDispatchStep = z.infer<typeof insertDispatchStepSchema>;
export type DispatchStep = typeof dispatchSteps.$inferSelect;
