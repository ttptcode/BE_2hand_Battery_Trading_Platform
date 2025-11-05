import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../layouts/RootLayout";
import { ProtectedAdminRoute } from "./ProtectedAdminRoute";

import Ads from "../pages/Customer/AdsPage/AdsPage";

import LandingPage from "../pages/Customer/LandingPage/LandingPage";
import ProductList from "../pages/Customer/ProductListPage/ProductList";
import ChatBoxHome from "../pages/Customer/ChatBox/ChatBoxHome";
import AdminPage from "../pages/Admin/AdminPage";
import LoginAdmin from "../pages/Admin/LoginAdmin/LoginAdmin";
import NotFound from "../components/Error/NotFound";
import ProductDetailPage from "../pages/Customer/ProductDetailPage/ProductDetailPage";
import PostPage from "../pages/Customer/PostPage/PostPage";
import GoogleCallback from "../pages/Customer/LoginPage/GoogleCallback";
import PlansPage from "../pages/Customer/PlansPage/PlansPage";
import PaymentCallback from "../pages/Customer/PaymentCallback/PaymentCallback";

import PlansManagement from "../pages/Admin/PlansManagement/PlansManagement";
import ItemTypesManagement from "../pages/Admin/ItemTypesManagement/ItemTypesManagement";
import BlogPage from "../pages/Customer/Blog/BlogPage";
import BlogDetailPage from "../pages/Customer/Blog/BlogPageDetail";
import ProfilePage from "../pages/Customer/ProfilePage/ProfilePage";
import AboutUsPage from "../pages/Customer/AboutUs/AboutUs";
import WishlistPage from "../pages/Customer/ProfilePage/WishlistPage";
import Dashboard from "../pages/Admin/Dashboard/Dashboard";
import PaymentsManagement from "../pages/Admin/Dashboard/PaymentManagement";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    handle: { breadcrumb: "Trang chủ" },
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "products",
        element: <ProductList />,
        handle: { breadcrumb: "Xe cộ" },
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
        handle: { breadcrumb: "Chi tiết xe" },
      },
      {
        path: "chat",
        element: <ChatBoxHome />,
        handle: { breadcrumb: "Hộp chat" },
      },
      {
        path: "my-ads",
        element: <Ads />,
        handle: { breadcrumb: "Quản lý tin" },
      },
      {
        path: "product/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "post-item",
        element: <PostPage />,
        handle: { breadcrumb: "Đăng tin" },
      },
      {
        path: "auth/google/callback",
        element: <GoogleCallback />,
      },
      {
        path: "plans",
        element: <PlansPage />,
        handle: { breadcrumb: "Các gói dịch vụ đăng tin" },
      },
      {
        path: "payment-callback",
        element: <PaymentCallback />,
        handle: { breadcrumb: "Kết quả thanh toán" },
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "blog",
        element: <BlogPage />,
      },
      {
        path: "blog/:slug",
        element: <BlogDetailPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "about-us",
        element: <AboutUsPage />,
      },
      {
        path: "wishlist",
        element: <WishlistPage />,
      },
    ],
  },
  {
    path: "/admin/login",
    element: <LoginAdmin />,
    handle: { breadcrumb: "Đăng nhập Admin" },
  },
  {
    path: "/admin",
    element: (
      <ProtectedAdminRoute>
        <AdminPage />
      </ProtectedAdminRoute>
    ),
    handle: { breadcrumb: "Trang quản trị" },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { breadcrumb: "Dashboard" },
      },
      {
        path: "PaymentsManagement",
        element: <PaymentsManagement />,
        handle: { breadcrumb: "Quản lý doanh thu" },
      },
      {
        path: "plans",
        element: <PlansManagement />,
        handle: { breadcrumb: "Quản lý gói" },
      },
      {
        path: "item-types",
        element: <ItemTypesManagement />,
        handle: { breadcrumb: "Quản lý loại sản phẩm" },
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
