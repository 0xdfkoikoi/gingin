// --- Cloudflare Worker for Toko Gangan AI Assistant (Gemini 2.5 Flash) ---

// This version is AI-powered and uses the generous free tier provided by Google.
// IMPORTANT: Ensure your GEMINI_API_KEY is set as a secret environment variable
// in your Cloudflare Worker settings.

const corsHeaders = {
    // Allows all origins (safe for GitHub Pages deployment)
    'Access-Control-Allow-Origin': '*', 
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    // We only set Content-Type on the response when we actually send data back
};

/**
 * Handles the AI generation request after routing.
 * @param {Request} request 
 * @param {Object} env 
 * @returns {Promise<Response>}
 */
async function handleGenerate(request, env) {
    const defaultHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };
    
    // 1. Check for API Key (MANDATORY for AI functionality)
    if (!env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'Gin gin AI cannot connect. GEMINI_API_KEY is not set in Worker environment variables. Please set the secret key to enable AI conversation.' }), {
            status: 500,
            headers: defaultHeaders
        });
    }

    try {
        // 2. Parse the request body to get the prompt
        // Using the supported and fast gemini-2.5-flash model
        const { prompt, model = "gemini-2.5-flash" } = await request.json(); 

        if (!prompt) {
            return new Response(JSON.stringify({ error: 'Missing "prompt" in request body.' }), {
                status: 400,
                headers: defaultHeaders
            });
        }

        // 3. Construct the Gemini API payload and URL
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`;
        
        // Use the comprehensive SYSTEM_PROMPT found in your config.js to guide the AI
        const SYSTEM_PROMPT = `Anda adalah GIN GIN asisten AI untuk TOKO GAN GAN, Warung semi modern sederhana di kawasan bandung dengan konsep teknologi dan edukasi gratis bagi pelanggan setia TOKO GAN GAN. berikan informasi singkat yang tidak terlalu panjang untuk setiap pertanyaan pelanggan.
        
        **Informasi TOKO GAN GAN:**
        - JAM BUKA 6AM - 1AM
        - TOKO GAN GAN selain menyediakan aneka jajanan untuk anak ada juga roko kopi aneka minuman juga ada fasilitas mesin fotocopy menyediakan tali rapia kuat bermerek dollar untuk para petani bawang untuk mengikat bawang daun hasil panen
        - fisi dan misi TOKO GAN GAN selain menyediakan kebutuhan harian masyarakat juga memberikan edukasi pendidikan melalui teknologi AI gemini 2.5 flash
        - alat tulis kantor, berbagai lem alteco, lem korea, gas lpg 3kg, beras, popok untuk bayi dan juga dewasa dan masih banyak lagi
        - informasi harga kopi sachet berkisar 18000 - 19000 untuk satu renteng, harga bundle 5500 untuk 3 pcs, harga per pcs 2000
        - dan juga menyediakan kopi premium dalam kemasan drip bag dari cameo coffee harga 10000 per sachet
        - informasi harga dalam kurs rupiah
        - List harga roko djarum coklat 18000, djarum super 25000, djarum 76 rasa apel, mangga, nanas, kurma, mangga royal 16000, djarum esspresso 18000, djarum espresso gold 20000, djarum coklat extra 17000, djarum coklat elite 18000
          la bold 38500, mld fresh colla 32000, la light 35000, la menthol 35000, la ice 35000, la ice manggo 34500, la ice purple 34500, djarum black 34000, djarum black cappuccino 34000, mld putih 20 batang 39000, djarum king 23000, djarum extra mocca 18000.
        - harga telur perkilogram 29000, harga beras 
        - jika ada informasi harga yang tidak tertera pada SYSTEM_PROMPT pelanggan disarankan bertanya langsung pada penjaga toko karena harga selalu fluktuatif
        - informasi GIN GIN ai assistant TOKO GAN GAN dikembangkan oleh GAN GAN atau lemmon_coffee91 nama alias 0xdfkoikoi powered by gemini 2.5 flash.`;


        const payload = {
            contents: [{ parts: [{ text: prompt }] }], 
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] } // Inject the system prompt
        };

        // 4. Call the Gemini API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle API errors (e.g., invalid key, rate limits)
            const errorMessage = data.error?.message || `Gemini API call failed with status ${response.status}.`;
            console.error('Gemini API Error:', errorMessage);
            return new Response(JSON.stringify({ error: `[API Error: The connection failed. Please check your GEMINI_API_KEY in the Cloudflare Worker settings.] Details: ${errorMessage}` }), {
                status: response.status || 500,
                headers: defaultHeaders
            });
        }

        // 5. Extract and format the generated text
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // 6. Return the response in the expected format: { "text": "..." }
        return new Response(JSON.stringify({ text: generatedText }), {
            status: 200,
            headers: defaultHeaders
        });

    } catch (e) {
        // Handle unexpected Worker execution errors (e.g., JSON parsing failure)
        return new Response(JSON.stringify({ error: `Worker execution failed: ${e.message}` }), {
            status: 500,
            headers: defaultHeaders
        });
    }
}


export default {
    async fetch(request, env) {
        const url = new URL(request.url);

        const headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        };

        // Handle OPTIONS preflight requests
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers });
        }

        // Route the POST request for /generate
        if (url.pathname === '/generate' && request.method === 'POST') {
            return handleGenerate(request, env);
        }
        
        // Return a 404 for any other path/method
        return new Response('Worker endpoint not found.', { 
            status: 404, 
            headers: { ...headers, 'Content-Type': 'text/plain' }
        });
    }
}
