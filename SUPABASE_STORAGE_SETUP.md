# 🖼️ Supabase Storage Setup Guide

## Overview
Supabase Storage provides secure, scalable file storage with automatic CDN delivery. Perfect for product images!

## Setup Steps

### 1. Enable Storage in Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Name it `product-images`
5. Set it as **Public** (for CDN access)

### 2. Configure Row Level Security (RLS)
```sql
-- Allow public read access to product images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload (for admin)
CREATE POLICY "Authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.role() = 'authenticated'
);
```

### 3. Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### 5. Create Storage Helper
Create `lib/storage.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export const uploadImage = async (file: File, path: string) => {
  const { data, error } = await supabase.storage
    .from('product-images')
    .upload(path, file)
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('product-images')
    .getPublicUrl(path)
  
  return publicUrl
}
```

## Benefits
- ✅ **Automatic CDN** - Images served globally
- ✅ **Security** - Row Level Security controls access
- ✅ **Scalability** - Handles any amount of images
- ✅ **Cost-effective** - Pay only for what you use
- ✅ **Easy integration** - Simple upload/download APIs

## Usage Example
```typescript
// Upload image
const imageUrl = await uploadImage(file, `products/${productId}/${filename}`)

// Store URL in database
await supabase.from('products').insert({
  name: 'Product Name',
  images: [imageUrl],
  // ... other fields
})
```

## Next Steps
1. Set up the storage bucket
2. Configure RLS policies
3. Implement the upload function in the admin panel
4. Update product display to use Supabase URLs

This will give you a robust, scalable image storage solution! 🚀 