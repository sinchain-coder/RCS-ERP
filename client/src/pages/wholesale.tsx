import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Package, Plus, Minus, Building, CheckCircle, Truck, Eye, Sparkles, DollarSign, Camera, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Product, Order, Dispatch, DispatchStep, DispatchItem } from "@shared/schema";

interface CartItem extends Product {
  quantity: number;
  unitPrice: string; // wholesale price
}

export default function Wholesale() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [activeTab, setActiveTab] = useState("wholesale");
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [acknowledgmentPhoto, setAcknowledgmentPhoto] = useState<string>("");
  const { toast } = useToast();

  const { data: products, isLoading } = useQuery<any>({
    queryKey: ["/api/wholesale/products"],
  });

  // Orders ready for dispatch (approved wholesale orders)
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{data: Order[]}>({
    queryKey: ["/api/wholesale/orders"],
    enabled: activeTab === "dispatch",
  });

  // Existing dispatches for wholesale orders
  const { data: dispatchesData, isLoading: dispatchesLoading } = useQuery<{data: Dispatch[]}>({
    queryKey: ["/api/admin/dispatches", "wholesale"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/dispatches?type=wholesale");
      return response.json();
    },
    enabled: activeTab === "dispatch",
  });

  // Dispatch items for selected dispatch
  const { data: selectedDispatchItemsData } = useQuery<{data: DispatchItem[]}>({
    queryKey: ["/api/admin/dispatch-items", selectedDispatch?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/dispatch-items?dispatchId=${selectedDispatch?.id}`);
      return response.json();
    },
    enabled: !!selectedDispatch?.id,
  });

  // Dispatch steps for selected dispatch
  const { data: selectedDispatchStepsData } = useQuery<{data: DispatchStep[]}>({
    queryKey: ["/api/admin/dispatch-steps", selectedDispatch?.id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/admin/dispatch-steps?dispatchId=${selectedDispatch?.id}`);
      return response.json();
    },
    enabled: !!selectedDispatch?.id,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/wholesale/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Wholesale Order Created",
        description: "Bulk order has been successfully created.",
        className: "celebration-bounce",
      });
      setCart([]);
      setCustomerName("");
      setCustomerPhone("");
      queryClient.invalidateQueries({ queryKey: ["/api/wholesale/orders"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wholesale order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Wholesale dispatch mutations
  const createDispatchMutation = useMutation({
    mutationFn: async (data: { orderId?: string, type: string }) => {
      // Use the correct endpoint that populates customerName and totalItems from order data
      if (data.orderId) {
        const response = await apiRequest("POST", `/api/admin/dispatches/from-order/${data.orderId}`, { type: data.type });
        return response.json();
      } else {
        // Fallback for direct dispatch creation (not from existing orders)
        const response = await apiRequest("POST", "/api/admin/dispatches", data);
        return response.json();
      }
    },
    onSuccess: (response: any) => {
      toast({
        title: "Wholesale Dispatch Created! 🎉",
        description: "Bulk order dispatch workflow has been started successfully.",
        className: "celebration-bounce confetti-celebration",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatches"] });
      // Initialize steps for the new dispatch
      if (response?.data?.id) {
        initializeStepsMutation.mutate(response.data.id);
      }
    },
  });

  const initializeStepsMutation = useMutation({
    mutationFn: async (dispatchId: string) => {
      const response = await apiRequest("POST", `/api/admin/dispatches/${dispatchId}/initialize-steps`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatch-steps"] });
    },
  });

  const completeStepMutation = useMutation({
    mutationFn: async ({ stepId, stepName }: { stepId: string; stepName: string }) => {
      const response = await apiRequest("PUT", `/api/admin/dispatch-steps/${stepId}/complete`, { stepName });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Step Completed! ✨",
        description: "Excellent! Moving to the next step.",
        className: "celebration-bounce",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatch-steps"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatches"] });
    },
  });

  const updateDispatchItemQuantityMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      const response = await apiRequest("PUT", `/api/admin/dispatch-items/${itemId}/quantity`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Quantity Updated",
        description: "Wholesale dispatch item quantity has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatch-items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dispatches"] });
    },
  });

  const productList = (products?.data as Product[]) || [];
  const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.unitPrice) * item.quantity), 0);

  // Wholesale dispatch data processing
  const ordersList = (ordersData?.data as Order[]) || [];
  const dispatchesList = (dispatchesData?.data as Dispatch[]) || [];
  const selectedDispatchItems = (selectedDispatchItemsData?.data as DispatchItem[]) || [];
  const selectedDispatchSteps = (selectedDispatchStepsData?.data as DispatchStep[]) || [];

  // Wholesale-specific gamified step progression
  const getDispatchProgress = (dispatch: Dispatch) => {
    if (dispatch.totalItems && dispatch.dispatchedItems) {
      return (dispatch.dispatchedItems / dispatch.totalItems) * 100;
    }
    // Fallback to step-based progress for wholesale workflow
    const stepProgress = {
      'order_received': 15,
      'order_confirmed': 30,
      'payment_received': 45,
      'checked': 65,
      'dispatched': 85,
      'acknowledgement_sent': 100
    };
    return stepProgress[dispatch.currentStep as keyof typeof stepProgress] || 0;
  };

  const getWholesaleStepIcon = (stepName: string) => {
    switch (stepName) {
      case 'order_received': return Package;
      case 'order_confirmed': return CheckCircle;
      case 'payment_received': return CreditCard;
      case 'checked': return Eye;
      case 'dispatched': return Truck;
      case 'acknowledgement_sent': return Camera;
      default: return Package;
    }
  };

  const getWholesaleStepColor = (stepName: string, isCompleted: boolean) => {
    if (isCompleted) return "bg-green-500 text-white";
    switch (stepName) {
      case 'order_received': return "bg-blue-500 text-white";
      case 'order_confirmed': return "bg-emerald-500 text-white";
      case 'payment_received': return "bg-amber-500 text-white";
      case 'checked': return "bg-orange-500 text-white";
      case 'dispatched': return "bg-indigo-500 text-white";
      case 'acknowledgement_sent': return "bg-purple-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const createDispatchFromOrder = (orderId: string) => {
    createDispatchMutation.mutate({ orderId, type: "wholesale" });
  };

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 10 } // wholesale quantities
            : item
        );
      } else {
        return [...prevCart, { 
          ...product, 
          quantity: 10, // minimum wholesale quantity
          unitPrice: product.price // wholesale price from API
        }];
      }
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 10) { // minimum wholesale quantity
      toast({
        title: "Minimum Quantity",
        description: "Wholesale orders require minimum 10 units per item.",
        variant: "destructive",
      });
      return;
    }
    
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

    if (!customerName.trim()) {
      toast({
        title: "Customer Information Required",
        description: "Please provide customer name for wholesale orders.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerName,
      customerPhone,
      totalAmount: cartTotal.toFixed(2),
      status: "pending", // wholesale orders need approval
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: parseFloat(item.unitPrice)
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Package className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p data-testid="text-loading">Loading wholesale products...</p>
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
              <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                <Package className="text-secondary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground" data-testid="text-page-title">Wholesale Portal</h1>
                <p className="text-xs text-muted-foreground" data-testid="text-page-subtitle">Bulk Order Management</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="wholesale" data-testid="tab-wholesale">
              <Building className="w-4 h-4 mr-2" />
              Wholesale Portal
            </TabsTrigger>
            <TabsTrigger value="dispatch" data-testid="tab-dispatch">
              <Package className="w-4 h-4 mr-2" />
              Order Dispatch
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wholesale" className="mt-6">
            {/* Wholesale Info Banner */}
            <Card className="mb-8 bg-secondary/5 border-secondary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Building className="w-6 h-6 text-secondary" />
                  <div>
                    <h3 className="font-semibold text-secondary" data-testid="text-wholesale-info-title">Wholesale Pricing</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-wholesale-info-description">
                      Special wholesale prices applied. Minimum order quantity: 10 units per item.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Products */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle data-testid="text-products-title">Wholesale Products</CardTitle>
                <CardDescription data-testid="text-products-description">
                  Bulk pricing available for all items
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
                        <div>
                          <span className="text-lg font-bold text-secondary" data-testid={`text-wholesale-price-${product.id}`}>
                            ${product.price}
                          </span>
                          <p className="text-xs text-muted-foreground">wholesale price</p>
                        </div>
                        <Button 
                          onClick={() => addToCart(product)} 
                          size="sm"
                          disabled={product.stock < 10}
                          variant="secondary"
                          data-testid={`button-add-to-cart-${product.id}`}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add (min 10)
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
                <CardTitle data-testid="text-cart-title">Bulk Order</CardTitle>
                <CardDescription data-testid="text-cart-description">
                  Review wholesale order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <Input
                    placeholder="Business/Customer Name *"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    data-testid="input-customer-name"
                    required
                  />
                  <Input
                    placeholder="Contact Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    data-testid="input-customer-phone"
                  />
                </div>

                {/* Cart Items */}
                <div className="space-y-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4" data-testid="text-empty-cart">
                      No items in wholesale order
                    </p>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border border-border rounded" data-testid={`cart-item-${item.id}`}>
                        <div className="flex-1">
                          <p className="font-medium" data-testid={`text-cart-product-name-${item.id}`}>{item.name}</p>
                          <p className="text-sm text-muted-foreground" data-testid={`text-cart-unit-price-${item.id}`}>${item.unitPrice} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 10)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-12 text-center" data-testid={`text-quantity-${item.id}`}>{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 10)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="w-20 text-right">
                          <span className="font-semibold" data-testid={`text-item-total-${item.id}`}>
                            ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
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
                      <span className="text-lg font-bold" data-testid="text-total-label">Order Total:</span>
                      <span className="text-lg font-bold text-secondary" data-testid="text-total-amount">${cartTotal.toFixed(2)}</span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      className="w-full"
                      disabled={createOrderMutation.isPending}
                      variant="secondary"
                      data-testid="button-checkout"
                    >
                      {createOrderMutation.isPending ? "Processing..." : "Submit Wholesale Order"}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center mt-2" data-testid="text-approval-note">
                      * Wholesale orders require approval
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
            </div>
          </TabsContent>

          <TabsContent value="dispatch" className="mt-6">
            {/* Dispatch Management Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Orders Ready for Dispatch */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-dispatch-orders-title">Orders Ready for Dispatch</CardTitle>
                  <CardDescription data-testid="text-dispatch-orders-description">
                    Approved wholesale orders awaiting dispatch
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Package className="w-6 h-6 animate-spin" />
                    </div>
                  ) : ordersList.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-orders">
                      No orders ready for dispatch
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {ordersList.map((order) => (
                        <div key={order.id} className="border border-border rounded-lg p-4" data-testid={`card-order-${order.id}`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold" data-testid={`text-order-customer-${order.id}`}>{order.customerName}</h3>
                              <p className="text-sm text-muted-foreground" data-testid={`text-order-phone-${order.id}`}>{order.customerPhone}</p>
                            </div>
                            <Badge variant="secondary" data-testid={`badge-order-status-${order.id}`}>{order.status}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold text-secondary" data-testid={`text-order-total-${order.id}`}>
                              ${order.totalAmount}
                            </span>
                            <Button 
                              onClick={() => createDispatchFromOrder(order.id)} 
                              size="sm"
                              disabled={createDispatchMutation.isPending}
                              className="gamified-button"
                              data-testid={`button-create-dispatch-${order.id}`}
                            >
                              <Truck className="w-4 h-4 mr-1" />
                              Create Dispatch
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Active Dispatches */}
              <Card>
                <CardHeader>
                  <CardTitle data-testid="text-active-dispatches-title">Active Dispatches</CardTitle>
                  <CardDescription data-testid="text-active-dispatches-description">
                    Wholesale orders in dispatch workflow
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dispatchesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Package className="w-6 h-6 animate-spin" />
                    </div>
                  ) : dispatchesList.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8" data-testid="text-no-dispatches">
                      No active wholesale dispatches
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {dispatchesList.map((dispatch) => (
                        <Card key={dispatch.id} className="cursor-pointer hover:shadow-md transition-shadow dispatch-card" data-testid={`card-dispatch-${dispatch.id}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-semibold" data-testid={`text-dispatch-id-${dispatch.id}`}>Dispatch #{dispatch.id}</h3>
                                <p className="text-sm text-muted-foreground" data-testid={`text-dispatch-customer-${dispatch.id}`}>{dispatch.customerName}</p>
                              </div>
                              <Badge 
                                variant="secondary" 
                                className={getWholesaleStepColor(dispatch.currentStep, false)}
                                data-testid={`badge-dispatch-status-${dispatch.id}`}
                              >
                                {dispatch.currentStep?.replace('_', ' ').toUpperCase()}
                              </Badge>
                            </div>
                            
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span data-testid={`text-progress-label-${dispatch.id}`}>Progress</span>
                                <span data-testid={`text-progress-percent-${dispatch.id}`}>{Math.round(getDispatchProgress(dispatch))}%</span>
                              </div>
                              <Progress value={getDispatchProgress(dispatch)} className="h-2 gamified-progress" />
                            </div>

                            <Button 
                              onClick={() => setSelectedDispatch(dispatch)} 
                              size="sm" 
                              variant="outline" 
                              className="w-full gamified-button"
                              data-testid={`button-view-dispatch-${dispatch.id}`}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Selected Dispatch Details Dialog */}
            {selectedDispatch && (
              <Dialog open={!!selectedDispatch} onOpenChange={() => setSelectedDispatch(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-dispatch-details">
                  <DialogHeader>
                    <DialogTitle data-testid="text-dispatch-details-title">
                      Wholesale Dispatch #{selectedDispatch.id}
                    </DialogTitle>
                    <DialogDescription data-testid="text-dispatch-details-description">
                      Customer: {selectedDispatch.customerName} | Items: {selectedDispatch.totalItems}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Dispatch Steps */}
                    <div>
                      <h3 className="font-semibold mb-4" data-testid="text-dispatch-steps-title">Wholesale Workflow Steps</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {selectedDispatchSteps.map((step) => {
                          const StepIcon = getWholesaleStepIcon(step.stepName);
                          return (
                            <div key={step.id} className="flex items-center space-x-3" data-testid={`step-item-${step.id}`}>
                              <Button
                                onClick={() => completeStepMutation.mutate({ stepId: step.id, stepName: step.stepName })}
                                disabled={step.isCompleted || completeStepMutation.isPending}
                                size="sm"
                                className={`${getWholesaleStepColor(step.stepName, step.isCompleted)} ${step.isCompleted ? 'dispatch-step-completed' : 'gamified-button'}`}
                                data-testid={`button-step-${step.id}`}
                              >
                                {step.isCompleted ? (
                                  <CheckCircle className="w-4 h-4 success-sparkle" />
                                ) : (
                                  <StepIcon className="w-4 h-4" />
                                )}
                              </Button>
                              <div className="flex-1">
                                <p className="text-sm font-medium" data-testid={`text-step-name-${step.id}`}>
                                  {step.stepName.replace('_', ' ').toUpperCase()}
                                </p>
                                {step.isCompleted && (
                                  <p className="text-xs text-muted-foreground success-sparkle" data-testid={`text-step-completed-${step.id}`}>
                                    Completed ✨
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Dispatch Items */}
                    {selectedDispatchItems.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-4" data-testid="text-dispatch-items-title">Dispatch Items</h3>
                        <div className="space-y-3">
                          {selectedDispatchItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-3 border border-border rounded" data-testid={`dispatch-item-${item.id}`}>
                              <div className="flex-1">
                                <p className="font-medium" data-testid={`text-dispatch-item-name-${item.id}`}>{item.itemName}</p>
                                <p className="text-sm text-muted-foreground" data-testid={`text-dispatch-item-price-${item.id}`}>${item.unitPrice} each</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateDispatchItemQuantityMutation.mutate({ 
                                    itemId: item.id, 
                                    quantity: Math.max(10, item.dispatchedQuantity - 10) 
                                  })}
                                  disabled={updateDispatchItemQuantityMutation.isPending}
                                  data-testid={`button-dispatch-decrease-${item.id}`}
                                >
                                  <Minus className="w-3 h-3" />
                                </Button>
                                <span className="w-12 text-center" data-testid={`text-dispatch-quantity-${item.id}`}>{item.dispatchedQuantity}</span>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateDispatchItemQuantityMutation.mutate({ 
                                    itemId: item.id, 
                                    quantity: item.dispatchedQuantity + 10 
                                  })}
                                  disabled={updateDispatchItemQuantityMutation.isPending}
                                  data-testid={`button-dispatch-increase-${item.id}`}
                                >
                                  <Plus className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="w-24 text-right">
                                <span className="font-semibold" data-testid={`text-dispatch-item-total-${item.id}`}>
                                  ${(parseFloat(item.unitPrice) * item.dispatchedQuantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
