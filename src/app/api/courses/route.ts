import { MongoClient } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function GET(req: NextRequest)
{
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if(!id)
        return NextResponse.json(
            { success: false, error: 'Course ID is required' },
            { status: 400 }
        );

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db('devtutor');
    const userCourseCollection = db.collection('userCourses');

    const course = await userCourseCollection.find({ userId: id }).toArray();
    await client.close();

    return NextResponse.json(
        { success: true, courses: course },
        { status: 200 }
    );
}