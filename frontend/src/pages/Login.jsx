import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Login() {
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [message,setMessage]=useState("");
    const navigate=useNavigate();

    const login=async(e)=>{
        e.preventDefault();

        try {
            const response=await fetch(
                "http://localhost:8080/api/auth/login",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        email:email,
                        password:password
                    })
                }
            );

            const data=await response.json();

            if(response.ok) {
    localStorage.setItem("token",data.token);
    localStorage.setItem("userId",data.userId);
    localStorage.setItem("userName",data.name);
    localStorage.setItem("userEmail",data.email);
                setMessage("Login successful!");

                setTimeout(()=>{
                    navigate("/dashboard");
                },500);
            } else {
                setMessage(data.error||"Login failed");
            }
        } catch(error) {
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={login}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e)=>setEmail(e.target.value)}
                />

                <br/>

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                />

                <br/>

                <button type="submit">
                    Login
                </button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Login;