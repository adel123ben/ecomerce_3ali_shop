import React, { useState, useRef, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { uploadProductImage, validateImageFile } from '../../lib/storage';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  currentImages?: string[];
  onImagesChange: (imageUrls: string[]) => void;
  disabled?: boolean;
  maxImages?: number;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImages = [],
  onImagesChange,
  disabled = false,
  maxImages = 5,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previews, setPreviews] = useState<string[]>(currentImages);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync previews with currentImages prop
  useEffect(() => {
    setPreviews(currentImages);
  }, [currentImages]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Check if adding these files would exceed maxImages
    if (previews.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    // Validate all files
    for (const file of files) {
      const validationError = validateImageFile(file);
      if (validationError) {
        toast.error(validationError);
        return;
      }
    }

    setUploading(true);

    try {
      const newImageUrls: string[] = [];
      const newPreviews: string[] = [];

      // Create previews for all files
      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        newPreviews.push(previewUrl);
      }

      // Upload all files
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const imageUrl = await uploadProductImage(file);
        newImageUrls.push(imageUrl);
        
        // Clean up preview URL
        URL.revokeObjectURL(newPreviews[i]);
      }

      // Update state
      const updatedImages = [...previews, ...newImageUrls];
      setPreviews(updatedImages);
      onImagesChange(updatedImages);
      
      toast.success(`${files.length} image(s) uploaded successfully`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = previews.filter((_, i) => i !== index);
    setPreviews(updatedImages);
    onImagesChange(updatedImages);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const remainingSlots = maxImages - previews.length;

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Product Images ({previews.length}/{maxImages})
      </label>
      
      <div className="space-y-4">
        {/* Upload Area */}
        {remainingSlots > 0 && (
          <div
            onClick={handleClick}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : uploading
                ? 'border-blue-300 bg-blue-50'
                : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
            }`}
            style={{ minHeight: '150px' }}
          >
            {uploading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-sm text-blue-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">Click to upload images</p>
                <p className="text-xs text-gray-400 mt-1">
                  PNG, JPG, WebP up to 5MB each • {remainingSlots} slot(s) remaining
                </p>
              </div>
            )}
          </div>
        )}

        {/* Image Grid */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {previews.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      <div className="text-xs text-gray-500">
        <p>• Supported formats: JPEG, PNG, WebP</p>
        <p>• Maximum file size: 5MB per image</p>
        <p>• Maximum images: {maxImages}</p>
        <p>• Recommended dimensions: 800x800px or higher</p>
      </div>
    </div>
  );
};