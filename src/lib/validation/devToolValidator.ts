import { GoogleGenerativeAI } from '@google/generative-ai';

export async function validateDevTool(toolName: string): Promise<boolean> {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.error('GEMINI_API_KEY not found');
            return basicDevToolValidation(toolName);
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
You are a validator for a developer learning platform. Your task is to determine if a given input is a valid programming language, framework, library, development tool, or technology that developers would learn.

Input: "${toolName}"

Rules:
- Return "VALID" if it's a programming language (e.g., JavaScript, Python, Java)
- Return "VALID" if it's a web framework (e.g., React, Angular, Vue, Django)
- Return "VALID" if it's a development tool (e.g., Docker, Git, VS Code)
- Return "VALID" if it's a database technology (e.g., MongoDB, PostgreSQL)
- Return "VALID" if it's a cloud platform (e.g., AWS, Azure, GCP)
- Return "VALID" if it's any technology/tool used in software development
- Return "INVALID" if it's not related to programming or software development
- Return "INVALID" for general objects, furniture, food, animals, etc.

Be strict but reasonable. Only accept things that developers would actually learn or use in their work.

Respond with only "VALID" or "INVALID" - no other text.
        `.trim();

        const result = await model.generateContent(prompt);
        const response = result.response.text().trim().toUpperCase();
        
        return response === 'VALID';
    } catch (error) {
        console.error('Error validating tool with Gemini:', error);
        // Fallback to basic validation if Gemini fails
        return basicDevToolValidation(toolName);
    }
}

function basicDevToolValidation(toolName: string): boolean {
    const normalized = toolName.toLowerCase().trim();
    
    // Basic patterns for common dev-related terms
    const devPatterns = [
        /\b(js|ts|py|java|cpp|cs|go|rs|swift|kt|php|rb)\b/i,
        /\b(framework|library|tool|lang|language|js|api|sdk|cli)\b/i,
        /\b(dev|development|coding|programming|script|compile|build)\b/i,
        /\.(js|ts|py|java|cpp|cs|go|rs|swift|kt|php|rb|html|css)$/i,
        /\b(react|angular|vue|node|express|django|flask|spring)\b/i
    ];
    
    return devPatterns.some(pattern => pattern.test(normalized));
}
