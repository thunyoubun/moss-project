import { NextResponse } from "next/server";
import path from "path";
import { writeFile, readFile, mkdir } from "fs/promises";

// This function handles POST requests to /api/upload
export async function POST(request) {
  try {
    const data = await request.formData();
    const file = data.get("file");

    // Extract other form data
    const companyName = data.get("companyName");
    const jobType = data.get("jobType");
    const contactInfo = data.get("contactInfo");
    const jobResponsibilities = data.get("jobResponsibilities");

    if (!file || !companyName || !jobType) {
      return NextResponse.json(
        { success: false, message: "ข้อมูลไม่ครบถ้วน" },
        { status: 400 }
      );
    }

    // --- File Handling ---
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to avoid overwrites
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = uniqueSuffix + "-" + file.name.replaceAll(" ", "_");

    // Define the path to the public/image directory
    const imageDir = path.join(process.cwd(), "public", "image");
    const filePath = path.join(imageDir, filename);
    const publicPath = `/image/${filename}`; // The path to be stored in JSON

    // Ensure the directory exists
    await mkdir(imageDir, { recursive: true });

    // Write the file to the directory
    await writeFile(filePath, buffer);
    console.log(`File saved to: ${filePath}`);

    // --- JSON Handling ---
    const jsonPath = path.join(process.cwd(), "public", "suppliers.json");
    let suppliers = [];

    try {
      // Read the existing JSON file
      const jsonData = await readFile(jsonPath, "utf-8");
      suppliers = JSON.parse(jsonData);
    } catch (error) {
      // If the file doesn't exist or is empty, start with an empty array
      console.log("suppliers.json not found or empty, creating a new one.");
    }

    // Create the new supplier entry
    const newSupplier = {
      id: Date.now(),
      companyName,
      jobType,
      contactInfo,
      jobResponsibilities,
      companyLogoUrl: publicPath, // Save the public path
      createdAt: new Date().toISOString(),
    };

    // Add the new entry to the array
    suppliers.unshift(newSupplier); // Add to the beginning of the list

    // Write the updated array back to the JSON file
    await writeFile(jsonPath, JSON.stringify(suppliers, null, 2));
    console.log("suppliers.json updated successfully.");

    return NextResponse.json({
      success: true,
      message: "อัปโหลดและบันทึกข้อมูลสำเร็จ",
    });
  } catch (error) {
    console.error("Error in upload API:", error);
    return NextResponse.json(
      {
        success: false,
        message: `เกิดข้อผิดพลาดในเซิร์ฟเวอร์: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
