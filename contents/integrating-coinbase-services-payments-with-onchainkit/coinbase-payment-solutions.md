# Coinbase Payment Solutions Guide

A comprehensive overview of available Coinbase payment integration options for Next.js applications and modern web stores.

## Overview

Coinbase offers multiple payment solutions for accepting cryptocurrency payments. Each approach has different trade-offs between simplicity, control, and customization.

---

## Integration Solutions

### 1. OnchainKit Checkout Component (Recommended 2026)

The modern, simplest approach for accepting USDC payments in a React/Next.js application.

**Best for:** Quick implementation, simple checkout flows, minimal backend requirements

**Key Features:**
- No backend required for basic implementations
- Built-in Coinbase Commerce support
- React component-based (easy to integrate into existing apps)
- Event callbacks: `onSuccess`, `onFailure`, `onPaymentDetected`
- Supports product IDs from Coinbase
- Handles Smart Wallet integration automatically

**Basic Usage:**
```tsx
import { Checkout } from 'onchainkit';

export function PaymentButton() {
  return (
    <Checkout
      productId="your-product-id"
      onSuccess={() => console.log('Payment successful')}
      onFailure={() => console.log('Payment failed')}
    />
  );
}
```

**Setup:**
1. Install OnchainKit package
2. Get product ID from Coinbase Commerce
3. Import Checkout component
4. Add event handlers as needed

**Documentation:** https://docs.base.org/builderkits/onchainkit/checkout/checkout

---

### 2. Coinbase Commerce API (Traditional REST API)

The programmatic approach for more control and custom implementations.

**Best for:** Custom payment flows, invoicing, advanced tracking, multi-product stores

**Key Features:**
- RESTful API for charge creation
- Webhook support for payment confirmations
- Flexible settlement options (USDC, crypto, or hybrid)
- Multi-currency support (Bitcoin, Ethereum, USDC, etc.)
- 1% transaction fee (vs 2.9% + $0.30 for card processors)
- Full API control for custom integrations

**Basic Workflow:**
1. Create a charge via API with product details
2. Get a `hosted_url` for payment
3. Redirect customer or embed payment page
4. Listen to webhooks for confirmation
5. Settle payments to your wallet

**Implementation Pattern:**
```typescript
// Server-side (Next.js API route)
async function createCharge(productData) {
  const response = await fetch('https://api.commerce.coinbase.com/charges', {
    method: 'POST',
    headers: {
      'X-CC-Api-Key': process.env.COINBASE_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: productData.name,
      description: productData.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: productData.price,
        currency: 'USD',
      },
      redirect_url: `${process.env.NEXT_PUBLIC_URL}/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel`,
      metadata: {
        product_id: productData.id,
        customer_id: productData.customerId,
      },
    }),
  });

  return response.json();
}
```

**Webhook Handler Pattern:**
```typescript
// Listen for payment confirmations
export async function POST(request: Request) {
  const charge = await request.json();

  if (charge.event.type === 'charge:confirmed') {
    // Payment received and confirmed on blockchain
    // Update your database, deliver product, etc.
  }
}
```

**Documentation:** https://commerce.coinbase.com/docs

---

### 3. Coinbase Smart Wallet Integration

For advanced payment experiences combining self-custodial and Coinbase account payments.

**Best for:** Enterprise applications, multi-chain support, advanced user experiences

**Key Features:**
- ERC-4337 compliant smart contract wallets
- Paymaster for sponsored transaction fees (users don't pay gas)
- Available on Base, Ethereum, Polygon, Arbitrum, Avalanche, Optimism, BNB, Zora
- Integrated with popular wallet libraries (WAGMI, Web3Modal, Privy, Dynamic, Rainbowkit)
- Users can pay with wallet balance OR Coinbase account balance
- Effortless onboarding (no recovery phrases)

**Best For:**
- Apps requiring self-custody options
- Multi-chain transactions
- Sponsored gas fees for better UX
- Advanced Web3 integration

**Setup:**
- Integrate via WAGMI, Web3Modal, or other wallet aggregators
- Configure Smart Wallet parameters
- Set up Paymaster if using fee sponsorship

**Documentation:** https://docs.cdp.coinbase.com/wallet-sdk/docs/sw-setup

---

## Comparison Table

| Feature | OnchainKit | Commerce API | Smart Wallet |
|---------|-----------|--------------|--------------|
| Ease of Setup | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |
| Backend Required | No | Yes | Yes |
| Customization | Low | High | High |
| Multi-chain | Base only | No | Yes |
| Control | Limited | Full | Full |
| Gas Sponsorship | No | No | Yes |
| Best for | Quick shops | Custom flows | Enterprise |

---

## Your Next.js Store Implementation Options

### Option A: Simple Product Store (OnchainKit)
**Setup Time:** 30 minutes
**Complexity:** Low
**Code Amount:** ~50 lines

```tsx
// components/ProductCard.tsx
import { Checkout } from 'onchainkit';

export function ProductCard({ product }) {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <Checkout
        productId={product.coinbaseId}
        onSuccess={() => {
          // Redirect to success page or show confirmation
        }}
      />
    </div>
  );
}
```

### Option B: Custom Payment Flow (Commerce API)
**Setup Time:** 2-3 hours
**Complexity:** Medium
**Code Amount:** ~300+ lines

**Includes:**
- API route for charge creation
- Webhook handler for confirmations
- Database tracking
- Order management

### Option C: Multi-chain Enterprise (Smart Wallet)
**Setup Time:** 4-6 hours
**Complexity:** High
**Code Amount:** ~500+ lines

**Includes:**
- WAGMI/Web3Modal integration
- Multi-chain support
- Paymaster configuration
- Advanced state management

---

## Settlement Options

Coinbase supports flexible settlement:

1. **Direct Crypto Settlement** - Receive Bitcoin, Ethereum, USDC in your wallet
2. **Stablecoin Conversion** - Auto-convert to USDC for price stability
3. **Hybrid** - Accept multiple assets, settle to preferred currency
4. **Instant Settlement** - Payments arrive in minutes, not 2-5 business days

---

## Recommended Starting Point

For a new Next.js store in 2026:

1. **Start with OnchainKit** if you want to launch quickly (within a week)
2. **Add Coinbase Commerce API** webhooks if you need order tracking
3. **Expand to Smart Wallet** only if you need multi-chain or enterprise features

This gives you a progressive enhancement path with minimal technical debt.

---

## Resources & Documentation

- **OnchainKit Checkout:** https://docs.base.org/builderkits/onchainkit/checkout/checkout
- **Coinbase Commerce API:** https://commerce.coinbase.com/docs
- **Adding Payment Buttons:** https://docs.cdp.coinbase.com/commerce/usdc-payment/adding-payment
- **Smart Wallet Setup:** https://docs.cdp.coinbase.com/wallet-sdk/docs/sw-setup
- **Next.js Integration Guide:** https://dev.to/joshuajee/how-to-accept-crypto-payments-in-a-nextjs-application-using-coinbase-commerce-303e
- **Vercel Template:** https://vercel.com/templates/next.js/coinbase-commerce
- **React Coinbase Commerce Package:** https://www.npmjs.com/package/react-coinbase-commerce

---

## Next Steps

1. Choose your integration method (OnchainKit recommended)
2. Get API keys from Coinbase Commerce (https://commerce.coinbase.com)
3. Create test products in the Coinbase dashboard
4. Build your payment component
5. Set up webhooks for payment confirmation
6. Test in sandbox before going live
