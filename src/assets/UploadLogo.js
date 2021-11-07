const upload =
  "data:image/png;base64,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";

export default upload;
