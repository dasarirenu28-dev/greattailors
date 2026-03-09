import React from "react";
export default function TestLogo(){
  return (
    <div style={{padding:30}}>
      <h3>Test Logo</h3>
      <img src={`${process.env.PUBLIC_URL}/logo.jpg`} alt="Logo" style={{width:200, height:140, objectFit:"cover", border:"1px solid #ddd"}} />
    </div>
  );
}
