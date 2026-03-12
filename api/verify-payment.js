import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ message: 'Missing Razorpay payload parameters' });
        }

        const secret = process.env.RAZORPAY_KEY_SECRET || 'pt0GPrH3ecquvhovoN5by4UO';

        // Step 1: Create the string to sign: "order_id|payment_id"
        const signString = `${razorpay_order_id}|${razorpay_payment_id}`;

        // Step 2: Generate HMAC SHA256 using razorpay secret
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(signString.toString())
            .digest('hex');

        // Step 3: Compare signatures to verify authenticity
        if (expectedSignature === razorpay_signature) {
            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid payment signature' });
        }
    } catch (error) {
        console.error('Error verifying Razorpay payment:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
