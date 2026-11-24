# Course Selling Website

An online course selling platform built using React, Vite, TypeScript, and Firebase.

## Features

- Online course listing
- Course purchasing system
- Razorpay payment integration
- Automatic payment verification
- Automatic course approval after successful payment
- Student registration
- Admin dashboard
- Firebase database integration
- Coupon system
- Transaction management

## Tech Stack

- React
- Vite
- TypeScript
- Firebase
- Razorpay Standard Checkout
- Vercel

## Installation

Install dependencies:

npm install

## Environment Variables

Create a `.env` file in the root directory.

Add the following variables:

RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

Never expose RAZORPAY_KEY_SECRET in frontend code.

## Development

Start the development server:

npm run dev

## Build

Create production build:

npm run build

## Razorpay Payment Flow

1. Student selects a course.
2. Student enters their details.
3. Frontend requests a Razorpay order from the backend.
4. Razorpay Checkout opens.
5. Student completes payment.
6. Backend verifies the payment signature.
7. Verified payment is recorded.
8. Course access is approved automatically.

## API Endpoints

### Create Order

POST /api/create-order

Creates a Razorpay payment order.

### Verify Payment

POST /api/verify-payment

Verifies the Razorpay payment signature.

## Deployment

This project is configured for deployment on Vercel.

Configure the following environment variables
in the Vercel dashboard:

- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET
- VITE_RAZORPAY_KEY_ID

After adding environment variables,
redeploy the project.

## Security

- Razorpay Secret Key must remain on the backend.
- Never commit `.env` files.
- Payments must be verified server-side.
- Course access should only be granted after successful payment verification.

## License

All rights reserved.
