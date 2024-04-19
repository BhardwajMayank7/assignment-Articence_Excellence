import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { useDispatch, useSelector } from "react-redux";
import {
  setFile,
  setUploading,
  setError,
  setCsvData,
} from "./redux/reducer/fileReducer";

function App() {
  const dispatch = useDispatch();
  const file = useSelector((state) => state.file.file);
  const uploading = useSelector((state) => state.file.uploading);
  const error = useSelector((state) => state.file.error);
  const [sortedCsvData, setSortedCsvData] = useState([]);
  const [originalCsvData, setOriginalCsvData] = useState([]);
  const [updatedCsvData, setUpdatedCsvData] = useState([]);

  const fetchData = async () => {
    try {
      const response = await axios.get("http://localhost:3001/data");
      const sortedData = response.data.sort((a, b) =>
        a.Region.localeCompare(b.Region)
      );
      setSortedCsvData(sortedData);
      setOriginalCsvData(sortedData);
      dispatch(setCsvData(sortedData));
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleFileChange = (e) => {
    dispatch(setFile(e.target.files[0]));
  };

  const handleUpload = async () => {
    dispatch(setUploading(true));
    dispatch(setError(null));

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post("http://localhost:3001/uploads", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      dispatch(setUploading(false));
      console.log("Upload successful");
      fetchData();
    } catch (error) {
      console.log("Upload failed");
      dispatch(setError(error.message));
      dispatch(setUploading(false));
    }
  };

  const handleCellChange = async (rowIndex, columnName, newValue) => {
    const updatedData = [...sortedCsvData];
    const updatedRow = { ...updatedData[rowIndex] };
    updatedRow[columnName] = newValue;
    updatedData[rowIndex] = updatedRow;
    setSortedCsvData(updatedData);
    setUpdatedCsvData(updatedData);
  };

  const handleUpdate = async () => {
    try {
      const updatedDataWithoutIdAndV = updatedCsvData.map(
        ({ _id, __v, ...rest }) => rest
      );

      const csvData = updatedDataWithoutIdAndV.map((row) =>
        Object.values(row).join(",")
      );
      const csvContent = [
        Object.keys(updatedDataWithoutIdAndV[0]).join(","),
        ...csvData,
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "updated_data.csv");
      document.body.appendChild(link);
      link.click();
      console.log("Download successful");
    } catch (error) {
      console.log("Download failed:", error);
    }
  };

  return (
    <div className="container">
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload} disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>
        {error && <p className="error">Error: {error}</p>}
      </div>

      <div className="data-section">
        <h2>Uploaded Data Summary</h2>
        <div className="table-wrapper">
          {sortedCsvData.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  {Object.keys(sortedCsvData[0])
                    .filter((header) => header !== "_id" && header !== "__v")
                    .map((header, index) => (
                      <th key={index}>{header}</th>
                    ))}
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedCsvData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{rowIndex + 1}</td>
                    {Object.keys(row)
                      .filter((key) => key !== "_id" && key !== "__v")
                      .map((columnName, cellIndex) => (
                        <td
                          key={cellIndex}
                          contentEditable
                          onBlur={(e) =>
                            handleCellChange(
                              rowIndex,
                              columnName,
                              e.target.innerText
                            )
                          }
                        >
                          {row[columnName]}
                        </td>
                      ))}
                    <td>
                      <button onClick={handleUpdate}>Update</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
