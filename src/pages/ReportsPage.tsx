import { useEffect, useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import {
    Download,
    TrendingUp,
    DollarSign,
    Package,
    AlertTriangle,
    FileText,
    ArrowUpRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { reportService } from '../services/reportService';
import type { Product } from '../types/product.types';
import type { Category } from '../types/category.types';

const ReportsPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [productsData, categoriesData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll()
            ]);
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            toast.error('Error al cargar datos para reportes');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCSV = () => {
        try {
            reportService.exportProductsToCSV(products, categories);
            toast.success('Reporte exportado correctamente');
        } catch (error) {
            toast.error('Error al exportar reporte');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const inventoryValueData = reportService.getInventoryValueByCategory(products, categories);
    const productCountData = reportService.getProductCountByCategory(products, categories);
    const stockStatusData = reportService.getStockStatusDistribution(products);

    const totalInventoryValue = products.reduce((sum, p) => sum + (p.price * p.currentStock), 0);
    const totalProducts = products.length;
    const lowStockCount = products.filter(p => p.currentStock <= (p.minStockThreshold || 5)).length;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Reportes y Análisis</h1>
                    <p className="text-gray-500 mt-1 text-sm">Visualiza el estado de tu inventario y genera exportaciones.</p>
                </div>
                <Button onClick={handleExportCSV} className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar Catálogo (CSV)
                </Button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-blue-50 rounded-xl">
                        <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Valor Total Inventario</p>
                        <h3 className="text-2xl font-bold text-gray-900">${totalInventoryValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                        <p className="text-[10px] text-emerald-600 font-bold flex items-center mt-1 uppercase tracking-tight">
                            <ArrowUpRight className="h-3 w-3 mr-1" /> Saludable
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 rounded-xl">
                        <Package className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Total de Productos</p>
                        <h3 className="text-2xl font-bold text-gray-900">{totalProducts}</h3>
                        <p className="text-[10px] text-gray-500 font-bold flex items-center mt-1 uppercase tracking-tight">
                            SKUs Activos
                        </p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-5">
                    <div className={`p-4 rounded-xl ${lowStockCount > 0 ? 'bg-amber-50' : 'bg-emerald-50'}`}>
                        <AlertTriangle className={`h-6 w-6 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-400">Stock Crítico</p>
                        <h3 className={`text-2xl font-bold ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{lowStockCount}</h3>
                        <p className={`text-[10px] font-bold flex items-center mt-1 uppercase tracking-tight ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {lowStockCount > 0 ? 'Requieren atención' : 'Sin alertas'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Inventory Value by Category - Bar Chart */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <TrendingUp className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Valor por Categoría</h2>
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={inventoryValueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name="Valor ($)" radius={[6, 6, 0, 0]}>
                                    {inventoryValueData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Stock Status Distribution - Pie Chart */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Estado del Stock</h2>
                        </div>
                    </div>
                    <div className="h-[350px] w-full flex flex-col md:flex-row items-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stockStatusData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {stockStatusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Product Count by Category - Horizontal Bar Chart */}
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg">
                            <FileText className="h-5 w-5 text-indigo-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Cantidad de SKUs por Categoría</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {productCountData.map((item, index) => (
                            <div key={index} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex justify-between items-center transition-all hover:shadow-md hover:bg-white">
                                <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                <span className="text-lg font-bold text-gray-900" style={{ color: item.color }}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;
