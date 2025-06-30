import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function POST(request: NextRequest) {
    const { userId, answers } = await request.json();

    if (!userId || !answers) 
        return NextResponse.json(
            { success: false, error: 'User ID and answers are required' },
            { status: 400 }
        );
    

    const client = new MongoClient(MONGODB_URI);
    try {
        await client.connect();
        const db = client.db('devtutor');
        const usersCollection = db.collection('users');

        const result = await usersCollection.updateOne(
            { _id: new ObjectId(userId) },
            { $set: { questionnaireAnswers: answers, hasCompletedSurvey: true } }
        );

        if (result.matchedCount === 0) 
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        

        if (result.modifiedCount === 0) 
            return NextResponse.json(
                { success: false, error: 'Failed to update user with questionnaire answers' },
                { status: 500 }
            );
        

        return NextResponse.json(
            { success: true, message: 'Questionnaire answers saved successfully' },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error saving questionnaire answers:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    } finally {
        await client.close();
    }
}
