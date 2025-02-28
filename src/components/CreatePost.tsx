import { useState } from "react";
import { addPostToFirestore } from "../common/shared";
import { toast } from "react-toastify";
import Loader from "../common/Loader";

const AddPost = ({ onPostAdded }: { onPostAdded: () => void }) => {
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  let preset = process.env.REACT_APP_UPLOAD_PRESET
  const uploadImage = async (image: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", image);
    const uploadPreset = process.env.REACT_APP_UPLOAD_PRESET;

    if (!uploadPreset) {
      throw new Error("Missing REACT_APP_UPLOAD_PRESET in .env file");
    }
    
    formData.append("upload_preset", uploadPreset);

    const cloudinary = process.env.REACT_APP_CLOUDINARY;

    if (!cloudinary) {
      throw new Error("Missing cloudinary in .env file");
    }
    try {
      const res = await fetch(cloudinary, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.secure_url || null;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage) {
      toast.error("Please upload an image.");
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) throw new Error("Image upload failed.");

      await addPostToFirestore(imageUrl);
      toast.success("Post added successfully!");
      setSelectedImage(null);
      onPostAdded();
    } catch (err) {
      toast.error("Failed to add post. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="pt-10 px-6 w-fit rounded-lg">
      {loading && <Loader />}
      <form onSubmit={handleSubmit} className="p-4 w-full">
        <div className="w-full border rounded-sm p-2 flex flex-col items-center cursor-pointer relative">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files ? e.target.files[0] : null)}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          {selectedImage ? (
            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="w-16 h-16 object-cover rounded" />
          ) : (
            <p className="text-gray-200 cursor-pointer">Click to Upload Image</p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`cursor-pointer ml-0 mt-2 px-4 py-2 text-white font-semibold rounded-sm ${
            loading ? "bg-gray-400" : "bg-gray-500 hover:bg-gray-600"
          } focus:outline-none`}
        >
          Post
        </button>
      </form>
    </div>
  );
};

export default AddPost;
