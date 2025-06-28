import { model } from './client';
import { Tool, ToolModule } from '../../models/course';

export const generateTool = async (toolName: string): Promise<Tool> => {
  if (!toolName)
    throw new Error('Tool name is required');

  try
  {
    const prompt = `Create a comprehensive learning tool for "${toolName}".

Generate a structured response with:
1. A clear description of what ${toolName} is and why it's useful
2. Appropriate difficulty level (beginner, intermediate, or advanced)
3. A relevant icon URL (use a real icon URL from devicons CDN like: https://cdn.jsdelivr.net/gh/devicons/devicon/icons/[toolname]/[toolname]-original.svg)
4. 3-5 learning modules with titles and descriptions
5. Each module should cover a key aspect of ${toolName}

Respond in this exact JSON format:
{
  "name": "${toolName}",
  "description": "Clear description of the tool",
  "icon": "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/[toolname]/[toolname]-original.svg",
  "difficulty": "beginner|intermediate|advanced",
  "modules": [
    {
      "id": "module-1",
      "title": "Module Title",
      "description": "Module description"
    }
  ]
}`;

    const response = await model.generateContent(prompt);

    return parseToolResponse(response.response.text(), toolName);
  } catch(error)
  {
    console.log('Error generating tool:', error);
    throw new Error(`Failed to generate tool for ${toolName}`,);
  }
};

const parseToolResponse = (responseText: string, toolName: string): Tool => {
  try
  {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch)
      throw new Error('No JSON found in response');
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    const toolId = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const modules: ToolModule[] = (parsed.modules || []).map((module: { title?: string; description?: string }, index: number) => ({
        id: `module_${index + 1}_${Math.random().toString(36).substr(2, 9)}`,
        title: module.title || `Module ${index + 1}`,
        description: module.description || 'Module description'
    }));

    return {
        id: toolId,
        name: parsed.name || toolName,
        description: parsed.description || `Learn ${parsed.name || toolName}`,
        icon: parsed.icon || '/placeholder-icon.svg',
        difficulty: parsed.difficulty || 'beginner',
        modules: modules    
    };
  } catch (error)
  {
    console.log('Error parsing tool response:', error);
    
    const fallbackId = `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      id: fallbackId,
      name: toolName,
      description: `A comprehensive guide to learning ${toolName}`,
      icon: '/placeholder-icon.svg',
      difficulty: 'beginner',
      modules: [
        {
          id: `module_1_${Math.random().toString(36).substr(2, 9)}`,
          title: 'Getting Started',
          description: 'Introduction and basic concepts'
        }
      ]
    };
  }
};
