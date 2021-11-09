import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import "./Sniper.css";

import CamLogo from "./assets/CamLogo";
import UploadLogo from "./assets/UploadLogo";
import CamToggleLogo from "./assets/CamToggleLogo";
import VideoLogo from "./assets/VideoLogo";
import DownloadLogo from "./assets/DownloadLogo";
import StopRecord from "./assets/StopRecord";

const Sniper = () => {
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
  // for accessing MediaRecorder
  const mediaRecorderRef = useRef(null);
  // capturing video
  const [recording, setRecording] = useState(false);
  // recorded video
  const [recordedVideo, setRecordedVideo] = useState([]);

  // constraints
  const VideoConstraints = {
    // width: 320,
    width: {
      min: 300,
      ideal: width,
      max: 1920,
    },
    // height: 300,
    height: {
      min: 600,
      ideal: height,
      max: 1080,
    },
    // resizeMode: "crop-and-scale",
    // aspectRatio: 1.77777,
  };

  // console.log(width, height);

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

  // handle size of video being recorded
  const handleDataAvailable = useCallback(
    ({ data }) => {
      if (data.size > 0) {
        setRecordedVideo((prev) => prev.concat(data));
      }
    },
    [setRecordedVideo]
  );

  // start recording
  const handleStartVideoRecording = useCallback(() => {
    setRecording(true);
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: "video/webm",
    });
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );
    mediaRecorderRef.current.start();
  }, [webcamRef, setRecording, mediaRecorderRef, handleDataAvailable]);

  // stop recording
  const handleStopVideoRecording = useCallback(() => {
    mediaRecorderRef.current.stop();
    setRecording(false);
  }, [mediaRecorderRef, setRecording]);

  // handle download
  const handleDownload = useCallback(() => {
    if (recordedVideo.length) {
      const blob = new Blob(recordedVideo, {
        type: "video/webm",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = url;
      a.download = "stream-capture.webm";
      a.click();
      window.URL.revokeObjectURL(url);
      setRecordedVideo([]);
    }
  }, [recordedVideo]);

  return (
    <>
      <div className="webcam-container">
        <div className="webcam-wrapper">
          {image === "" ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality="0.95"
              videoConstraints={{ ...VideoConstraints, facingMode: camMode }}
              className="webcam-stream"
            />
          ) : (
            <img src={image} alt={image} onClick={handleRetake} />
          )}
          {/* snap photo logo button  */}
          {image === "" && !recording ? (
            <img
              src={CamLogo}
              alt="cam"
              width={25}
              className="camera-logo"
              onClick={handleCapture}
            />
          ) : null}
          {/* toggle camera logo button  */}
          {image === "" && !recording ? (
            <img
              src={CamToggleLogo}
              alt="camtoggle"
              width={25}
              className="toggle-logo"
              onClick={handleToggle}
            />
          ) : null}
          {/* upload snapped photot */}
          {image !== "" && !recording ? (
            <img
              src={UploadLogo}
              alt="upload"
              width={25}
              className="upload-logo"
              onClick={handleSubmit}
            />
          ) : null}
          {/* start video recording logo */}
          {image === "" && !recording && (
            <img
              src={VideoLogo}
              alt="start-record"
              width={25}
              className="recording-logo"
              onClick={handleStartVideoRecording}
            />
          )}
          {/* stop video recording logo */}
          {image === "" && recording && (
            <img
              src={StopRecord}
              alt="stop-record"
              width={25}
              className="recording-logo"
              onClick={handleStopVideoRecording}
            />
          )}
          {/* download recorded video */}
          {image === "" && recordedVideo.length > 0 && !recording && (
            <img
              src={DownloadLogo}
              alt="download"
              width={25}
              className="download"
              onClick={handleDownload}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Sniper;
