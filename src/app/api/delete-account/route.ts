import { MongoClient, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

const MONGODB_URI = process.env.MONGODB_URI || '';

export async function DELETE(request: NextRequest) {
  const body = await request.json();
  const { userId } = body;

  if (!userId) {
    return NextResponse.json(
      { error: 'userId is required' },
      { status: 400 }
    );
  }

  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    
    const db = client.db('devtutor');
    const usersCollection = db.collection('users');
    const coursesCollection = db.collection('courses');
    const toolsCollection = db.collection('tools');

    // Verify user exists before deletion
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Start a transaction to ensure all deletions succeed or none do
    const session = client.startSession();
    
    try {
      await session.withTransaction(async () => {
        // Delete user's courses
        await coursesCollection.deleteMany({ userId }, { session });
        
        // Delete user's tools (if they created any)
        await toolsCollection.deleteMany({ createdBy: userId }, { session });
        
        // Delete user's questionnaire answers and user object
        await usersCollection.deleteOne({ _id: new ObjectId(userId) }, { session });
      });

      return NextResponse.json({
        success: true,
        message: 'Account and all associated data deleted successfully'
      });
    } catch (transactionError) {
      console.error('Error during transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to delete account. Transaction rolled back.' },
        { status: 500 }
      );
    } finally {
      await session.endSession();
    }
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await client.close();
  }
}
