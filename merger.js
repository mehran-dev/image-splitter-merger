import sharp from "sharp";
import fs from "fs";
import path from "path";

const mergeImages = async (outputDir) => {
  try {
    // Read the directory for split images
    const files = fs.readdirSync(outputDir);

    // Filter out split image files
    const splitImages = files.filter((file) =>
      /^split-\d+-\d+\.png$/.test(file)
    );

    // Extract unique rows and columns
    const rows = new Set();
    const cols = new Set();

    splitImages.forEach((file) => {
      const match = file.match(/^split-(\d+)-(\d+)\.png$/);
      if (match) {
        rows.add(parseInt(match[1], 10));
        cols.add(parseInt(match[2], 10));
      }
    });

    const rowCount = Math.max(...Array.from(rows)) + 1; // Total rows (0-based index)
    const colCount = Math.max(...Array.from(cols)) + 1; // Total columns (0-based index)

    // Calculate dimensions based on detected rows and cols
    const width = colCount * 400; // Each split image width
    const height = rowCount * 225; // Each split image height

    // Create an array to hold the promises for each image
    const images = [];

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < colCount; col++) {
        const imagePath = path.join(outputDir, `split-${row}-${col}.png`);
        if (fs.existsSync(imagePath)) {
          images.push(sharp(imagePath).resize(400, 225)); // Resize each image to ensure correct dimensions
        } else {
          console.warn(`Warning: File ${imagePath} does not exist. Skipping.`);
        }
      }
    }

    // Create an empty canvas to hold the merged image
    const canvas = sharp({
      create: {
        width: width,
        height: height,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }, // White background
      },
    });

    // Composite the images into the canvas
    const mergedImage = await canvas.composite(
      await Promise.all(
        images.map(async (img, index) => {
          const row = Math.floor(index / colCount);
          const col = index % colCount;
          return {
            input: await img.toBuffer(), // Ensure to convert to buffer
            top: row * 225,
            left: col * 400,
          };
        })
      )
    );

    // Save the merged image
    const outputPath = path.join(outputDir, "merged-image.png");
    await mergedImage.toFile(outputPath);
    console.log(`Merged image saved to ${outputPath}`);
  } catch (err) {
    console.error(`Error completing the image merge process: ${err.message}`);
  }
};

// Example usage
mergeImages("output").catch((err) => console.error(err));
