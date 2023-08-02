import { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";

const ObjectDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [objectDetector, setObjectDetector] = useState(null);
  const [detectedObjects, setDetectedObjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [snapshot, setSnapshot] = useState(null);

  const loadObjectDetector = async () => {
    try {
      const model = await cocossd.load();
      setObjectDetector(model);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading model", error);
    }
  };

  useEffect(() => {
    loadObjectDetector();
  }, []);


  const handleSnapshot = async () => {
    setDetectedObjects([]); // Clear previous detections
    if (videoRef.current && canvasRef.current) {

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const tempCanvus = document.createElement("canvas");
      const video = videoRef.current;
      tempCanvus.width = canvas.width;
      tempCanvus.height = canvas.height;
      tempCanvus.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(tempCanvus, 0, 0, canvas.width, canvas.height);
      const image = tf.browser.fromPixels(tempCanvus);
      if (!objectDetector) return;
      const predictions = await objectDetector.detect(image);

      // Draw the class name and probability for each detected object
      predictions.forEach((obj) => {
        ctx.beginPath();
        ctx.lineWidth = "2";
        ctx.strokeStyle = "green";
        ctx.fillStyle = "green";
        ctx.font = "10px Arial";
        ctx.fillText(`${obj.class} (${Math.round(obj.score * 100)}%)`, obj.bbox[0], obj.bbox[1] - 5);
        const x = obj.bbox[0];
        const y = obj.bbox[1];
        const width = obj.bbox[2];
        const height = obj.bbox[3];
        console.log('x', x, 'y', y, 'width', width, 'height', height);
        ctx.rect(x, y, width, height);
        ctx.stroke();
      });

      tf.dispose(image); // Dispose the intermediate tensor to free up memory
    }
  };


  let mediaStream = null;

  const startCamera = async (facingMode) => {
    try {
      const constraints = { video: { facingMode: facingMode } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      videoRef.current.srcObject = stream;
      mediaStream = stream;
    } catch (error) {
      console.error('Error accessing webcam:', error);
    }
  };

  const tryCameraAccess = async () => {
    try {
      await startCamera('environment'); // Try the back camera (environment facing mode)
    } catch (error) {
      // If the back camera fails, try the front camera (user facing mode)
      await startCamera('user');
    }
  };

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      tryCameraAccess();
    }

    // Clean up the media stream when the component unmounts
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);
  return (
    <div className="camera-container">
      <div className="video-container">
        <video ref={videoRef} autoPlay playsInline muted />
      </div>
      <div className="preview-container">
        {isLoading && <p>Please wait while the model is loading...</p>}
        <canvas ref={canvasRef} />
      </div>

      <button className="snapshot-btn" onClick={handleSnapshot}>
        <div className="snapshot-btn__inner" />
      </button>
      <style jsx>{`
        .camera-container {
          display: flex;
          width: 100%;
          height: 100vh;
        }

        .video-container,
        .preview-container {
          width: 50%;
          height: 100%;
          overflow: hidden;
          background-color: black;
          color: white;
        }

        .video-container {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        video {
          width: 100%;
        }

        .preview-container {
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }

        canvas {
          width: 100%;
          height: 100%;
          border: 2px solid green;
        }

        .snapshot-btn {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          border-radius: 50%;
          width: 80px;
          height: 80px;
          background-color: white;
          color: white;
          font-size: 24px;
          border: none;
          cursor: pointer;
          border: 2px solid red;
        }

        .snapshot-btn__inner {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background-color: yellow;
          border: 5px solid red;
        }

        @media (max-width: 600px) {
          .camera-container {
            flex-direction: column;
          }

          .video-container,
          .preview-container {
            width: 100%;
            height: 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default ObjectDetection;

