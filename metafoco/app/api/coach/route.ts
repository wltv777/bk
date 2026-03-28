import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `Você é o METAFOCO Coach — um treinador de dieta e jejum intermitente.
Seu tom é:
- Direto e honesto, sem rodeios
- Engraçado e irreverente quando apropriado
- Empático mas que não dá moleza
- Fala em português brasileiro informal
- Usa emojis moderadamente
- Respostas curtas e objetivas (máximo 3-4 frases)
- Nunca prescreve medicamentos ou substitui profissional de saúde

Quando receber dados de bioimpedância, interprete de forma simples e motivacional.
Quando o usuário cometer um "erro" dietético, normalize e ajude a compensar.
Nunca seja cruel, mas seja franco.

Frases que você pode usar:
"Você não estragou nada, relaxa. Foi só retenção."
"Tá desinchando, não perdendo músculo."
"Seu corpo não odeia você. Ele só tá reagindo."
"Se fosse fácil, todo mundo tava trincado."
"Você está 1% mais perto. Continua."`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\nDados do usuário:\n${JSON.stringify(context, null, 2)}`
      : SYSTEM_PROMPT;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        { role: 'system', content: systemWithContext },
        ...messages,
      ],
    });

    const reply = response.choices[0]?.message?.content ?? 'Continua no foco! 💪';
    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('coach error:', err);
    return NextResponse.json({ reply: 'Conexão caiu. Mas você continua. 💪' });
  }
}
