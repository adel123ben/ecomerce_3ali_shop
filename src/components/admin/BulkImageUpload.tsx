import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Move } from 'lucide-react';
import { uploadProductImage, validateImageFile } from '../../lib/storage';
import toast from 'react-hot-toast';

interface ImageItem {
  id: string;
  file: File;
  preview: string;
  uploaded?: boolean;
  url?: string;
}

interface BulkImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
}

export const BulkImageUpload: React.FC<BulkImageUploadProps> = ({
  onImagesUploaded,
  maxImages = 10,
}) => {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    addFiles(files);
  };

  const addFiles = (files: File[]) => {
    const validFiles: ImageItem[] = [];

    files.forEach((file) => {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`);
        return;
      }

      if (images.length + validFiles.length >= maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      const id = Math.random().toString(36).substring(2);
      const preview = URL.createObjectURL(file);
      validFiles.push({ id, file, preview });
    });

    setImages((prev) => [...prev, ...validFiles]);
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image?.preview) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const uploadAllImages = async () => {
    if (images.length === 0) {
      toast.error('Please select images to upload');
      return;
    }

    setUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (const image of images) {
        if (!image.uploaded) {
          const url = await uploadProductImage(image.file);
          uploadedUrls.push(url);
          
          setImages((prev) =>
            prev.map((img) =>
              img.id === image.id ? { ...img, uploaded: true, url } : img
            )
          );
        } else if (image.url) {
          uploadedUrls.push(image.url);
        }
      }

      onImagesUploaded(uploadedUrls);
      toast.success(`${uploadedUrls.length} images uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    setImages(newImages);
    setDraggedIndex(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Product Images</h3>
        <div className="text-sm text-gray-500">
          {images.length} / {maxImages} images
        </div>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleFileDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-900 mb-2">
          Drop images here or click to upload
        </p>
        <p className="text-sm text-gray-500">
          PNG, JPG, WebP up to 5MB each (max {maxImages} images)
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                className={`relative group border-2 rounded-lg overflow-hidden cursor-move transition-all ${
                  image.uploaded
                    ? 'border-green-300 bg-green-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="aspect-square">
                  <img
                    src={image.preview}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(image.id);
                      }}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <div className="bg-white bg-opacity-80 p-2 rounded-full">
                      <Move className="h-4 w-4 text-gray-600" />
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                {image.uploaded && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}

                {/* Index */}
                <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Drag images to reorder them. First image will be the main product image.
            </p>
            <button
              onClick={uploadAllImages}
              disabled={uploading || images.every((img) => img.uploaded)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  <span>Upload All</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};