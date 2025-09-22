## Lakshmi Services Frontend (React) – Setup Guide

This guide helps you build a React frontend for the Lakshmi Services e‑commerce backend you have. It covers project setup, routing, authentication with JWT, API integration, cart/checkout flows, and Cash on Delivery (COD).

### 1) Tech Stack
- React 
- React Router
- Redux Toolkit (state) + React-Redux
- Axios (HTTP)
- No online payment (Cash on Delivery only)
- Tailwind CSS or CSS Modules (optional)

### 2) Prerequisites
- Node.js >= 18
- Backend running (see backend README). Note the API base URL.

### 3) Create the project
Using Vite (recommended):
```bash
npm create vite@latest lakshmi-frontend -- --template react
cd lakshmi-frontend
npm install
npm install axios react-router-dom @reduxjs/toolkit react-redux
```

Or with CRA:
```bash
npx create-react-app lakshmi-frontend
cd lakshmi-frontend
npm install axios react-router-dom @reduxjs/toolkit react-redux
```

### 4) Environment variables
Create `.env` (Vite) or `.env.local` (CRA):
```bash
# Backend API
VITE_API_BASE_URL=http://localhost:5000

# No Stripe keys needed for COD
```
For CRA, use `REACT_APP_` prefix instead of `VITE_`.

### 5) Suggested project structure
```text
src/
  app/
    store.ts
  api/
    axiosClient.ts
    auth.ts
    products.ts
    cart.ts
    orders.ts
  features/
    auth/
      authSlice.ts
    cart/
      cartSlice.ts
  components/
    Navbar.tsx
    ProtectedRoute.tsx
    ProductCard.tsx
  pages/
    Home.tsx
    ProductList.tsx
    ProductDetail.tsx
    Cart.tsx
    Checkout.tsx
    Orders.tsx
    Login.tsx
    Register.tsx
    AdminProducts.tsx
    AdminOrders.tsx
  main.tsx
  App.tsx
```

### 6) Axios client and auth handling
Create `src/api/axiosClient.ts`:
```ts
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
```

Example API modules (e.g., `src/api/auth.ts`):
```ts
import axiosClient from './axiosClient';

export const register = (data: { name: string; email: string; password: string }) =>
  axiosClient.post('/auth/register', data);

export const login = (data: { email: string; password: string }) =>
  axiosClient.post('/auth/login', data);

export const getMe = () => axiosClient.get('/auth/me');
```

`src/api/products.ts`:
```ts
import axiosClient from './axiosClient';

export const getProducts = (params?: Record<string, string | number>) =>
  axiosClient.get('/products', { params });

export const getProduct = (id: string) => axiosClient.get(`/products/${id}`);

export const createProduct = (payload: any) => axiosClient.post('/products', payload);

export const updateProduct = (id: string, payload: any) => axiosClient.put(`/products/${id}`, payload);

export const deleteProduct = (id: string) => axiosClient.delete(`/products/${id}`);
```

`src/api/cart.ts`:
```ts
import axiosClient from './axiosClient';

export const getCart = () => axiosClient.get('/cart');
export const addToCart = (payload: { productId: string; quantity: number }) =>
  axiosClient.post('/cart', payload);
export const updateCartItem = (productId: string, quantity: number) =>
  axiosClient.put(`/cart/${productId}`, { quantity });
export const removeFromCart = (productId: string) => axiosClient.delete(`/cart/${productId}`);
```

`src/api/orders.ts`:
```ts
import axiosClient from './axiosClient';

export const createOrder = (payload: any) => axiosClient.post('/orders', payload);
export const getMyOrders = () => axiosClient.get('/orders');
export const getOrder = (id: string) => axiosClient.get(`/orders/${id}`);
export const getAllOrders = () => axiosClient.get('/orders/all');
export const updateOrderStatus = (id: string, orderStatus: string) =>
  axiosClient.put(`/orders/${id}`, { orderStatus });
```

// No payment API module needed for COD

### 7) Redux Toolkit store
`src/app/store.ts`:
```ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import cartReducer from '../features/cart/cartSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

`src/features/auth/authSlice.ts` (minimal):
```ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../../api/auth';

type User = { id: string; name: string; email: string; role: 'user' | 'admin' } | null;
type AuthState = { user: User; token: string | null; status: 'idle' | 'loading' | 'failed' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  status: 'idle',
};

export const loginThunk = createAsyncThunk('auth/login', async (payload: { email: string; password: string }) => {
  const { data } = await authApi.login(payload);
  return data;
});

export const meThunk = createAsyncThunk('auth/me', async () => {
  const { data } = await authApi.getMe();
  return data.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.token;
        localStorage.setItem('token', action.payload.token);
        state.user = action.payload.user;
      })
      .addCase(meThunk.fulfilled, (state, action) => {
        state.user = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

`src/features/cart/cartSlice.ts` (minimal):
```ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as cartApi from '../../api/cart';

export const fetchCart = createAsyncThunk('cart/fetch', async () => {
  const { data } = await cartApi.getCart();
  return data.data;
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] as any[], status: 'idle' as 'idle' | 'loading' },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload.products || [];
      state.status = 'idle';
    });
  },
});

export default cartSlice.reducer;
```

### 8) App bootstrap and routing
`src/main.tsx` (Vite):
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
```

`src/components/ProtectedRoute.tsx`:
```tsx
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, role }: { children: JSX.Element; role?: 'admin' | 'user' }) {
  const token = localStorage.getItem('token');
  const user = token ? JSON.parse(atob(token.split('.')[1])) : null; // basic decode for role; consider storing user in state
  if (!token) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/" replace />;
  return children;
}
```

`src/App.tsx` (example routes):
```tsx
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
      <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />

      <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />

      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
```

### 9) Pages – minimal examples
`src/pages/Login.tsx`:
```tsx
import { useState } from 'react';
import { useAppDispatch } from '../hooks';
import { loginThunk } from '../features/auth/authSlice';

export default function Login() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form onSubmit={(e) => { e.preventDefault(); dispatch(loginThunk({ email, password })); }}>
      <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
```

`src/pages/ProductList.tsx` (basic fetch):
```tsx
import { useEffect, useState } from 'react';
import { getProducts } from '../api/products';

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);
  useEffect(() => {
    getProducts().then(({ data }) => setProducts(data.data));
  }, []);
  return (
    <div>
      <h1>Products</h1>
      <ul>
        {products.map((p) => (<li key={p._id}>{p.name} - ${p.price}</li>))}
      </ul>
    </div>
  );
}
```

### 10) Checkout (Cash on Delivery)
For Cash on Delivery, the checkout page should:
- Collect and validate shipping address fields
- Call `POST /api/orders` with `{ shippingAddress, paymentMethod: 'cod' }`
- On success, show an order confirmation screen with the Order ID
- No payment UI is required

Minimal example for creating a COD order:
```tsx
// inside Checkout.tsx submit handler
import { createOrder } from '../api/orders';

async function placeOrder(address: { address: string; city: string; postalCode: string; country: string }) {
  const { data } = await createOrder({ shippingAddress: address, paymentMethod: 'cod' });
  // data.data contains the created order
  // redirect to orders page or show confirmation
}
```

### 11) Running the app
```bash
# Dev
npm run dev

# Build
npm run build

# Preview (Vite)
npm run preview
```

### 12) Admin routes
- Protect admin pages with `ProtectedRoute role="admin"`.
- Use backend admin endpoints to manage products and orders.

### 13) Tips
- Store JWT in `localStorage` (already used above) or in httpOnly cookies (more secure, requires backend change).
- Handle 401 globally in Axios to redirect to `/login`.
- Use skeletons/spinners for loading states.
- Add pagination and filters to product listing (`category`, `minPrice`, `maxPrice`, `sort`).

### 14) Deployment
- Set `VITE_API_BASE_URL` to your backend URL.
- Build and deploy to any static host (Vercel, Netlify, S3+CloudFront, etc.).


