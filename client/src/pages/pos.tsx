import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product } from "@shared/schema";

interface CartItem extends Product {
  quantity: number;
}

export default function POS() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<any>({
    queryKey: ["/api/pos/products"],
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/pos/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order Created",
        description: "Order has been successfully created.",
      });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      queryClient.invalidateQueries({ queryKey: ["/api/pos/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    },
  });

  const productList = (products?.data as Product[]) || [];
  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.id !== productId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before checkout.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName: customerName || "Walk-in Customer",
      customerPhone,
      totalAmount: cartTotal.toFixed(2),
      status: "completed",
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p data-testid="text-loading">Loading products...</p>
        </div>
      </div>
    );
  }

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
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <ShoppingCart className="text-accent-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Point of Sale</h1>
                <p className="text-xs text-muted-foreground" data-testid="text-page-subtitle">Retail Transaction System</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-products-title">Products</CardTitle>
                <CardDescription data-testid="text-products-description">
                  Select items to add to cart
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productList.map((product) => (
                    <div key={product.id} className="border border-border rounded-lg p-4" data-testid={`card-product-${product.id}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold" data-testid={`text-product-name-${product.id}`}>{product.name}</h3>
                          <p className="text-sm text-muted-foreground" data-testid={`text-product-category-${product.id}`}>{product.category}</p>
                        </div>
                        <Badge variant="secondary" data-testid={`badge-stock-${product.id}`}>Stock: {product.stock}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3" data-testid={`text-product-description-${product.id}`}>
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold" data-testid={`text-price-${product.id}`}>${product.price}</span>
                        <Button 
                          onClick={() => addToCart(product)} 
                          size="sm"
                          disabled={product.stock === 0}
                          data-testid={`button-add-to-cart-${product.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart & Checkout */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-cart-title">Shopping Cart</CardTitle>
                <CardDescription data-testid="text-cart-description">
                  Review and checkout
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <Input
                    placeholder="Customer Name (Optional)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-testid="input-customer-name"
                  />
                  <Input
                    placeholder="Customer Phone (Optional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    data-testid="input-customer-phone"
                  />
                </div>

                {/* Cart Items */}
                <div className="space-y-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4" data-testid="text-empty-cart">
                      Cart is empty
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border border-border rounded" data-testid={`cart-item-${item.id}`}>
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-cart-product-name-${item.id}`}>{item.name}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-cart-unit-price-${item.id}`}>${item.price} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-8 text-center" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="w-16 text-right">
                          <span className="font-semibold" data-testid={`text-item-total-${item.id}`}>
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Total & Checkout */}
                {cart.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold" data-testid="text-total-label">Total:</span>
                      <span className="text-lg font-bold" data-testid="text-total-amount">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                      data-testid="button-checkout"
                    >
                      {createOrderMutation.isPending ? "Processing..." : "Checkout"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
