"use client";

import { useState, ChangeEvent, DragEvent } from "react";
import JSZip from "jszip"; // Import JSZip
import Image from "next/image";

export default function Home() {
  const [user1, setUser1] = useState<string>("");
  const [user2, setUser2] = useState<string>("");
  const [files, setFiles] = useState<File[]>([]);
  const [zipFileLink, setZipFileLink] = useState<string | null>(null); // State for ZIP file link
  const [isLinkGenerated, setIsLinkGenerated] = useState<boolean>(false); // State to track if link is generated
  const [isGenerating, setIsGenerating] = useState<boolean>(false); // State to track loading

  // Handle files from input or drop
  const handleFiles = (newFiles: FileList) => {
    const fileArray = Array.from(newFiles);
    setFiles((prevFiles) => [...prevFiles, ...fileArray]);
  };

  // Handle drag-over event to prevent default behavior
  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  // Handle file drop
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      handleFiles(event.dataTransfer.files);
    }
  };

  // Handle file selection via input
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  // Remove file by index
  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // Function to create a ZIP file and generate a download link
  const generateZip = async () => {
    if (files.length === 0) {
      alert("Please upload files first.");
      return;
    }

    setIsGenerating(true); // Set loading state

    const zip = new JSZip();
    files.forEach((file) => {
      zip.file(file.name, file); // Add each file to the ZIP
    });

    const zipBlob = await zip.generateAsync({ type: "blob" }); // Generate the ZIP file
    const zipBlobBase64 = await blobToBase64(zipBlob); // Convert to base64

    // Send the ZIP file to the API for saving
    const response = await fetch("/api/saveZip", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ zipBlob: zipBlobBase64 }),
    });

    if (response.ok) {
      const data = await response.json(); // Get the response data
      setZipFileLink(`https://upload-hub-kappa.vercel.app/${data.fileName}`); // Use the unique file name for the link
      setIsLinkGenerated(true); // Link has been generated
    } else {
      alert("Error saving the ZIP file");
    }

    setIsGenerating(false); // Reset loading state
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <>
      <div className="container mx-auto p-8">
        <header className="text-center mb-12">
          <div className="justify-center flex">
            <Image
              src="/logo.png"
              alt="Upload Hub Logo"
              width={500}
              height={500}
            />
          </div>
          <p className="text-lg text-gray-200 mt-4">
            If you dont know how to use mail we will do it for you
          </p>
        </header>

        <div className="max-w-4xl mx-auto bg-slate-950 bg-opacity-10 p-8 rounded-lg shadow-xl mb-10">
          <h2 className="text-4xl font-bold mb-4 text-center">Upload a File</h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2">
              <form
                action={"https://formsubmit.co/" + user1}
                method="POST"
                className="flex flex-col gap-4"
                encType="multipart/form-data"
                onSubmit={(e) => {
                  if (!isLinkGenerated) {
                    e.preventDefault(); // Prevent form submission if link is not generated
                    alert("Please generate the ZIP file link first.");
                  }
                }}
              >
                <input
                  type="hidden"
                  name="_next"
                  value="https://upload-hub-kappa.vercel.app/"
                />
                <div>
                  <label className="block text-sm font-medium">
                    Recipients Email:
                  </label>
                  <input
                    value={user2}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUser2(e.target.value)
                    }
                    type="email"
                    id="recipient-email"
                    name="recipient-email"
                    className="mt-1 block w-full p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter recipient's email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Your Email:</label>
                  <input
                    type="email"
                    name="from"
                    value={user1}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUser1(e.target.value)
                    }
                    className="mt-1 block w-full p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Title:</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    className="mt-1 block w-full p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Enter the title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium">Message:</label>
                  <textarea
                    id="message"
                    name="message"
                    className="mt-1 block w-full p-3 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                    placeholder="Add any message or description..."
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Generated link:
                  </label>
                  <div className="relative mt-1 pb-3">
                    <input
                      type="url"
                      id="url"
                      name="url"
                      value={zipFileLink || ""}
                      readOnly
                      className="block w-full p-3 pr-20 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder="Generated link will appear here..."
                      required
                    />
                    {zipFileLink && (
                      <button
                        type="button"
                        onClick={() => {
                          if (zipFileLink) {
                            navigator.clipboard.writeText(zipFileLink);
                            alert("Link copied to clipboard!");
                          }
                        }}
                        className="absolute right-0 top-0 bg-yellow-200 hover:bg-yellow-300 text-black font-bold py-3 px-4 rounded-r-lg"
                      >
                        Copy
                      </button>
                    )}
                  </div>
                </div>

                {/* Conditionally render either "Generate Link" or "Send" button */}
                {!isLinkGenerated ? (
                  <button
                    type="button"
                    onClick={generateZip}
                    disabled={isGenerating}
                    className="mt-6 w-full bg-gradient-to-r from-yellow-300 to-yellow-500 py-3 rounded-full text-lg font-semibold hover:from-yellow-300 hover:to-yellow-500 text-black transition-all duration-300"
                  >
                    {isGenerating ? "Generating..." : "Generate Link"}
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="mt-6 w-full bg-green-500 hover:bg-green-600 py-3 rounded-full text-lg font-semibold text-white transition-all duration-300"
                  >
                    Send
                  </button>
                )}
              </form>
            </div>
            <div
              className="md:w-1/2 p-4 flex flex-col justify-center gap-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <label
                id="drop-area"
                className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg w-full h-80 text-center cursor-pointer hover:border-yellow-400 transition"
              >
                <span className="text-sm font-medium" id="file-label">
                  Drag & drop your file here or click to select
                </span>
                <input
                  type="file"
                  id="file"
                  name="file"
                  className="hidden"
                  multiple
                  onChange={handleInputChange}
                  required
                />
              </label>
              {files.length > 0 && (
                <ul className="mb-4">
                  {files.map((file, index) => (
                    <li key={index} className="text-sm py-1 flex justify-between">
                      {file.name}
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
