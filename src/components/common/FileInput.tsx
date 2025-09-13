import React, { useState } from 'react';
import { formatFileSize } from '../../utils/formatters';

interface FileInputProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement> | React.MutableRefObject<HTMLInputElement | null>;
  multiple?: boolean;
  accept?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string; // Optional label for button text
}

interface FilePreview {
  name: string;
  type: string;
  src: string;
  size: number;
  width: number;
  height: number;
  isImage: boolean;
}

const FileInput: React.FC<FileInputProps> = ({
  id,
  onChange,
  inputRef,
  multiple = false,
  accept,
  required = false,
  disabled = false,
  className = '',
  label = 'Upload File',
}) => {

  const [previews, setPreviews] = useState<FilePreview[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e); // Notify parent

    const files = Array.from(e.target.files || []);
    const filePreviews = files.map((file) => {
      const isImage = file.type.startsWith('image/');
      return { file, isImage };
    });

    Promise.all(
      filePreviews.map(({ file, isImage }) => {
        if (isImage) {
          return new Promise<FilePreview>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                resolve({
                  name: file.name,
                  type: file.type,
                  size: file.size,
                  src: reader.result as string,
                  width: img.width,
                  height: img.height,
                  isImage: true,
                });
              };
              img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
          });
        } else {
          return Promise.resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            src: '',
            width: 0,
            height: 0,
            isImage: false,
          });
        }
      })
    ).then(setPreviews);

  };

  const handleRemoveFile = (index: number) => {
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // Optional: also clear inputRef if needed when all files removed
    if (inputRef?.current && previews.length === 1) {
      inputRef.current.value = '';
    }
  };


  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="relative inline-block">
        <label
          htmlFor={id}
          className={`w-full max-w-sm min-w-[200px] inline-flex items-center justify-center px-4 py-2 gap-2 rounded-lg font-medium focus:outline-none transition-colors bg-gray-100 border border-slate-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-700 cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''
            } ${className}`}
        >
          <span>{label}</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16v-8m0 0L8 12m4-4l4 4M20 12a8 8 0 11-16 0 8 8 0 0116 0z"
            />
          </svg>
        </label>
        <input
          type="file"
          id={id}
          ref={inputRef}
          onChange={handleChange}
          multiple={multiple}
          accept={accept}
          required={required}
          disabled={disabled}
          className="hidden"
        />
      </div>
      {/* Files display */}
      {previews.length > 0 && (
        <div className="grid gap-4 grid-cols-1">
          {previews.map((file, idx) => (
            <div key={idx} className="group relative flex gap-2 mb-2 border-b border-gray-200 dark:border-gray-700 p-2 bg-white dark:bg-gray-800 items-start overflow-hidden">
              {file.isImage && file.src && (
                <img
                  src={file.src}
                  alt={file.name}
                  className="size-12 inline-grid shrink-0 align-middle [--avatar-radius:20%] *:col-start-1 *:row-start-1 outline -outline-offset-1 outline-black/10 dark:outline-white/10 rounded-lg"
                />
              )}
              <div className="text-xs flex-grow">
                <div className='flex items-center gap-2'>
                  <p className='truncate w-[calc(100%-10rem)]'><strong>Name:</strong> {file.name}</p>
                  <span className='text-zinc-500 dark:text-zinc-400'>{formatFileSize(file.size)}</span>
                </div>
                <p><strong>Format:</strong> {file.type || 'Unknown'}</p>
                {file.isImage && file.width && file.height && (
                  <p><strong>Dimensions:</strong> {file.width} × {file.height}</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveFile(idx)}
                className="text-red-500 text-xs font-medium hover:underline absolute right-0 top-2 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-in-out"
              >
                Clear
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileInput;