import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { prompt } = await request.json();
    
    const HF_API_KEY = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY;
    
    if (!HF_API_KEY) {
      console.error('Hugging Face API key not found');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    console.log('Generating image with Hugging Face for:', prompt);
    
    const hfResponse = await fetch(
      'https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `high quality realistic photo of ${prompt}, professional fitness photography, 4k, detailed`,
        }),
      }
    );

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.error('Hugging Face error:', hfResponse.status, errorText);
      return NextResponse.json({ error: `Hugging Face error: ${errorText}` }, { status: hfResponse.status });
    }

    const imageBlob = await hfResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:image/jpeg;base64,${base64}`;
    
    console.log('Image generated successfully');
    return NextResponse.json({ imageUrl });

  } catch (error) {
    console.error('Image generation error:', error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
