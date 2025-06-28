import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function POST(req: NextRequest)
{
    const { username, password } = await req.json();

    if(!username || !password)
        return NextResponse.json(
            { success: false, error: 'Username and password are required' },
            { status: 400 }
        );

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ username });

    if(!user)
    {
        await client.close();
        return NextResponse.json(
            { success: false, error: 'User not found' },
            { status: 404 }
        );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    await client.close();

    if(!passwordMatch)
        return NextResponse.json(
            { success: false, error: 'Incorrect password' },
            { status: 401 }
        );

    return NextResponse.json({
        success: true,
        data: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username,
            hasCompletedSurvey: user.hasCompletedSurvey
        }
    });
}