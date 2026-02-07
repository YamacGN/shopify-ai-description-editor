# 🛍️ Shopify AI Description Editor

AI-powered product description editor for Shopify stores using OpenAI. Optimize your product descriptions in Turkish with SEO-friendly content generation.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)

## ✨ Features

- 🤖 **AI-Powered Content**: Generate SEO-optimized product descriptions using OpenAI GPT-4
- 🇹🇷 **Turkish Language Support**: Specialized prompts for Turkish e-commerce content
- 📦 **Shopify Integration**: Direct integration with Shopify Admin API
- ⚡ **Batch Processing**: Process multiple products at once
- 🎨 **Modern UI**: Responsive web interface with real-time feedback
- 🚀 **Railway Ready**: Optimized for Railway deployment with environment-based configuration
- 🔒 **Secure**: No hardcoded credentials, all secrets via environment variables

## 🏗️ Architecture

```
├── server.js           # Express.js backend server
├── package.json        # Project dependencies
├── Procfile           # Railway deployment configuration
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
├── public/
│   ├── index.html     # Frontend UI
│   ├── styles.css     # Styling
│   └── app.js         # Frontend logic
└── README.md          # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- Shopify store with Admin API access
- OpenAI API key

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YamacGN/shopify-ai-description-editor.git
   cd shopify-ai-description-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your credentials:
   ```env
   SHOPIFY_STORE_URL=your-store.myshopify.com
   SHOPIFY_ACCESS_TOKEN=your_shopify_admin_api_token
   OPENAI_API_KEY=your_openai_api_key
   PORT=3000
   NODE_ENV=development
   ```

4. **Run the application**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🌐 Railway Deployment

### Step 1: Prepare Your Repository

1. Ensure all files are committed to your GitHub repository
2. Make sure `.env` is in `.gitignore` (already configured)

### Step 2: Deploy to Railway

1. Go to [Railway.app](https://railway.app/)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will automatically detect the `Procfile` and configure the deployment

### Step 3: Configure Environment Variables

In Railway dashboard, add the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `SHOPIFY_STORE_URL` | Your Shopify store URL | `yourstore.myshopify.com` |
| `SHOPIFY_ACCESS_TOKEN` | Shopify Admin API token | `shpat_xxxxx` |
| `OPENAI_API_KEY` | OpenAI API key | `sk-xxxxx` |
| `NODE_ENV` | Environment | `production` |
| `API_BASE_URL` | (Optional) API backend URL for separate frontend deployment | Leave empty for same-server |

**Note**: Railway automatically sets the `PORT` variable, so you don't need to configure it.

### Step 4: Deploy

1. Railway will automatically deploy after you add the environment variables
2. Once deployed, Railway will provide you with a public URL
3. Access your application at `https://your-app.up.railway.app`

### Advanced: Separate Frontend Deployment

If you want to deploy the frontend separately (e.g., on Vercel, Netlify) and connect it to your Railway backend:

1. Deploy the backend to Railway as described above
2. Note your Railway backend URL: `https://your-app.up.railway.app`
3. When deploying the frontend separately, set the `API_BASE_URL` environment variable to point to your Railway backend
4. The frontend will automatically use the Railway backend for all API calls

**Example for separate deployment:**
```env
# Frontend environment (e.g., Vercel)
API_BASE_URL=https://your-app.up.railway.app
```

This allows you to:
- Host multiple frontends connecting to one backend
- Test local frontend against production backend
- Scale frontend and backend independently

## 🔑 Getting API Credentials

### Shopify Admin API Token

1. Go to your Shopify admin panel
2. Navigate to **Settings** → **Apps and sales channels**
3. Click **Develop apps** → **Create an app**
4. Name your app (e.g., "AI Description Editor")
5. Go to **API credentials** tab
6. Under **Admin API access scopes**, select:
   - `read_products`
   - `write_products`
7. Click **Install app**
8. Copy the **Admin API access token** (starts with `shpat_`)
9. Your store URL format: `yourstore.myshopify.com`

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in
3. Navigate to **API keys** section
4. Click **Create new secret key**
5. Copy and save your API key (starts with `sk-`)
6. Add credits to your account if needed

## 🎯 Usage Guide

### Single Product Editing

1. Click **"Ürünleri Yükle"** to load products from Shopify
2. Use the search box to find specific products
3. Click on a product to select it
4. Review the current description
5. Click **"AI ile İyileştir"** to generate an improved description
6. Edit the generated description if needed
7. Click **"Shopify'a Kaydet"** to update the product

### Batch Processing

1. Switch to **"Toplu İşlem"** tab
2. Select products using checkboxes (or use "Tümünü Seç")
3. Click **"Seçilenleri İşle"** to process all selected products
4. Monitor progress in real-time
5. Review results for each product

## 🔒 Security Best Practices

- ✅ Never commit `.env` file to version control
- ✅ Use environment variables for all sensitive data
- ✅ Rotate API keys regularly
- ✅ Use Shopify's scoped API tokens (limit to only necessary permissions)
- ✅ Monitor OpenAI usage to prevent unexpected costs
- ✅ Keep dependencies updated (`npm audit`)

## 🐛 Troubleshooting

### Common Issues

**"Konfigürasyon eksik" error**
- Check that all environment variables are set correctly
- Verify your Shopify store URL format (no `https://`)
- Ensure API tokens are valid and not expired

**"Ürünler yüklenemedi" error**
- Verify Shopify Admin API token has `read_products` permission
- Check that your store URL is correct
- Ensure your Shopify plan supports API access

**"İyileştirme başarısız" error**
- Verify OpenAI API key is valid
- Check that you have credits in your OpenAI account
- Ensure network connectivity to OpenAI API

**Railway deployment issues**
- Ensure `Procfile` exists in root directory
- Verify all environment variables are set in Railway dashboard
- Check Railway logs for specific error messages

**Connecting to Railway-deployed backend**
- If using a separate Railway backend, ensure `API_BASE_URL` is set correctly
- Check that the Railway backend URL is accessible (not behind authentication)
- Verify CORS is properly configured if frontend is on a different domain
- Test the backend health endpoint: `https://your-app.up.railway.app/api/health`

## 📊 API Endpoints

### Configuration
```
GET /api/config
```
Returns API configuration including base URL for Railway deployments.

**Response:**
```json
{
  "apiBaseUrl": "https://your-app.up.railway.app"
}
```

### Health Check
```
GET /api/health
```
Returns system status and configuration check.

### Get Products
```
GET /api/products
```
Fetches all products from Shopify store.

### Improve Single Description
```
POST /api/improve-description
Content-Type: application/json

{
  "currentDescription": "string",
  "productTitle": "string"
}
```

### Improve Bulk Descriptions
```
POST /api/improve-bulk
Content-Type: application/json

{
  "products": [
    {
      "id": "number",
      "title": "string",
      "description": "string"
    }
  ]
}
```

### Update Product
```
PUT /api/products/:id
Content-Type: application/json

{
  "description": "string"
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `SHOPIFY_STORE_URL` | Yes | - | Shopify store URL (without https://) |
| `SHOPIFY_ACCESS_TOKEN` | Yes | - | Shopify Admin API access token |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `PORT` | No | 3000 | Server port (Railway sets this automatically) |
| `NODE_ENV` | No | production | Environment mode |
| `API_BASE_URL` | No | empty | Railway backend URL for separate frontend deployment |

### OpenAI Settings

The application uses GPT-4 with the following configuration:
- **Temperature**: 0.7 (balanced creativity)
- **Max tokens**: 800 (suitable for product descriptions)
- **Language**: Turkish
- **Output format**: HTML with semantic tags

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section

## 🙏 Acknowledgments

- Built with [Express.js](https://expressjs.com/)
- AI powered by [OpenAI](https://openai.com/)
- Integrated with [Shopify Admin API](https://shopify.dev/docs/api/admin)
- Deployed on [Railway](https://railway.app/)

---

Made with ❤️ for Turkish e-commerce businesses