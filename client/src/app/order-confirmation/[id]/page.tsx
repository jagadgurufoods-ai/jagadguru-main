'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface OrderItem {
    id: number;
    quantity: number;
    price: number;
    product: {
        name: string;
        imageUrl?: string;
    };
}

interface Order {
    id: number;
    totalAmount: number;
    orderStatus: string;
    paymentMethod: string;
    paymentStatus: string;
    createdAt: string;
    orderItems: OrderItem[];
    address?: {
        name: string;
        phone: string;
        street: string;
        city: string;
        state: string;
        pincode: string;
    };
}

export default function OrderConfirmationPage() {
    const { id } = useParams();
    const { token } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token || !id) return;
        fetch(`${API_URL}/orders/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id, token]);

    if (loading) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <p className="text-slate-400">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-20 text-center">
                <p className="text-slate-400">Order not found</p>
                <Link href="/" className="inline-block mt-6 px-8 py-3 bg-[#15a31a] text-white rounded-[16px] font-[700]">
                    Go Home
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[800px] mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">✓</span>
                </div>
                <h1 className="text-[32px] font-[700] text-[#3a2212]">Order Placed Successfully!</h1>
                <p className="text-slate-400 mt-2">Order #{order.id} • You will receive a confirmation email shortly</p>
            </div>

            <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-sm space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                        <p className="text-[12px] text-slate-400 uppercase font-[600]">Order ID</p>
                        <p className="text-[16px] font-[700] text-[#3a2212]">#{order.id}</p>
                    </div>
                    <div>
                        <p className="text-[12px] text-slate-400 uppercase font-[600]">Status</p>
                        <p className="text-[16px] font-[700] text-[#15a31a] capitalize">{order.orderStatus}</p>
                    </div>
                    <div>
                        <p className="text-[12px] text-slate-400 uppercase font-[600]">Payment</p>
                        <p className="text-[16px] font-[700] text-[#3a2212]">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</p>
                    </div>
                    <div>
                        <p className="text-[12px] text-slate-400 uppercase font-[600]">Total</p>
                        <p className="text-[16px] font-[700] text-[#bf8345]">₹{Number(order.totalAmount).toFixed(2)}</p>
                    </div>
                </div>

                <div className="h-px bg-slate-100" />

                <div>
                    <h3 className="text-[14px] font-[700] text-slate-400 uppercase mb-4">Items</h3>
                    <div className="space-y-3">
                        {order.orderItems.map((item) => (
                            <div key={item.id} className="flex gap-4 items-center">
                                <div className="w-14 h-14 rounded-[10px] overflow-hidden bg-slate-100 shrink-0">
                                    {item.product?.imageUrl && (
                                        <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-[14px] font-[600] text-[#3a2212]">{item.product?.name}</p>
                                    <p className="text-[12px] text-slate-400">Qty: {item.quantity}</p>
                                </div>
                                <p className="text-[14px] font-[700] text-[#3a2212]">₹{Number(item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {order.address && (
                    <>
                        <div className="h-px bg-slate-100" />
                        <div>
                            <h3 className="text-[14px] font-[700] text-slate-400 uppercase mb-2">Shipping Address</h3>
                            <p className="text-[14px] text-[#3a2212]">
                                {order.address.name}, {order.address.phone}<br />
                                {order.address.street}<br />
                                {order.address.city}, {order.address.state} - {order.address.pincode}
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div className="text-center mt-8">
                <Link href="/" className="inline-block px-8 py-4 bg-[#15a31a] text-white rounded-[16px] font-[700] text-[16px] hover:bg-[#128a16] transition-colors">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}
