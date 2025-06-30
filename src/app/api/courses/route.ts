import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) 
    return NextResponse.json(
      { error: 'Missing userId parameter' },
      { status: 400 }
    );
  

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    // Verify user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) 
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    

    const coursesCollection = db.collection('courses');

    // Find all courses for this user
    const courses = await coursesCollection.find({ userId }).toArray();
    
    return NextResponse.json({
      success: true,
      courses: courses.map(course => ({
        ...course,
        id: course._id.toString()
      }))
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { toolId, userId } = body;

  if (!toolId || !userId) 
    return NextResponse.json(
      { error: 'toolId and userId are required' },
      { status: 400 }
    );
  

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    // Verify user exists
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) 
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    

    const coursesCollection = db.collection('courses');

    // Check if course already exists for this user and tool
    const existingCourse = await coursesCollection.findOne({ userId, toolId });
    if (existingCourse) 
      return NextResponse.json({
        success: true,
        course: {
          ...existingCourse,
          id: existingCourse._id.toString()
        }
      });
    

    // Create new course
    const newCourse = {
      userId,
      toolId,
      modulesCompleted: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await coursesCollection.insertOne(newCourse);
    
    const savedCourse = {
      ...newCourse,
      id: result.insertedId.toString()
    };

    return NextResponse.json({
      success: true,
      course: savedCourse,
    });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { toolId, userId, modulesCompleted } = body;

  if (!toolId || !userId || modulesCompleted === undefined) 
    return NextResponse.json(
      { error: 'toolId, userId, and modulesCompleted are required' },
      { status: 400 }
    );
  

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    const db = client.db('devtutor');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) 
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    

    const coursesCollection = db.collection('courses');

    const result = await coursesCollection.updateOne(
      { userId, toolId },
      { 
        $set: { 
          modulesCompleted: Math.max(0, modulesCompleted + 1),
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) 
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    
    const updatedCourse = await coursesCollection.findOne({ userId, toolId });

    return NextResponse.json({
      success: true,
      course: {
        ...updatedCourse,
        id: updatedCourse?._id.toString()
      }
    });
  } catch (error) {
    console.error('Error updating course progress:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}