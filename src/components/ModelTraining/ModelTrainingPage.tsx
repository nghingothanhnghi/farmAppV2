// src/components/ModelTraining/ModelTrainingPage.tsx
import React, { useState, useRef } from 'react';
import { useAlert } from '../../contexts/alertContext';
import { objectDetectionService } from '../../services/objectDetectionService';
import { IconCheck, IconDownload } from '@tabler/icons-react';
import List from '../common/List';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import Form, { FormGroup, FormLabel, FormInput, FormSelect, FormActions } from '../common/Form';
import FileInput from '../common/FileInput';
import NumberInput from '../common/NumberInput';
import Announcement from '../Announcement/Announcement';
import LinearProgress from '../common/LinearProgress';
import './ModelTrainingPage.css';

const trainingTips = [
  {
    id: 1,
    content: <>Use at least <b>50 - 100 images</b> per class for basic training</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
  {
    id: 3,
    content: <>Include images with varied backgrounds, lighting, and object orientations</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
  {
    id: 4,
    content: <>Ensure image-label file names match exactly (e.g., <code>cat.jpg</code> → <code>cat.txt</code>).</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
  {
    id: 5,
    content: <>Labels must be in YOLO format with normalized values.</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
  {
    id: 6,
    content: <>Start with <b>20–50 epochs</b> and increase based on validation loss</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
  {
    id: 7,
    content: <>Larger image sizes (e.g., 1024) improve detection of small objects but require more processing power</>,
    icon: <IconCheck className="text-green-500" size={16} />,
  },
];

interface TrainingStatus {
  isTraining: boolean;
  progress: number;
  message: string;
}

const ModelTrainingPage: React.FC = () => {
  const { setAlert } = useAlert();
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [modelName, setModelName] = useState<string>('');
  const [epochs, setEpochs] = useState<number>(10);
  const [imageSize, setImageSize] = useState<number>(640);
  const [trainImages, setTrainImages] = useState<FileList | null>(null);
  const [valImages, setValImages] = useState<FileList | null>(null);
  const [trainLabels, setTrainLabels] = useState<FileList | null>(null);
  const [valLabels, setValLabels] = useState<FileList | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus>({
    isTraining: false,
    progress: 0,
    message: '',
  });
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const trainImagesRef = useRef<HTMLInputElement>(null);
  const valImagesRef = useRef<HTMLInputElement>(null);
  const trainLabelsRef = useRef<HTMLInputElement>(null);
  const valLabelsRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelName) {
      setAlert({ message: 'Please enter a model name', type: 'error' });
      return;
    }

    if (!trainImages || trainImages.length === 0 || !trainLabels || trainLabels.length === 0) {
      setAlert({ message: 'Please upload training images and labels', type: 'error' });
      return;
    }

    try {
      setTrainingStatus({
        isTraining: true,
        progress: 10,
        message: 'Uploading files...',
      });

      const formData = new FormData();
      formData.append('model_name', modelName);
      formData.append('epochs', epochs.toString());
      formData.append('imgsz', imageSize.toString());

      // Add training images
      for (let i = 0; i < trainImages.length; i++) {
        formData.append('train_images', trainImages[i]);
      }

      // Add training labels
      for (let i = 0; i < trainLabels.length; i++) {
        formData.append('train_labels', trainLabels[i]);
      }

      // Only add validation data if both images and labels are provided
      const hasValidationData = valImages && valLabels &&
        valImages.length > 0 && valLabels.length > 0;

      if (hasValidationData) {
        setTrainingStatus({
          isTraining: true,
          progress: 20,
          message: 'Processing validation data...',
        });

        // Add validation images
        for (let i = 0; i < valImages.length; i++) {
          formData.append('val_images', valImages[i]);
        }

        // Add validation labels
        for (let i = 0; i < valLabels.length; i++) {
          formData.append('val_labels', valLabels[i]);
        }
      } else {
        // Log that we're skipping validation data
        console.log('No validation data provided, training with training data only');
      }

      setTrainingStatus({
        isTraining: true,
        progress: 30,
        message: 'Files uploaded. Starting training...',
      });

      // Convert FileList objects to arrays for the API
      const trainImagesArray = trainImages ? Array.from(trainImages) : [];
      const trainLabelsArray = trainLabels ? Array.from(trainLabels) : [];
      const valImagesArray = valImages ? Array.from(valImages) : [];
      const valLabelsArray = valLabels ? Array.from(valLabels) : [];

      // Use the objectDetectionService for training
      const response = await objectDetectionService.trainModel(
        modelName,
        epochs,
        imageSize,
        trainImagesArray,
        trainLabelsArray,
        valImagesArray.length > 0 ? valImagesArray : undefined,
        valLabelsArray.length > 0 ? valLabelsArray : undefined
      );

      // Training completed successfully
      setTrainingStatus({
        isTraining: false,
        progress: 100,
        message: `Model "${modelName}" trained successfully!`,
      });
      setAlert({
        message: response.message || `Model "${modelName}" trained successfully!`,
        type: 'success'
      });

      // Reset form
      if (trainImagesRef.current) trainImagesRef.current.value = '';
      if (valImagesRef.current) valImagesRef.current.value = '';
      if (trainLabelsRef.current) trainLabelsRef.current.value = '';
      if (valLabelsRef.current) valLabelsRef.current.value = '';
      setTrainImages(null);
      setValImages(null);
      setTrainLabels(null);
      setValLabels(null);
    } catch (error) {
      console.error('Training error:', error);
      setTrainingStatus({
        isTraining: false,
        progress: 0,
        message: '',
      });
      setAlert({ message: `Training failed: ${error instanceof Error ? error.message : 'Unknown error'}`, type: 'error' });
    }
  };

  const clearForm = () => {
    setModelName('');
    setEpochs(10);
    setImageSize(640);
    if (trainImagesRef.current) trainImagesRef.current.value = '';
    if (valImagesRef.current) valImagesRef.current.value = '';
    if (trainLabelsRef.current) trainLabelsRef.current.value = '';
    if (valLabelsRef.current) valLabelsRef.current.value = '';
    setTrainImages(null);
    setValImages(null);
    setTrainLabels(null);
    setValLabels(null);
    setTrainingStatus({
      isTraining: false,
      progress: 0,
      message: '',
    });
  };

  const handleDownloadLabels = async () => {
    try {
      setIsDownloading(true);
      setAlert({ message: 'Preparing training labels for download...', type: 'info' });

      // Use the current model name or 'default' if not set
      const currentModel = modelName || 'default';

      // Call the API to get the training labels
      const blob = await objectDetectionService.downloadTrainingLabels(currentModel);

      // Create a URL for the blob
      const url = URL.createObjectURL(blob);

      // Create a temporary anchor element for downloading
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentModel}_training_labels.zip`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setAlert({ message: `Training labels for model "${currentModel}" downloaded successfully`, type: 'success' });
    } catch (error) {
      console.error('Error downloading training labels:', error);
      setAlert({
        message: `Failed to download training labels: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error'
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="model-training-page">
      <PageTitle
        title="Train YOLOv8 Model"
        actions={
          <Button
            type="button"
            label={
              isDownloading
                ? 'Downloading...'
                : `Download Labels for "${modelName || 'Guideline'}"`
            }
            onClick={handleDownloadLabels}
            variant="secondary"
            className="download-button"
            disabled={isDownloading}
            icon={<IconDownload size={16} className="text-gray-500" />}
            iconPosition='left'
            rounded='lg'
          />
        }
      />
      {showAnnouncement && (
        <Announcement
          type="info"
          title="About YOLOv8 Training"
          message={
            <div className="training-info flex flex-col gap-4 text-gray-900 dark:text-gray-200 lg:pr-64">
              <p>
                YOLOv8 (You Only Look Once) is a state-of-the-art object detection model.
                Training a custom model allows you to detect specific objects in images.
              </p>
              <h3 className="font-medium text-purple-700">💡 Training Tips</h3>
              <List items={trainingTips} showIcons listStyle="none" className="text-gray-800 dark:text-gray-300" />
            </div>
          }
          dismissible
          onDismiss={() => setShowAnnouncement(false)}
          className='mb-8'
        />
      )}
      <Form onSubmit={handleSubmit} className="training-form mx-auto max-w-4xl">
        <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
          <div className='space-y-1'>
            <FormLabel htmlFor="modelName">Model Name</FormLabel>
            <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Used to name and save your trained model.</p>
          </div>
          <div>
            <FormInput
              type="text"
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="my_custom_model"
              required
            />
            <div className='mt-5'>
              <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
              <List
                items={
                  [
                    {
                      id: 1,
                      content: <>Must be <b>unique</b> and <b>descriptive</b>.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                    {
                      id: 2,
                      content: <>Use only <b>letters</b>, <b>numbers</b>, <b>underscores</b>.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                    {
                      id: 3,
                      content: <>Example: my_custom_detector, yolo_helmet_model.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                  ]
                }
                showIcons
                listStyle="none"
                className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
              />
            </div>
          </div>
        </FormGroup>
        <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
        <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
          <div className='space-y-1'>
            <FormLabel htmlFor="epochs">Training Epochs:</FormLabel>
            <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">The number of full passes through the training dataset.</p>
          </div>
          <div>
            <NumberInput
              id="epochs"
              value={epochs}
              onChange={setEpochs}
              min={1}
              max={100}
            />

            <div className='mt-5'>
              <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
              <List
                items={
                  [
                    {
                      id: 1,
                      content: <>More epochs = more learning, but <b>risk of overfitting</b>.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                    {
                      id: 2,
                      content: <>Typical range: 10–100.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                    {
                      id: 3,
                      content: <>Start with 20–50 and increase if model underperforms.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                  ]
                }
                showIcons
                listStyle="none"
                className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
              />
            </div>
          </div>
        </FormGroup>
        <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
        <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
          <div className='space-y-1'>
            <FormLabel htmlFor="imageSize">Image Size:</FormLabel>
            <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
              The size to which input images are resized before training.
            </p>
          </div>
          <div>
            <FormSelect
              id="imageSize"
              value={imageSize}
              onChange={(e) => setImageSize(parseInt(e.target.value))}
            >
              <option value="320">320 (Faster)</option>
              <option value="416">416</option>
              <option value="512">512</option>
              <option value="640">640 (Balanced)</option>
              <option value="1024">1024 (More Accurate)</option>
            </FormSelect>
            <small>Recommended: 640px (balanced speed vs accuracy).</small>
            <div className='mt-5'>
              <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
              <List
                items={
                  [
                    {
                      id: 1,
                      content: <>Choose based on your <b>hardware capacity</b> and <b>object size</b>.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                    {
                      id: 2,
                      content: <>Must match the model’s input requirement at inference time.</>,
                      icon: <IconCheck className="text-green-500" size={16} />,
                    },
                  ]
                }
                showIcons
                listStyle="none"
                className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
              />
            </div>
          </div>
        </FormGroup>
        <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
        <div className="file-upload-section">
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="trainImages">Training Images:</FormLabel>
              <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                The images on which the model will be trained.
              </p>
            </div>
            <div>
              <FileInput
                id="trainImages"
                inputRef={trainImagesRef}
                onChange={(e) => setTrainImages(e.target.files)}
                multiple={true}
                accept="image/*"
                required
              />
              <small>Select multiple image files (JPG, PNG)</small>
              <div className='mt-5'>
                <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
                <List
                  items={
                    [
                      {
                        id: 1,
                        content: <>Should be <b>representative</b> of real-world conditions.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 2,
                        content: <> More variety = better generalization.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 3,
                        content: <>At least <b>50 images per class</b>, ideally 100–1000+.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                    ]
                  }
                  showIcons
                  listStyle="none"
                  className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
                />
              </div>
            </div>
          </FormGroup>
          <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="trainLabels">Training Labels:</FormLabel>
              <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                <code className='bg-gray-100 dark:bg-gray-800 font-mono px-1 py-0.5 rounded'>.txt</code> files corresponding to each image, with bounding boxes and class ids.
              </p>
            </div>
            <div>
              <FileInput
                id="trainLabels"
                inputRef={trainLabelsRef}
                onChange={(e) => setTrainLabels(e.target.files)}
                multiple
                accept=".txt"
                required
              />
              <small>Select multiple label files (<code className='bg-gray-100 font-mono px-1 py-0.5 rounded'>.txt</code> in YOLO format – one object per line). <code className="bg-gray-100 dark:bg-gray-800  text-red-600 font-mono px-1 py-0.5 rounded">class_id x_center y_center width height</code>.</small>
              <small>Example: <code className='bg-gray-100 dark:bg-gray-800 font-mono px-1 py-0.5 rounded'>0 0.5 0.5 0.2 0.3</code></small>
              <div className='mt-5'>
                <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
                <List
                  items={
                    [
                      {
                        id: 1,
                        content: <>Must match the training images <b>one-to-one</b> (same filename, <code className="bg-gray-100 dark:bg-gray-800 font-mono px-1 py-0.5 rounded">.txt</code>).</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 2,
                        content: <>Ensure the values are <b>normalized (0–1)</b>.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                    ]
                  }
                  showIcons
                  listStyle="none"
                  className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
                />
              </div>
            </div>
          </FormGroup>
          <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="valImages">Validation Images (Optional):</FormLabel>
              <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                Used to evaluate model performance during training.
              </p>
            </div>
            <div>
              <FileInput
                id="valImages"
                inputRef={valImagesRef}
                onChange={(e) => setValImages(e.target.files)}
                multiple
                accept="image/*"
              />
              <small>If provided, must also upload matching validation labels</small>
              <div className='mt-5'>
                <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
                <List
                  items={
                    [
                      {
                        id: 1,
                        content: <>Optional, but highly recommended.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 2,
                        content: <>Should be <b>different</b> from training images.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 3,
                        content: <>Must match validation labels one-to-one.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                    ]
                  }
                  showIcons
                  listStyle="none"
                  className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
                />
              </div>
            </div>
          </FormGroup>
          <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
          <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
            <div className='space-y-1'>
              <FormLabel htmlFor="valLabels">Validation Labels (Optional):</FormLabel>
              <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">
                <code className='bg-gray-100 dark:bg-gray-800 font-mono px-1 py-0.5 rounded'>.txt</code> files matching validation images in YOLO format.
              </p>
            </div>
            <div>
              <FileInput
                id="valLabels"
                inputRef={valLabelsRef}
                onChange={(e) => setValLabels(e.target.files)}
                multiple
                accept=".txt"
              />
              <small>If provided, must match validation images</small>
              <div className='mt-5'>
                <h6 className='text-base/6 font-medium text-zinc-500 sm:text-sm/6 dark:text-zinc-400'>Tips:</h6>
                <List
                  items={
                    [
                      {
                        id: 1,
                        content: <>Required <b>only if</b> validation images are uploaded.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 2,
                        content: <>Same YOLO format.</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                      {
                        id: 3,
                        content: <>Same file naming as validation images (image.jpg → image.txt).</>,
                        icon: <IconCheck className="text-green-500" size={16} />,
                      },
                    ]
                  }
                  showIcons
                  listStyle="none"
                  className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"
                />
              </div>
            </div>
          </FormGroup>
        </div>

        {trainingStatus.isTraining && (
          <div className="training-progress">
            <LinearProgress
              position="relative" // or any other position you prefer
              thickness="h-1" // or any other thickness you prefer
              duration={5000} // or any other duration you prefer
              message={trainingStatus.message}
            />

          </div>
        )}
        <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
        <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4'>
          <Button
            type="submit"
            label={trainingStatus.isTraining ? 'Training...' : 'Train Model'}
            onClick={() => { }} // Form submit will handle this
            disabled={trainingStatus.isTraining}
            variant="primary"
            className="train-button md:w-auto"
            fullWidth={true}
            rounded='lg'
          />
          <Button
            type="button"
            label="Clear Form"
            onClick={clearForm}
            disabled={trainingStatus.isTraining}
            variant="secondary"
            className="clear-button md:w-auto"
            fullWidth={true}
            rounded='lg'
          />
        </FormActions>
      </Form>
    </div>
  );
};

export default ModelTrainingPage;