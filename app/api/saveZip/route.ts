// app/api/saveZip/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for generating unique IDs

export async function POST(req: Request) {
  try {
    const { zipBlob } = await req.json();

    if (!zipBlob) {
      return NextResponse.json({ message: 'No ZIP file provided' }, { status: 400 });
    }

    // Decode the base64 string
    const buffer = Buffer.from(zipBlob.split(',')[1], 'base64');
    const uniqueFileName = `generated_${Date.now()}_${uuidv4()}.zip`; // Generate a unique filename
    const zipFilePath = path.join(process.cwd(), 'public', uniqueFileName);

    // Save the ZIP file to the public folder
    await fs.promises.writeFile(zipFilePath, buffer);

    // Set a timeout to delete the file after 10 minutes
    setTimeout(() => {
      fs.promises.unlink(zipFilePath).catch((err) => console.error('Error deleting ZIP file:', err));
    }, 10 * 60 * 1000); // 10 minutes

    return NextResponse.json({ message: 'ZIP file saved successfully', fileName: uniqueFileName }, { status: 200 });
  } catch (error) {
    console.error('Error in POST /api/saveZip:', error);
    return NextResponse.json({ message: 'Error saving ZIP file' }, { status: 500 });
  }
}
