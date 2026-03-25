import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `Você é um especialista em nutrição e análise de alimentos.
Analise a imagem fornecida e identifique todos os alimentos visíveis.
Responda APENAS com um JSON válido no formato abaixo, sem markdown ou texto adicional:
{
  "name": "Nome do prato ou alimento principal",
  "calories": número,
  "protein": número em gramas,
  "carbs": número em gramas,
  "fat": número em gramas,
  "fiber": número em gramas,
  "portion": número em gramas (porção estimada),
  "portionUnit": "g",
  "confidence": número de 0 a 1,
  "imageDescription": "breve descrição do que você viu",
  "clarifyingQuestions": ["pergunta opcional se precisar de mais info"]
}
Estime os valores nutricionais com base na porção visível na imagem.
Se não conseguir identificar, retorne confidence baixo e name como "Alimento não identificado".`;

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Imagem não fornecida.' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: SYSTEM_PROMPT },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
                detail: 'low',
              },
            },
          ],
        },
      ],
    });

    const content = response.choices[0]?.message?.content ?? '';

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Não foi possível analisar o alimento.' }, { status: 422 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('scan-food error:', err);
    return NextResponse.json({ error: 'Erro ao processar imagem.' }, { status: 500 });
  }
}
