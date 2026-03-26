import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.json({ error: 'Código não fornecido.' }, { status: 400 });

  try {
    const res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments,serving_size`,
      { next: { revalidate: 86400 } }
    );
    const data = await res.json();

    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments ?? {};

    return NextResponse.json({
      name:           p.product_name || 'Produto',
      brand:          p.brands,
      servingSize:    p.serving_size,
      calories_100g:  Math.round(Number(n['energy-kcal_100g'] || n.energy_100g / 4.184 || 0)),
      protein_100g:   parseFloat(String(n.proteins_100g || 0)),
      carbs_100g:     parseFloat(String(n.carbohydrates_100g || 0)),
      fat_100g:       parseFloat(String(n.fat_100g || 0)),
      fiber_100g:     parseFloat(String(n.fiber_100g || 0)),
      sodium_100g:    parseFloat(String(n.sodium_100g || 0)),
    });
  } catch {
    return NextResponse.json({ error: 'Erro ao buscar produto.' }, { status: 500 });
  }
}
