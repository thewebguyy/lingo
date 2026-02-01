import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function reformatContent(content: string, platform: string, targetDialect: string = 'Standard English') {
    const prompt = `
    You are Lingo, the universal content bridge. 
    Transform the following content for ${platform}.
    Target Dialect: ${targetDialect}.
    
    Guidelines:
    - If platform is TikTok: Use slang, high energy, short sentences, and relevant hashtags.
    - If platform is LinkedIn: Keep it professional but engaging, use bullet points, and industry-relevant tone.
    - If platform is X: Be concise, witty, and use a thread format if the content is long.
    - If targetDialect is Pidgin: Use authentic Lagos Pidgin English.
    
    Original Content:
    "${content}"
    
    Return ONLY the reformatted content.
  `;

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
    });

    return response.choices[0].message.content;
}
