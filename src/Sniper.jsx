import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import "./Sniper.css";
import CamLogo from "./assets/CamLogo";
import UploadLogo from "./assets/UploadLogo";
import CamToggleLogo from "./assets/CamToggleLogo";

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

  // constraints
  const videoConstraints = {
    // width: 320,
    width: width,
    // height: 300,
    height: height,
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

  return (
    <>
      <div className="webcam-container">
        {image === "" ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{ ...videoConstraints, facingMode: camMode }}
            className="webcam-stream"
            onClick={handleCapture}
          />
        ) : (
          <img src={image} alt={image} onClick={handleRetake} width={width} />
        )}
        {/* camera snap logo button  */}
        {image !== "" ? (
          <img
            src={CamLogo}
            alt="cam"
            width={25}
            className="camera-logo"
            onClick={handleRetake}
          />
        ) : (
          <img
            src={CamLogo}
            alt="cam"
            width={25}
            className="camera-logo"
            onClick={handleCapture}
          />
        )}
        {/* upload captured image and toggle camera logo button  */}
        {image !== "" ? (
          <img
            src={UploadLogo}
            alt="upload"
            width={25}
            className="upload-logo"
            onClick={handleSubmit}
          />
        ) : (
          <img
            src={CamToggleLogo}
            alt="camtoggle"
            width={25}
            className="toggle-logo"
            onClick={handleToggle}
          />
        )}
      </div>
    </>
  );
};

export default Sniper;
