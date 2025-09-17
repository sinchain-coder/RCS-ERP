# Overview

RCS-ERP is a comprehensive Enterprise Resource Planning system designed specifically for Indian sweets businesses. The application provides a full-stack solution for managing point-of-sale (POS) operations, wholesale transactions, product inventory, and administrative functions. Built with a modern React frontend and Express.js backend, it offers three distinct user interfaces: admin dashboard for system management, POS terminal for retail sales, and wholesale portal for bulk transactions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS with custom CSS variables for theming

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon Database serverless)
- **API Design**: RESTful endpoints with role-based routing (`/api/admin`, `/api/pos`, `/api/wholesale`)
- **Storage Layer**: Abstract storage interface with in-memory implementation for development

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Drizzle ORM schema definitions
- **Schema Design**: Four main entities - users, products, orders, and order_items
- **Data Types**: Support for decimal pricing, timestamps, and UUID primary keys
- **Relationships**: Foreign key constraints between orders and order items, products

## Authentication and Authorization
- **Role-Based Access**: Three user roles - admin, pos_user, wholesale_user
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Route Protection**: Role-based middleware for API endpoint access control

## API Structure
- **Admin Routes**: User management, product CRUD operations, system analytics
- **POS Routes**: Product browsing, order creation for retail sales
- **Wholesale Routes**: Bulk product operations with wholesale pricing
- **Data Validation**: Zod schemas for request/response validation integrated with Drizzle

## Component Architecture
- **Design System**: Consistent component library with variant-based styling
- **Form Handling**: React Hook Form with Zod resolvers for validation
- **UI Components**: Comprehensive set of accessible components (buttons, forms, modals, tables)
- **Mobile Responsive**: Mobile-first design with responsive breakpoints

## Development Environment
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Type Checking**: Strict TypeScript configuration across frontend, backend, and shared modules
- **Path Aliases**: Configured import aliases for cleaner code organization
- **Code Splitting**: Automatic code splitting with Vite bundling

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Database Migrations**: Drizzle Kit for schema migrations and database management

## UI and Styling
- **Radix UI**: Headless UI components for accessibility and functionality
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variants

## Development Tools
- **Replit Integration**: Specialized plugins for Replit development environment
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind and Autoprefixer plugins

## Form and Data Management
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: Schema validation for TypeScript with runtime type checking
- **TanStack Query**: Server state management with caching and synchronization
- **Date-fns**: Date utility library for formatting and manipulation

## Session and Storage
- **Connect PG Simple**: PostgreSQL session store for Express sessions
- **Crypto**: Node.js built-in module for UUID generation and security