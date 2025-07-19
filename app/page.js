"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Main component for the Next.js page
export default function HomePage() {
  // State management for the component
  const [companyName, setCompanyName] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState("");
  const [jobResponsibilities, setJobResponsibilities] = useState("");
  const [jobType, setJobType] = useState("");
  const [contactInfo, setContactInfo] = useState("");

  const [workHistories, setWorkHistories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [jobTypeSearchTerm, setJobTypeSearchTerm] = useState("");

  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  // Function to handle image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Set the preview URL for the image
      };
      reader.readAsDataURL(file);
    }
  };

  // Define job type options for the dropdowns
  const jobTypeOptions = [
    { value: "", label: "เลือกประเภทการทำงาน" },
    { value: "งานเครื่องกล", label: "งานเครื่องกล" },
    { value: "งานไฟฟ้า", label: "งานไฟฟ้า" },
    { value: "งานโยธา", label: "งานโยธา" },
    { value: "งานธุรการ", label: "งานธุรการ" },
    { value: "งานบัญชี", label: "งานบัญชี" },
    { value: "งานบุคคล", label: "งานบุคคล" },
    { value: "งานการตลาด", label: "งานการตลาด" },
    { value: "งานขาย", label: "งานขาย" },
    { value: "งานไอที", label: "งานไอที" },
  ];

  // Effect to fetch initial data from the local JSON file
  useEffect(() => {
    setLoading(true);
    fetch("/suppliers.json") // Fetches from the /public folder
      .then((res) => {
        if (!res.ok) {
          throw new Error("ไม่พบไฟล์ suppliers.json");
        }
        return res.json();
      })
      .then((data) => {
        // Sort data by date, assuming createdAt is a valid date string
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setWorkHistories(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching local data:", error);
        setMessage(`เกิดข้อผิดพลาด: ${error.message}`);
        setLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

  // Handles adding a new work history item to the state
  const handleAddWorkHistory = (e) => {
    e.preventDefault();
    if (!companyName || !jobType) {
      setMessage("กรุณากรอกชื่อ Supplier และเลือกประเภทการทำงาน");
      return;
    }

    // Create a new history object
    const newHistory = {
      id: Date.now(), // Use current timestamp for a simple unique ID
      companyName,
      companyLogoUrl,
      jobResponsibilities,
      jobType,
      contactInfo,
      createdAt: new Date().toISOString(), // ISO string for consistency
    };

    // API call to upload the logo file if it exists
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      formData.append("companyName", companyName);
      formData.append("jobType", jobType);
      formData.append("contactInfo", contactInfo);
      formData.append("jobResponsibilities", jobResponsibilities);
      fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            newHistory.companyLogoUrl = data.companyLogoPath; // Use the path returned from the API
            console.log("File uploaded successfully:", data);
          } else {
            console.error("File upload failed:", data.message);
            setMessage(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${data.message}`);
          }
        })
        .catch((error) => {
          console.error("Error uploading file:", error);
          setMessage(`เกิดข้อผิดพลาดในการอัปโหลดไฟล์: ${error.message}`);
        });
    } else {
      newHistory.companyLogoUrl = ""; // No logo uploaded
    }

    // Update the state to include the new item at the top of the list
    setWorkHistories([newHistory, ...workHistories]);

    // Set a success message, reminding the user that data is not persisted
    setMessage("Added new supplier successfully!");

    // Clear the form fields
    setCompanyName("");
    setCompanyLogoUrl("");
    setJobResponsibilities("");
    setJobType("");
    setContactInfo("");
  };

  // Handles searching based on company name and/or job type
  const handleSearch = () => {
    if (searchTerm.trim() === "" && jobTypeSearchTerm.trim() === "") {
      setSearchResults([]);
      setMessage("");
      return;
    }

    // Filter the work histories based on search terms
    const results = workHistories.filter((history) => {
      const companyMatch =
        searchTerm.trim() === "" ||
        history.companyName.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch =
        jobTypeSearchTerm.trim() === "" ||
        history.jobType === jobTypeSearchTerm;
      return companyMatch && typeMatch;
    });

    setSearchResults(results);
    setMessage(`พบ ${results.length} รายการที่ตรงกับเงื่อนไข`);
  };

  // UI Rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-4 font-inter text-gray-800 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-8">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center text-purple-700 mb-8 tracking-tight">
          <span role="img" aria-label="briefcase">
            🏭
          </span>{" "}
          Supplier Management System
        </h1>

        {message && (
          <div
            className={`p-3 rounded-lg text-center font-medium ${
              message.includes("ข้อผิดพลาด")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {loading && (
          <div className="text-center text-purple-500 font-semibold flex justify-center items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            กำลังโหลดข้อมูล...
          </div>
        )}

        {/* Add Work History Form */}
        <div className="bg-purple-50 p-6 rounded-xl shadow-inner border border-purple-100">
          <h2 className="text-2xl font-bold text-purple-600 mb-4">
            Add Supplier Form
          </h2>
          <form onSubmit={handleAddWorkHistory} className="space-y-4">
            <div>
              <label
                htmlFor="companyName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ชื่อ Supplier:
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                placeholder="ชื่อ Supplier"
                required
              />
            </div>
            <div>
              <label
                htmlFor="jobType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ประเภทงานที่ให้บริการ:
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                required
              >
                {jobTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="companyLogoUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Logo:
              </label>
              <input
                type="file"
                id="companyLogoUrl"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition duration-200"
              />
              {imagePreviewUrl && (
                <div className="mt-2">
                  <Image
                    src={imagePreviewUrl}
                    alt="Logo Preview"
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded-full border-2 border-purple-400"
                  />
                </div>
              )}
            </div>
            <div>
              <label
                htmlFor="contactInfo"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                ช่องทางการติดต่อ:
              </label>
              <input
                type="text"
                id="contactInfo"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition duration-200"
                placeholder="เช่น เบอร์โทรศัพท์, อีเมล, เว็บไซต์"
              />
            </div>
            <div>
              <label
                htmlFor="jobResponsibilities"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                รายละเอียดบริการ:
              </label>
              <textarea
                id="jobResponsibilities"
                value={jobResponsibilities}
                onChange={(e) => setJobResponsibilities(e.target.value)}
                className="w-full p-2 border border-purple-300 rounded-md focus:ring-purple-500 focus:border-purple-500 transition duration-200 h-24 resize-y"
                placeholder="บันทึกรายละเอียดบริการที่ Supplier เคยให้"
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Submit
            </button>
          </form>
        </div>

        <div className="border-t-2 border-dashed border-gray-200 my-8"></div>

        {/* Search Work History Section */}
        <div className="bg-pink-50 p-6 rounded-xl shadow-inner border border-pink-100">
          <h2 className="text-2xl font-bold text-pink-700 mb-4">
            Search Supplier
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาตามชื่อ Supplier"
              className="flex-grow p-2 border border-pink-300 rounded-md focus:ring-pink-500 focus:border-pink-500 transition duration-200"
            />
            <select
              id="jobTypeSearch"
              value={jobTypeSearchTerm}
              onChange={(e) => setJobTypeSearchTerm(e.target.value)}
              className="flex-grow p-2 border border-pink-300 rounded-md focus:ring-pink-500 focus:border-pink-500 transition duration-200"
            >
              {jobTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSearch}
              className="bg-pink-600 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1"
            >
              Search
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-6 space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                ผลการค้นหา:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
                {searchResults.map((history) => (
                  <div
                    key={history.id}
                    className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-gray-200"
                  >
                    {history.companyLogoUrl ? (
                      <Image
                        width={100}
                        height={100}
                        src={history.companyLogoUrl}
                        alt={history.companyName}
                        className="w-24 h-24 object-cover rounded-full mb-3 border-2 border-teal-400"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full uppercase mb-3 border-2 border-teal-400 bg-pink-200 flex items-center justify-center text-white text-2xl font-bold object-cover">
                        {history.companyName?.substring(0, 2) ?? "?"}
                      </div>
                    )}
                    <h4 className="text-lg font-bold text-purple-700">
                      {history.companyName}
                    </h4>
                    {history.jobType && (
                      <p className="text-gray-600 text-sm">
                        ประเภทงานที่ให้บริการ: {history.jobType}
                      </p>
                    )}
                    {history.contactInfo && (
                      <p className="text-gray-600 text-sm">
                        ช่องทางการติดต่อ: {history.contactInfo}
                      </p>
                    )}
                    {history.jobResponsibilities && (
                      <p className="text-gray-700 text-sm mt-2 p-2 bg-gray-50 rounded-md w-full break-words">
                        <span className="font-medium">รายละเอียดบริการ:</span>{" "}
                        {history.jobResponsibilities}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {(searchTerm || jobTypeSearchTerm) &&
            searchResults.length === 0 &&
            !loading && (
              <p className="text-center text-gray-500 mt-4">
                ไม่พบ Supplier ที่ตรงกับเงื่อนไข
              </p>
            )}
        </div>

        <div className="border-t-2 border-dashed border-gray-200 my-8"></div>

        {/* All Work Histories List */}
        <div className="bg-teal-50 p-6 rounded-xl shadow-inner border border-teal-100">
          <h2 className="text-2xl font-bold text-teal-700 mb-4">
            All Suppliers
          </h2>
          {workHistories.length === 0 && !loading ? (
            <p className="text-center text-gray-500">
              ยังไม่มีข้อมูล Supplier ในระบบ ลองเพิ่มใหม่!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {workHistories.map((history, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-4 flex flex-col items-center text-center border border-gray-200"
                >
                  {history.companyLogoUrl ? (
                    <Image
                      width={100}
                      height={100}
                      src={history.companyLogoUrl}
                      alt={history.companyName}
                      className="w-24 h-24 object-cover rounded-full mb-3 border-2 border-teal-400"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full uppercase mb-3 border-2 border-teal-400 bg-pink-200 flex items-center justify-center text-white text-2xl font-bold object-cover">
                      {history.companyName?.substring(0, 2) ?? "?"}
                    </div>
                  )}
                  <h4 className="text-lg font-bold text-purple-700">
                    {history.companyName}
                  </h4>
                  {history.jobType && (
                    <p className="text-gray-600 text-sm">
                      ประเภทงานที่ให้บริการ: {history.jobType}
                    </p>
                  )}
                  {history.contactInfo && (
                    <p className="text-gray-600 text-sm">
                      ช่องทางการติดต่อ: {history.contactInfo}
                    </p>
                  )}
                  {history.jobResponsibilities && (
                    <p className="text-gray-700 text-sm mt-2 p-2 bg-gray-50 rounded-md w-full break-words">
                      <span className="font-medium">รายละเอียดบริการ:</span>{" "}
                      {history.jobResponsibilities}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
