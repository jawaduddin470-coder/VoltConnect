import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

// Helper to inject the Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

export const useRazorpay = () => {
    const { user, setUserPlan } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const initializePayment = useCallback(async ({ amount, planId, planName, isTestMode = true }) => {
        setLoading(true);
        setError(null);

        try {
            // 1. Load the Razorpay script
            const res = await loadRazorpayScript();
            if (!res) throw new Error('Razorpay SDK failed to load. Are you online?');

            // 2. Create the Order on the backend API
            const orderResponse = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount, receipt: planId }),
            });

            if (!orderResponse.ok) {
                const errData = await orderResponse.json();
                throw new Error(errData.message || 'Failed to create payment order');
            }

            const order = await orderResponse.json();

                    // 5. Configure Razorpay Checkout
                    // For TEST mode, we hardcode the test key or fetch it from env
                    const key_id = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SQHfOB7KWwdG43';

                    const options = {
                        key: key_id,
                        amount: order.amount,
                        currency: order.currency,
                        name: 'VoltConnect',
                        description: `Subscription: ${planName}`,
                        order_id: order.id,
                        handler: async function (response) {
                            try {
                                // 6. Verify payment on the backend
                                const verifyRes = await fetch('/api/verify-payment', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        razorpay_order_id: response.razorpay_order_id,
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_signature: response.razorpay_signature,
                                    }),
                                });

                                const verifyData = await verifyRes.json();

                                if (verifyData.success) {
                                    // 7. If successful, update the user context AND Firestore
                                    setUserPlan(planId);

                                    if (user) {
                                        // Update Firestore
                                        const userRef = doc(db, 'users', user.uid);
                                        const expiryDate = new Date();
                                        expiryDate.setMonth(expiryDate.getMonth() + 1); // +1 month for subscription

                                        await updateDoc(userRef, {
                                            subscription_plan: planId,
                                            subscription_status: 'active',
                                            payment_id: response.razorpay_payment_id,
                                            payment_date: new Date().toISOString(),
                                            subscription_expiry: expiryDate.toISOString(),
                                        }).catch(e => {
                                            console.error('Failed to update Firestore, but payment succeeded:', e);
                                        });
                                    }

                                    alert(`Payment Successful! Activated ${planName}`);
                                } else {
                                    throw new Error(verifyData.message || 'Payment verification failed');
                                }
                            } catch (err) {
                                console.error('Payment Verification Error:', err);
                                setError(err.message);
                                alert('Payment Verification Failed: ' + err.message);
                            }
                        },
                        prefill: {
                            name: user?.displayName || '',
                            email: user?.email || '',
                            contact: '',
                        },
                        notes: {
                            address: 'VoltConnect HQ',
                        },
                        theme: {
                            color: '#00D084', // Primary VoltConnect green/accent color
                        },
                    };

                    // 8. Open Razorpay Widget
                    const paymentObject = new window.Razorpay(options);
                    paymentObject.on('payment.failed', function (response) {
                        console.error('Payment Failed:', response.error);
                        setError(response.error.description);
                        alert(`Payment Failed: ${response.error.description}. Please try again.`);
                    });
                    paymentObject.open();

                } catch (err) {
                    console.error('Razorpay Initialization Error:', err);
                    setError(err.message);
                    alert(err.message);
                } finally {
                    setLoading(false);
                }
            }, [user, setUserPlan]);

            return { initializePayment, loading, error };
        };
