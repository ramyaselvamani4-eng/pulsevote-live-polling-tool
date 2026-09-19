import {BrowserRouter,Routes,Route,useNavigate} from "react-router-dom";
import Poll from "./pages/Poll";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import CreatePoll from "./pages/CreatePoll";
import Dashboard from "./pages/Dashboard";

function Home() {
    const navigate=useNavigate();

    return (
        <div
            style={{
                minHeight:"100vh",
                background:"#f5f7fb",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                fontFamily:"Arial,sans-serif",
                padding:"20px"
            }}
        >
            <div
                style={{
                    background:"#ffffff",
                    maxWidth:"650px",
                    width:"100%",
                    padding:"50px 30px",
                    borderRadius:"16px",
                    textAlign:"center",
                    boxShadow:"0 2px 15px rgba(0,0,0,0.08)"
                }}
            >
                <h1>
                    PulseVote
                </h1>

                <h2>
                    Live Polling Made Simple
                </h2>

                <p>
                    Create polls, share them with your audience,
                    and watch results update live without refreshing.
                </p>

                <div
                    style={{
                        marginTop:"30px"
                    }}
                >
                    <button
                        onClick={()=>{
                            navigate("/login");
                        }}
                        style={{
                            padding:"12px 25px",
                            marginRight:"10px",
                            border:"none",
                            borderRadius:"7px",
                            cursor:"pointer"
                        }}
                    >
                        Login
                    </button>

                    <button
                        onClick={()=>{
                            navigate("/signup");
                        }}
                        style={{
                            padding:"12px 25px",
                            border:"none",
                            borderRadius:"7px",
                            cursor:"pointer"
                        }}
                    >
                        Create Account
                    </button>
                </div>

                <div
                    style={{
                        marginTop:"40px"
                    }}
                >
                    <p>
                        <strong>Features</strong>
                    </p>

                    <p>
                        ✓ Real-time voting
                    </p>

                    <p>
                        ✓ WebSocket live updates
                    </p>

                    <p>
                        ✓ Redis-powered live results
                    </p>

                    <p>
                        ✓ MongoDB persistent storage
                    </p>

                    <p>
                        ✓ Secure JWT authentication
                    </p>
                </div>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route
                    path="/"
                    element={<Home/>}
                />

                <Route
                    path="/signup"
                    element={<Signup/>}
                />

                <Route
                    path="/login"
                    element={<Login/>}
                />

                <Route
                    path="/dashboard"
                    element={<Dashboard/>}
                />

                <Route
                    path="/create"
                    element={<CreatePoll/>}
                />

                <Route
                    path="/poll/:shareCode"
                    element={<Poll/>}
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;