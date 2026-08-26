export function getCloudinaryUrl(
  value: string
): string {

  const cloudName =
    import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;


  if (!value) {
    return "";
  }


  // Already a complete Cloudinary URL
  if (
    value.startsWith(
      "https://res.cloudinary.com"
    )
  ) {
    return value;
  }


  if (!cloudName) {
    return "";
  }


  // Treat as Cloudinary public_id
  return (
    `https://res.cloudinary.com/${cloudName}` +
    `/image/upload/q_auto,f_auto/${value}`
  );
}