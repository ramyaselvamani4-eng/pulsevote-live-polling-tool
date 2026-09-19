import {useState} from "react";
import {useNavigate} from "react-router-dom";

function CreatePoll() {
    const [question,setQuestion]=useState("");
    const [options,setOptions]=useState(["",""]);
    const [message,setMessage]=useState("");
    const navigate=useNavigate();

    const updateOption=(index,value)=>{
        const updatedOptions=[...options];
        updatedOptions[index]=value;
        setOptions(updatedOptions);
    };

    const addOption=()=>{
        if(options.length<6) {
            setOptions([...options,""]);
        }
    };

    const removeOption=(index)=>{
        if(options.length<=2) {
            return;
        }

        const updatedOptions=options.filter(
            (_,optionIndex)=>optionIndex!==index
        );

        setOptions(updatedOptions);
    };

    const createPoll=async(e)=>{
        e.preventDefault();

        setMessage("");

        const token=localStorage.getItem("token");

        if(!token) {
            setMessage("Please login again.");
            navigate("/login");
            return;
        }

        if(question.trim()==="") {
            setMessage("Please enter a question.");
            return;
        }

        if(options.some(option=>option.trim()==="")) {
            setMessage("Please fill all options.");
            return;
        }
        const cleanedOptions=options.map(option=>option.trim());

const uniqueOptions=new Set(
    cleanedOptions.map(option=>option.toLowerCase())
);

if(uniqueOptions.size!==cleanedOptions.length) {
    setMessage("Options must be different.");
    return;
}

        try {
            const response=await fetch(
                "http://localhost:8080/api/polls",
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":"Bearer "+token
                    },
                    body:JSON.stringify({
                        question:question.trim(),
                        options:options.map(option=>option.trim())
                    })
                }
            );

            const data=await response.json();

            if(response.ok) {
                setMessage("Poll created successfully!");

                setTimeout(()=>{
                    navigate(`/poll/${data.shareCode}`);
                },700);
            } else {
                setMessage(
                    data.error||"Failed to create poll"
                );
            }
        } catch(error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    return (
        <div
            style={{
                minHeight:"100vh",
                background:"#f5f7fb",
                padding:"40px 20px",
                fontFamily:"Arial,sans-serif"
            }}
        >
            <div
                style={{
                    maxWidth:"650px",
                    margin:"0 auto"
                }}
            >
                <div
                    style={{
                        background:"#ffffff",
                        padding:"30px",
                        borderRadius:"14px",
                        boxShadow:"0 2px 12px rgba(0,0,0,0.08)"
                    }}
                >
                    <button
                        type="button"
                        onClick={()=>navigate("/dashboard")}
                        style={{
                            padding:"8px 14px",
                            border:"none",
                            borderRadius:"6px",
                            cursor:"pointer",
                            marginBottom:"15px"
                        }}
                    >
                        ← Dashboard
                    </button>

                    <h1>
                        Create New Poll
                    </h1>

                    <p>
                        Create a question and share it with your audience.
                    </p>

                    <form onSubmit={createPoll}>
                        <label>
                            <strong>
                                Question
                            </strong>
                        </label>

                        <input
                            type="text"
                            placeholder="Example: Which programming language do you prefer?"
                            value={question}
                            onChange={(e)=>{
                                setQuestion(e.target.value);
                            }}
                            style={{
                                width:"100%",
                                padding:"12px",
                                marginTop:"8px",
                                marginBottom:"20px",
                                boxSizing:"border-box",
                                border:"1px solid #ccc",
                                borderRadius:"7px"
                            }}
                        />

                        <h3>
                            Options
                        </h3>

                        {options.map((option,index)=>(
                            <div
                                key={index}
                                style={{
                                    display:"flex",
                                    gap:"10px",
                                    marginBottom:"12px"
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder={`Option ${index+1}`}
                                    value={option}
                                    onChange={(e)=>{
                                        updateOption(
                                            index,
                                            e.target.value
                                        );
                                    }}
                                    style={{
                                        flex:1,
                                        padding:"12px",
                                        border:"1px solid #ccc",
                                        borderRadius:"7px"
                                    }}
                                />

                                {options.length>2&&(
                                    <button
                                        type="button"
                                        onClick={()=>{
                                            removeOption(index);
                                        }}
                                        style={{
                                            padding:"8px 12px",
                                            border:"none",
                                            borderRadius:"6px",
                                            cursor:"pointer"
                                        }}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        ))}

                        {options.length<6&&(
                            <button
                                type="button"
                                onClick={addOption}
                                style={{
                                    padding:"10px 16px",
                                    border:"none",
                                    borderRadius:"6px",
                                    cursor:"pointer",
                                    marginTop:"5px"
                                }}
                            >
                                + Add Option
                            </button>
                        )}

                        <br/>
                        <br/>

                        <button
                            type="submit"
                            style={{
                                width:"100%",
                                padding:"13px",
                                border:"none",
                                borderRadius:"7px",
                                cursor:"pointer",
                                fontSize:"16px"
                            }}
                        >
                            Create Poll
                        </button>
                    </form>

                    {message&&(
                        <p style={{marginTop:"20px"}}>
                            {message}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default CreatePoll;