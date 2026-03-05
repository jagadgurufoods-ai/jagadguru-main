'use client';

import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

const API_URL = 'http://localhost:5001/api';

declare global {
    interface Window {
        Razorpay: new (options: Record<string, unknown>) => { open: () => void };
    }
}

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { token, user, isLoggedIn } = useAuth();
    const router = useRouter();

    const [address, setAddress] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        street: '',
        city: '',
        state: '',
        pincode: '',
    });
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isLoggedIn) {
        router.push('/login');
        return null;
    }

    if (items.length === 0) {
        router.push('/cart');
        return null;
    }

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // 1. Save address
            const addrRes = await fetch(`${API_URL}/orders/address`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ ...address, isDefault: true })
            });
            if (!addrRes.ok) throw new Error('Failed to save address');
            const savedAddress = await addrRes.json();

            // 2. Place order
            const orderPayload = {
                items: items.map(item => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: Number(item.product.price)
                })),
                totalAmount: totalPrice,
                addressId: savedAddress.id,
                paymentMethod
            };

            const orderRes = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(orderPayload)
            });

            if (!orderRes.ok) {
                const errData = await orderRes.json();
                throw new Error(errData.error || 'Failed to place order');
            }

            const orderData = await orderRes.json();

            if (paymentMethod === 'razorpay' && orderData.razorpayOrder) {
                // Load Razorpay script
                const script = document.createElement('script');
                script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                script.onload = () => {
                    const options = {
                        key: orderData.razorpayOrder.key,
                        amount: orderData.razorpayOrder.amount,
                        currency: orderData.razorpayOrder.currency,
                        name: 'Jagadguru Foods',
                        description: 'Order Payment',
                        order_id: orderData.razorpayOrder.id,
                        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                            // Verify payment
                            const verifyRes = await fetch(`${API_URL}/orders/verify-payment`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({
                                    razorpay_order_id: response.razorpay_order_id,
                                    razorpay_payment_id: response.razorpay_payment_id,
                                    razorpay_signature: response.razorpay_signature,
                                    orderId: orderData.order.id
                                })
                            });

                            if (verifyRes.ok) {
                                await clearCart();
                                router.push(`/order-confirmation/${orderData.order.id}`);
                            } else {
                                setError('Payment verification failed');
                                setLoading(false);
                            }
                        },
                        prefill: {
                            name: address.name,
                            email: user?.email || '',
                            contact: address.phone
                        },
                        theme: { color: '#15a31a' }
                    };
                    const rzp = new window.Razorpay(options);
                    rzp.open();
                    setLoading(false);
                };
                document.body.appendChild(script);
                return;
            }

            // COD — order already placed
            await clearCart();
            router.push(`/order-confirmation/${orderData.order.id}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1440px] mx-auto px-6 py-12">
            <h1 className="text-[32px] font-[700] text-[#3a2212] mb-8">Checkout</h1>

            <form onSubmit={handlePlaceOrder}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Shipping Address */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-sm">
                            <h2 className="text-[20px] font-[700] text-[#3a2212] mb-6">Shipping Address</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                                    <input
                                        type="text" required value={address.name}
                                        onChange={(e) => setAddress({ ...address, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel" required value={address.phone}
                                        onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Street Address</label>
                                    <input
                                        type="text" required value={address.street}
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">City</label>
                                    <input
                                        type="text" required value={address.city}
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">State</label>
                                    <input
                                        type="text" required value={address.state}
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Pincode</label>
                                    <input
                                        type="text" required value={address.pincode}
                                        onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-sm">
                            <h2 className="text-[20px] font-[700] text-[#3a2212] mb-6">Payment Method</h2>
                            <div className="space-y-4">
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-[#15a31a] bg-green-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio" name="payment" value="cod"
                                        checked={paymentMethod === 'cod'}
                                        onChange={() => setPaymentMethod('cod')}
                                        className="accent-[#15a31a]"
                                    />
                                    <div>
                                        <p className="font-[700] text-[#3a2212]">Cash on Delivery</p>
                                        <p className="text-[13px] text-slate-400">Pay when your order arrives</p>
                                    </div>
                                </label>
                                <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'razorpay' ? 'border-[#15a31a] bg-green-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                    <input
                                        type="radio" name="payment" value="razorpay"
                                        checked={paymentMethod === 'razorpay'}
                                        onChange={() => setPaymentMethod('razorpay')}
                                        className="accent-[#15a31a]"
                                    />
                                    <div>
                                        <p className="font-[700] text-[#3a2212]">Pay Online (Razorpay)</p>
                                        <p className="text-[13px] text-slate-400">UPI, Cards, Net Banking, Wallets</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[24px] p-8 border border-black/5 shadow-sm sticky top-[110px]">
                            <h2 className="text-[20px] font-[700] text-[#3a2212] mb-6">Order Summary</h2>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3 items-center">
                                        <div className="w-12 h-12 rounded-[8px] overflow-hidden bg-slate-100 shrink-0">
                                            {item.product?.imageUrl && (
                                                <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[13px] font-[600] text-[#3a2212] truncate">{item.product?.name}</p>
                                            <p className="text-[12px] text-slate-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="text-[14px] font-[700] text-[#3a2212]">₹{(Number(item.product?.price || 0) * item.quantity).toFixed(2)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="h-px bg-slate-100 my-6" />
                            <div className="space-y-3 text-[14px]">
                                <div className="flex justify-between text-slate-500">
                                    <span>Subtotal</span>
                                    <span className="font-[700] text-[#3a2212]">₹{totalPrice.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-slate-500">
                                    <span>Shipping</span>
                                    <span className="font-[600] text-[#15a31a]">Free</span>
                                </div>
                                <div className="h-px bg-slate-100" />
                                <div className="flex justify-between text-[18px] font-[800] text-[#3a2212]">
                                    <span>Total</span>
                                    <span>₹{totalPrice.toFixed(2)}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-600 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-[#15a31a] rounded-[16px] text-white text-[16px] font-[800] tracking-[0.02em] uppercase hover:bg-[#128a16] transition-colors shadow-lg shadow-green-100 disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : 'Pay Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
