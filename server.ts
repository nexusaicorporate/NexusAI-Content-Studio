import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // AI Setup
  const getAI = (overrideKey?: string) => {
    const key = overrideKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) {
      console.error("CRITICAL: No API key found in process.env (checked API_KEY and GEMINI_API_KEY) and no override provided");
      throw new Error("Gemini API Key missing on server. Please add GEMINI_API_KEY in the Settings menu or provides one in the app's Connection Settings.");
    }
    // Simple verification - don't log the full key for security
    console.log("AI initialized with key ending in:", key.substring(key.length - 4));
    return new GoogleGenAI({ apiKey: key });
  };

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Proxy for Google Veo/Video and Higgsfield
  app.post("/api/generate-video", async (req, res) => {
    const { engine, prompt, imageBase64, aspectRatio, geminiKey, higgsfieldKey } = req.body;

    try {
      if (engine === 'higgsfield') {
        console.log("Starting Higgsfield generation...");
        let accessToken = process.env.HIGGSFIELD_ACCESS_TOKEN;
        const apiKey = higgsfieldKey || process.env.HIGGSFIELD_API_KEY;
        
        // Fallback to local token storage
        if (!accessToken && !apiKey) {
          try {
            const fs = await import('fs/promises');
            const tokenPath = path.join(process.cwd(), 'higgsfield_token.json');
            const tokenData = JSON.parse(await fs.readFile(tokenPath, 'utf-8'));
            accessToken = tokenData.access_token;
            console.log("Using Higgsfield token from local storage");
          } catch (e) {
            console.log("No local Higgsfield token found");
          }
        }

        if (!accessToken && !apiKey) {
          return res.status(401).json({ error: "Higgsfield authentication missing. Please authorize again or provide an API Key in Settings." });
        }

        const endpoint = 'https://api.higgsfield.ai/v1/video/generate';
        const payload: any = {
          prompt,
          model: 'higgs-1',
          aspect_ratio: aspectRatio || '9:16'
        };
        if (imageBase64) payload.image = imageBase64.split(',')[1] || imageBase64;

        console.log("Calling Higgsfield API at:", endpoint);
        const headers: any = { 'Content-Type': 'application/json' };
        if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;
        else if (apiKey) headers['x-api-key'] = apiKey;

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          console.error("Higgsfield API Error Response:", err);
          throw new Error(`Higgsfield Error: ${err.message || response.statusText}`);
        }

        console.log("Higgsfield generation successful");
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', response.headers.get('Content-Type') || 'video/mp4');
        res.send(Buffer.from(buffer));
      } 
      else {
        // Default to Google Veo
        const ai = getAI(geminiKey);
        let operation = await ai.models.generateVideos({
          model: 'veo-3.1-lite-generate-preview',
          prompt,
          image: imageBase64 ? {
            imageBytes: imageBase64.split(',')[1] || imageBase64,
            mimeType: 'image/jpeg'
          } : undefined,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio || '9:16'
          }
        });

        while (!operation.done) {
          await new Promise(r => setTimeout(r, 5000));
          operation = await ai.operations.getVideosOperation({ operation });
        }

        const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!videoUri) throw new Error("Video generation failed - no URI returned");

        const response = await fetch(videoUri, {
          headers: { 'x-goog-api-key': process.env.API_KEY || process.env.GEMINI_API_KEY || '' }
        });
        const buffer = await response.arrayBuffer();
        res.setHeader('Content-Type', 'video/mp4');
        res.send(Buffer.from(buffer));
      }
    } catch (error: any) {
      console.error("Video Generation Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/analyze", async (req, res) => {
    const { content, geminiKey } = req.body;
    try {
      console.log("Analyzing content...");
      const ai = getAI(geminiKey);
      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: `Analyze the following website content and extract:
1. Core product/service description.
2. 3 key selling points.
3. 3 main pain points it solves.
4. Target audience.
5. Brand tone/voice.

Content: ${content}` } ]}],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING },
              sellingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              painPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              audience: { type: Type.STRING },
              tone: { type: Type.STRING }
            }
          }
        }
      });
      res.json(JSON.parse(result.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/generate-content", async (req, res) => {
    const { type, analysis, style, extraLinks, platform, isMultiProduct, brandKit, gemInstruction, platformOptions, geminiKey } = req.body;
    try {
      console.log(`Generating ${type} content for ${platform}...`);
      const ai = getAI(geminiKey);
      
      const defaultSystemInstruction = `You are a high-conversion social media strategist. 
Style: ${style}. 
Platform Target: ${platform}.
${platformOptions ? `Platform Options:
- Aspect Ratio: ${platformOptions.aspectRatio || 'Auto'}
- Post Type: ${platformOptions.postType || 'Auto'}
- Orientation: ${platformOptions.orientation || 'Auto'}
- Location Tag: ${platformOptions.location || 'None'}
- Custom Tags: ${platformOptions.tags?.join(', ') || 'None'}
- Threads Integration: ${platformOptions.postToThreads ? 'ENABLED' : 'DISABLED'}` : ''}
Conversion Goal: Maximize sell rate by highlighting pain points and unique solutions.
${brandKit ? `BRAND IDENTITY:
- Colors: ${brandKit.primaryColor}, ${brandKit.secondaryColor}, ${brandKit.accentColor}
- Font Style: ${brandKit.fontFamily}
Ensure the content alignment matches this brand identity.` : ''}
Include SEO keywords, tags, alt-text for accessibility, and a clear meta-description.
Associated Links: ${extraLinks ? extraLinks.join(', ') : ''}`;

      const finalSystemInstruction = gemInstruction ? gemInstruction : defaultSystemInstruction;

      const prompt = `Task: Generate a full ${type} post suite for ${platform}. 
Brand Analysis (Context): ${JSON.stringify(analysis)}
Is Multi-Product: ${isMultiProduct}

REQUIREMENTS FOR THIS OUTPUT:
${type === 'video' ? `
- Script: Include a high-retention HOOK, SOLUTION, and CTA.
- SPECIAL MANDATORY CTA: Somewhere in the video content or script, you MUST include: "This is Christopher from NexusAIGear, smash that like button and the link to the product is in the post. Don't forget to subscribe."
- Metadata: Provide a viral Title, a short engaging description, and relevant keywords/tags.
- Video Generation: You MUST provide a detailed 'videoPrompt' for high-quality video generation.
` : type === 'image' ? `
- Format: If carousel supported, generate conceptual prompts for 3 distinct images.
- Content: Engaging caption with colourful emojis and formatting.
- SEO: Keywords and Alt-text for each image concept.
` : type === 'article' ? `
- Structure: Long-form thought leadership piece.
- Visuals: Specify places for 1-2 product images with hyperlinks to the product.
- Formatting: Use Markdown for readability.
` : type === 'deck' ? `
- Structure: Professional 8-slide investor pitch deck.
- Content: Slides MUST include: Title, Problem, Solution, Market Opportunity, Product/Tech, Revenue Model, Traction/Team, and Contact.
- Visuals: Provide a 'visualPrompt' for each slide describing a clean, high-end professional background or illustration.
- Narrative: High-conviction, data-driven, and strategic language.
` : `
- Format: Custom content/Dynamic Template execution.
- Execution: Follow the specific logic defined in the system instruction and user refinement.
- Content: Provide the result in the 'customContent' field if it doesn't fit standard fields.
`}

Output strictly as JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: finalSystemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              script: { type: Type.STRING },
              ctaText: { type: Type.STRING },
              articleMarkdown: { type: Type.STRING },
              customContent: { type: Type.STRING },
              imageUrl: { type: Type.STRING },
              carouselImages: { 
                type: Type.ARRAY, 
                items: { 
                  type: Type.OBJECT, 
                  properties: {
                    prompt: { type: Type.STRING },
                    alt: { type: Type.STRING }
                  }
                } 
              },
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    content: { type: Type.STRING },
                    points: { type: Type.ARRAY, items: { type: Type.STRING } },
                    visualPrompt: { type: Type.STRING },
                    type: { type: Type.STRING }
                  }
                }
              },
              seo: {
                type: Type.OBJECT,
                properties: {
                  keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                  altText: { type: Type.STRING },
                  metaDescription: { type: Type.STRING }
                }
              },
              videoPrompt: { type: Type.STRING }
            }
          }
        }
      });
      res.json(JSON.parse(result.text || '{}'));
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    const { message, history, currentContent, geminiKey } = req.body;
    try {
      console.log("Processing chat revision...");
      const ai = getAI(geminiKey);
      const contents = history.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...contents, { role: 'user', parts: [{ text: message }] }],
        config: {
          systemInstruction: `You are an expert content editor and social media strategist. 
Current content: ${JSON.stringify(currentContent)}. 
The user wants to revise this content or get more information.
If the user's request requires updating the content (e.g., "make it shorter", "change the tone", "rewrite the hook"):
1. Provide a brief explanation of the change.
2. Provide the UPDATED content fields in a clear JSON block wrapped in triple backticks and tagged with 'json-update'.
Example:
\`\`\`json-update
{
  "title": "New Title",
  "script": "New script contents..."
}
\`\`\`
If they are just asking a question, just answer it.`
        }
      });
      res.json({ text: result.text || '' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Local Store for Shortened URLs
  const urlStore: Record<string, string> = {};

  app.post("/api/shorten", (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    const slug = Math.random().toString(36).substring(2, 8);
    urlStore[slug] = url;
    
    // Prioritize the public APP_URL injected by the environment
    const publicBaseUrl = process.env.APP_URL ? process.env.APP_URL.replace(/\/$/, '') : `${req.protocol}://${req.get('host')}`;
    res.json({ shortUrl: `${publicBaseUrl}/s/${slug}` });
  });

  app.get("/s/:slug", (req, res) => {
    const { slug } = req.params;
    const originalUrl = urlStore[slug];
    if (originalUrl) {
      res.redirect(originalUrl);
    } else {
      res.status(404).send("Short URL not found");
    }
  });

  // API Routes
  app.post("/api/preview", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const response = await fetch(url);
      const text = await response.text();
      
      const titleMatch = text.match(/<title>([^<]*)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : url;

      const ogImageMatch = text.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i) || 
                          text.match(/<meta\s+content=["']([^"']*)["']\s+property=["']og:image["']/i);
      const thumbnail = ogImageMatch ? ogImageMatch[1] : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(title)}`;

      res.json({ title, thumbnail });
    } catch (error) {
      res.status(500).json({ error: "Failed to get preview: " + (error as any).message });
    }
  });

  app.post("/api/scrape", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      // In a real app, you'd use puppeteer or a scraping service.
      // For this environment, we'll simulate a scrape response or use a simple fetch if possible.
      // However, since I can't guarantee fetch works for all URLs under sandbox,
      // I'll provide a placeholder or try a basic fetch.
      // actually, the instructions say "Build real integrations". 
      // I'll use a simple fetch and parse some text.
      const response = await fetch(url);
      const text = await response.text();
      // Extract basic text (very naive)
      const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 10000);
      res.json({ content: cleanText });
    } catch (error) {
      res.status(500).json({ error: "Failed to scrape URL: " + (error as any).message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
