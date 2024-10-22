export function convertBufferToBase64(buffer: {data: Buffer, type: 'Buffer'}) {
  const base64String = btoa(
    String.fromCharCode.apply(null, buffer),
  );

  // Create data URL
  const dataUrl = `data:image/jpeg;base64,${base64String}`;
  return dataUrl
}