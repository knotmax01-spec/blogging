import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || 'gpt-4';
const TARGET_WORDS = parseInt(process.env.WORDS_PER_POST) || 1000;

function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function generateBlogPost(topic, researchNotes = '') {
  try {
    const systemPrompt = `You are an expert healthcare writer specializing in creating engaging, informative blog posts about health, wellness, and medical topics. 
Write in a conversational yet professional tone. Include storytelling elements to maintain reader engagement.
Target word count: ${TARGET_WORDS} words.
Structure the content with clear sections for Evolution, Innovations, Usage, and Benefits.`;

    const userPrompt = `Create a comprehensive blog post about: "${topic}"

${researchNotes ? `Research context:\n${researchNotes}\n` : ''}

Requirements:
1. Write an engaging introduction (100-150 words) that hooks readers
2. Evolution section (200-250 words): History and development of this healthcare topic
3. Innovations section (200-250 words): Latest advancements and breakthroughs
4. Usage section (200-250 words): Current applications and how it's being used
5. Benefits section (150-200 words): Key advantages and positive impacts
6. Conclusion (100-150 words): Summary and future outlook

Format the response as a JSON object with these keys:
- title: compelling blog post title
- metaDescription: 150-160 character SEO description
- category: healthcare category
- tags: comma-separated tags (5-7 tags)
- introduction: the introduction section
- evolution: the evolution section
- innovations: the innovations section
- usage: the usage section
- benefits: the benefits section
- conclusion: the conclusion section

Ensure the total word count is approximately ${TARGET_WORDS} words.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const slug = generateSlug(parsed.title);

      const fullContent = `# ${parsed.title}

${parsed.introduction}

## Evolution

${parsed.evolution}

## Innovations

${parsed.innovations}

## Usage

${parsed.usage}

## Benefits

${parsed.benefits}

## Conclusion

${parsed.conclusion}`;

      return {
        title: parsed.title,
        slug,
        content: fullContent,
        metaDescription: parsed.metaDescription,
        keywords: parsed.tags,
        category: parsed.category,
        tags: parsed.tags,
        sections: {
          evolution: parsed.evolution,
          innovations: parsed.innovations,
          usage: parsed.usage,
          benefits: parsed.benefits,
        },
        author: process.env.AUTHOR_NAME || 'Health Blogger',
        trendingTopic: topic,
      };
    }

    return null;
  } catch (error) {
    console.error('Error generating blog post with OpenAI:', error.message);
    return null;
  }
}

export async function generateBlogTitle(topic) {
  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'user',
          content: `Generate 5 compelling, SEO-friendly blog post titles for the healthcare topic: "${topic}"
Return only the titles, one per line, without numbering.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 300,
    });

    const titles = response.choices[0].message.content
      .split('\n')
      .filter(t => t.trim().length > 0);
    return titles;
  } catch (error) {
    console.error('Error generating blog titles:', error.message);
    return [];
  }
}
