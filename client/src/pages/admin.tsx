import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Package, BarChart3, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

export default function Admin() {
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: products } = useQuery<any>({
    queryKey: ["/api/admin/products"],
  });

  const productList = (products?.data as Product[]) || [];
  const dashboardStats = stats?.data || { totalProducts: 0, posOrders: 0, wholesaleOrders: 0, totalOrders: 0 };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="ghost" size="sm" data-testid="button-back-home">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Admin Dashboard</h1>
                <p className="text-xs text-muted-foreground" data-testid="text-page-subtitle">System Administration</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" data-testid="text-products-title">
              <Package className="w-5 h-5" />
              Products Management
            </CardTitle>
            <CardDescription data-testid="text-products-description">
              Manage your inventory of sweets and snacks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {productList.length > 0 ? (
              <div className="space-y-4">
                {productList.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border border-border rounded-lg" data-testid={`card-product-${product.id}`}>
                    <div>
                      <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                      <p className="text-sm text-muted-foreground" data-testid={`text-product-category-${product.id}`}>{product.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" data-testid={`badge-stock-${product.id}`}>Stock: {product.stock}</Badge>
                      <span className="font-semibold" data-testid={`text-price-${product.id}`}>${product.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground" data-testid="text-no-products">
                No products found. Add your first product to get started.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-quick-actions">Quick Actions</CardTitle>
            <CardDescription data-testid="text-actions-description">
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-add-product">
                <Package className="w-6 h-6" />
                Add Product
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-manage-users">
                <Users className="w-6 h-6" />
                Manage Users
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2" data-testid="button-view-reports">
                <BarChart3 className="w-6 h-6" />
                View Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
