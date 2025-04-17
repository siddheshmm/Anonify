import { NextResponse } from 'next/server';
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    // Dynamic prompt to introduce variability
    const randomSeed = Math.floor(Math.random() * 10000); // Generate a random number
    const prompt = `
You are an AI assistant tasked with generating three open-ended and engaging questions for an anonymous social messaging platform. 
Each question must be formatted as a single string and separated by '||'. 
The questions should be suitable for a diverse audience and focus on universal themes that encourage friendly interaction. 
Avoid personal or sensitive topics, such as income, appearance, or relationships. 
Here is an example of the desired output format: 
'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. 
Now, generate three questions in this format. Use the seed ${randomSeed} to ensure variability:
`;

    const response = await hf.textGeneration({
      model: 'mistralai/Mixtral-8x7B-Instruct-v0.1', // Use a Hugging Face-supported model
      inputs: prompt,
      parameters: {
        max_new_tokens: 100,
        return_full_text: false,
        temperature: 0.7, // Add temperature for variability
      },
    });

    console.log('Response:', response); // Log the full response to check its structure

    // Ensure the response contains the separator
    const generatedText = response.generated_text.trim();
    if (!generatedText.includes('||')) {
      throw new Error('AI response does not contain the required separator (||).');
    }

    const suggestions = generatedText.split('||'); // Split the text into suggestions
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error Details:', error);

    // Fallback suggestions
    const fallbackSuggestions = [
      "What’s your favorite book?",
      "If you could visit any country, where would you go?",
      "What’s a skill you’ve always wanted to learn?",
    ];

    return NextResponse.json({ suggestions: fallbackSuggestions }, { status: 200 });
  }
}