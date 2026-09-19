
import {useEffect,useState} from "react";
import {useNavigate} from "react-router-dom";

function Dashboard() {
    const [polls,setPolls]=useState([]);
    const [loading,setLoading]=useState(true);
    const [message,setMessage]=useState("");

    const navigate=useNavigate();

    const userEmail=localStorage.getItem("userEmail");
    const userName=localStorage.getItem("userName");

    useEffect(()=>{
        const token=localStorage.getItem("token");

        if(!token) {
            navigate("/login");
            return;
        }

       fetch(
    "http://localhost:8080/api/user-polls",
    {
        headers:{
            "Authorization":"Bearer "+token
        }
    }
)
.then(response=>response.json())
.then(async data=>{
    if(data.polls) {
        const pollsWithResults=await Promise.all(
            data.polls.map(async poll=>{
                try {
                    const response=await fetch(
                        `http://localhost:8080/api/polls/${poll.shareCode}/results`
                    );

                    const resultData=await response.json();

                    const totalVotes=Object.values(
                        resultData.results||{}
                    ).reduce(
                        (total,value)=>total+Number(value),
                        0
                    );

                    return {
                        ...poll,
                        totalVotes:totalVotes
                    };
                } catch(error) {
                    return {
                        ...poll,
                        totalVotes:0
                    };
                }
            })
        );

        setPolls(pollsWithResults);
    } else {
        setMessage(
            data.error||"Unable to load polls"
        );
    }

    setLoading(false);
})
.catch(error=>{
    console.error(error);
    setMessage("Unable to connect to server");
    setLoading(false);
});
    },[navigate]);

    const logout=()=>{
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");

        navigate("/login");
    };

    const closePoll=async(poll)=>{
        try {
            const token=localStorage.getItem("token");

            const response=await fetch(
                `http://localhost:8080/api/polls/${poll.shareCode}/close`,
                {
                    method:"POST",
                    headers:{
                        "Authorization":"Bearer "+token
                    }
                }
            );

            const data=await response.json();

            if(response.ok) {
                setPolls(previousPolls=>
                    previousPolls.map(item=>
                        item.id===poll.id
                            ?{...item,isActive:false}
                            :item
                    )
                );

                setMessage("Poll closed successfully!");
            } else {
                setMessage(
                    data.error||"Failed to close poll"
                );
            }
        } catch(error) {
            console.error(error);
            setMessage("Unable to connect to server");
        }
    };

    const copyPollLink=(poll)=>{
        const link=
            `${window.location.origin}/poll/${poll.shareCode}`;

        navigator.clipboard.writeText(link);

        setMessage("Poll link copied!");
    };

    return (
        <div
            style={{
                minHeight:"100vh",
                background:"#f5f7fb",
                padding:"30px",
                fontFamily:"Arial,sans-serif"
            }}
        >
            <div
                style={{
                    maxWidth:"1000px",
                    margin:"0 auto"
                }}
            >
                <div
                    style={{
                        background:"#ffffff",
                        padding:"20px 25px",
                        borderRadius:"12px",
                        display:"flex",
                        justifyContent:"space-between",
                        alignItems:"center",
                        boxShadow:"0 2px 10px rgba(0,0,0,0.08)"
                    }}
                >
                    <div>
                        <h1 style={{margin:"0"}}>
                            PulseVote
                        </h1>

                        <p style={{margin:"5px 0 0"}}>
                            Live Polling Dashboard
                        </p>
                    </div>

                    <button
                        onClick={logout}
                        style={{
                            padding:"10px 18px",
                            border:"none",
                            borderRadius:"6px",
                            cursor:"pointer"
                        }}
                    >
                        Logout
                    </button>
                </div>

                <div
                    style={{
                        background:"#ffffff",
                        marginTop:"25px",
                        padding:"25px",
                        borderRadius:"12px",
                        boxShadow:"0 2px 10px rgba(0,0,0,0.08)"
                    }}
                >
                    <h2>Welcome, {userName}</h2>

                    <p>{userEmail}</p>

                    <button
                        onClick={()=>{
                            navigate("/create");
                        }}
                        style={{
                            padding:"12px 20px",
                            border:"none",
                            borderRadius:"6px",
                            cursor:"pointer"
                        }}
                    >
                        + Create New Poll
                    </button>
                </div>

                <div style={{marginTop:"25px"}}>
                    <h2>My Polls</h2>

                    {loading&&(
                        <p>
                            Loading polls...
                        </p>
                    )}

                    {!loading&&polls.length===0&&(
                        <div
                            style={{
                                background:"#ffffff",
                                padding:"25px",
                                borderRadius:"12px"
                            }}
                        >
                            <p>
                                You have not created any polls yet.
                            </p>
                        </div>
                    )}

                    {polls.map(poll=>(
                        <div
                            key={poll.id}
                            style={{
                                background:"#ffffff",
                                padding:"20px",
                                marginBottom:"15px",
                                borderRadius:"12px",
                                boxShadow:"0 2px 10px rgba(0,0,0,0.08)"
                            }}
                        >
                            <h3>
                                {poll.question}
                            </h3>

                            <p>
                                Status:{" "}
                                <strong>
                                    {poll.isActive
                                        ?"Active"
                                        :"Closed"}
                                </strong>
                            </p>
                            <p>
    Total Votes: <strong>{poll.totalVotes||0}</strong>
</p>

                            <div>
                                <button
                                    onClick={()=>{
                                        navigate(
                                            `/poll/${poll.shareCode}`
                                        );
                                    }}
                                    style={{
                                        padding:"10px 16px",
                                        marginRight:"10px",
                                        border:"none",
                                        borderRadius:"6px",
                                        cursor:"pointer"
                                    }}
                                >
                                    Open Poll
                                </button>

                                <button
                                    onClick={()=>{
                                        copyPollLink(poll);
                                    }}
                                    style={{
                                        padding:"10px 16px",
                                        marginRight:"10px",
                                        border:"none",
                                        borderRadius:"6px",
                                        cursor:"pointer"
                                    }}
                                >
                                    Copy Link
                                </button>

                                <button
                                    onClick={()=>{
                                        closePoll(poll);
                                    }}
                                    disabled={!poll.isActive}
                                    style={{
                                        padding:"10px 16px",
                                        border:"none",
                                        borderRadius:"6px",
                                        cursor:poll.isActive
                                            ?"pointer"
                                            :"not-allowed"
                                    }}
                                >
                                    {poll.isActive
                                        ?"Close Poll"
                                        :"Poll Closed"}
                                </button>
                            </div>
                        </div>
                    ))}

                </div>

                {message&&(
                    <p
                        style={{
                            background:"#ffffff",
                            padding:"12px",
                            borderRadius:"7px"
                        }}
                    >
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
