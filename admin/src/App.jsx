import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from './components/layout/MainLayout'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { ProductsPage } from './pages/products/ProductsPage'
import { ProductFormPage } from './pages/products/ProductFormPage'
import { CategoriesPage } from './pages/products/CategoriesPage'
import { BrandsPage } from './pages/products/BrandsPage'
import { TagsPage } from './pages/products/TagsPage'
import { AttributesPage } from './pages/products/AttributesPage'
import { ReviewsPage } from './pages/reviews/ReviewsPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { OrderDetailPage } from './pages/orders/OrderDetailPage'
import { CustomersPage } from './pages/customers/CustomersPage'
import { CustomerDetailPage } from './pages/customers/CustomerDetailPage'
import { ReportsPage } from './pages/reports/ReportsPage'
import { CouponsPage } from './pages/marketing/CouponsPage'
import { InventoryPage } from './pages/inventory/InventoryPage'
import { PaymentsPage } from './pages/payments/PaymentsPage'
import { SettingsPage } from './pages/settings/SettingsPage'
import { LoginPage } from './pages/auth/LoginPage'
import { MediaPage } from './pages/media/MediaPage'
import { BannersPage } from './pages/content/BannersPage'
import { FeaturedCategoriesPage } from './pages/content/FeaturedCategoriesPage'
import { AboutBlogPage } from './pages/content/AboutBlogPage'
import { ProductSectionPage } from './pages/content/ProductSectionPage'
import { SummerSalePage } from './pages/content/SummerSalePage'
import { AllProductionPage } from './pages/content/AllProductionPage'
import { GreatSavingPage } from './pages/content/GreatSavingPage'
import { HottestBlogPage } from './pages/content/HottestBlogPage'
import { BlockbusterPage } from './pages/content/BlockbusterPage'
import { OfferSectionPage } from './pages/content/OfferSectionPage'
import { FeaturedNowPage } from './pages/content/FeaturedNowPage'
import { ShortlistPage } from './pages/content/ShortlistPage'
import { SponsoredPage } from './pages/content/SponsoredPage'
import { OurClientPage } from './pages/content/OurClientPage'
import { EnquiriesPage } from './pages/enquiries/EnquiriesPage'
import { CollectionPage } from './pages/content/CollectionPage'
import { StatusPage } from './pages/status/StatusPage'
import { ExtensionsPage } from './pages/extensions/ExtensionsPage'
import { useAuthStore } from './store/authStore'

function RequireAuth({ children }) {
  const token = localStorage.getItem('cg_token')
  return token ? children : <Navigate to="/login" replace />
}

function HelpPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Documentation</h2>
        <p className="text-sm text-gray-500 mb-4">Full documentation for the Corporate Gifts Dashboard.</p>
        <a href="#" className="text-sm text-blue-600 hover:underline">View Documentation →</a>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">Support</h2>
        <p className="text-sm text-gray-500 mb-4">Get help from our support team.</p>
        <a href="mailto:support@corporategifts.in" className="text-sm text-blue-600 hover:underline">support@corporategifts.in</a>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter basename="/admin">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/categories" element={<CategoriesPage />} />
          <Route path="/products/brands" element={<BrandsPage />} />
          <Route path="/products/tags" element={<TagsPage />} />
          <Route path="/products/attributes" element={<AttributesPage />} />
          <Route path="/products/reviews" element={<ReviewsPage />} />
          <Route path="/products/:id" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/new" element={<CustomerDetailPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/sales" element={<ReportsPage />} />
          <Route path="/reports/products" element={<ReportsPage />} />
          <Route path="/reports/customers" element={<ReportsPage />} />
          <Route path="/marketing" element={<CouponsPage />} />
          <Route path="/marketing/coupons" element={<CouponsPage />} />
          <Route path="/marketing/campaigns" element={<CouponsPage />} />
          <Route path="/coupons" element={<CouponsPage />} />
          <Route path="/status" element={<StatusPage />} />
          <Route path="/extensions" element={<ExtensionsPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/low-stock" element={<InventoryPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/content/banners" element={<BannersPage />} />
          <Route path="/content/featured-categories" element={<FeaturedCategoriesPage />} />
          <Route path="/content/about-blog" element={<AboutBlogPage />} />
          <Route path="/content/product-section" element={<ProductSectionPage />} />
          <Route path="/content/summer-sale" element={<SummerSalePage />} />
          <Route path="/content/all-production" element={<AllProductionPage />} />
          <Route path="/content/great-saving" element={<GreatSavingPage />} />
          <Route path="/content/hottest-blog" element={<HottestBlogPage />} />
          <Route path="/content/blockbuster" element={<BlockbusterPage />} />
          <Route path="/content/offer-section" element={<OfferSectionPage />} />
          <Route path="/content/featured-now" element={<FeaturedNowPage />} />
          <Route path="/content/shortlist" element={<ShortlistPage />} />
          <Route path="/content/sponsored" element={<SponsoredPage />} />
          <Route path="/content/our-client" element={<OurClientPage />} />
          <Route path="/content/collection" element={<CollectionPage />} />
          <Route path="/enquiries" element={<EnquiriesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/:tab" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
