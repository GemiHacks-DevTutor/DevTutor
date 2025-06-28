import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devtutor';

export async function POST(request: NextRequest) 
{
    const { firstName, lastName, username, password } = await request.json();

    if(!firstName || !lastName || !username || !password)
        return NextResponse.json(
            { success: false, error: 'All fields are required' },
            { status: 400 }
        );

    const hashedPassword = await bcrypt.hash(password, 12);

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    const userExists = await usersCollection.findOne({ username });
    if(userExists)
    {
        await client.close();
        return NextResponse.json(
            { success: false, error: 'User already exists' },
            { status: 409 }
        );
    }

    const result = await usersCollection.insertOne({
    firstName,
    lastName,
    username,
    password: hashedPassword,
    hasCompletedSurvey: false,
    });

    await client.close();

    if(result.insertedId)
        return NextResponse.json(
            {
            success: true,
            data: {
                id: result.insertedId.toString(),
                firstName,
                lastName,
                username: username,
                hasCompletedSurvey: false
            }
            },
            { status: 201 }
        );
    else
        return NextResponse.json(
            { success: false, error: 'Failed to create user' },
            { status: 500 }
        );
}
