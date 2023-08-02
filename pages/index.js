import { useState, useRef, useEffect } from 'react';

const Camera = () => {
    const videoRef = useRef(null);
    const [snapshot, setSnapshot] = useState('');
    const [prediction, setPrediction] = useState('');
    const [probability, setProbability] = useState('');
    let mediaStream = null;

    useEffect(() => {
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

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            tryCameraAccess();
        }

        // Clean up the media stream when the component unmounts
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleSnapshot = async () => {
        setPrediction('');
        setProbability('');
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            const video = videoRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/png'); // Convert snapshot to data URI
            setSnapshot(dataUri);

            // Send dataUri to API endpoint as a POST request
            try {
                const response = await fetch('https://trash-detection-api-1.onrender.com/predict', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ image_link: dataUri }),
                });
                const data = await response.json();
                // data = {"prediction":{"name":"cardboard","probability":0.7180725932121277},"overall_probabilities":[{"class":"cardboard","probability":0.7180725932121277},{"class":"metal","probability":0.2032327651977539},{"class":"trash","probability":0.04265006259083748},{"class":"plastic","probability":0.020296193659305573},{"class":"glass","probability":0.012044194154441357},{"class":"paper","probability":0.0037041513714939356}]}
                // Handle response here if needed
                setPrediction(data.prediction.name);
                setProbability(data.prediction.probability);
            } catch (error) {
                console.error('Error sending the snapshot:', error);
            }
        }
    };

    return (
        <div className="camera-container">
            <div className="video-container">
                <video ref={videoRef} autoPlay playsInline muted />
            </div>
            <div className="preview-container">
                {prediction && <p>Prediction: {prediction}</p>}
                {probability && <p>Probability: {probability}</p>}
                {snapshot && <img src={snapshot} alt="Snapshot" />}
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
          justify-content: center;
          align-items: center;
          flex-direction: column;
        }

        img {
          max-width: 100%;
          max-height: 100%;
        }
        
        .preview-container img {
          width: 70%;
          height: 90%;
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
            img {
            	height: 80%;
            }
            
        }
            

        
      `}</style>
        </div>
    );
};

export default Camera;
