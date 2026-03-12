import Razorpay from 'razorpay';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { amount, receipt } = req.body;

        if (!amount || !receipt) {
            return res.status(400).json({ message: 'Amount and receipt are required' });
        }

        // Initialize razorpay instance
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_SQHfOB7KWwdG43',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'pt0GPrH3ecquvhovoN5by4UO',
        });

        // Amount comes in as Rupee value. Multiply by 100 for paisa as Razorpay expects.
        // E.g., 399 becomes 39900.
        const options = {
            amount: parseInt(amount) * 100,
            currency: 'INR',
            receipt: receipt, // E.g., "driver_plus" or "operator_growth"
        };

        const order = await razorpay.orders.create(options);

        // Return order details to the frontend
        res.status(200).json({
            id: order.id,
            currency: order.currency,
            amount: order.amount,
        });

    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
}
