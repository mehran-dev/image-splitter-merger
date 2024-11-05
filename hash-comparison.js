import crypto from "crypto";
import fs from "fs";
import path from "path";

// Function to calculate the hash of an image file
const calculateImageHash = (imagePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256"); // You can use 'md5' or any other algorithm as needed
    const stream = fs.createReadStream(imagePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err) => reject(err));
  });
};

// Function to compare hashes of two images
const compareImageHashes = async (imagePath1, imagePath2) => {
  try {
    const hash1 = await calculateImageHash(imagePath1);
    const hash2 = await calculateImageHash(imagePath2);

    if (hash1 === hash2) {
      console.log("The images have the same hash content.");
    } else {
      console.log("The images do not have the same hash content.");
    }
  } catch (err) {
    console.error(`Error comparing images: ${err.message}`);
  }
};

// Example usage
const outputDir = "./output"; // Change this to your output directory if necessary
const mergedImagePath = path.join(outputDir, "merged-image.png");
const testImagePath = path.join(outputDir, "test.png"); // Adjust if your test image is located elsewhere

compareImageHashes(mergedImagePath, testImagePath).catch((err) =>
  console.error(err)
);
