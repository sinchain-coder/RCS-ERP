import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Package, BarChart3, Settings, Store, Clipboard, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: products } = useQuery<any>({
    queryKey: ["/api/admin/products"],
  });

  const productList = (products?.data as Product[]) || [];
  const dashboardStats = stats?.data || { totalProducts: 0, posOrders: 0, wholesaleOrders: 0, totalOrders: 0 };

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "store-master", label: "Store Master", icon: Store },
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

        {activeTab === "store-master" && (
          <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-600/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white" data-testid="text-store-master-title">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Store className="w-5 h-5 text-orange-400" />
                </div>
                🏪 Store Command Center
              </CardTitle>
              <CardDescription className="text-slate-300" data-testid="text-store-master-description">
                Manage your empire of sweet shop locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16 text-slate-300" data-testid="text-store-master-placeholder">
                <div className="text-8xl mb-6">🏗️</div>
                <div className="text-2xl font-bold mb-4 text-white">Under Construction</div>
                <div className="text-lg mb-2">Store Master Arena</div>
                <div className="text-sm opacity-75">This powerful module is being crafted...</div>
                <div className="mt-6 inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-full">
                  <span className="animate-spin mr-2">⚙️</span>
                  <span className="text-orange-300">Building in Progress</span>
                </div>
              </div>
            </CardContent>
          </Card>
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
