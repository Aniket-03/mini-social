import { useState } from "react";
import { addPostToFirestore } from "../common/firebaseFunctions";
import { toast } from "react-toastify";
import Loader from "../common/Loader";

const AddPost = ({ onPostAdded }: { onPostAdded: () => void }) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file) {
      setImageFile(file);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error("Please upload an image.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("upload_preset", 'Social');  

      const response = await fetch('https://api.cloudinary.com/v1_1/dw9mwtcc1/image/upload', {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        const imageUrl = data.secure_url;
        console.log(imageUrl)
        await addPostToFirestore(imageUrl);

        toast.success("Post added successfully!");

        setImageFile(null);
        onPostAdded();
      } else {
        throw new Error("Image upload failed.");
      }
    } catch (err) {
      toast.error("Failed to add post. Please try again.");
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div className="">
 <div className="flex  pt-10 px-6 w-full sm:max-w-xl max-w-xl rounded-lg mb-1 ">
      {loading && <Loader />}
      <form
        onSubmit={handlePostSubmit}
        className=" p-4 w-full"
      >
        <div className="w-full relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          />
          <button
            type="button"
            className="w-full py-2 border rounded-sm text-gray-600 bg-white focus:outline-none hover:bg-gray-100"
          >
            {imageFile ? imageFile.name : "Upload Image"}
          </button>
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
    </div>
    
  );
};

export default AddPost;
