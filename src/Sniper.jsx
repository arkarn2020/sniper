import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

import "./Sniper.css";

import CamLogo from "./assets/CamLogo";
import UploadLogo from "./assets/UploadLogo";
import CamToggleLogo from "./assets/CamToggleLogo";
import VideoLogo from "./assets/VideoLogo";
import DownloadLogo from "./assets/DownloadLogo";
import StopRecordLogo from "./assets/StopRecord";

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

  const useTimer = () => {
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    function toggleTimer() {
      setIsActive(!isActive);
    }

    function resetTimer() {
      setSeconds(0);
      setIsActive(false);
    }

    function displayTimer() {
      console.log(seconds);
    }

    useEffect(() => {
      let interval = null;
      if (isActive) {
        interval = setInterval(() => {
          setSeconds((seconds) => seconds + 1);
        }, 1000);
      } else if (!isActive && seconds !== 0) {
        clearInterval(interval);
      }
      return () => clearInterval(interval);
    }, [isActive, seconds]);

    return {
      toggleTimer,
      resetTimer,
      displayTimer,
      seconds,
      isActive,
    };
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
  //access time
  const { seconds, toggleTimer, resetTimer } = useTimer();

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
      ideal: height * 0.843,
      // ideal: height,
      max: 1080,
    },
    // resizeMode: "crop-and-scale",
    // aspectRatio: 1.77777,
  };

  const AudioConstraints = {
    echoCancellation: true,
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
    toggleTimer();
  }, [
    webcamRef,
    setRecording,
    mediaRecorderRef,
    handleDataAvailable,
    toggleTimer,
  ]);

  // stop recording
  const handleStopVideoRecording = useCallback(() => {
    mediaRecorderRef.current.stop();
    toggleTimer();
    resetTimer();
    setRecording(false);
  }, [mediaRecorderRef, setRecording, toggleTimer, resetTimer]);

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
              audio={true}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              screenshotQuality="0.95"
              videoConstraints={{ ...VideoConstraints, facingMode: camMode }}
              audioConstraints={{ ...AudioConstraints }}
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
            <span>
              <span className="timer">
                <span className="digits-min">
                  {("0" + Math.floor((seconds / 60) % 60)).slice(-2)}:
                </span>
                <span className="digits-sec">
                  {("0" + Math.floor(seconds % 60)).slice(-2)}
                </span>
              </span>
              <img
                src={StopRecordLogo}
                alt="stop-record"
                width={25}
                className="recording-logo"
                onClick={handleStopVideoRecording}
              />
            </span>
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
