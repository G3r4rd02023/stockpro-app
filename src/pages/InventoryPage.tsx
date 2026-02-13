import React, { useEffect, useState } from 'react';
import { Plus, History, ArrowUpCircle, ArrowDownCircle, Search, Calendar } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { stockService } from '../services/stockService';
import { productService } from '../services/productService';
import { MovementTypes } from '../types/stock.types';
import type { StockMovement, MovementType } from '../types/stock.types';
import type { Product } from '../types/product.types';

const InventoryPage = () => {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Form State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        productId: '',
        quantity: 1,
        movementType: MovementTypes.Entry,
        reason: '',
        date: new Date().toISOString().substring(0, 16) // datetime-local format
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [movementsData, productsData] = await Promise.all([
                stockService.getAll(),
                productService.getAll()
            ]);
            setMovements(movementsData.sort((a, b) =>
                new Date(b.movementDate).getTime() - new Date(a.movementDate).getTime()
            ));
            setProducts(productsData);
            if (productsData.length > 0 && !formData.productId) {
                setFormData(prev => ({ ...prev, productId: productsData[0].id }));
            }
        } catch (error) {
            toast.error('Error al cargar datos del inventario');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await stockService.create({
                productId: formData.productId,
                quantity: Number(formData.quantity),
                movementType: formData.movementType,
                reason: formData.reason,
                date: new Date(formData.date).toISOString()
            });
            toast.success('Movimiento registrado con éxito');
            setIsModalOpen(false);
            setFormData({
                productId: products.length > 0 ? products[0].id : '',
                quantity: 1,
                movementType: MovementTypes.Entry,
                reason: '',
                date: new Date().toISOString().substring(0, 16)
            });
            loadData();
        } catch (error) {
            toast.error('Error al registrar movimiento');
        }
    };

    const filteredMovements = movements.filter(m =>
        m.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Control de Inventario</h1>
                    <p className="text-sm text-gray-500">Gestiona entradas, salidas e historial de stock</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Movimiento
                </Button>
            </div>

            {/* Stats Summary (Optional/Quick) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <ArrowUpCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Entradas (Mes)</p>
                        <p className="text-xl font-bold">{movements.filter(m => m.movementType === MovementTypes.Entry).length}</p>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-red-100 p-2 rounded-full text-red-600">
                        <ArrowDownCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Salidas (Mes)</p>
                        <p className="text-xl font-bold">{movements.filter(m => m.movementType === MovementTypes.Exit).length}</p>
                    </div>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-blue-600" />
                        <h2 className="font-semibold text-gray-900">Historial de Movimientos</h2>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar en historial..."
                            className="pl-10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cant.</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motivo</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center">Cargando...</td></tr>
                            ) : filteredMovements.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-gray-500">No hay movimientos registrados</td></tr>
                            ) : (
                                filteredMovements.map((m) => (
                                    <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(m.movementDate).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                            {m.productName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${m.movementType === MovementTypes.Entry
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {m.movementType === MovementTypes.Entry ? 'Entrada' : 'Salida'}
                                            </span>
                                        </td>
                                        <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-bold ${m.movementType === MovementTypes.Entry ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                            {m.movementType === MovementTypes.Entry ? '+' : '-'}{m.quantity}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {m.reason}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {m.userName}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Registro */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm transition-all">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Registrar Movimiento</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="h-6 w-6 rotate-45" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="product">Producto</Label>
                                <select
                                    id="product"
                                    className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-sm h-11 px-3"
                                    value={formData.productId}
                                    onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                                    required
                                >
                                    <option value="" disabled>Selecciona un producto</option>
                                    {products.map(p => (
                                        <option key={p.id} value={p.id}>{p.name} (S: {p.currentStock})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Tipo</Label>
                                    <select
                                        id="type"
                                        className="w-full rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all text-sm h-11 px-3"
                                        value={formData.movementType}
                                        onChange={(e) => setFormData({ ...formData, movementType: Number(e.target.value) as MovementType })}
                                        required
                                    >
                                        <option value={MovementTypes.Entry}>Entrada</option>
                                        <option value={MovementTypes.Exit}>Salida</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="quantity">Cantidad</Label>
                                    <Input
                                        id="quantity"
                                        type="number"
                                        min="1"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                                        className="h-11"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Fecha y Hora</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        className="h-11 pl-10"
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="reason">Motivo / Descripción</Label>
                                <Input
                                    id="reason"
                                    placeholder="Ej: Reposición de inventario"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    className="h-11"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                    Confirmar
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryPage;
