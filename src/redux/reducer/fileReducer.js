
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  file: null,
  uploading: false,
  error: null,
  csvData: [],
};

export const fileSlice = createSlice({
  name: "file",
  initialState,
  reducers: {
    setFile: (state, action) => {
      state.file = action.payload;
    },
    setUploading: (state, action) => {
      state.uploading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setCsvData: (state, action) => {
      state.csvData = action.payload;
    },
  },
});

export const { setFile, setUploading, setError, setCsvData } =
  fileSlice.actions;

export default fileSlice.reducer;
