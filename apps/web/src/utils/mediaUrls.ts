export function getCloudinaryUrl(
  publicId: string
): string {

  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;


  if (!publicId || !cloudName) {
    return "";
  }


  return (
    `https://res.cloudinary.com/${cloudName}` +
    `/image/upload/q_auto,f_auto/${publicId}`
  );
}