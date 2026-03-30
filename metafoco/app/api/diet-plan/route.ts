import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both wizard format ({step1, step2, step3, step4}) and legacy flat format
    let weight: number, height: number, age: number, sex: string, activity: string;
    let bodyFat: string, leanMass: string, visceralFat: string, waterPct: string, metabolicAge: string, bmr: string;
    let goal: string, dietType: string[], allergies: string[], mealsPerDay: number;

    if (body.step1) {
      // Wizard format
      weight = parseFloat(body.step1.weight) || 75;
      height = parseFloat(body.step1.height) || 170;
      age = parseFloat(body.step1.age) || 30;
      sex = body.step1.sex || 'male';
      activity = body.step1.activityLevel || 'moderate';
      bodyFat = body.step2?.body_fat_pct || '';
      leanMass = body.step2?.lean_mass_kg || '';
      visceralFat = body.step2?.visceral_fat || '';
      waterPct = body.step2?.body_water_pct || '';
      metabolicAge = body.step2?.metabolic_age || '';
      bmr = body.step2?.bmr || '';
      goal = body.step3?.goal || 'maintain';
      dietType = body.step4?.dietTypes?.length > 0 ? body.step4.dietTypes : ['Onívoro'];
      allergies = body.step4?.allergies?.length > 0 ? body.step4.allergies : ['Nenhuma'];
      mealsPerDay = body.step4?.mealsPerDay || 4;
    } else {
      // Legacy flat format
      weight = parseFloat(body.weight) || 75;
      height = parseFloat(body.height) || 170;
      age = parseFloat(body.age) || 30;
      sex = body.sex || 'male';
      activity = body.activity || 'moderate';
      bodyFat = body.bodyFat || '';
      leanMass = body.leanMass || '';
      visceralFat = body.visceralFat || '';
      waterPct = body.waterPct || '';
      metabolicAge = body.metabolicAge || '';
      bmr = body.bmr || '';
      goal = body.goal || 'maintain';
      dietType = body.dietType || ['Onívoro'];
      allergies = body.allergies || ['Nenhuma'];
      mealsPerDay = body.mealsPerDay || 4;
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || '' });

    // Calculate TMB via Mifflin-St Jeor
    const tmb = sex === 'male'
      ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
      : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

    const activityFactors: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9,
    };
    const tdee = Math.round(tmb * (activityFactors[activity] || 1.55));
    const goalAdjust: Record<string, number> = {
      lose_fat: -500, maintain: 0, gain_muscle: 300, recomp: -200,
    };
    const targetCalories = tdee + (goalAdjust[goal] || 0);
    const targetProtein = Math.round(weight * 2);
    const targetCarbs = Math.round(targetCalories * 0.4 / 4);
    const targetFat = Math.round(targetCalories * 0.3 / 9);

    const goalLabel = goal === 'lose_fat' ? 'Perder gordura (-500 kcal)' : goal === 'gain_muscle' ? 'Ganhar músculo (+300 kcal)' : goal === 'recomp' ? 'Recomposição (-200 kcal)' : 'Manutenção';

    const prompt = `Você é um nutricionista especialista em nutrição esportiva brasileira. Crie um plano alimentar personalizado de 7 dias em português do Brasil.

Dados do usuário:
- Peso: ${weight}kg, Altura: ${height}cm, Idade: ${age} anos, Sexo: ${sex === 'male' ? 'Masculino' : 'Feminino'}
- Nível de atividade: ${activity}
- TMB calculada: ${tmb} kcal | TDEE: ${tdee} kcal | Meta calórica: ${targetCalories} kcal/dia
${bodyFat ? `- Gordura corporal: ${bodyFat}% | Massa magra: ${leanMass}kg` : ''}
${visceralFat ? `- Gordura visceral: ${visceralFat}` : ''}
${waterPct ? `- Água corporal: ${waterPct}%` : ''}
${metabolicAge ? `- Idade metabólica: ${metabolicAge}` : ''}
${bmr ? `- TMB da balança inteligente: ${bmr} kcal` : ''}
- Objetivo: ${goalLabel}
- Metas: Proteína ${targetProtein}g | Carboidratos ${targetCarbs}g | Gordura ${targetFat}g
- Tipo de dieta: ${dietType.join(', ')}
- Alergias/restrições: ${allergies.join(', ')}
- Refeições por dia: ${mealsPerDay}

Crie um plano de 7 dias usando alimentos brasileiros comuns e baseado na Tabela TACO (NEPA/UNICAMP). Varie os alimentos entre os dias. Responda APENAS com JSON válido, sem markdown, sem texto antes ou depois:

{
  "summary": "Resumo personalizado do plano em 2-3 frases motivacionais",
  "targetCalories": ${targetCalories},
  "targetProtein": ${targetProtein},
  "targetCarbs": ${targetCarbs},
  "targetFat": ${targetFat},
  "days": [
    {
      "day": "Segunda-feira",
      "meals": [
        {
          "name": "Café da manhã",
          "foods": [
            { "name": "Aveia em flocos", "quantity": "40g", "calories": 148 },
            { "name": "Banana prata", "quantity": "1 unidade (90g)", "calories": 81 }
          ],
          "macros": { "calories": 229, "protein": 8, "carbs": 40, "fat": 4 }
        }
      ]
    }
  ]
}

Inclua exatamente ${mealsPerDay} refeições por dia para todos os 7 dias (Segunda a Domingo). Cada refeição deve ter 2-5 alimentos e macros precisos. Total diário deve ficar próximo de ${targetCalories} kcal.`;

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 8000,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid JSON response from AI');

    const plan = JSON.parse(jsonMatch[0]);
    return NextResponse.json(plan);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('diet-plan error:', message);
    return NextResponse.json({ error: 'Erro ao gerar plano. Tente novamente.' }, { status: 500 });
  }
}
