import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";

export const ImageCapture = () => {
  // accessing global window and destructuring width and height
  const getWindowDimensions = () => {
    const { innerWidth: width, innerHeight: height } = window;

    return {
      width,
      height,
    };
  };

  // changing width and height based on size of window
  const useWindowDimensions = () => {
    const [windowDimensions, setWindowDimensions] = useState(
      getWindowDimensions()
    );

    useEffect(() => {
      const handleResize = () => setWindowDimensions(getWindowDimensions());

      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }, []);

    return windowDimensions;
  };

  // contains image file
  const [image, setImage] = useState("");
  // camera of device
  // cammode = 'user' implies user facing camera
  // cammode = 'environment' implies back camera
  const [camMode, setCamMode] = useState("user");
  // destructuring width and height
  const { width, height } = useWindowDimensions();
  // for accessing Webcam component
  const webcamRef = useRef(null);

  // for accessing video
  const mediaRecorderRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // constraints
  const videoConstraints = {
    // width: 320,
    width: width * 0.95,
    // height: 300,
    height: height * 0.9,
    // facingMode: 'user',
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
    // console.log(imageSrc)
  }, [webcamRef]);

  // capture retake of image
  const handleRetake = () => {
    setImage("");
  };

  // submit image
  const handleSubmit = () => {
    console.log(image);
    // image base64 sent to backend for processing
  };

  // capture  image in base64 format
  const handleCapture = () => {
    capture();
  };

  // toggle camera from front to back and vice-versa
  const handleToggle = () => {
    if (camMode !== "user") setCamMode("user");
    else setCamMode("environment");
  };

  // video recording
  // size of video
  const handleDataAvailable = React.useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  // start recording
  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  // stop recording
  const handleStopCaptureClick = React.useCallback(() => {
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  // download recording
  const handleDownload = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "react-webcam-stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  return (
    <div className="webcam-container">
      <div className="webcam-img">
        {image === "" ? (
          <Webcam
            audio={false}
            width={width * 0.95}
            height={height * 0.9}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ ...videoConstraints, facingMode: camMode }}
          />
        ) : (
          <img src={image} alt={image} />
        )}
      </div>
      <div className="btn-container">
        {image !== "" || capturing ? (
          <div>
            <button onClick={handleRetake}>Retake Photo</button>
            <button onClick={handleSubmit}>Submit Photo</button>
            <button onClick={handleStopCaptureClick}>Stop Record</button>
          </div>
        ) : (
          <div>
            <button onClick={handleCapture}>Capture Photo</button>
            <button onClick={handleToggle}>Toggle Camera</button>
            <button onClick={handleStartCaptureClick}>Start Record</button>
            {recordedChunks.length > 0 && (
              <button onClick={handleDownload}>download</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCapture;
