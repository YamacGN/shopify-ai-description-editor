require('dotenv').config();
const express = require('express');
const { OpenAI } = require('openai');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SHOPIFY_STORE = process.env.SHOPIFY_STORE_URL;
const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_API_VERSION = '2024-01';

async function shopifyAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(
    `https://${SHOPIFY_STORE}/admin/api/${SHOPIFY_API_VERSION}${endpoint}`,
    options
  );

  if (!response.ok) {
    throw new Error(`Shopify API Error: ${response.statusText}`);
  }

  return response.json();
}

app.get('/api/products', async (req, res) => {
  try {
    const data = await shopifyAPI('/products.json');
    res.json(data.products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/improve-description', async (req, res) => {
  try {
    const { currentDescription, productTitle } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Sen profesyonel bir e-ticaret ürün açıklaması yazarısın. Verilen ürün açıklamalarını daha çekici, SEO uyumlu ve satış odaklı hale getir. Türkçe yaz. HTML formatında yanıt ver (p, ul, li, strong etiketlerini kullan)."
        },
        {
          role: "user",
          content: `Ürün: ${productTitle}\n\nMevcut Açıklama: ${currentDescription || 'Açıklama yok'}\n\nBu açıklamayı iyileştir ve daha detaylı, çekici hale getir.`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    const improvedDescription = completion.choices[0].message.content;
    res.json({ improvedDescription });
  } catch (error) {
    console.error('Error improving description:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/improve-bulk', async (req, res) => {
  try {
    const { products } = req.body;
    const results = [];

    for (const product of products) {
      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "Sen profesyonel bir e-ticaret ürün açıklaması yazarısın. Verilen ürün açıklamalarını daha çekici, SEO uyumlu ve satış odaklı hale getir. Türkçe yaz. HTML formatında yanıt ver."
            },
            {
              role: "user",
              content: `Ürün: ${product.title}\n\nMevcut Açıklama: ${product.description || 'Açıklama yok'}\n\nBu açıklamayı iyileştir.`
            }
          ],
          temperature: 0.7,
          max_tokens: 800
        });

        results.push({
          id: product.id,
          improvedDescription: completion.choices[0].message.content,
          success: true
        });
      } catch (error) {
        results.push({
          id: product.id,
          error: error.message,
          success: false
        });
      }
    }

    res.json({ results });
  } catch (error) {
    console.error('Error in bulk improvement:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const data = await shopifyAPI(`/products/${id}.json`, 'PUT', {
      product: {
        id: parseInt(id),
        body_html: description
      }
    });

    res.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    shopifyConfigured: !!SHOPIFY_STORE && !!SHOPIFY_ACCESS_TOKEN,
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Shopify Store: ${SHOPIFY_STORE || 'NOT CONFIGURED'}`);
  console.log(`🤖 OpenAI: ${process.env.OPENAI_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED'}`);
});
