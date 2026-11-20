import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { portfolio } = await req.json();

        // 1. Fetch latest news for context
        let newsContext = 'Berita tidak tersedia.';
        try {
            const newsRes = await fetch('https://min-api.cryptocompare.com/data/v2/news/?lang=EN&categories=Crypto');
            const newsData = await newsRes.json();
            newsContext = (newsData.Data || []).slice(0, 8).map((a: any) => `${a.title}: ${a.body.substring(0, 100)}`).join('\n');
        } catch (e) {
            console.error('News fetch error:', e);
        }

        // 2. Format prompt for 9router LLM
        const prompt = `Anda adalah analis finansial crypto profesional. 
Analisis portfolio berikut berdasarkan data aset dan berita pasar terkini.

Data Portfolio:
${JSON.stringify(portfolio, null, 2)}

Berita Pasar Terkini:
${newsContext}

Berikan analisis dalam format JSON berikut (pastikan valid JSON):
{
  "summary": "Analisis ringkas kondisi pasar dan kinerja portfolio (Markdown)",
  "sentiment_score": 0, // -10 (Sangat Bearish) hingga 10 (Sangat Bullish)
  "recommendations": ["Saran strategi 1", "Saran strategi 2"]
}
Jangan berikan teks lain di luar JSON.`;

        // 3. Call 9router endpoint
        const response = await fetch('http://localhost:20128/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer sk-434ada9936444748-6nkfff-0a8c3e17',
            },
            body: JSON.stringify({
                model: 'coding',
                messages: [
                    { role: 'system', content: 'Anda adalah AI financial advisor yang objektif.' },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7,
                stream: false
            }),
        });

        const responseText = await response.text();
        
        if (!response.ok) {
            throw new Error(`9router error: ${response.status} - ${responseText}`);
        }

        const data = JSON.parse(responseText);
        let content = data.choices?.[0]?.message?.content || '{}';

        // Robust JSON extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonString = jsonMatch ? jsonMatch[0] : content;

        const parsed = JSON.parse(jsonString);
        return NextResponse.json({ summary: parsed });

    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: error.message || 'Gagal melakukan analisis AI' },
            { status: 500 }
        );
    }
}
