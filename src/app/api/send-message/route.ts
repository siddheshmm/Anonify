import UserModel from '@/model/User';
import dbConnect from '@/lib/dbConnect';
import { Message } from '@/model/User';
import { spawn } from 'child_process';
import path from 'path';

export async function POST(request: Request) {
  await dbConnect();
  const { username, content } = await request.json();

  try {
    const user = await UserModel.findOne({ username }).exec();
    if (!user) {
      return Response.json(
        { message: 'User not found', success: false },
        { status: 404 }
      );
    }

    // Check if the user is accepting messages
    if (!user.isAcceptingMessages) {
      return Response.json(
        { message: 'User is not accepting messages', success: false },
        { status: 403 }
      );
    }

    // Step 1: Use the trained model to classify the message
    const pythonScript = path.join(process.cwd(), 'ml', 'predict.py');
    const pythonProcess = spawn('python', [pythonScript, content]);

    const result = await new Promise((resolve, reject) => {
      let output = '';
      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      pythonProcess.stderr.on('data', (data) => {
        console.error('Python error:', data.toString());
        reject(data.toString());
      });
      pythonProcess.on('close', () => {
        resolve(output.trim());
      });
    });

    console.log('Python script output:', result);

    if (result === '1') {
      return Response.json(
        {
          message: 'Your message contains inappropriate content and cannot be sent.',
          success: false,
        },
        { status: 400 }
      );
    }

    // Step 2: Save the message if it passes the filter
    const newMessage = { content, createdAt: new Date() };

    // Push the new message to the user's messages array
    user.messages.push(newMessage as Message);
    await user.save();

    return Response.json(
      { message: 'Message sent successfully', success: true },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}