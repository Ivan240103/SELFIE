import React, { useState } from "react";
import "../css/Dashboard.css";
//import avatar from "./immm.png";

function Dashboard(){

    return(
        <div class="card">
            {/* <img src={avatar} alt="Avatar"/> */}
            <div class="figure">
                <h4><b>John Doe</b></h4>
                <p>Architect & Engineer</p>
            </div>
        </div> 
    );
}

export default Dashboard;
