import React from "react";
import Navbar from "../components/Navbar";
import sampleTable from "../assets/images/sampleTable.png";
import barChart from "../assets/images/barChart.png";
import pieChart from "../assets/images/pieChart.png";



// import { Navigate } from "react-router-dom";

function About() {
  // const token = localStorage.getItem("token");
  // if (!token) {
  //   return <Navigate to="/login" />;
  // }
  return (
    <>
      <Navbar />


      <div style={styles.pageContainer}>
        <div style={{ color: "red" }}>
          ZENS: About us (Work in progress ...)
        </div>
        <br />
        <div className="text-2xl font-bold text-center my-6">
          The Application for Your Budget Administration
        </div>
        <br />

        <div>
          <div className="text-1xl font-bold text-left my-6">
            Overview of Monthly Expenses:
          </div>
          <br />
          <img
            src={sampleTable}
            alt="Expenses table"
            style={{ marginBottom: "30px" }}
          />
          <br />
          <div className="text-1xl font-bold text-left my-6">
            Charts for Reporting:
          </div>
        </div>

        <div style={styles.chartContainer}>
          <div style={styles.chartBox}>
            <h3>Comparison expenses categories</h3>
            <img src={pieChart} alt="comparison expenses categories" />
          </div>
          <div style={styles.chartBox}>
            <h3>Expenses and Income statistics</h3>
            <img src={barChart} alt="Expenses statistics" />
          </div>
        </div>
      </div>
    </>
  );
}

const styles = {
  pageContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "left",
    padding: "20px",
  },
  chartContainer: {
    display: "flex", // enable flex layout
    flexDirection: "row", // row = side-by-side
    justifyContent: "left",
    gap: "30px", // space between the charts
    flexWrap: "wrap", // allow wrap on smaller screens
    marginTop: "20px",
  },
  chartBox: {
    textAlign: "center",
    maxWidth: "400px", // optional: control width
  },
};

export default About;
