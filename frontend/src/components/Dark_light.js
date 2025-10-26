import React from "react";
import Navbar from "./Navbar";
import { Navigate } from "react-router-dom";

function Dark_light() {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <Navbar></Navbar>
      <h1 style={{ color: "red" }}>Dark-/Light-Mode (Work in progress ...)</h1>
    </>
  );
}

export default Dark_light;
