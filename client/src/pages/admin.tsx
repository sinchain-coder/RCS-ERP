import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Package, BarChart3, Settings, Store as StoreIcon, Clipboard, LayoutDashboard, Plus, Edit, Trash2, Search, Filter, Eye, X, Tag, List, Calculator, Target } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Product, Store, StoreCategory, InsertStore, InsertStoreCategory, Item, ItemCategory, Tax, InsertItem, InsertItemCategory, InsertTax, InsertItemPrice } from "@shared/schema";
import { insertStoreSchema, insertStoreCategorySchema, insertItemSchema, insertItemCategorySchema, insertTaxSchema, insertItemPriceSchema } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [itemMasterTab, setItemMasterTab] = useState("create-item");
  const [storeDetailView, setStoreDetailView] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats } = useQuery<{data: {totalProducts: number, posOrders: number, wholesaleOrders: number, totalOrders: number}}>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: products } = useQuery<{data: Product[]}>({
    queryKey: ["/api/admin/products"],
  });

  const { data: stores } = useQuery<{data: Store[]}>({
    queryKey: ["/api/admin/stores"],
  });

  const { data: storeCategories } = useQuery<{data: StoreCategory[]}>({
    queryKey: ["/api/admin/store-categories"],
  });

  const productList = (products?.data as Product[]) || [];
  const storeList = (stores?.data as Store[]) || [];
  const categoryList = (storeCategories?.data as StoreCategory[]) || [];
  const dashboardStats = stats?.data || { totalProducts: 0, posOrders: 0, wholesaleOrders: 0, totalOrders: 0 };

  // Store form
  const storeForm = useForm<InsertStore>({
    resolver: zodResolver(insertStoreSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      address: "",
      city: "",
      pincode: "",
      state: "",
      phone: "",
      storePin: "",
      upiQrCode: "",
      isActive: true,
    },
  });

  // Edit store form
  const editStoreForm = useForm<InsertStore>({
    resolver: zodResolver(insertStoreSchema),
  });

  // Category form
  const categoryForm = useForm<InsertStoreCategory>({
    resolver: zodResolver(insertStoreCategorySchema),
    defaultValues: {
      name: "",
      color: "#3B82F6",
      image: "",
      shape: "",
      isActive: true,
    },
  });

  // Edit category form
  const editCategoryForm = useForm<InsertStoreCategory>({
    resolver: zodResolver(insertStoreCategorySchema),
  });

  // Item Master queries
  const { data: itemCategories } = useQuery<{data: ItemCategory[]}>({
    queryKey: ["/api/admin/item-categories"],
  });

  const { data: taxes } = useQuery<{data: Tax[]}>({
    queryKey: ["/api/admin/taxes"],
  });

  const { data: items } = useQuery<{data: Item[]}>({
    queryKey: ["/api/admin/items"],
  });

  const itemCategoriesList = (itemCategories?.data as ItemCategory[]) || [];
  const taxesList = (taxes?.data as Tax[]) || [];
  const itemsList = (items?.data as Item[]) || [];

  // Item form state
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedTaxes, setSelectedTaxes] = useState<string[]>([]);
  const [itemPrices, setItemPrices] = useState<Array<{storeCategoryId: string, sellPrice: string, purchasePrice: string, isAvailable: boolean}>>([]);
  const [barcodeDuplicate, setBarcodeDuplicate] = useState<string>("");
  const [qrCodeDuplicate, setQrCodeDuplicate] = useState<string>("");
  
  // Items list management state
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [itemCategoryFilter, setItemCategoryFilter] = useState<string>("");
  const [editSelectedCategories, setEditSelectedCategories] = useState<string[]>([]);
  const [editSelectedTaxes, setEditSelectedTaxes] = useState<string[]>([]);
  const [editItemPrices, setEditItemPrices] = useState<Array<{storeCategoryId: string, sellPrice: string, purchasePrice: string, isAvailable: boolean}>>([]);
  
  // Duplicate checking functions
  const checkBarcodeUnique = async (barcode: string) => {
    if (!barcode.trim()) {
      setBarcodeDuplicate("");
      return;
    }
    try {
      const response = await apiRequest(`/api/admin/items/check-barcode?barcode=${encodeURIComponent(barcode)}`, "GET");
      if (response.exists) {
        setBarcodeDuplicate("Item with this barcode already exists");
      } else {
        setBarcodeDuplicate("");
      }
    } catch (error) {
      console.error("Error checking barcode:", error);
    }
  };
  
  const checkQrCodeUnique = async (qrCode: string) => {
    if (!qrCode.trim()) {
      setQrCodeDuplicate("");
      return;
    }
    try {
      const response = await apiRequest(`/api/admin/items/check-qr?qrCode=${encodeURIComponent(qrCode)}`, "GET");
      if (response.exists) {
        setQrCodeDuplicate("Item with this QR code already exists");
      } else {
        setQrCodeDuplicate("");
      }
    } catch (error) {
      console.error("Error checking QR code:", error);
    }
  };

  // Create item form
  const itemForm = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
    defaultValues: {
      productName: "",
      displayName: "",
      barcode: "",
      qrCode: "",
      soldBy: "piece",
      masterPackSize: 1,
      lowStockValue: 10,
      image: "",
      color: "",
      shape: "",
      categoryIds: [],
      taxIds: [],
      isActive: true,
    },
  });

  // Mutations
  const createStoreMutation = useMutation({
    mutationFn: async (data: InsertStore) => {
      return apiRequest("/api/admin/stores", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      storeForm.reset();
      toast({ title: "🏪 Store Created", description: "New store location added successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to create store", variant: "destructive" });
    },
  });

  const deleteStoreMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/stores/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      toast({ title: "🗑️ Store Deleted", description: "Store removed successfully!" });
    },
  });

  const updateStoreStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/stores/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
    },
  });

  const updateStoreMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStore> }) => {
      return apiRequest(`/api/admin/stores/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] });
      setEditingStore(null);
      editStoreForm.reset();
      toast({ title: "🏪 Store Updated", description: "Store details updated successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to update store", variant: "destructive" });
    },
  });

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertStoreCategory) => {
      return apiRequest("/api/admin/store-categories", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store-categories"] });
      categoryForm.reset();
      toast({ title: "🏷️ Category Created", description: "New store category added successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to create category", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertStoreCategory> }) => {
      return apiRequest(`/api/admin/store-categories/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store-categories"] });
      setEditingCategory(null);
      editCategoryForm.reset();
      toast({ title: "🏷️ Category Updated", description: "Store category updated successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/store-categories/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/store-categories"] });
      toast({ title: "🗑️ Category Deleted", description: "Store category removed successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to delete category", variant: "destructive" });
    },
  });

  // Item Master mutations
  const createItemMutation = useMutation({
    mutationFn: async (data: InsertItem) => {
      // First create the item
      const itemResponse = await apiRequest("/api/admin/items", "POST", data);
      const createdItem = itemResponse.data;
      
      // Then create item prices if any are configured
      const validPrices = itemPrices.filter(price => 
        price.sellPrice && Number(price.sellPrice) > 0
      );
      
      if (validPrices.length > 0) {
        const pricesToCreate = validPrices.map(price => ({
          itemId: createdItem.id,
          storeCategoryId: price.storeCategoryId,
          sellPrice: price.sellPrice,
          purchasePrice: price.purchasePrice || null,
          isAvailable: price.isAvailable,
        }));
        
        await Promise.all(pricesToCreate.map(price => 
          apiRequest("/api/admin/item-prices", "POST", price)
        ));
      }
      
      return itemResponse;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/item-prices"] });
      itemForm.reset();
      setSelectedCategories([]);
      setSelectedTaxes([]);
      setItemPrices([]);
      setBarcodeDuplicate("");
      setQrCodeDuplicate("");
      toast({ title: "📦 Item Created", description: "New item with pricing added successfully!" });
    },
    onError: (error: any) => {
      if (error?.response?.data?.message?.includes("barcode")) {
        setBarcodeDuplicate("Item with this barcode already exists");
      }
      if (error?.response?.data?.message?.includes("QR code")) {
        setQrCodeDuplicate("Item with this QR code already exists");
      }
      toast({ title: "❌ Error", description: "Failed to create item", variant: "destructive" });
    },
  });

  const createItemPriceMutation = useMutation({
    mutationFn: async (prices: InsertItemPrice[]) => {
      return Promise.all(prices.map(price => apiRequest("/api/admin/item-prices", "POST", price)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/item-prices"] });
      toast({ title: "💰 Prices Set", description: "Item prices configured successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to set item prices", variant: "destructive" });
    },
  });

  // Edit item form
  const editItemForm = useForm<InsertItem>({
    resolver: zodResolver(insertItemSchema),
  });

  // Item update and delete mutations
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<InsertItem> }) => {
      return apiRequest(`/api/admin/items/${id}`, "PUT", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      setEditingItem(null);
      editItemForm.reset();
      setEditSelectedCategories([]);
      setEditSelectedTaxes([]);
      setEditItemPrices([]);
      toast({ title: "📦 Item Updated", description: "Item details updated successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to update item", variant: "destructive" });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/admin/items/${id}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
      toast({ title: "🗑️ Item Deleted", description: "Item removed successfully!" });
    },
    onError: () => {
      toast({ title: "❌ Error", description: "Failed to delete item", variant: "destructive" });
    },
  });

  const updateItemStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/admin/items/${id}`, "PUT", { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/items"] });
    },
  });

  const onStoreSubmit = (data: InsertStore) => {
    createStoreMutation.mutate(data);
  };

  const onEditStoreSubmit = (data: InsertStore) => {
    if (editingStore) {
      updateStoreMutation.mutate({ id: editingStore.id, data });
    }
  };

  const handleStoreStatusToggle = (storeId: string, isActive: boolean) => {
    updateStoreStatusMutation.mutate({ id: storeId, isActive });
  };

  const handleStoreDelete = (storeId: string) => {
    if (confirm("🗑️ Are you sure you want to delete this store?")) {
      deleteStoreMutation.mutate(storeId);
    }
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    editStoreForm.reset({
      name: store.name,
      categoryId: store.categoryId || "",
      address: store.address,
      city: store.city,
      pincode: store.pincode,
      state: store.state,
      phone: store.phone,
      storePin: store.storePin,
      upiQrCode: store.upiQrCode || "",
      isActive: store.isActive,
    });
  };

  const handleBulkDelete = () => {
    if (selectedStores.size === 0) return;
    if (confirm(`🗑️ Are you sure you want to delete ${selectedStores.size} selected stores?`)) {
      selectedStores.forEach(storeId => deleteStoreMutation.mutate(storeId));
      setSelectedStores(new Set());
    }
  };

  const filteredStores = storeList.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === "all" || store.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedStore = storeDetailView ? storeList.find(store => store.id === storeDetailView) : null;

  const onCategorySubmit = (data: InsertStoreCategory) => {
    createCategoryMutation.mutate(data);
  };
  
  const onItemSubmit = (data: InsertItem) => {
    // Prevent submission if there are duplicate errors
    if (barcodeDuplicate || qrCodeDuplicate) {
      toast({ 
        title: "⚠️ Validation Error", 
        description: "Please resolve duplicate barcode/QR code issues before saving.", 
        variant: "destructive" 
      });
      return;
    }
    
    // Update form data with selected categories and taxes
    const enhancedData = {
      ...data,
      categoryIds: selectedCategories,
      taxIds: selectedTaxes,
    };
    
    createItemMutation.mutate(enhancedData);
  };

  // Item management handlers
  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setEditSelectedCategories(item.categoryIds || []);
    setEditSelectedTaxes(item.taxIds || []);
    editItemForm.reset({
      productName: item.productName,
      displayName: item.displayName,
      barcode: item.barcode || "",
      qrCode: item.qrCode || "",
      soldBy: item.soldBy,
      masterPackSize: item.masterPackSize,
      lowStockValue: item.lowStockValue,
      image: item.image || "",
      color: item.color || "",
      shape: item.shape || "",
      categoryIds: item.categoryIds || [],
      taxIds: item.taxIds || [],
      isActive: item.isActive,
    });
  };

  const onEditItemSubmit = (data: InsertItem) => {
    if (editingItem) {
      const enhancedData = {
        ...data,
        categoryIds: editSelectedCategories,
        taxIds: editSelectedTaxes,
      };
      updateItemMutation.mutate({ id: editingItem.id, data: enhancedData });
    }
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("🗑️ Are you sure you want to delete this item?")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const handleItemStatusToggle = (itemId: string, isActive: boolean) => {
    updateItemStatusMutation.mutate({ id: itemId, isActive });
  };

  // Filter items based on search and category
  const filteredItems = itemsList.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                         item.displayName.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
                         (item.barcode && item.barcode.includes(itemSearchTerm)) ||
                         (item.qrCode && item.qrCode.includes(itemSearchTerm));
    const matchesCategory = !itemCategoryFilter || itemCategoryFilter === "all" || 
                           (item.categoryIds && item.categoryIds.includes(itemCategoryFilter));
    return matchesSearch && matchesCategory;
  });

  const onEditCategorySubmit = (data: InsertStoreCategory) => {
    if (editingCategory) {
      updateCategoryMutation.mutate({ id: editingCategory.id, data });
    }
  };

  const handleEditCategory = (category: StoreCategory) => {
    setEditingCategory(category);
    editCategoryForm.reset({
      name: category.name,
      color: category.color || "#3B82F6",
      image: category.image || "",
      shape: category.shape || "",
      isActive: category.isActive,
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const storeCount = storeList.filter(store => store.categoryId === categoryId).length;
    if (storeCount > 0) {
      toast({ 
        title: "⚠️ Cannot Delete", 
        description: `This category has ${storeCount} stores. Remove stores first.`, 
        variant: "destructive" 
      });
      return;
    }
    if (confirm("🗑️ Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "store-master", label: "Store Master", icon: StoreIcon },
    { id: "store-categories", label: "Store Categories", icon: Tag },
    { id: "item-master", label: "Item Master", icon: Package },
    { id: "dispatch-checklist", label: "Dispatch Checklist", icon: Clipboard },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex">
      {/* Left Sidebar Navigation */}
      <div className="w-72 bg-gradient-to-b from-slate-800 to-slate-900 border-r border-cyan-500/30 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-cyan-500/30">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home" className="mb-4 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
              <Settings className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white" data-testid="text-page-title">Admin Console</h1>
              <p className="text-xs text-cyan-300" data-testid="text-page-subtitle">🎮 Game Control Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                data-testid={`nav-${item.id}`}
                className={`w-full group relative overflow-hidden rounded-xl p-4 transition-all duration-300 transform hover:scale-105 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white"
                }`}
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="flex items-center space-x-3 relative z-10">
                  <div className={`p-2 rounded-lg ${isActive ? "bg-white/20" : "bg-slate-600/50 group-hover:bg-slate-500/70"}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-75">
                      {item.id === "dashboard" && "📊 Main Control"}
                      {item.id === "store-master" && "🏪 Store Hub"}
                      {item.id === "item-master" && "📦 Item Gallery"}
                      {item.id === "dispatch-checklist" && "🚀 Mission Board"}
                      {item.id === "settings" && "⚙️ Configuration"}
                    </div>
                  </div>
                </div>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Fun Stats at Bottom */}
        <div className="p-4 mt-auto">
          <div className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-xl p-4 border border-emerald-500/30">
            <div className="text-emerald-300 text-sm font-semibold mb-2">🏆 Admin Level</div>
            <div className="text-white text-xl font-bold">Level 42</div>
            <div className="w-full bg-emerald-900/50 rounded-full h-2 mt-2">
              <div className="bg-gradient-to-r from-emerald-400 to-green-400 h-2 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Game Bar */}
        <div className="bg-slate-800/50 border-b border-cyan-500/30 p-4">
          <div className="flex justify-between items-center">
            <div className="flex space-x-6">
              <div className="flex items-center space-x-2 bg-yellow-500/20 px-4 py-2 rounded-full border border-yellow-500/30">
                <span className="text-yellow-400">💰</span>
                <span className="text-yellow-300 font-semibold">Credits: 9,999</span>
              </div>
              <div className="flex items-center space-x-2 bg-red-500/20 px-4 py-2 rounded-full border border-red-500/30">
                <span className="text-red-400">❤️</span>
                <span className="text-red-300 font-semibold">Health: 100%</span>
              </div>
              <div className="flex items-center space-x-2 bg-blue-500/20 px-4 py-2 rounded-full border border-blue-500/30">
                <span className="text-blue-400">⭐</span>
                <span className="text-blue-300 font-semibold">XP: 15,420</span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 p-8 overflow-auto">
        {/* Tab Content */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" data-testid="text-total-products">Total Products</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-products-count">{dashboardStats.totalProducts}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" data-testid="text-pos-orders">POS Orders</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-pos-count">{dashboardStats.posOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" data-testid="text-wholesale-orders">Wholesale Orders</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-wholesale-count">{dashboardStats.wholesaleOrders}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium" data-testid="text-total-orders">Total Orders</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold" data-testid="text-total-count">{dashboardStats.totalOrders}</div>
                </CardContent>
              </Card>
            </div>

            {/* Products Management */}
            <Card className="mb-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white" data-testid="text-products-title">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-orange-400" />
                  </div>
                  🏪 Product Arsenal
                </CardTitle>
                <CardDescription className="text-slate-300" data-testid="text-products-description">
                  Manage your inventory of delicious treats and snacks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {productList.length > 0 ? (
                  <div className="space-y-4">
                    {productList.map((product, index) => (
                      <div key={product.id} 
                           className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-700/50 to-slate-600/50 rounded-xl border border-slate-500/30 hover:scale-105 transition-transform duration-300" 
                           data-testid={`card-product-${product.id}`}
                           style={{animationDelay: `${index * 100}ms`}}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold">🍭</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                            <p className="text-sm text-slate-300" data-testid={`text-product-category-${product.id}`}>📂 {product.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30" data-testid={`badge-stock-${product.id}`}>
                            📦 {product.stock}
                          </Badge>
                          <span className="font-bold text-yellow-300 text-lg" data-testid={`text-price-${product.id}`}>💰${product.price}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-300" data-testid="text-no-products">
                    <div className="text-6xl mb-4">🏪</div>
                    <div className="text-xl font-semibold mb-2">Empty Inventory</div>
                    <div>Start your adventure by adding your first product!</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="text-white" data-testid="text-quick-actions">⚡ Power Actions</CardTitle>
                <CardDescription className="text-slate-300" data-testid="text-actions-description">
                  Quick administrative spells and abilities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300 hover:scale-105 transition-transform duration-300 hover:bg-green-500/30" 
                    data-testid="button-add-product"
                  >
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Package className="w-6 h-6" />
                    </div>
                    <span className="font-semibold">➕ Add Product</span>
                    <span className="text-xs opacity-75">Create New Item</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-300 hover:scale-105 transition-transform duration-300 hover:bg-blue-500/30" 
                    data-testid="button-manage-users"
                  >
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <Users className="w-6 h-6" />
                    </div>
                    <span className="font-semibold">👥 Manage Users</span>
                    <span className="text-xs opacity-75">Player Management</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-24 flex flex-col gap-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300 hover:scale-105 transition-transform duration-300 hover:bg-purple-500/30" 
                    data-testid="button-view-reports"
                  >
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <span className="font-semibold">📊 View Reports</span>
                    <span className="text-xs opacity-75">Analytics Portal</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Store Categories */}
        {activeTab === "store-categories" && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  🏷️ Store Categories Master
                </h1>
                <p className="text-slate-300 mt-2">Create and manage store categories for better organization</p>
              </div>
            </div>

            {/* Create Category Form */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Plus className="w-5 h-5 text-green-400" />
                  ➕ Create New Category
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Add a new store category with visual customization options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...categoryForm}>
                  <form onSubmit={categoryForm.handleSubmit(onCategorySubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Category Name */}
                      <FormField
                        control={categoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏷️ Category Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="e.g., Flagship Store, Express Outlet"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-category-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Color */}
                      <FormField
                        control={categoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🎨 Category Color</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                type="color"
                                className="bg-slate-700/50 border-slate-600 text-white h-10"
                                data-testid="input-category-color"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Image */}
                      <FormField
                        control={categoryForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🖼️ Category Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="Optional image URL"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-category-image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Shape */}
                      <FormField
                        control={categoryForm.control}
                        name="shape"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🔶 Category Shape</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="🏪 (emoji or shape)"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-category-shape"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Active Status */}
                      <FormField
                        control={categoryForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel className="text-white">⚡ Active Status</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-category-active"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4 border-t border-slate-600/50">
                      <Button 
                        type="submit"
                        disabled={createCategoryMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        data-testid="button-create-category"
                      >
                        {createCategoryMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⚙️</span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            💾 Save Category
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => categoryForm.reset()}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        data-testid="button-clear-category"
                      >
                        <X className="w-4 h-4 mr-2" />
                        🧹 Clear
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Categories List */}
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <List className="w-5 h-5 text-blue-400" />
                  📋 Store Categories List
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Manage and organize your store categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-600/50 bg-slate-900/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600/50">
                        <TableHead className="text-slate-300">Sr No.</TableHead>
                        <TableHead className="text-slate-300">🏷️ Name</TableHead>
                        <TableHead className="text-slate-300">🎨 Color</TableHead>
                        <TableHead className="text-slate-300">🖼️ Image</TableHead>
                        <TableHead className="text-slate-300">🔶 Shape</TableHead>
                        <TableHead className="text-slate-300">⚡ Status</TableHead>
                        <TableHead className="text-slate-300">📊 Store Count</TableHead>
                        <TableHead className="text-slate-300">🛠️ Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {storeCategories.isLoading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                            <span className="animate-spin text-2xl">⚙️</span>
                            <div className="mt-2">Loading categories...</div>
                          </TableCell>
                        </TableRow>
                      ) : categoryList.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-400">
                            <div className="text-4xl mb-2">🏷️</div>
                            <div>No categories created yet</div>
                            <div className="text-sm">Create your first store category above!</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        categoryList.map((category, index) => {
                          const storeCount = storeList.filter(store => store.categoryId === category.id).length;
                          return (
                            <TableRow key={category.id} className="border-slate-600/50 hover:bg-slate-700/30">
                              <TableCell className="text-slate-200">{index + 1}</TableCell>
                              <TableCell className="text-white font-medium">
                                <div className="flex items-center gap-2">
                                  {category.shape && <span>{category.shape}</span>}
                                  {category.name}
                                </div>
                              </TableCell>
                              <TableCell>
                                {category.color && (
                                  <div 
                                    className="w-6 h-6 rounded-full border border-slate-500"
                                    style={{ backgroundColor: category.color }}
                                  />
                                )}
                              </TableCell>
                              <TableCell className="text-slate-200">
                                {category.image ? (
                                  <img src={category.image} alt="Category" className="w-6 h-6 rounded object-cover" />
                                ) : "—"}
                              </TableCell>
                              <TableCell className="text-slate-200">
                                {category.shape || "—"}
                              </TableCell>
                              <TableCell>
                                <Badge variant={category.isActive ? "default" : "secondary"}>
                                  {category.isActive ? "🟢 Active" : "🔴 Inactive"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={storeCount > 0 ? "default" : "secondary"}>
                                  {storeCount} stores
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditCategory(category)}
                                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                    data-testid={`button-edit-category-${category.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    disabled={storeCount > 0}
                                    data-testid={`button-delete-category-${category.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Edit Category Dialog */}
            <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
              <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Edit className="w-5 h-5 text-orange-400" />
                    ✏️ Edit Category Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Update category information and visual settings
                  </DialogDescription>
                </DialogHeader>
                <Form {...editCategoryForm}>
                  <form onSubmit={editCategoryForm.handleSubmit(onEditCategorySubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Category Name */}
                      <FormField
                        control={editCategoryForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏷️ Category Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter category name"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-edit-category-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Color */}
                      <FormField
                        control={editCategoryForm.control}
                        name="color"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🎨 Category Color</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                type="color"
                                className="bg-slate-700/50 border-slate-600 text-white h-10"
                                data-testid="input-edit-category-color"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Image */}
                      <FormField
                        control={editCategoryForm.control}
                        name="image"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🖼️ Category Image URL</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="Optional image URL"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-edit-category-image"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Shape */}
                      <FormField
                        control={editCategoryForm.control}
                        name="shape"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🔶 Category Shape</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="🏪 (emoji or shape)"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-edit-category-shape"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category Active Status */}
                      <FormField
                        control={editCategoryForm.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormLabel className="text-white">⚡ Active Status</FormLabel>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                data-testid="switch-edit-category-active"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-600">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setEditingCategory(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        data-testid="button-cancel-edit-category"
                      >
                        ❌ Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateCategoryMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                        data-testid="button-save-edit-category"
                      >
                        {updateCategoryMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⚙️</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            💾 Update Category
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "store-master" && (
          <div className="space-y-6">
            {/* Create Store Form - Top Half */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white" data-testid="text-store-form-title">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Plus className="w-5 h-5 text-orange-400" />
                  </div>
                  🏗️ Create New Store Location
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Add a new store to your empire of sweet shop locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...storeForm}>
                  <form onSubmit={storeForm.handleSubmit(onStoreSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Store Name */}
                      <FormField
                        control={storeForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏪 Store Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter store name"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
                      <FormField
                        control={storeForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏷️ Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white" data-testid="select-store-category">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryList.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={storeForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">📞 Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter phone number"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-phone"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        control={storeForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏠 Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter full address"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-address"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City */}
                      <FormField
                        control={storeForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏙️ City</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter city"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-city"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pincode */}
                      <FormField
                        control={storeForm.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">📮 Pincode</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter pincode"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-pincode"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* State */}
                      <FormField
                        control={storeForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🗺️ State</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter state"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-state"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Store PIN */}
                      <FormField
                        control={storeForm.control}
                        name="storePin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🔐 Store PIN (POS Login)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="4-digit PIN"
                                type="password"
                                maxLength={4}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-pin"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* UPI QR Code */}
                      <FormField
                        control={storeForm.control}
                        name="upiQrCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">💳 UPI QR Code</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="Enter UPI QR code data"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                data-testid="input-store-upi"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 pt-4">
                      <Button 
                        type="submit"
                        disabled={createStoreMutation.isPending}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8"
                        data-testid="button-save-store"
                      >
                        {createStoreMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⚙️</span>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            💾 Save Store
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => storeForm.reset()}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        data-testid="button-clear-form"
                      >
                        🧹 Clear Form
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Store List Table - Bottom Half */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white" data-testid="text-store-list-title">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <StoreIcon className="w-5 h-5 text-blue-400" />
                  </div>
                  🏪 Store Empire ({filteredStores.length})
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Manage all your store locations and their status
                </CardDescription>
                {/* Search and Filter */}
                <div className="flex gap-4 pt-4">
                  <div className="flex-1 relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <Input
                      placeholder="🔍 Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                      data-testid="input-search-stores"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white" data-testid="select-category-filter">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="🏷️ Filter by Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categoryList.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedStores.size > 0 && (
                    <Button 
                      variant="destructive"
                      size="sm"
                      onClick={handleBulkDelete}
                      className="bg-red-600 hover:bg-red-700"
                      data-testid="button-bulk-delete"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      🗑️ Delete ({selectedStores.size})
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border border-slate-600/50 bg-slate-900/30">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-600/50 hover:bg-slate-700/20">
                        <TableHead className="text-slate-300">
                          <Checkbox 
                            className="border-slate-500"
                            data-testid="checkbox-select-all-stores"
                          />
                        </TableHead>
                        <TableHead className="text-slate-300">Sr No.</TableHead>
                        <TableHead className="text-slate-300">🏪 Name</TableHead>
                        <TableHead className="text-slate-300">🏷️ Category</TableHead>
                        <TableHead className="text-slate-300">📍 Location</TableHead>
                        <TableHead className="text-slate-300">📞 Phone</TableHead>
                        <TableHead className="text-slate-300">⚡ Status</TableHead>
                        <TableHead className="text-slate-300">🛠️ Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStores.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-12 text-slate-400">
                            <div className="text-6xl mb-4">🏗️</div>
                            <div className="text-lg">No stores found</div>
                            <div className="text-sm opacity-75">Create your first store location above!</div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredStores.map((store, index) => {
                          const category = categoryList.find(cat => cat.id === store.categoryId);
                          return (
                            <TableRow 
                              key={store.id} 
                              className="border-slate-600/50 hover:bg-slate-700/20"
                              data-testid={`row-store-${store.id}`}
                            >
                              <TableCell>
                                <Checkbox 
                                  className="border-slate-500"
                                  checked={selectedStores.has(store.id)}
                                  onCheckedChange={(checked) => {
                                    const newSelected = new Set(selectedStores);
                                    if (checked) {
                                      newSelected.add(store.id);
                                    } else {
                                      newSelected.delete(store.id);
                                    }
                                    setSelectedStores(newSelected);
                                  }}
                                  data-testid={`checkbox-store-${store.id}`}
                                />
                              </TableCell>
                              <TableCell className="text-slate-300">{index + 1}</TableCell>
                              <TableCell className="text-white font-medium">{store.name}</TableCell>
                              <TableCell className="text-slate-300">{category?.name || "—"}</TableCell>
                              <TableCell className="text-slate-300">{store.city}, {store.state}</TableCell>
                              <TableCell className="text-slate-300">{store.phone}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={store.isActive}
                                  onCheckedChange={(checked) => handleStoreStatusToggle(store.id, checked)}
                                  className="data-[state=checked]:bg-green-500"
                                  data-testid={`toggle-store-status-${store.id}`}
                                />
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setStoreDetailView(store.id)}
                                    className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                    data-testid={`button-view-store-${store.id}`}
                                  >
                                    <Eye className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditStore(store)}
                                    className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                                    data-testid={`button-edit-store-${store.id}`}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleStoreDelete(store.id)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    data-testid={`button-delete-store-${store.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            {/* Store Detail View Dialog */}
            <Dialog open={!!storeDetailView} onOpenChange={() => setStoreDetailView(null)}>
              <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <StoreIcon className="w-5 h-5 text-blue-400" />
                    🏪 Store Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Complete information about this store location
                  </DialogDescription>
                </DialogHeader>
                {selectedStore && (
                  <div className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300">🏪 Store Name</Label>
                        <div className="text-white font-medium">{selectedStore.name}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">🏷️ Category</Label>
                        <div className="text-white">{categoryList.find(cat => cat.id === selectedStore.categoryId)?.name || "—"}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">📞 Phone</Label>
                        <div className="text-white">{selectedStore.phone}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">🔐 Store PIN</Label>
                        <div className="text-white">••••</div>
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label className="text-slate-300">🏠 Address</Label>
                        <div className="text-white">{selectedStore.address}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">🏙️ City</Label>
                        <div className="text-white">{selectedStore.city}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">🗺️ State</Label>
                        <div className="text-white">{selectedStore.state}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">📮 Pincode</Label>
                        <div className="text-white">{selectedStore.pincode}</div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">⚡ Status</Label>
                        <Badge variant={selectedStore.isActive ? "default" : "secondary"}>
                          {selectedStore.isActive ? "🟢 Active" : "🔴 Inactive"}
                        </Badge>
                      </div>
                      {selectedStore.upiQrCode && (
                        <div className="space-y-2 col-span-2">
                          <Label className="text-slate-300">💳 UPI QR Code</Label>
                          <div className="text-white font-mono text-sm bg-slate-700/50 p-2 rounded">
                            {selectedStore.upiQrCode}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-600">
                      <Button
                        variant="outline"
                        onClick={() => handleEditStore(selectedStore)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        ✏️ Edit Store
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setStoreDetailView(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        ❌ Close
                      </Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>

            {/* Edit Store Dialog */}
            <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
              <DialogContent className="max-w-4xl bg-gradient-to-br from-slate-800 to-slate-900 border-slate-600">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-white">
                    <Edit className="w-5 h-5 text-orange-400" />
                    ✏️ Edit Store Details
                  </DialogTitle>
                  <DialogDescription className="text-slate-300">
                    Update store information and settings
                  </DialogDescription>
                </DialogHeader>
                <Form {...editStoreForm}>
                  <form onSubmit={editStoreForm.handleSubmit(onEditStoreSubmit)} className="space-y-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Store Name */}
                      <FormField
                        control={editStoreForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏪 Store Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter store name"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Category */}
                      <FormField
                        control={editStoreForm.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏷️ Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                              <FormControl>
                                <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                  <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categoryList.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Phone */}
                      <FormField
                        control={editStoreForm.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">📞 Phone Number</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter phone number"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Address */}
                      <FormField
                        control={editStoreForm.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏠 Address</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter full address"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City */}
                      <FormField
                        control={editStoreForm.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🏙️ City</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter city"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* State */}
                      <FormField
                        control={editStoreForm.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🗺️ State</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter state"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Pincode */}
                      <FormField
                        control={editStoreForm.control}
                        name="pincode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">📮 Pincode</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Enter pincode"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Store PIN */}
                      <FormField
                        control={editStoreForm.control}
                        name="storePin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">🔐 Store PIN (POS Login)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="4-digit PIN"
                                type="password"
                                maxLength={4}
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* UPI QR Code */}
                      <FormField
                        control={editStoreForm.control}
                        name="upiQrCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">💳 UPI QR Code</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                value={field.value || ""}
                                placeholder="Enter UPI QR code data"
                                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4 border-t border-slate-600">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setEditingStore(null)}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                      >
                        ❌ Cancel
                      </Button>
                      <Button 
                        type="submit"
                        disabled={updateStoreMutation.isPending}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        {updateStoreMutation.isPending ? (
                          <>
                            <span className="animate-spin mr-2">⚙️</span>
                            Updating...
                          </>
                        ) : (
                          <>
                            <Edit className="w-4 h-4 mr-2" />
                            💾 Update Store
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {activeTab === "item-master" && (
          <div className="space-y-6">
            {/* Item Master Header */}
            <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white" data-testid="text-item-master-title">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Package className="w-5 h-5 text-blue-400" />
                  </div>
                  📦 Item Master Portal
                </CardTitle>
                <CardDescription className="text-slate-300" data-testid="text-item-master-description">
                  Comprehensive item and product management system with advanced features
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Item Master Sub Navigation */}
            <div className="grid grid-cols-5 gap-4">
              {[
                { id: "create-item", label: "Create Item", icon: "➕", color: "from-green-500 to-emerald-600" },
                { id: "items", label: "Items", icon: "📦", color: "from-blue-500 to-cyan-600" },
                { id: "item-categories", label: "Categories", icon: "🏷️", color: "from-purple-500 to-violet-600" },
                { id: "taxes", label: "Taxes", icon: "🧮", color: "from-orange-500 to-red-600" },
                { id: "combos", label: "Combos", icon: "🎯", color: "from-pink-500 to-rose-600" }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setItemMasterTab(item.id)}
                  data-testid={`nav-item-${item.id}`}
                  className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 transform hover:scale-105 ${
                    itemMasterTab === item.id
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-600/70 hover:text-white"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{item.icon}</div>
                    <div className="font-bold text-sm">{item.label}</div>
                  </div>
                  {itemMasterTab === item.id && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 pointer-events-none" />
                  )}
                </button>
              ))}
            </div>

            {/* Item Master Content */}
            <div className="space-y-6">
              {/* Create Item Tab */}
              {itemMasterTab === "create-item" && (
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <div className="p-2 bg-green-500/20 rounded-lg">
                        <Plus className="w-5 h-5 text-green-400" />
                      </div>
                      ➕ Create New Item
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Add a new item to your inventory with comprehensive details and pricing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <Form {...itemForm}>
                      <form className="space-y-8">
                        {/* Basic Information Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-blue-400 text-sm">📝</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Basic Information</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Product Name */}
                            <FormField
                              control={itemForm.control}
                              name="productName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">📦 Product Name</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      placeholder="Enter product name"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-product-name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Display Name */}
                            <FormField
                              control={itemForm.control}
                              name="displayName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">🏪 Display Name (POS)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      placeholder="Name shown on POS"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-display-name"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Barcode OR QR Code Section */}
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm text-orange-400 font-medium">⚠️ Only one barcode OR QR code allowed</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Barcode */}
                              <FormField
                                control={itemForm.control}
                                name="barcode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">📊 Barcode</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Scan or enter barcode"
                                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${
                                          barcodeDuplicate ? 'border-red-500' : ''
                                        }`}
                                        data-testid="input-barcode"
                                        disabled={!!itemForm.watch('qrCode')}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          if (e.target.value && itemForm.watch('qrCode')) {
                                            itemForm.setValue('qrCode', '');
                                          }
                                          setBarcodeDuplicate('');
                                          // Check for duplicates after a short delay
                                          setTimeout(() => checkBarcodeUnique(e.target.value), 500);
                                        }}
                                      />
                                    </FormControl>
                                    {barcodeDuplicate && (
                                      <div className="text-red-400 text-sm flex items-center gap-1">
                                        <span>❌</span> {barcodeDuplicate}
                                      </div>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* QR Code */}
                              <FormField
                                control={itemForm.control}
                                name="qrCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-white">🔲 QR Code</FormLabel>
                                    <FormControl>
                                      <Input 
                                        {...field}
                                        value={field.value || ''}
                                        placeholder="Scan or enter QR code"
                                        className={`bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 ${
                                          qrCodeDuplicate ? 'border-red-500' : ''
                                        }`}
                                        data-testid="input-qr-code"
                                        disabled={!!itemForm.watch('barcode')}
                                        onChange={(e) => {
                                          field.onChange(e);
                                          if (e.target.value && itemForm.watch('barcode')) {
                                            itemForm.setValue('barcode', '');
                                          }
                                          setQrCodeDuplicate('');
                                          // Check for duplicates after a short delay
                                          setTimeout(() => checkQrCodeUnique(e.target.value), 500);
                                        }}
                                      />
                                    </FormControl>
                                    {qrCodeDuplicate && (
                                      <div className="text-red-400 text-sm flex items-center gap-1">
                                        <span>❌</span> {qrCodeDuplicate}
                                      </div>
                                    )}
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Product Details Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-purple-400 text-sm">⚙️</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Product Details</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Sold By */}
                            <FormField
                              control={itemForm.control}
                              name="soldBy"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">⚖️ Sold By</FormLabel>
                                  <Select value={field.value} onValueChange={field.onChange} data-testid="select-sold-by">
                                    <FormControl>
                                      <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                                        <SelectValue placeholder="Select unit" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="piece">📦 Piece</SelectItem>
                                      <SelectItem value="weight">⚖️ Weight (triggers POS popup)</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Master Pack Size */}
                            <FormField
                              control={itemForm.control}
                              name="masterPackSize"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">
                                    📏 Master Pack Size ({itemForm.watch('soldBy') === 'weight' ? 'kg' : 'pieces'})
                                  </FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      type="number"
                                      min="1"
                                      placeholder={itemForm.watch('soldBy') === 'weight' ? '1.0' : '1'}
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-master-pack-size"
                                      onChange={(e) => field.onChange(Number(e.target.value) || 1)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Low Stock Value */}
                            <FormField
                              control={itemForm.control}
                              name="lowStockValue"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">📉 Low Stock Alert</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      type="number"
                                      min="0"
                                      placeholder="10"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-low-stock-value"
                                      onChange={(e) => field.onChange(Number(e.target.value) || 10)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Visual Representation Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-pink-400 text-sm">🎨</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Visual Representation</h3>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Image URL */}
                            <FormField
                              control={itemForm.control}
                              name="image"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">🖼️ Image URL</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      value={field.value || ''}
                                      placeholder="https://example.com/image.jpg"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-image-url"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Color */}
                            <FormField
                              control={itemForm.control}
                              name="color"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">🎨 Color (if no image)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      value={field.value || ''}
                                      type="color"
                                      className="bg-slate-700/50 border-slate-600 text-white h-10"
                                      data-testid="input-color"
                                      disabled={!!itemForm.watch('image')}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Shape */}
                            <FormField
                              control={itemForm.control}
                              name="shape"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-white">🔶 Shape (emoji/text)</FormLabel>
                                  <FormControl>
                                    <Input 
                                      {...field}
                                      value={field.value || ''}
                                      placeholder="🍬 or text description"
                                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                                      data-testid="input-shape"
                                      disabled={!!itemForm.watch('image')}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        {/* Categories Selection Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-purple-400 text-sm">🏷️</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Item Categories</h3>
                            <span className="text-sm text-slate-400">(Select multiple)</span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {itemCategoriesList.map((category) => (
                              <div key={category.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-600/40 transition-colors">
                                <Checkbox
                                  id={`category-${category.id}`}
                                  checked={selectedCategories.includes(category.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedCategories([...selectedCategories, category.id]);
                                      itemForm.setValue('categoryIds', [...selectedCategories, category.id]);
                                    } else {
                                      const newCategories = selectedCategories.filter(id => id !== category.id);
                                      setSelectedCategories(newCategories);
                                      itemForm.setValue('categoryIds', newCategories);
                                    }
                                  }}
                                  className="border-slate-500"
                                  data-testid={`checkbox-category-${category.id}`}
                                />
                                <label
                                  htmlFor={`category-${category.id}`}
                                  className="flex items-center gap-2 text-sm text-white cursor-pointer flex-1"
                                >
                                  {category.shape && <span>{category.shape}</span>}
                                  {category.color && (
                                    <div 
                                      className="w-3 h-3 rounded-full border border-slate-400" 
                                      style={{ backgroundColor: category.color }}
                                    ></div>
                                  )}
                                  <span>{category.name}</span>
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          {selectedCategories.length > 0 && (
                            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                              <div className="text-emerald-300 text-sm font-medium mb-1">Selected Categories:</div>
                              <div className="flex flex-wrap gap-2">
                                {selectedCategories.map(categoryId => {
                                  const category = itemCategoriesList.find(c => c.id === categoryId);
                                  return (
                                    <Badge key={categoryId} variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                                      {category?.name}
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Taxes Selection Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-orange-400 text-sm">🧮</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Tax Settings</h3>
                            <span className="text-sm text-slate-400">(Select applicable taxes)</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {taxesList.map((tax) => (
                              <div key={tax.id} className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/50 hover:bg-slate-600/40 transition-colors">
                                <Checkbox
                                  id={`tax-${tax.id}`}
                                  checked={selectedTaxes.includes(tax.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedTaxes([...selectedTaxes, tax.id]);
                                      itemForm.setValue('taxIds', [...selectedTaxes, tax.id]);
                                    } else {
                                      const newTaxes = selectedTaxes.filter(id => id !== tax.id);
                                      setSelectedTaxes(newTaxes);
                                      itemForm.setValue('taxIds', newTaxes);
                                    }
                                  }}
                                  className="border-slate-500"
                                  data-testid={`checkbox-tax-${tax.id}`}
                                />
                                <label
                                  htmlFor={`tax-${tax.id}`}
                                  className="flex items-center justify-between text-sm text-white cursor-pointer flex-1"
                                >
                                  <span>{tax.name}</span>
                                  <Badge variant="outline" className="ml-2 border-orange-500/30 text-orange-300">
                                    {tax.rate}%
                                  </Badge>
                                </label>
                              </div>
                            ))}
                          </div>
                          
                          {selectedTaxes.length > 0 && (
                            <div className="p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                              <div className="text-orange-300 text-sm font-medium mb-1">Selected Taxes:</div>
                              <div className="flex flex-wrap gap-2">
                                {selectedTaxes.map(taxId => {
                                  const tax = taxesList.find(t => t.id === taxId);
                                  return (
                                    <Badge key={taxId} variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                                      {tax?.name} ({tax?.rate}%)
                                    </Badge>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Pricing Table Section */}
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                              <span className="text-emerald-400 text-sm">💰</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Pricing by Store Category</h3>
                            <span className="text-sm text-slate-400">(Set prices for different store types)</span>
                          </div>
                          
                          {/* Bulk Operations */}
                          <div className="flex gap-2 mb-4">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const sellPrice = prompt('💰 Enter sell price to apply to all categories:');
                                if (sellPrice && !isNaN(Number(sellPrice))) {
                                  const updatedPrices = categoryList.map(category => {
                                    const existing = itemPrices.find(p => p.storeCategoryId === category.id);
                                    return {
                                      storeCategoryId: category.id,
                                      sellPrice: sellPrice,
                                      purchasePrice: existing?.purchasePrice || '',
                                      isAvailable: existing?.isAvailable ?? true
                                    };
                                  });
                                  setItemPrices(updatedPrices);
                                }
                              }}
                              className="border-emerald-600 text-emerald-300 hover:bg-emerald-700/50"
                              data-testid="button-fill-all-sell-price"
                            >
                              📋 Fill All Sell Prices
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const purchasePrice = prompt('🛒 Enter purchase price to apply to all categories:');
                                if (purchasePrice && !isNaN(Number(purchasePrice))) {
                                  const updatedPrices = categoryList.map(category => {
                                    const existing = itemPrices.find(p => p.storeCategoryId === category.id);
                                    return {
                                      storeCategoryId: category.id,
                                      sellPrice: existing?.sellPrice || '',
                                      purchasePrice: purchasePrice,
                                      isAvailable: existing?.isAvailable ?? true
                                    };
                                  });
                                  setItemPrices(updatedPrices);
                                }
                              }}
                              className="border-blue-600 text-blue-300 hover:bg-blue-700/50"
                              data-testid="button-fill-all-purchase-price"
                            >
                              🛒 Fill All Purchase Prices
                            </Button>
                            
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                if (itemPrices.length > 0) {
                                  const firstPrice = itemPrices[0];
                                  const copiedPrices = categoryList.map(category => ({
                                    storeCategoryId: category.id,
                                    sellPrice: firstPrice.sellPrice,
                                    purchasePrice: firstPrice.purchasePrice,
                                    isAvailable: firstPrice.isAvailable
                                  }));
                                  setItemPrices(copiedPrices);
                                }
                              }}
                              disabled={itemPrices.length === 0}
                              className="border-purple-600 text-purple-300 hover:bg-purple-700/50"
                              data-testid="button-copy-to-all"
                            >
                              📄 Copy First to All
                            </Button>
                          </div>
                          
                          {/* Pricing Table */}
                          <div className="bg-slate-700/30 rounded-lg border border-slate-600/50 overflow-hidden">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-slate-600/50">
                                    <TableHead className="text-slate-300 w-1/4">🏪 Store Category</TableHead>
                                    <TableHead className="text-slate-300 w-1/4">💰 Sell Price</TableHead>
                                    <TableHead className="text-slate-300 w-1/4">🛒 Purchase Price</TableHead>
                                    <TableHead className="text-slate-300 w-1/6">📍 Available</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {categoryList.map((category) => {
                                    const priceData = itemPrices.find(p => p.storeCategoryId === category.id) || {
                                      storeCategoryId: category.id,
                                      sellPrice: '',
                                      purchasePrice: '',
                                      isAvailable: true
                                    };
                                    
                                    return (
                                      <TableRow key={category.id} className="border-slate-600/50">
                                        <TableCell className="text-white font-medium">
                                          <div className="flex items-center gap-2">
                                            {category.color && (
                                              <div 
                                                className="w-3 h-3 rounded-full border border-slate-400" 
                                                style={{ backgroundColor: category.color }}
                                              ></div>
                                            )}
                                            {category.shape && <span>{category.shape}</span>}
                                            {category.name}
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={priceData.sellPrice}
                                            onChange={(e) => {
                                              const updatedPrices = [...itemPrices];
                                              const existingIndex = updatedPrices.findIndex(p => p.storeCategoryId === category.id);
                                              const newPriceData = {
                                                ...priceData,
                                                sellPrice: e.target.value
                                              };
                                              
                                              if (existingIndex >= 0) {
                                                updatedPrices[existingIndex] = newPriceData;
                                              } else {
                                                updatedPrices.push(newPriceData);
                                              }
                                              setItemPrices(updatedPrices);
                                            }}
                                            className="bg-slate-600/50 border-slate-500 text-white text-sm"
                                            data-testid={`input-sell-price-${category.id}`}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="0.00"
                                            value={priceData.purchasePrice}
                                            onChange={(e) => {
                                              const updatedPrices = [...itemPrices];
                                              const existingIndex = updatedPrices.findIndex(p => p.storeCategoryId === category.id);
                                              const newPriceData = {
                                                ...priceData,
                                                purchasePrice: e.target.value
                                              };
                                              
                                              if (existingIndex >= 0) {
                                                updatedPrices[existingIndex] = newPriceData;
                                              } else {
                                                updatedPrices.push(newPriceData);
                                              }
                                              setItemPrices(updatedPrices);
                                            }}
                                            className="bg-slate-600/50 border-slate-500 text-white text-sm"
                                            data-testid={`input-purchase-price-${category.id}`}
                                          />
                                        </TableCell>
                                        <TableCell>
                                          <Switch
                                            checked={priceData.isAvailable}
                                            onCheckedChange={(checked) => {
                                              const updatedPrices = [...itemPrices];
                                              const existingIndex = updatedPrices.findIndex(p => p.storeCategoryId === category.id);
                                              const newPriceData = {
                                                ...priceData,
                                                isAvailable: checked
                                              };
                                              
                                              if (existingIndex >= 0) {
                                                updatedPrices[existingIndex] = newPriceData;
                                              } else {
                                                updatedPrices.push(newPriceData);
                                              }
                                              setItemPrices(updatedPrices);
                                            }}
                                            className="data-[state=checked]:bg-emerald-500"
                                            data-testid={`switch-available-${category.id}`}
                                          />
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                          
                          {/* Pricing Summary */}
                          {itemPrices.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                <div className="text-emerald-300 text-sm font-medium">💰 Categories with Sell Price</div>
                                <div className="text-emerald-200 text-lg font-bold">
                                  {itemPrices.filter(p => p.sellPrice && Number(p.sellPrice) > 0).length} / {categoryList.length}
                                </div>
                              </div>
                              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                                <div className="text-blue-300 text-sm font-medium">🛒 Categories with Purchase Price</div>
                                <div className="text-blue-200 text-lg font-bold">
                                  {itemPrices.filter(p => p.purchasePrice && Number(p.purchasePrice) > 0).length} / {categoryList.length}
                                </div>
                              </div>
                              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                                <div className="text-purple-300 text-sm font-medium">📍 Available Categories</div>
                                <div className="text-purple-200 text-lg font-bold">
                                  {itemPrices.filter(p => p.isAvailable).length} / {categoryList.length}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-4 justify-end pt-6 border-t border-slate-600">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => {
                              itemForm.reset();
                              setSelectedCategories([]);
                              setSelectedTaxes([]);
                              setItemPrices([]);
                              setBarcodeDuplicate('');
                              setQrCodeDuplicate('');
                            }}
                            className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                            data-testid="button-clear-form"
                          >
                            🧹 Clear
                          </Button>
                          
                          <Button 
                            type="button"
                            variant="outline"
                            className="border-blue-600 text-blue-300 hover:bg-blue-700/50"
                            data-testid="button-bulk-upload"
                          >
                            📄 Bulk Upload
                          </Button>
                          
                          <Button 
                            type="submit"
                            disabled={createItemMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                            data-testid="button-save-item"
                          >
                            {createItemMutation.isPending ? (
                              <>
                                <span className="animate-spin mr-2">⚙️</span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                💾 Save Item
                              </>
                            )}
                          </Button>
                          
                          <Button 
                            type="button"
                            disabled={createItemMutation.isPending}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                            data-testid="button-save-and-new"
                          >
                            {createItemMutation.isPending ? (
                              <>
                                <span className="animate-spin mr-2">⚙️</span>
                                Saving...
                              </>
                            ) : (
                              <>
                                <Plus className="w-4 h-4 mr-2" />
                                💾➕ Save & New
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {/* Items List Tab */}
              {itemMasterTab === "items" && (
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <Package className="w-5 h-5 text-blue-400" />
                      </div>
                      📦 Items Management
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      View, edit, and manage all items with advanced filtering and actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Search and Filters */}
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          placeholder="🔍 Search items by name, barcode, or QR code..."
                          value={itemSearchTerm}
                          onChange={(e) => setItemSearchTerm(e.target.value)}
                          className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                          data-testid="input-item-search"
                        />
                      </div>
                      <Select value={itemCategoryFilter} onValueChange={setItemCategoryFilter}>
                        <SelectTrigger className="w-48 bg-slate-700/50 border-slate-600 text-white" data-testid="select-item-category-filter">
                          <Filter className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Filter by category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">All Categories</SelectItem>
                          {itemCategoriesList.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              🏷️ {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Items Count and Summary */}
                    <div className="flex items-center justify-between">
                      <div className="text-slate-300">
                        <span className="text-white font-semibold" data-testid="text-items-count">{filteredItems.length}</span> items 
                        {itemSearchTerm || itemCategoryFilter ? ` (filtered from ${itemsList.length} total)` : ''}
                      </div>
                      <Button
                        onClick={() => setItemMasterTab("create-item")}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        data-testid="button-add-new-item"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                      </Button>
                    </div>

                    {/* Items Table */}
                    {filteredItems.length > 0 ? (
                      <div className="border rounded-lg border-slate-600/50 overflow-hidden">
                        <Table>
                          <TableHeader className="bg-slate-700/50">
                            <TableRow className="border-slate-600">
                              <TableHead className="text-slate-300">Product Details</TableHead>
                              <TableHead className="text-slate-300">Code/ID</TableHead>
                              <TableHead className="text-slate-300">Categories</TableHead>
                              <TableHead className="text-slate-300">Sold By</TableHead>
                              <TableHead className="text-slate-300">Status</TableHead>
                              <TableHead className="text-slate-300">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredItems.map((item) => (
                              <TableRow key={item.id} className="border-slate-600 hover:bg-slate-700/30" data-testid={`row-item-${item.id}`}>
                                <TableCell>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      {item.image ? (
                                        <img src={item.image} alt={item.productName} className="w-8 h-8 rounded object-cover" />
                                      ) : (
                                        <div 
                                          className="w-8 h-8 rounded flex items-center justify-center text-xs"
                                          style={{ backgroundColor: item.color || '#64748b' }}
                                        >
                                          {item.shape || '📦'}
                                        </div>
                                      )}
                                      <div>
                                        <div className="font-medium text-white" data-testid={`text-item-name-${item.id}`}>{item.productName}</div>
                                        <div className="text-sm text-slate-400">{item.displayName}</div>
                                      </div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="space-y-1">
                                    {item.barcode && (
                                      <div className="text-sm text-slate-300" data-testid={`text-barcode-${item.id}`}>
                                        📊 {item.barcode}
                                      </div>
                                    )}
                                    {item.qrCode && (
                                      <div className="text-sm text-slate-300" data-testid={`text-qrcode-${item.id}`}>
                                        📱 {item.qrCode}
                                      </div>
                                    )}
                                    {!item.barcode && !item.qrCode && (
                                      <div className="text-sm text-slate-500">No code</div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-wrap gap-1">
                                    {item.categoryIds && item.categoryIds.length > 0 ? (
                                      item.categoryIds.map((categoryId) => {
                                        const category = itemCategoriesList.find(cat => cat.id === categoryId);
                                        return category ? (
                                          <Badge key={categoryId} variant="secondary" className="text-xs" data-testid={`badge-category-${categoryId}`}>
                                            🏷️ {category.name}
                                          </Badge>
                                        ) : null;
                                      })
                                    ) : (
                                      <span className="text-sm text-slate-500">No categories</span>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant={item.soldBy === "piece" ? "default" : "outline"} data-testid={`badge-sold-by-${item.id}`}>
                                    {item.soldBy === "piece" ? "📦 Piece" : "⚖️ Weight"}
                                  </Badge>
                                  <div className="text-xs text-slate-400 mt-1">
                                    Pack: {item.masterPackSize}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Switch
                                      checked={item.isActive}
                                      onCheckedChange={(checked) => handleItemStatusToggle(item.id, checked)}
                                      data-testid={`switch-item-status-${item.id}`}
                                    />
                                    <Badge variant={item.isActive ? "default" : "secondary"} data-testid={`badge-status-${item.id}`}>
                                      {item.isActive ? "🟢 Active" : "🔴 Inactive"}
                                    </Badge>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditItem(item)}
                                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                      data-testid={`button-edit-item-${item.id}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteItem(item.id)}
                                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                      data-testid={`button-delete-item-${item.id}`}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-300">
                        <div className="text-6xl mb-4">📭</div>
                        <div className="text-xl font-bold mb-2 text-white">No Items Found</div>
                        <div className="text-sm opacity-75 mb-4">
                          {itemSearchTerm || itemCategoryFilter ? 
                            "Try adjusting your search or filter criteria" : 
                            "Start by creating your first item"
                          }
                        </div>
                        <Button
                          onClick={() => setItemMasterTab("create-item")}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                          data-testid="button-create-first-item"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Create First Item
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Edit Item Dialog */}
              {editingItem && (
                <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-600">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-white">
                        <Edit className="w-5 h-5 text-blue-400" />
                        Edit Item: {editingItem.productName}
                      </DialogTitle>
                      <DialogDescription className="text-slate-300">
                        Update item details, categories, and settings
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...editItemForm}>
                      <form onSubmit={editItemForm.handleSubmit(onEditItemSubmit)} className="space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={editItemForm.control}
                            name="productName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Product Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-slate-700/50 border-slate-600 text-white" data-testid="input-edit-product-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={editItemForm.control}
                            name="displayName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-white">Display Name</FormLabel>
                                <FormControl>
                                  <Input {...field} className="bg-slate-700/50 border-slate-600 text-white" data-testid="input-edit-display-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        {/* Categories and Taxes */}
                        <div className="space-y-4">
                          <div>
                            <Label className="text-white mb-2 block">Categories</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {itemCategoriesList.map((category) => (
                                <div key={category.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-category-${category.id}`}
                                    checked={editSelectedCategories.includes(category.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setEditSelectedCategories([...editSelectedCategories, category.id]);
                                      } else {
                                        setEditSelectedCategories(editSelectedCategories.filter(id => id !== category.id));
                                      }
                                    }}
                                    data-testid={`checkbox-edit-category-${category.id}`}
                                  />
                                  <Label htmlFor={`edit-category-${category.id}`} className="text-slate-300 text-sm">
                                    {category.name}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-white mb-2 block">Taxes</Label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {taxesList.map((tax) => (
                                <div key={tax.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={`edit-tax-${tax.id}`}
                                    checked={editSelectedTaxes.includes(tax.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setEditSelectedTaxes([...editSelectedTaxes, tax.id]);
                                      } else {
                                        setEditSelectedTaxes(editSelectedTaxes.filter(id => id !== tax.id));
                                      }
                                    }}
                                    data-testid={`checkbox-edit-tax-${tax.id}`}
                                  />
                                  <Label htmlFor={`edit-tax-${tax.id}`} className="text-slate-300 text-sm">
                                    {tax.name} ({tax.rate}%)
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-4">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setEditingItem(null)}
                            className="text-slate-300 hover:text-white"
                            data-testid="button-cancel-edit"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={updateItemMutation.isPending}
                            className="bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700"
                            data-testid="button-save-edit"
                          >
                            {updateItemMutation.isPending ? (
                              <>
                                <span className="animate-spin mr-2">⚙️</span>
                                Updating...
                              </>
                            ) : (
                              <>
                                <Edit className="w-4 h-4 mr-2" />
                                Update Item
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              )}

              {/* Item Categories Tab */}
              {itemMasterTab === "item-categories" && (
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        <Tag className="w-5 h-5 text-purple-400" />
                      </div>
                      🏷️ Item Categories
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Organize items with visual categories and sortable POS ordering
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Create New Category Form */}
                    <Card className="bg-slate-700/30 border-slate-600/50">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">➕ Create New Category</CardTitle>
                        <CardDescription className="text-slate-300">
                          Add a new item category for better organization
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-white">Category Name</Label>
                            <Input
                              placeholder="Enter category name"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              data-testid="input-new-category-name"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Color</Label>
                            <Input
                              type="color"
                              defaultValue="#3B82F6"
                              className="bg-slate-700/50 border-slate-600 h-10"
                              data-testid="input-new-category-color"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Icon/Shape</Label>
                            <Input
                              placeholder="🏷️ emoji or text"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              data-testid="input-new-category-shape"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 w-full"
                              data-testid="button-create-category"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Category
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Categories List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Existing Categories</h3>
                        <Badge variant="secondary" className="text-sm" data-testid="badge-categories-count">
                          {itemCategoriesList.length} categories
                        </Badge>
                      </div>

                      {itemCategoriesList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {itemCategoriesList.map((category) => {
                            const usageCount = itemsList.filter(item => 
                              item.categoryIds && item.categoryIds.includes(category.id)
                            ).length;

                            return (
                              <Card key={category.id} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-colors" data-testid={`card-category-${category.id}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div 
                                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                                        style={{ backgroundColor: category.color || '#3B82F6' }}
                                      >
                                        {category.shape || '🏷️'}
                                      </div>
                                      <div>
                                        <h4 className="text-white font-semibold" data-testid={`text-category-name-${category.id}`}>
                                          {category.name}
                                        </h4>
                                        <div className="text-sm text-slate-400">
                                          Sort: {category.sortOrder || 0}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                        data-testid={`button-edit-category-${category.id}`}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          if (usageCount > 0) {
                                            toast({
                                              title: "⚠️ Cannot Delete", 
                                              description: `This category has ${usageCount} items. Remove items first.`, 
                                              variant: "destructive"
                                            });
                                          } else if (confirm("🗑️ Are you sure you want to delete this category?")) {
                                            // Delete category mutation will be added
                                          }
                                        }}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                        data-testid={`button-delete-category-${category.id}`}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-300">Usage Count:</span>
                                      <Badge variant={usageCount > 0 ? "default" : "secondary"} data-testid={`badge-usage-count-${category.id}`}>
                                        {usageCount} items
                                      </Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-slate-300">Status:</span>
                                      <Badge variant={category.isActive ? "default" : "secondary"} data-testid={`badge-category-status-${category.id}`}>
                                        {category.isActive ? "🟢 Active" : "🔴 Inactive"}
                                      </Badge>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-300">
                          <div className="text-6xl mb-4">🗂️</div>
                          <div className="text-xl font-bold mb-2 text-white">No Categories Yet</div>
                          <div className="text-sm opacity-75">
                            Create your first item category to get started
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Tips */}
                    <Card className="bg-gradient-to-r from-purple-500/10 to-violet-500/10 border-purple-500/30">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-purple-400 text-xl">💡</div>
                          <div>
                            <h4 className="text-white font-semibold mb-2">Category Management Tips</h4>
                            <ul className="text-sm text-slate-300 space-y-1">
                              <li>• Use colors and icons to make categories visually distinct</li>
                              <li>• Sort order controls the display sequence in POS interface</li>
                              <li>• Categories with items cannot be deleted (remove items first)</li>
                              <li>• Inactive categories won't appear in new item creation</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
              )}

              {/* Taxes Tab */}
              {itemMasterTab === "taxes" && (
                <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <div className="p-2 bg-orange-500/20 rounded-lg">
                        <Calculator className="w-5 h-5 text-orange-400" />
                      </div>
                      🧮 Tax Management
                    </CardTitle>
                    <CardDescription className="text-slate-300">
                      Configure tax rates and settings for different item categories
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Create New Tax Form */}
                    <Card className="bg-slate-700/30 border-slate-600/50">
                      <CardHeader>
                        <CardTitle className="text-lg text-white">➕ Create New Tax</CardTitle>
                        <CardDescription className="text-slate-300">
                          Add a new tax rate for items and services
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label className="text-white">Tax Name</Label>
                            <Input
                              placeholder="e.g., GST, VAT, Sales Tax"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              data-testid="input-new-tax-name"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Tax Rate (%)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              placeholder="e.g., 18.00"
                              className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                              data-testid="input-new-tax-rate"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 w-full"
                              data-testid="button-create-tax"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Create Tax
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Taxes List */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-white">Tax Rates</h3>
                        <Badge variant="secondary" className="text-sm" data-testid="badge-taxes-count">
                          {taxesList.length} tax rates
                        </Badge>
                      </div>

                      {taxesList.length > 0 ? (
                        <div className="space-y-3">
                          {taxesList.map((tax) => {
                            const usageCount = itemsList.filter(item => 
                              item.taxIds && item.taxIds.includes(tax.id)
                            ).length;

                            return (
                              <Card key={tax.id} className="bg-slate-700/30 border-slate-600/50 hover:bg-slate-700/50 transition-colors" data-testid={`card-tax-${tax.id}`}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {tax.rate}%
                                      </div>
                                      <div>
                                        <h4 className="text-white font-semibold text-lg" data-testid={`text-tax-name-${tax.id}`}>
                                          {tax.name}
                                        </h4>
                                        <div className="text-sm text-slate-400">
                                          Rate: {tax.rate}% • Sort: {tax.sortOrder || 0}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                      {/* Usage and Status Info */}
                                      <div className="text-right space-y-1">
                                        <Badge variant={usageCount > 0 ? "default" : "secondary"} data-testid={`badge-tax-usage-${tax.id}`}>
                                          {usageCount} items
                                        </Badge>
                                        <div>
                                          <Badge variant={tax.isActive ? "default" : "secondary"} data-testid={`badge-tax-status-${tax.id}`}>
                                            {tax.isActive ? "🟢 Active" : "🔴 Inactive"}
                                          </Badge>
                                        </div>
                                      </div>

                                      {/* Toggle Switch */}
                                      <div className="flex items-center gap-2">
                                        <Switch
                                          checked={tax.isActive}
                                          onCheckedChange={(checked) => {
                                            // TODO: Add update tax status mutation
                                            console.log(`Toggle tax ${tax.id} to ${checked}`);
                                          }}
                                          data-testid={`switch-tax-status-${tax.id}`}
                                        />
                                      </div>

                                      {/* Action Buttons */}
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                          data-testid={`button-edit-tax-${tax.id}`}
                                        >
                                          <Edit className="w-4 h-4" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => {
                                            if (usageCount > 0) {
                                              toast({
                                                title: "⚠️ Cannot Delete", 
                                                description: `This tax is used by ${usageCount} items. Remove from items first.`, 
                                                variant: "destructive"
                                              });
                                            } else if (confirm("🗑️ Are you sure you want to delete this tax?")) {
                                              // TODO: Add delete tax mutation
                                              console.log(`Delete tax ${tax.id}`);
                                            }
                                          }}
                                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                          data-testid={`button-delete-tax-${tax.id}`}
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-slate-300">
                          <div className="text-6xl mb-4">💰</div>
                          <div className="text-xl font-bold mb-2 text-white">No Tax Rates Yet</div>
                          <div className="text-sm opacity-75">
                            Create your first tax rate to get started
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tax Information and Guidelines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Common Tax Rates */}
                      <Card className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-blue-400 text-xl">📊</div>
                            <div>
                              <h4 className="text-white font-semibold mb-2">Common Tax Rates</h4>
                              <ul className="text-sm text-slate-300 space-y-1">
                                <li>• GST (India): 5%, 12%, 18%, 28%</li>
                                <li>• VAT (EU): 19-25% (varies by country)</li>
                                <li>• Sales Tax (US): 6-10% (varies by state)</li>
                                <li>• Service Tax: Usually 18-20%</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Tax Management Tips */}
                      <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="text-orange-400 text-xl">💡</div>
                            <div>
                              <h4 className="text-white font-semibold mb-2">Tax Management Tips</h4>
                              <ul className="text-sm text-slate-300 space-y-1">
                                <li>• Inactive taxes won't be available for new items</li>
                                <li>• Sort order affects display sequence in forms</li>
                                <li>• Taxes with items cannot be deleted</li>
                                <li>• Ensure compliance with local regulations</li>
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Combos Tab */}
              {itemMasterTab === "combos" && (
                <div className="space-y-6">
                  {/* Combos Header */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <Target className="w-5 h-5 text-pink-400" />
                        </div>
                        🎯 Combo Management
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Create combo items with multiple products and special pricing
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  {/* Create New Combo Form */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="text-lg text-white">➕ Create New Combo</CardTitle>
                      <CardDescription className="text-slate-300">
                        Bundle multiple items together with special pricing
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Basic Combo Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-white">Combo Name</Label>
                          <Input
                            placeholder="e.g., Family Meal, Snack Pack"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            data-testid="input-combo-name"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Display Name</Label>
                          <Input
                            placeholder="Name shown on POS"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            data-testid="input-combo-display-name"
                          />
                        </div>
                      </div>

                      {/* Visual Representation */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-white">Image URL</Label>
                          <Input
                            placeholder="https://example.com/combo.jpg"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            data-testid="input-combo-image"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Color</Label>
                          <Input
                            type="color"
                            defaultValue="#EC4899"
                            className="bg-slate-700/50 border-slate-600 h-10"
                            data-testid="input-combo-color"
                          />
                        </div>
                        <div>
                          <Label className="text-white">Icon/Shape</Label>
                          <Input
                            placeholder="🎁 emoji or text"
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
                            data-testid="input-combo-shape"
                          />
                        </div>
                      </div>

                      {/* Combo Options */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="combo-only" data-testid="checkbox-combo-only" />
                          <Label htmlFor="combo-only" className="text-slate-300">
                            🔒 Combo Only (items cannot be sold separately)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="available-separately" defaultChecked data-testid="checkbox-available-separately" />
                          <Label htmlFor="available-separately" className="text-slate-300">
                            🛒 Items also available separately
                          </Label>
                        </div>
                      </div>

                      {/* Item Selection */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">📦 Select Items for Combo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto border border-slate-600/50 rounded-lg p-4">
                          {itemsList.filter(item => item.isActive).map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors" data-testid={`item-option-${item.id}`}>
                              <Checkbox
                                id={`combo-item-${item.id}`}
                                data-testid={`checkbox-combo-item-${item.id}`}
                              />
                              <div className="flex items-center gap-2 flex-1">
                                {item.image ? (
                                  <img src={item.image} alt={item.productName} className="w-6 h-6 rounded object-cover" />
                                ) : (
                                  <div 
                                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                    style={{ backgroundColor: item.color || '#64748b' }}
                                  >
                                    {item.shape || '📦'}
                                  </div>
                                )}
                                <div>
                                  <div className="text-white text-sm font-medium">{item.displayName}</div>
                                  <div className="text-slate-400 text-xs">{item.productName}</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <Input
                                  type="number"
                                  min="1"
                                  defaultValue="1"
                                  className="w-16 h-8 text-center bg-slate-600/50 border-slate-500 text-white text-sm"
                                  placeholder="Qty"
                                  data-testid={`input-quantity-${item.id}`}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Combo Categories */}
                      <div className="space-y-2">
                        <Label className="text-white">Categories</Label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {itemCategoriesList.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={`combo-category-${category.id}`}
                                data-testid={`checkbox-combo-category-${category.id}`}
                              />
                              <Label htmlFor={`combo-category-${category.id}`} className="text-slate-300 text-sm">
                                {category.name}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pricing Configuration */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">💰 Combo Pricing</h3>
                        <div className="space-y-4">
                          {categoryList.map((storeCategory) => (
                            <Card key={storeCategory.id} className="bg-slate-700/30 border-slate-600/50" data-testid={`combo-pricing-${storeCategory.id}`}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                      style={{ backgroundColor: storeCategory.color || '#3B82F6' }}
                                    >
                                      {storeCategory.shape || '🏪'}
                                    </div>
                                    <span className="text-white font-medium">{storeCategory.name}</span>
                                  </div>
                                  <Checkbox data-testid={`checkbox-pricing-${storeCategory.id}`} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-slate-300 text-sm">Sell Price</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="bg-slate-600/50 border-slate-500 text-white"
                                      data-testid={`input-combo-sell-price-${storeCategory.id}`}
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-slate-300 text-sm">Purchase Price</Label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="0.00"
                                      className="bg-slate-600/50 border-slate-500 text-white"
                                      data-testid={`input-combo-purchase-price-${storeCategory.id}`}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-4">
                        <Button
                          type="button"
                          variant="ghost"
                          className="text-slate-300 hover:text-white"
                          data-testid="button-cancel-combo"
                        >
                          Cancel
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                          data-testid="button-create-combo"
                        >
                          <Target className="w-4 h-4 mr-2" />
                          Create Combo
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Existing Combos List */}
                  <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between text-white">
                        <span>🎁 Existing Combos</span>
                        <Badge variant="secondary" className="text-sm" data-testid="badge-combos-count">
                          0 combos
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-slate-300">
                        Manage your existing combo products and their configurations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* Placeholder for when no combos exist */}
                      <div className="text-center py-16 text-slate-300">
                        <div className="text-6xl mb-4">🎁</div>
                        <div className="text-xl font-bold mb-2 text-white">No Combos Created Yet</div>
                        <div className="text-sm opacity-75 mb-4">
                          Create your first combo to bundle items together
                        </div>
                        <div className="text-xs text-slate-400">
                          Combos help increase average order value by bundling related items
                        </div>
                      </div>

                      {/* TODO: Add combos list table when combos exist */}
                      {/* This would include:
                          - Combo name and display name
                          - Items included (with quantities)
                          - Pricing across store categories
                          - Active/inactive status
                          - Edit and delete actions
                      */}
                    </CardContent>
                  </Card>

                  {/* Combo Management Tips */}
                  <Card className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 border-pink-500/30">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-pink-400 text-xl">💡</div>
                        <div>
                          <h4 className="text-white font-semibold mb-2">Combo Strategy Tips</h4>
                          <ul className="text-sm text-slate-300 space-y-1">
                            <li>• Bundle complementary items to increase sales</li>
                            <li>• Price combos attractively compared to individual items</li>
                            <li>• Use "combo-only" for exclusive bundles</li>
                            <li>• Consider seasonal or themed combinations</li>
                            <li>• Monitor combo performance and adjust pricing</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "dispatch-checklist" && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" data-testid="text-dispatch-title">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Clipboard className="w-5 h-5 text-green-400" />
                </div>
                🚀 Mission Control
              </CardTitle>
              <CardDescription className="text-slate-300" data-testid="text-dispatch-description">
                Order dispatch and delivery mission management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-slate-300" data-testid="text-dispatch-placeholder">
                <div className="text-8xl mb-6">🛸</div>
                <div className="text-2xl font-bold mb-4 text-white">Mission Preparing</div>
                <div className="text-lg mb-2">Dispatch Command Center</div>
                <div className="text-sm opacity-75">Launch systems being calibrated...</div>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full">
                  <span className="animate-bounce mr-2">🚀</span>
                  <span className="text-green-300">Preparing Launch</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "settings" && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" data-testid="text-settings-title">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                ⚙️ System Configuration
              </CardTitle>
              <CardDescription className="text-slate-300" data-testid="text-settings-description">
                Game settings and system preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-slate-300" data-testid="text-settings-placeholder">
                <div className="text-8xl mb-6">🎛️</div>
                <div className="text-2xl font-bold mb-4 text-white">Systems Offline</div>
                <div className="text-lg mb-2">Configuration Panel</div>
                <div className="text-sm opacity-75">Advanced settings being developed...</div>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="animate-spin mr-2">⚙️</span>
                  <span className="text-purple-300">Configuring...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        </main>
      </div>
    </div>
  );
}
