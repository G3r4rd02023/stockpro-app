import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import {
    LogOut,
    Package,
    LayoutDashboard,
    Tags,
    Boxes,
    ClipboardList,
    Menu,
    AlertCircle,
    Camera,
    PieChart
} from 'lucide-react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { productService } from '../services/productService';

const Layout = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [lowStockCount, setLowStockCount] = useState(0);

    useEffect(() => {
        const fetchLowStock = async () => {
            try {
                const products = await productService.getAll();
                const lowStock = products.filter(p => p.currentStock <= (p.minStockThreshold || 5)).length;
                setLowStockCount(lowStock);
            } catch (error) {
                console.error('Error fetching low stock info:', error);
            }
        };

        fetchLowStock();
        // Refresh periodically or on route change? For now, fetch on mount/route change
    }, [location.pathname]);

    const navItems = [
        { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        { name: 'Categorías', path: '/categories', icon: Tags },
        { name: 'Productos', path: '/products', icon: Boxes },
        { name: 'Inventario', path: '/inventory', icon: ClipboardList },
        { name: 'Reportes', path: '/reports', icon: PieChart },
        { name: 'Escanear QR', path: '/scanner', icon: Camera },
    ];

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Overlay (Mobile) */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-20 flex items-center px-8 border-b border-gray-50">
                        <Link to="/" className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-200">
                                <Package className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">StockPro</span>
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`
                                        flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                                        ${isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/50'
                                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                        {item.name}
                                    </div>

                                    {/* Low Stock Badge on Products/Inventory */}
                                    {(item.path === '/products' || item.path === '/inventory') && lowStockCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                            {lowStockCount}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Profile / Logout */}
                    <div className="p-4 border-t border-gray-50 bg-gray-50/50">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
                                    {user?.fullName?.[0] || user?.email?.[0] || 'U'}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                        {user?.fullName || 'Usuario'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            {/* Low Stock General Alert */}
                            {lowStockCount > 0 && (
                                <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                                    <span className="text-[10px] font-semibold text-amber-700 leading-tight">
                                        {lowStockCount} productos con stock bajo
                                    </span>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl"
                                onClick={logout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Cerrar Sesión
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sticky top-0 z-30">
                    <button onClick={toggleSidebar} className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-600 p-1.5 rounded-lg shadow-md shadow-blue-100">
                            <Package className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">StockPro</span>
                    </div>
                    <div className="w-10" /> {/* Spacer */}
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10">
                    <div className="max-w-6xl mx-auto h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;

