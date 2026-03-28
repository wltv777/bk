import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const { weight, height, age, sex, activityLevel, climate, goal } = await req.json();

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY || '' });

    // Scientific baseline (EFSA / IOM guidelines)
    const baseByWeight = Math.round(weight * 35); // 35ml/kg baseline
    const activityAdd = activityLevel === 'sedentary' ? 0 : activityLevel === 'light' ? 300 : activityLevel === 'moderate' ? 600 : activityLevel === 'active' ? 900 : 1200;
    const climateAdd = climate === 'hot' ? 500 : climate === 'tropical' ? 700 : 0;
    const baselineTotal = baseByWeight + activityAdd + climateAdd;

    const prompt = `Você é um nutricionista especialista em hidratação. Calcule a necessidade de água diária personalizada e crie um cronograma de hidratação.

Dados do usuário:
- Peso: ${weight}kg
- Altura: ${height}cm
- Idade: ${age} anos
- Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- Nível de atividade: ${activityLevel}
- Clima: ${climate}
- Objetivo: ${goal === 'lose' ? 'Perder peso' : goal === 'gain' ? 'Ganhar músculo' : 'Manutenção'}
- Estimativa científica base (35ml/kg + atividade + clima): ${baselineTotal}ml

Crie um plano de hidratação personalizado. Responda APENAS com JSON válido neste formato exato, sem markdown:
{
  "dailyGoalMl": número (total em ml),
  "dailyGoalL": número (total em litros, 1 casa decimal),
  "rationale": "explicação curta em português (2-3 frases) do porquê desta quantidade",
  "schedule": [
    {"time": "07:00", "ml": 300, "tip": "dica curta"},
    {"time": "09:00", "ml": 250, "tip": "dica curta"},
    {"time": "11:00", "ml": 250, "tip": "dica curta"},
    {"time": "13:00", "ml": 300, "tip": "dica curta"},
    {"time": "15:00", "ml": 250, "tip": "dica curta"},
    {"time": "17:00", "ml": 300, "tip": "dica curta"},
    {"time": "19:00", "ml": 250, "tip": "dica curta"},
    {"time": "21:00", "ml": 200, "tip": "dica curta"}
  ],
  "tips": ["dica 1 personalizada", "dica 2 personalizada", "dica 3 personalizada"],
  "foodsWithWater": ["alimento 1 com alto teor de água", "alimento 2", "alimento 3"]
}`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';

    try {
      const result = JSON.parse(text);
      return NextResponse.json({ ...result, baselineEstimate: baselineTotal });
    } catch {
      // Fallback with scientific calculation
      const dailyGoalMl = baselineTotal;
      return NextResponse.json({
        dailyGoalMl,
        dailyGoalL: Math.round(dailyGoalMl / 100) / 10,
        rationale: `Para ${weight}kg com nível de atividade ${activityLevel}, a recomendação é ${Math.round(dailyGoalMl / 1000 * 10) / 10}L/dia (35ml/kg + ajuste por atividade e clima).`,
        schedule: [
          { time: '07:00', ml: Math.round(dailyGoalMl * 0.12), tip: 'Ao acordar, hidrate imediatamente' },
          { time: '09:00', ml: Math.round(dailyGoalMl * 0.10), tip: 'Antes do treino ou trabalho' },
          { time: '11:00', ml: Math.round(dailyGoalMl * 0.10), tip: 'Metade da manhã' },
          { time: '13:00', ml: Math.round(dailyGoalMl * 0.12), tip: 'Antes do almoço' },
          { time: '15:00', ml: Math.round(dailyGoalMl * 0.10), tip: 'Tarde — combate o cansaço' },
          { time: '17:00', ml: Math.round(dailyGoalMl * 0.12), tip: 'Pré-treino ou fim do expediente' },
          { time: '19:00', ml: Math.round(dailyGoalMl * 0.10), tip: 'Com o jantar' },
          { time: '21:00', ml: Math.round(dailyGoalMl * 0.08), tip: 'Última dose do dia' },
        ],
        tips: [
          'Deixe uma garrafa de água visível na mesa ou bancada',
          'Urina clara a levemente amarela = boa hidratação',
          'Beba um copo extra após cada treino',
        ],
        foodsWithWater: ['Pepino (96% água)', 'Melancia (92% água)', 'Morango (91% água)', 'Alface (95% água)'],
        baselineEstimate: baselineTotal,
      });
    }
  } catch (err: any) {
    console.error('water-calc error:', err?.message);
    return NextResponse.json({ error: 'Erro no cálculo.' }, { status: 500 });
  }
}
