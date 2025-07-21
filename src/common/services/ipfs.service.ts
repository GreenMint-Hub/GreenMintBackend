// This service uploads files to Supabase Storage (bucket: images) and returns a public URL.
// It is named IPFSService for legacy reasons, but does not use IPFS.
import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://fjbkuvwkccpatbojdbtl.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqYmt1dndrY2NwYXRib2pkYnRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5OTgzMDIsImV4cCI6MjA2ODU3NDMwMn0.EIudFBcQ7ohUQ_Z3-KNiqJTakUGTB3zojF7LmER68lE';
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'images';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

@Injectable()
export class IPFSService {
  async uploadFile(file: Express.Multer.File): Promise<string> {
    // Upload file buffer to Supabase Storage
    const filePath = `${Date.now()}-${file.originalname}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) {
      throw new Error('Failed to upload image to Supabase: ' + error.message);
    }
    // Get public URL
    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);
    if (!data || !data.publicUrl) {
      throw new Error('Failed to get public URL from Supabase');
    }
    return data.publicUrl;
  }
} 