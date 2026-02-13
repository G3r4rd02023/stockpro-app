import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Download,
    Printer,
    Trash2,
    AlertTriangle,
    Package,
    DollarSign,
    BarChart3,
    Clock,
    Tag,
    History
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { productService } from '../services/productService';
import type { Product } from '../types/product.types';
import { getFullImageUrl } from '../utils/imageUtils';
import { qrUtils } from '../utils/qrUtils';

const ProductDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadProduct(id);
        }
    }, [id]);

    const loadProduct = async (productId: string) => {
        try {
            const data = await productService.getById(productId);
            setProduct(data);
        } catch (error) {
            toast.error('Error al cargar detalles del producto');
            navigate('/products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!product) return;
        if (window.confirm('¿Estás seguro de eliminar este producto?')) {
            try {
                await productService.delete(product.id);
                toast.success('Producto eliminado');
                navigate('/products');
            } catch (error) {
                toast.error('Error al eliminar producto');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!product) return null;

    const isLowStock = product.currentStock <= product.minStockThreshold;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/products')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <nav className="flex text-sm text-gray-500 mb-1">
                            <Link to="/products" className="hover:text-blue-600">Inventario</Link>
                            <span className="mx-2">&gt;</span>
                            <span className="text-gray-900 font-medium">Detalle de Producto</span>
                        </nav>
                        <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                    </div>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button variant="outline" onClick={handleDelete} className="text-red-600 border-red-200 hover:bg-red-50 flex-1 sm:flex-none">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                    </Button>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white flex-1 sm:flex-none">
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Information General */}
                    <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Package className="h-5 w-5 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Información General</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-500 mb-1">Nombre del Producto</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-medium">
                                    {product.name}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">SKU / Código</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900">
                                    {product.sku}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Categoría</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 flex items-center justify-between">
                                    <span>{product.category?.name || 'Electrónica'}</span>
                                    {/* Mockup shows a select-like UI, but for detail we just show text */}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Stock y Precio */}
                    <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <DollarSign className="h-5 w-5 text-emerald-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Stock y Precio</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Precio Unitario ($)</label>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 font-bold">
                                    {product.price.toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Stock Actual</label>
                                <div className={`p-3 rounded-xl border flex items-center justify-between ${isLowStock ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100'}`}>
                                    <span className="font-bold text-gray-900">{product.currentStock}</span>
                                    <span className={`text-[10px] font-bold uppercase ${isLowStock ? 'text-red-600' : 'text-emerald-600'}`}>Unidades</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500 mb-1">Umbral Mínimo</label>
                                <div className={`p-3 bg-gray-50 rounded-xl border border-gray-100 text-gray-900 ${isLowStock ? 'border-red-200' : ''}`}>
                                    {product.minStockThreshold}
                                </div>
                                {isLowStock && (
                                    <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                                        <AlertTriangle className="h-3 w-3" /> Debajo del stock mínimo
                                    </p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Imagen del Producto */}
                    <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Tag className="h-5 w-5 text-indigo-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Imagen del Producto</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 items-center">
                            <div className="relative group overflow-hidden rounded-2xl border border-gray-100 w-48 h-48 sm:w-64 sm:h-64 flex-shrink-0">
                                <img
                                    src={getFullImageUrl(product)}
                                    alt={product.name}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300?text=Sin+Imagen' }}
                                />
                            </div>
                            <div className="flex-1 w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl p-8 hover:border-blue-400 transition-colors cursor-pointer bg-gray-50/50">
                                <div className="p-3 bg-white rounded-full shadow-sm mb-4">
                                    <Download className="h-6 w-6 text-gray-400 rotate-180" />
                                </div>
                                <p className="text-gray-900 font-medium mb-1 text-center">Arrastra una nueva imagen o haz clic</p>
                                <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* QR Code Section */}
                    <section className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-6">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900">Código QR</span>
                            </div>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase">Activo</span>
                        </div>

                        <div className="relative p-6 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                                <QRCodeCanvas
                                    id="product-qr-canvas"
                                    value={qrUtils.generateProductQRValue(product.id)}
                                    size={160}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>
                            <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-lg">
                                <Download className="h-4 w-4" />
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 text-center mb-8 px-4 leading-relaxed">
                            Escanea este código para acceder rápidamente a los detalles del producto desde dispositivos móviles.
                        </p>

                        <div className="w-full space-y-3">
                            <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-6 rounded-xl font-bold shadow-sm"
                                onClick={() => qrUtils.downloadQR('product-qr-canvas', `QR-${product.sku}`)}
                            >
                                <Download className="h-5 w-5 mr-2" />
                                Descargar QR
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full py-6 rounded-xl font-bold border-gray-200 hover:bg-gray-50 text-gray-900"
                                onClick={() => qrUtils.printQR('product-qr-canvas', product.name)}
                            >
                                <Printer className="h-5 w-5 mr-2" />
                                Imprimir Etiqueta
                            </Button>
                        </div>
                    </section>

                    {/* Resumen de Movimientos */}
                    <section className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChart3 className="h-5 w-5 text-emerald-600" />
                            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-tight">Resumen de Movimientos</h2>
                        </div>
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Última entrada:</span>
                                <span className="text-gray-900 font-medium">12 May, 2024</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Última salida:</span>
                                <span className="text-gray-900 font-medium">Hoy, 09:45 AM</span>
                            </div>
                        </div>
                        <button className="w-full py-3 text-emerald-600 font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-100 rounded-lg transition-colors flex items-center justify-center gap-2">
                            Ver Historial Completo
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
