import { Buffer } from 'node:buffer';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) return res.status(500).json({ error: 'Razorpay is not configured on the server. Check Vercel environment variables.' });
  try {
    const body = req.body || {};
    const amount = Number(body.amount);
    if (!Number.isInteger(amount) || amount < 100) return res.status(400).json({ error: 'Amount must be at least 100 paise.' });
    const receipt = String(body.receipt || `receipt_${Date.now()}`).slice(0, 40);
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt, notes: { course_ids: Array.isArray(body.courseIds) ? body.courseIds.join(',').slice(0, 250) : '' } })
    });
    const data = await response.json();
    if (!response.ok) return res.status(response.status === 401 ? 401 : 500).json({ error: data?.error?.description || 'Razorpay could not create the order.' });
    return res.status(200).json({ order_id: data.id, amount: data.amount, currency: data.currency });
  } catch (error) {
    return res.status(500).json({ error: 'Unable to create payment order.' });
  }
}
