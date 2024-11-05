import fs from "fs";
import sharp from "sharp";

const splitImage = async (imagePath, rows, cols) => {
  const originalImage = sharp(imagePath);
  const metadata = await originalImage.metadata();

  const originalWidth = metadata.width;
  const originalHeight = metadata.height;

  // Calculate width and height for each piece
  const width = Math.floor(originalWidth / cols);
  const height = Math.floor(originalHeight / rows);

  console.log(`Original Dimensions: ${originalWidth}x${originalHeight}`);
  console.log(`Calculated Split Dimensions: ${width}x${height}`);

  const promises = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Calculate extraction coordinates
      const left = col * width;
      const top = row * height;

      // Adjust the width and height for the last row and column
      const currentWidth = col === cols - 1 ? originalWidth - left : width;
      const currentHeight = row === rows - 1 ? originalHeight - top : height;

      // Ensure we do not go out of bounds
      const finalWidth = Math.min(currentWidth, originalWidth - left);
      const finalHeight = Math.min(currentHeight, originalHeight - top);

      console.log(
        `Extracting: Row ${row}, Col ${col}, Area: [left: ${left}, top: ${top}, width: ${finalWidth}, height: ${finalHeight}]`
      );

      // Only proceed if dimensions are valid
      if (finalWidth > 0 && finalHeight > 0) {
        // Clone the original image for extraction
        const imageClone = sharp(imagePath);
        promises.push(
          imageClone
            .extract({ left, top, width: finalWidth, height: finalHeight })
            .toFile(`output/split-${row}-${col}.png`)
            .catch((error) =>
              console.error(`Error extracting Row ${row}, Col ${col}: ${error}`)
            )
        );
      } else {
        console.log(
          `Skipping extraction for Row ${row}, Col ${col}: invalid dimensions.`
        );
      }
    }
  }

  try {
    await Promise.all(promises);
    console.log("Image split process completed!");
  } catch (error) {
    console.error("Error completing the image split process:", error);
  }
};

// Main function to run the script
const main = async () => {
  const imagePath = process.argv[2]; // Image path from command line arguments
  const rows = parseInt(process.argv[3], 10); // Number of rows
  const cols = parseInt(process.argv[4], 10); // Number of columns

  if (!imagePath || isNaN(rows) || isNaN(cols)) {
    console.error("Usage: node splitter.js <image-path> <rows> <cols>");
    process.exit(1);
  }

  // Create output directory if it doesn't exist
  const outputDir = "output";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  try {
    await splitImage(imagePath, rows, cols);
  } catch (error) {
    console.error("Error splitting the image:", error);
  }
};

main();
