import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Users, Package, BarChart3, Settings, Store as StoreIcon, Clipboard, LayoutDashboard, Plus, Edit, Trash2, Search, Filter, Eye, X, Tag, List } from "lucide-react";
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
import type { Product, Store, StoreCategory, InsertStore, InsertStoreCategory } from "@shared/schema";
import { insertStoreSchema, insertStoreCategorySchema } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [storeDetailView, setStoreDetailView] = useState<string | null>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [selectedStores, setSelectedStores] = useState<Set<string>>(new Set());
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: products } = useQuery<any>({
    queryKey: ["/api/admin/products"],
  });

  const { data: stores } = useQuery<any>({
    queryKey: ["/api/admin/stores"],
  });

  const { data: storeCategories } = useQuery<any>({
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
    const matchesCategory = !categoryFilter || store.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedStore = storeDetailView ? storeList.find(store => store.id === storeDetailView) : null;

  const onCategorySubmit = (data: InsertStoreCategory) => {
    createCategoryMutation.mutate(data);
  };

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
                      <SelectItem value="">All Categories</SelectItem>
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
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" data-testid="text-item-master-title">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-5 h-5 text-blue-400" />
                </div>
                📦 Item Mastery Hub
              </CardTitle>
              <CardDescription className="text-slate-300" data-testid="text-item-master-description">
                Advanced item and product management system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-slate-300" data-testid="text-item-master-placeholder">
                <div className="text-8xl mb-6">🔮</div>
                <div className="text-2xl font-bold mb-4 text-white">Magic in Progress</div>
                <div className="text-lg mb-2">Item Master Portal</div>
                <div className="text-sm opacity-75">Powerful item management spells being prepared...</div>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="animate-pulse mr-2">✨</span>
                  <span className="text-blue-300">Enchanting...</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
