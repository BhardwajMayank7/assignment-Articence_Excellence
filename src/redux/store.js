import { configureStore } from "@reduxjs/toolkit";
import fileReducer from "./reducer/fileReducer";

const store = configureStore({
  reducer: {
    file: fileReducer,
  },
});

export default store;
