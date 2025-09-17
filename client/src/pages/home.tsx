import { Link } from "wouter";
import { Settings, ShoppingCart, Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IndianSweetsPictogram } from "../components/ui/pictogram";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Settings className="text-primary-foreground text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">RCS-ERP</h1>
                <p className="text-xs text-muted-foreground">Enterprise Resource Planning</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center space-x-4">
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                data-testid="link-documentation"
              >
                Documentation
              </a>
              <a 
                href="#" 
                className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-sm font-medium transition-colors"
                data-testid="link-support"
              >
                Support
              </a>
              <Button 
                variant="secondary" 
                className="text-sm font-medium"
                data-testid="button-login"
              >
                <Settings className="mr-2 w-4 h-4" />
                Login
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 sm:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Indian Sweets Pictogram Section */}
            <div className="mb-12">
              <div className="flex justify-center items-center mb-8">
                <IndianSweetsPictogram />
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Welcome to <span className="text-primary">RCS-ERP</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                Comprehensive Enterprise Resource Planning system designed for Indian sweets and snacks businesses. 
                Manage your operations seamlessly across all departments.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {/* Admin Button */}
              <Link href="/admin" className="block">
                <Card className="group bg-card hover:bg-primary/5 border-2 border-border hover:border-primary rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground rounded-full flex items-center justify-center mb-4 transition-all duration-300">
                      <Settings className="text-2xl text-primary group-hover:text-primary-foreground w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-admin-title">Admin</h3>
                    <p className="text-muted-foreground text-sm" data-testid="text-admin-description">
                      System administration, user management, and configuration settings
                    </p>
                  </div>
                </Card>
              </Link>

              {/* POS Button */}
              <Link href="/pos" className="block">
                <Card className="group bg-card hover:bg-accent/5 border-2 border-border hover:border-accent rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-accent/10 group-hover:bg-accent group-hover:text-accent-foreground rounded-full flex items-center justify-center mb-4 transition-all duration-300">
                      <ShoppingCart className="text-2xl text-accent group-hover:text-accent-foreground w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-pos-title">POS</h3>
                    <p className="text-muted-foreground text-sm" data-testid="text-pos-description">
                      Point of Sale system for retail transactions and customer management
                    </p>
                  </div>
                </Card>
              </Link>

              {/* Wholesale Button */}
              <Link href="/wholesale" className="block">
                <Card className="group bg-card hover:bg-secondary/5 border-2 border-border hover:border-secondary rounded-xl p-8 transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-secondary/10 group-hover:bg-secondary group-hover:text-secondary-foreground rounded-full flex items-center justify-center mb-4 transition-all duration-300">
                      <Package className="text-2xl text-secondary group-hover:text-secondary-foreground w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2" data-testid="text-wholesale-title">Wholesale</h3>
                    <p className="text-muted-foreground text-sm" data-testid="text-wholesale-description">
                      Bulk order management, distributor relations, and inventory tracking
                    </p>
                  </div>
                </Card>
              </Link>
            </div>

            {/* Additional Info Section */}
            <div className="mt-16 bg-card border border-border rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Settings className="text-primary text-2xl mb-2" />
                  <h4 className="font-semibold text-foreground mb-1" data-testid="text-secure-title">Secure</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-secure-description">Enterprise-grade security</p>
                </div>
                <div className="flex flex-col items-center">
                  <ShoppingCart className="text-accent text-2xl mb-2" />
                  <h4 className="font-semibold text-foreground mb-1" data-testid="text-analytics-title">Analytics</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-analytics-description">Real-time business insights</p>
                </div>
                <div className="flex flex-col items-center">
                  <Package className="text-secondary text-2xl mb-2" />
                  <h4 className="font-semibold text-foreground mb-1" data-testid="text-mobile-title">Mobile Ready</h4>
                  <p className="text-sm text-muted-foreground" data-testid="text-mobile-description">Access anywhere, anytime</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Settings className="text-primary-foreground w-4 h-4" />
                </div>
                <span className="text-lg font-semibold text-foreground" data-testid="text-footer-title">RCS-ERP</span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md" data-testid="text-footer-description">
                Streamlining operations for Indian sweets and snacks businesses with comprehensive ERP solutions.
              </p>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-3" data-testid="text-modules-title">Modules</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/admin" className="hover:text-foreground transition-colors" data-testid="link-admin-footer">Administration</Link></li>
                <li><Link href="/pos" className="hover:text-foreground transition-colors" data-testid="link-pos-footer">Point of Sale</Link></li>
                <li><Link href="/wholesale" className="hover:text-foreground transition-colors" data-testid="link-wholesale-footer">Wholesale</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-foreground mb-3" data-testid="text-support-title">Support</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-documentation-footer">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-help-footer">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors" data-testid="link-contact-footer">Contact Us</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p data-testid="text-copyright">&copy; 2024 RCS-ERP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
