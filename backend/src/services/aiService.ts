import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function reformatContent(content: string, platform: string, targetDialect: string = 'Standard English') {
    if (!content.trim()) throw new Error("Source content is empty");

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

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
        }, {
            timeout: 30000, // 30 second timeout
            maxRetries: 2,  // Built-in OpenAI retry
        });

        const result = response.choices[0].message.content;
        if (!result) throw new Error("AI returned empty result");

        return result;
    } catch (error: any) {
        console.error(`AI Reformat Error [${platform}]:`, error.message);
        if (error.name === 'AbortError' || error.message.includes('timeout')) {
            throw new Error(`AI Request timed out for ${platform}`);
        }
        throw new Error(`AI Failed to reformat for ${platform}: ${error.message}`);
    }
}
