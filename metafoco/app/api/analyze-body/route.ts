import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = 'image/jpeg', weight, height, age, sex } = await req.json();

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '' });

    const bmi = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : 'desconhecido';

    // Deurenberg formula as baseline
    const deurenberg = weight && height && age
      ? sex === 'male'
        ? Math.round(1.2 * Number(bmi) + 0.23 * age - 16.2)
        : Math.round(1.2 * Number(bmi) + 0.23 * age - 5.4)
      : null;

    let prompt = `Você é um especialista em composição corporal. `;

    if (imageBase64) {
      prompt += `Analise a foto desta pessoa e estime a porcentagem de gordura corporal com base na aparência visual.

Dados do usuário para referência:
- Peso: ${weight}kg
- Altura: ${height}cm
- Idade: ${age} anos
- Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- IMC calculado: ${bmi}
- Estimativa pela fórmula Deurenberg: ${deurenberg}%

IMPORTANTE: Use a foto + os dados como referência. Analise:
1. Distribuição de gordura corporal visível
2. Definição muscular
3. Proporções corporais

Responda APENAS com JSON válido neste formato exato, sem markdown:
{
  "estimatedBodyFat": número,
  "confidence": "low" | "medium" | "high",
  "category": "Essencial" | "Atlético" | "Boa forma" | "Aceitável" | "Acima do ideal",
  "observations": "observação curta em português (1-2 frases)",
  "recommendation": "recomendação personalizada em português (1-2 frases)"
}`;
    } else {
      prompt += `Com base nos dados abaixo, calcule a composição corporal estimada:

- Peso: ${weight}kg
- Altura: ${height}cm
- Idade: ${age} anos
- Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- IMC: ${bmi}
- Estimativa Deurenberg: ${deurenberg}%

Responda APENAS com JSON válido neste formato:
{
  "estimatedBodyFat": número,
  "confidence": "medium",
  "category": "Essencial" | "Atlético" | "Boa forma" | "Aceitável" | "Acima do ideal",
  "observations": "observação em português",
  "recommendation": "recomendação em português"
}`;
    }

    const messages: Anthropic.MessageParam[] = imageBase64
      ? [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg' | 'image/png' | 'image/webp', data: imageBase64 } },
            { type: 'text', text: prompt },
          ],
        }]
      : [{ role: 'user', content: prompt }];

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    try {
      const result = JSON.parse(text);
      return NextResponse.json({ ...result, deurenbergEstimate: deurenberg, bmi });
    } catch {
      // Fallback to Deurenberg if JSON parse fails
      return NextResponse.json({
        estimatedBodyFat: deurenberg,
        confidence: 'medium',
        category: getCategoryFromFat(deurenberg ?? 20, sex),
        observations: 'Estimativa calculada pela fórmula Deurenberg (IMC + idade).',
        recommendation: 'Para maior precisão, use medidas de circunferências ou escaneie uma foto.',
        deurenbergEstimate: deurenberg,
        bmi,
      });
    }
  } catch (err: any) {
    console.error('analyze-body error:', err?.message);
    return NextResponse.json({ error: 'Erro na análise.' }, { status: 500 });
  }
}

function getCategoryFromFat(fat: number, sex: string): string {
  if (sex === 'male') {
    if (fat < 6)  return 'Essencial';
    if (fat < 14) return 'Atlético';
    if (fat < 18) return 'Boa forma';
    if (fat < 25) return 'Aceitável';
    return 'Acima do ideal';
  }
  if (fat < 14) return 'Essencial';
  if (fat < 21) return 'Atlético';
  if (fat < 25) return 'Boa forma';
  if (fat < 32) return 'Aceitável';
  return 'Acima do ideal';
}
