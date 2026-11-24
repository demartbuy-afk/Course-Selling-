import crypto from 'node:crypto';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return res.status(500).json({ verified: false, error: 'Razorpay is not configured on the server.' });
  try {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = req.body || {};
    if (!orderId || !paymentId || !signature) return res.status(400).json({ verified: false, error: 'Missing payment verification fields.' });
    const expected = crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex');
    const a = Buffer.from(expected, 'hex');
    const b = Buffer.from(String(signature), 'hex');
    const valid = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!valid) return res.status(400).json({ verified: false, error: 'Payment signature mismatch.' });
    return res.status(200).json({ verified: true, payment_id: paymentId, order_id: orderId });
  } catch {
    return res.status(400).json({ verified: false, error: 'Invalid verification request.' });
  }
}
