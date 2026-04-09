type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

export async function uploadImage(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as
    | string
    | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as
    | string
    | undefined;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary environment variables are missing");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const result = (await response.json()) as CloudinaryUploadResponse;

  if (!response.ok) {
    throw new Error(result.error?.message ?? "Cloudinary upload failed");
  }

  if (!result.secure_url) {
    throw new Error("Cloudinary did not return secure_url");
  }

  return result.secure_url;
}
