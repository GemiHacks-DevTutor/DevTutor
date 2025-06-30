import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import { generateTool } from '@/lib/gemini';
import { validateDevTool } from '@/lib/validation/devToolValidator';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id)
        return NextResponse.json(
            { error: 'Missing id parameter' },
            { status: 400 }
        );

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    if (!user)
        return NextResponse.json(
            { error: 'Must be a user.' },
            { status: 404 }
        );

    const toolsCollection = db.collection('tools');

    const tools = await toolsCollection.find({}).toArray();
    await client.close();

    return NextResponse.json({
        success: true,
        tools
    });
}

export async function POST(request: NextRequest) {
    const body = await request.json();
    const { toolName, id } = body;

    if (!toolName || !id)
        return NextResponse.json(
            { error: 'toolName and id are required' },
            { status: 400 }
        );

    // Validate that the tool name is development-related
    const isValidDevTool = await validateDevTool(toolName);
    if (!isValidDevTool)
        return NextResponse.json(
            { error: 'Invalid tool. Please enter a programming language, framework, or development tool.' },
            { status: 400 }
        );

    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();

        const db = client.db('devtutor');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ _id: new ObjectId(id) });
        if (!user)
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );

        const toolsCollection = db.collection('tools');

        // Check if user already has this tool
        const toolExists = await toolsCollection.findOne({ 
            name: toolName, 
            userId: id 
        });
        
        if(toolExists) 
            return NextResponse.json({
                success: true,
                tool: {
                    ...toolExists,
                    id: toolExists._id.toString()
                }
            });
        

        const generatedTool = await generateTool(toolName);
        
        const toolToSave = {
            ...generatedTool,
            userId: id
        };
        
        const result = await toolsCollection.insertOne(toolToSave);
        
        const savedTool = {
            ...toolToSave,
            id: result.insertedId.toString()
        };

        return NextResponse.json({
            success: true,
            tool: savedTool,
        });
    } catch (error) {
        console.error('Error creating tool:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}
