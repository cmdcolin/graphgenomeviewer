import React, { useEffect, useRef } from "react";
import "./App.css";
import igv from "igv";
//import igv from 'igv.esm.min.js'
function App() {
  const ref = useRef();
  useEffect(() => {
    var igvOptions = { genome: "hg38", locus: "BRCA1" };
    return igv.createBrowser(ref.current, igvOptions);
  }, []);
  return (
    <div>
      <div className="header">
        <h1>graphgenome browser</h1>
      </div>
      <div className="with-sidebar">
        <div className="sidebar">d3 js</div>
        <div className="body">
          Body
          <div
            ref={ref}
            style={{
              paddingTop: "10px",
              paddingBottom: "10px",
              margin: "8px",
              border: "1px solid lightgray",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
