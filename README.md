**Vyapaar IQ** is an AI-powered pricing and settlement-clarity platform for Indian freelancers, creators, and small sellers.

It helps merchants answer one key question before sending an international invoice:

> “If I charge this amount in USD, approximately how much INR will I receive after payment and conversion costs?”

Users enter a target INR amount, select an FX cushion, and receive a suggested fixed USD client price along with an estimated breakdown of payment fees, conversion reduction, and currency cushioning.

## Project Overview & Live Links

**Elevator pitch:**  
Vyapaar IQ helps Indian freelancers and sellers set a fixed USD price for global clients and instantly see the estimated INR they will actually receive after payment, conversion, and FX costs.

**Live demo:**  
[Add your hosted application URL here]

**Demo video:**  
[Add your public YouTube demo video link here]

**Public repository:**  
[Add your public GitHub repository link here]

> Note: The current version is a functional frontend prototype with an illustrative pricing model. It does not provide guaranteed settlement amounts, live FX rates, or live payment-provider quotes. Backend, PayPal Sandbox, and AI integrations are planned/under development.

## Architecture Diagram

```text
+-------------------+
|      User         |
| Enter target INR  |
| Select FX cushion |
+---------+---------+
          |
          v
+-------------------+
|   Vyapaar IQ UI   |
|  Smart Pricing    |
| Rate Analysis     |
| Leakage Analysis  |
| Buffer Studio     |
| Your Hisaab       |
+---------+---------+
          |
          v
+-------------------+
| Pricing Engine /  |
| Backend API       |
| - FX assumptions  |
| - Payment fees    |
| - Conversion cost |
| - Cushion logic   |
+---------+---------+
          |
          v
+-------------------+
| PayPal Sandbox    |
| Orders / Payments |
| Sandbox testing   |
+---------+---------+
          |
          v
+-------------------+
| Estimated INR     |
| settlement view   |
+-------------------+
```

### Current implementation

At present, the pricing calculation is handled by the frontend’s illustrative pricing module. The user enters a target INR amount and cushion, and the application returns a suggested USD client price and estimated INR outcome.

### Planned architecture

In the connected version:

1. The user enters a target INR amount and cushion.
2. The frontend sends these inputs to the backend pricing API.
3. The backend applies configurable FX, payment-fee, and conversion-cost assumptions.
4. The backend returns a suggested client price and settlement breakdown.
5. PayPal Sandbox can be used to test the checkout/order flow in a controlled environment.
6. The AI assistant explains pricing inputs, cushion choices, and estimated deductions in plain language.

## Tech Stack & Tools Used

### Frontend

- React
- Vite
- JavaScript
- Tailwind CSS
- Lucide React
- React Router

### Pricing and product features

- Smart Pricing
- Rate Analysis
- Leakage Analysis
- Buffer Studio
- Your Hisaab
- Transactions preview
- Clients preview
- Earnings overview
- Notifications

### Planned PayPal integration

- PayPal Sandbox
- PayPal Orders v2 API
- PayPal Payments API

### Planned AI integration

- AI assistant for plain-language pricing explanations
- AI-powered explanation of cushion selection and estimated deductions

### Planned deployment and partner tools

- Render for application hosting
- APIMatic for API documentation/integration support, if used
- AG Grid for advanced data tables, if used

## Step-by-Step Setup Instructions

### 1. Clone the repository

```bash
git clone [https://github.com/YOUR_USERNAME/vyapaar-iq.git](https://github.com/YOUR_USERNAME/vyapaar-iq.git)
cd vyapaar-iq
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```bash
copy .env.example .env
```

Add your PayPal Sandbox credentials:

```env
VITE_PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
VITE_PAYPAL_CLIENT_SECRET=your_paypal_sandbox_client_secret
VITE_PAYPAL_ENVIRONMENT=sandbox
```

> Do not commit real credentials, secrets, or `.env` files to GitHub.

### 4. Run the application

```bash
npm run dev
```

Open the `Local:` URL printed in the terminal, usually:

```text
http://localhost:5173/
```

## Test Credentials / Sandbox Flow

### Current frontend prototype

No login or PayPal credentials are required to explore the current frontend prototype.

1. Open the application.
2. Go to **Smart Pricing**.
3. Enter a target INR amount, for example `500000`.
4. Select an FX cushion, such as `3%` or `5%`.
5. Review the suggested USD client price.
6. Review the estimated INR outcome and cost breakdown.
7. Explore **Rate Analysis**, **Leakage Analysis**, **Buffer Studio**, and **Your Hisaab**.

### PayPal Sandbox flow

Once PayPal Sandbox integration is connected:

1. Create or use a PayPal developer account.
2. Create a Sandbox business and personal account in the PayPal Developer Dashboard.
3. Add the Sandbox client ID and secret to `.env`.
4. Start a test checkout from the application.
5. Use PayPal Sandbox buyer credentials to complete the test transaction.
6. Review the order status and payment result in the PayPal Developer Dashboard.

> PayPal Sandbox buyer credentials are required for end-to-end Sandbox checkout testing. The application will not process real payments in Sandbox mode.

## Important Disclaimer

Vyapaar IQ provides planning and interface previews. It does not guarantee settlement, provide financial, tax, or investment advice, or connect to live payment accounts in its current version.
