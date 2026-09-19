import {useState} from "react";
import {useNavigate} from "react-router-dom";

function Signup() {
    const [name,setName]=useState("");
    const [email,setEmail]=useState("");
    const [password,setPassword]=useState("");
    const [message,setMessage]=useState("");
    const navigate=useNavigate();

    const signup=async(e)=>{
        e.preventDefault();

        try {
            const response=await fetch(
                "http://localhost:8080/api/auth/signup",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json"
                    },
                    body:JSON.stringify({
                        name:name,
                        email:email,
                        password:password
                    })
                }
            );

            const data=await response.json();

            if(response.ok) {
                setMessage("Signup successful! Redirecting to login...");

                setTimeout(()=>{
                    navigate("/login");
                },1000);
            } else {
                setMessage(data.error||"Signup failed");
            }
        } catch(error) {
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div>
            <h1>Create Account</h1>

            <form onSubmit={signup}>
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e)=>setName(e.target.value)}
                />

                <br/>

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
                    Signup
                </button>
            </form>

            <p>{message}</p>
        </div>
    );
}

export default Signup;