import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, DollarSign, AlertTriangle, Clock, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { productService } from '../services/productService';
import { stockService } from '../services/stockService';
import { MovementTypes } from '../types/stock.types';
import type { StockMovement } from '../types/stock.types';

const DashboardPage = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalProducts: 0,
        inventoryValue: 0,
        lowStockItems: 0
    });
    const [recentActivity, setRecentActivity] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            const [products, movements] = await Promise.all([
                productService.getAll(),
                stockService.getAll()
            ]);

            // Calculate Stats
            const totalProducts = products.length;
            const inventoryValue = products.reduce((acc, p) => acc + (p.price * p.currentStock), 0);
            const lowStockItems = products.filter(p => p.currentStock <= p.minStockThreshold).length;

            setStats({ totalProducts, inventoryValue, lowStockItems });

            // Get 5 most recent movements
            setRecentActivity(movements.sort((a, b) =>
                new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
            ).slice(0, 5));
        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-6">
                <h1 className="text-2xl font-bold text-gray-900">Bienvenido, {user?.fullName || user?.email}</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Aquí tienes el resumen actualizado de tu inventario en tiempo real.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Total Products Card */}
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-blue-50 text-blue-600 rounded-lg p-3">
                                <Package className="h-6 w-6" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate lowercase first-letter:uppercase">Total Productos</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.totalProducts}</div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inventory Value Card */}
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-50 text-green-600 rounded-lg p-3">
                                <DollarSign className="h-6 w-6" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate lowercase first-letter:uppercase">Valor del Inventario</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-3xl font-bold text-gray-900">
                                            {loading ? '...' : `$${stats.inventoryValue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Card */}
                <div className="bg-white overflow-hidden shadow-sm border border-gray-100 rounded-xl hover:shadow-md transition-shadow">
                    <div className="p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-amber-50 text-amber-600 rounded-lg p-3">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate lowercase first-letter:uppercase">Stock Bajo</dt>
                                    <dd className="flex items-baseline">
                                        <div className="text-3xl font-bold text-gray-900">{loading ? '...' : stats.lowStockItems}</div>
                                        {stats.lowStockItems > 0 && (
                                            <span className="ml-2 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                                Revisión necesaria
                                            </span>
                                        )}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2 bg-gray-50/30">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">Actividad Reciente</h2>
                </div>
                <div className="divide-y divide-gray-100">
                    {loading ? (
                        <div className="p-6 text-center text-gray-500">Cargando actividad...</div>
                    ) : recentActivity.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">No hay actividad reciente registrada.</div>
                    ) : (
                        recentActivity.map((activity) => (
                            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${activity.movementType === MovementTypes.Entry
                                        ? 'bg-green-100 text-green-600'
                                        : 'bg-red-100 text-red-600'
                                        }`}>
                                        {activity.movementType === MovementTypes.Entry
                                            ? <ArrowUpRight className="h-4 w-4" />
                                            : <ArrowDownRight className="h-4 w-4" />
                                        }
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {activity.movementType === MovementTypes.Entry ? 'Entrada' : 'Salida'}: {activity.productName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {activity.userName} • {activity.reason}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-sm font-bold ${activity.movementType === MovementTypes.Entry ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {activity.movementType === MovementTypes.Entry ? '+' : '-'}{activity.quantity}
                                    </p>
                                    <p className="text-[10px] text-gray-400 uppercase font-medium">
                                        {new Date(activity.movementDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {recentActivity.length > 0 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                        <a href="/inventory" className="text-sm font-semibold text-blue-600 hover:text-blue-700"> Ver todo el historial &rarr;</a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;

