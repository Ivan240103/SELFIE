import { Link } from "react-router-dom";
import "../css/Dashboard.css";
import calendarIcon from "../images/calendar-icon.png";
import notes from "../images/notebook-pen-icon.png";
import tomato from "../images/speed-icon.png";
import logout from "../images/door-check-out-icon.png";

function Dashboard(){

    return(
        <div className="cen">
            <div className="card">
                <div className="figure">
                    <h4><h2>Calendar</h2></h4>
                    <p>Organize your routine!!</p>
                    <img 
                        src={calendarIcon} alt="Calendar"
                        style={{ width: '100px', height: '100px' }} 
                    />
                </div>
                <Link to="/Calendar">
                    <button className="down"><b>Click here</b></button>
                </Link>
            </div> 
            <div className="card">
                <div className="figure">
                    <h4><h2>Notes</h2></h4>
                    <p>Write any thoughts!!</p>
                    <img 
                        src={notes} alt="Notes"
                        style={{ width: '100px', height: '100px' }} 
                    />
                </div>
                <Link to="/Notes">   
                    <button className="down"><b>Click here</b></button>
                </Link>
            </div> 
            <div className="card">
                <div className="figure">
                    <h4><h2>Tomato</h2></h4>
                    <p>Set your time to study!!</p>
                    <img 
                        src={tomato} alt="Tomato"
                        style={{ width: '100px', height: '100px' }} 
                    />
                </div>
                <Link to="/Tomato">
                    <button className="down"><b>Click here</b></button>
                </Link>
            </div> 
            <div className="card">
                <div className="figure">
                    <h4><h2>Logout</h2></h4>
                    <p>Do you want to login with another account?</p>
                    <img 
                        src={logout} alt="Logout"
                        style={{ width: '100px', height: '100px' }} 
                    />
                </div>
                <Link to="/">
                    <button
                        className="down"
                        onClick={() => localStorage.removeItem('token')}
                    >
                        <b>Click here</b>
                    </button>
                </Link>
            </div> 
        </div>
    );
}

export default Dashboard;
