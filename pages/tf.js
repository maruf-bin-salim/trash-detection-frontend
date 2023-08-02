import { useRef, useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocossd from "@tensorflow-models/coco-ssd";
import styles from "../styles/Home.module.css";

export default function ObjectDetection() {
    const videoEle = useRef(null);
    const canvasEle = useRef(null);
    const [objectDetector, setObjectDetectors] = useState(null);
    const [detectedObjects, setDetectedObjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [shouldIntervalStart, setShouldIntervalStart] = useState(false);

    const draw = (ctx, objects) => {
        // Clear the canvas
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // // Draw the video frame
        ctx.drawImage(videoEle.current, 0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let i = 0; i < objects.length; i++) {
            const bbox = objects[i].bbox;

            // Draw the bounding box
            ctx.beginPath();
            // ctx.rect(bbox[0], bbox[1], bbox[2], bbox[3]);
            // should be half the size of the bbox
            ctx.rect(bbox[0] + bbox[2] / 2, bbox[1] + bbox[3] / 2, bbox[2] / 2, bbox[3] / 2);
            ctx.strokeStyle = "green";
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.closePath();

            // Draw the label background
            ctx.fillStyle = "red";
            const textWidth = ctx.measureText(objects[i].class).width;
            ctx.fillRect(bbox[0], bbox[1] - 20, textWidth + 8, 20);

            // Write the label text
            ctx.font = "16px Arial";
            ctx.fillStyle = "black";
            let text = objects[i].class + " - " + Math.round(objects[i].score * 100) + "%";
            ctx.fillText(text, bbox[0] + 4, bbox[1] - 4);
        }
    };

    const startDetecting = async (
        frameSkipCount = 1, // Default value is 1, meaning no frame skipping
        frameCountThreshold = 100 // Default threshold to reset frameCount
    ) => {
        if (!objectDetector) return;

        let frameCount = 0;

        const detectFrame = async () => {
            if (frameCount % frameSkipCount === 0) {
                const image = tf.browser.fromPixels(videoEle.current);
                const predictions = await objectDetector.detect(image);

                setDetectedObjects(predictions);
                if (canvasEle.current) {
                    draw(canvasEle.current.getContext("2d"), predictions);
                }

                tf.dispose(image); // Dispose the intermediate tensor to free up memory
            }

            frameCount++;
            if (frameCount >= frameCountThreshold) {
                frameCount = 0; // Reset frameCount when it reaches the threshold
            }
            requestAnimationFrame(detectFrame); // Continue to the next frame
        };

        // Start the detection loop by calling the initial frame detection
        requestAnimationFrame(detectFrame);
    };

    const loadOCRModel = async () => {
        try {
            const model = await cocossd.load();
            setObjectDetectors(model);
            setIsLoading(false);
        } catch (error) {
            console.error("Error loading model", error);
        }
    };

    useEffect(() => {
        loadOCRModel();
    }, []);


    const handleVideoStream = (stream) => {
        videoEle.current.srcObject = stream;
        videoEle.current.onloadedmetadata = () => {
            videoEle.current.play();
            startDetecting();
        };
    };

    const handleVideoError = (error) => {
        console.error("Error accessing video stream: ", error);
    };

    useEffect(() => {
        if (detectedObjects && detectedObjects.length > 0 && !shouldIntervalStart) {
            setShouldIntervalStart(true);
        }
    }, [detectedObjects]);

    // if seeing an object in the screen for the first time, send a notification and wait for 5 seconds, then see if there is still an object in the screen, if there is, send another notification and so on

    const sendInstructions = (object) => {
        if (object) {
            console.log("An object is detected", object);
        }
        else {
            console.log("no object detected");
        }
    }



    useEffect(() => {
        if (setShouldIntervalStart) {
            console.log("detectedObjects", detectedObjects);
            const interval = setInterval(() => {
                if (detectedObjects && detectedObjects.length > 0) { sendInstructions(detectedObjects[0].class); }
                // else sendInstructions(null);

            }, 5000);
        }
    }, [shouldIntervalStart]);

    useEffect(() => {
        navigator.mediaDevices
            .getUserMedia({ video: true })
            .then(handleVideoStream)
            .catch(handleVideoError);
    }, [videoEle.current]);

    return (
        <>
            <div>
                {isLoading && (
                    <div>
                        <p>Please wait while the model is loading...</p>
                    </div>
                )}
            </div>
            <div className={styles.container} >
                <video
                    ref={videoEle}
                    width={300}
                    height={300}
                />
                <canvas
                    ref={canvasEle}
                    className={styles.canvas}
                    width={300}
                    height={300}
                />
            </div>
        </>
    );
}
