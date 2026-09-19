
import {useEffect,useState} from "react";
import {connectToPoll} from "../services/websocket";

function Poll() {
    const [poll,setPoll]=useState(null);
    const [results,setResults]=useState({});
    const [message,setMessage]=useState("");
    const [voted,setVoted]=useState(false);

    const shareCode=window.location.pathname.split("/").pop();

    const getVoterID=()=>{
        let voterID=localStorage.getItem("pulsevote-voter-id");

        if(!voterID) {
            voterID="voter-"+Date.now()+"-"+Math.random().toString(36).substring(2);

            localStorage.setItem(
                "pulsevote-voter-id",
                voterID
            );
        }

        return voterID;
    };

    useEffect(()=>{
        const loadPoll=async()=>{
            try {
                const pollResponse=await fetch(
                    `http://localhost:8080/api/polls/${shareCode}`
                );

                const pollData=await pollResponse.json();

                if(!pollResponse.ok) {
                    setMessage(
                        pollData.error||"Poll not found"
                    );
                    return;
                }

                setPoll(pollData.poll);

                const resultsResponse=await fetch(
                    `http://localhost:8080/api/polls/${shareCode}/results`
                );

                const resultsData=await resultsResponse.json();

                const initialResults={};

                pollData.poll.options.forEach(option=>{
                    initialResults[option.id]=Number(
                        resultsData.results?.[option.id]||0
                    );
                });

                setResults(initialResults);
            } catch(error) {
                console.error(error);
                setMessage("Unable to load poll");
            }
        };

        loadPoll();

        const socket=connectToPoll(
            shareCode,
            (data)=>{
                setResults(previousResults=>({
                    ...previousResults,
                    [data.optionId]:
                        (previousResults[data.optionId]||0)
                        +data.increment
                }));
            }
        );

        return ()=>{
            socket.close();
        };
    },[shareCode]);

    const vote=async(optionId)=>{
        if(voted) {
            setMessage("You have already voted.");
            return;
        }

        if(!poll.isActive) {
            setMessage("This poll is closed.");
            return;
        }

        try {
            const voterID=getVoterID();

            console.log("Voter ID:",voterID);

            const response=await fetch(
                `http://localhost:8080/api/polls/${shareCode}/vote`,
                {
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                        "X-Voter-ID":voterID
                    },
                    body:JSON.stringify({
                        optionId:optionId,
                        voterId:voterID
                    })
                }
            );

            const data=await response.json();

            if(response.ok) {
                setVoted(true);
                setMessage("Vote submitted successfully!");
            } else if(response.status===409) {
                setVoted(true);
                setMessage(
                    data.error||
                    "You have already voted in this poll"
                );
            } else {
                setMessage(
                    data.error||
                    "Vote failed"
                );
            }
        } catch(error) {
            console.error(error);
            setMessage("Unable to submit vote");
        }
    };

    if(!poll) {
        return (
            <div
                style={{
                    minHeight:"100vh",
                    display:"flex",
                    justifyContent:"center",
                    alignItems:"center",
                    background:"#f5f7fb",
                    fontFamily:"Arial,sans-serif"
                }}
            >
                <h2>
                    {message||"Loading poll..."}
                </h2>
            </div>
        );
    }

    const totalVotes=Object.values(results).reduce(
        (total,value)=>total+Number(value),
        0
    );

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
                    maxWidth:"700px",
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
                    <div
                        style={{
                            display:"flex",
                            justifyContent:"space-between",
                            alignItems:"center"
                        }}
                    >
                        <h1>
                            PulseVote
                        </h1>

                        <span>
                            {poll.isActive
                                ?"Active"
                                :"Closed"}
                        </span>
                    </div>

                    <hr/>

                    <h2>
                        {poll.question}
                    </h2>

                    <p>
                        Total Votes: <strong>{totalVotes}</strong>
                        <button
    onClick={()=>{
        navigator.clipboard.writeText(window.location.href);
        setMessage("Poll link copied!");
    }}
    style={{
        padding:"10px 16px",
        border:"none",
        borderRadius:"7px",
        cursor:"pointer",
        marginBottom:"20px"
    }}
>
    Copy Share Link
</button>
                    </p>

                    {poll.options.map(option=>{
                        const votes=Number(
                            results[option.id]||0
                        );

                        const percentage=totalVotes===0
                            ?0
                            :Math.round(
                                (votes/totalVotes)*100
                            );

                        return (
                            <div
                                key={option.id}
                                style={{
                                    marginBottom:"20px"
                                }}
                            >
                                <button
                                    onClick={()=>{
                                        vote(option.id);
                                    }}
                                    disabled={
                                        !poll.isActive||voted
                                    }
                                    style={{
                                        width:"100%",
                                        padding:"14px",
                                        textAlign:"left",
                                        border:"1px solid #ccc",
                                        borderRadius:"8px",
                                        background:"#ffffff",
                                        cursor:
                                            poll.isActive&&!voted
                                                ?"pointer"
                                                :"not-allowed"
                                    }}
                                >
                                    <strong>
                                        {option.text}
                                    </strong>

                                    <span
                                        style={{
                                            float:"right"
                                        }}
                                    >
                                        {votes} votes
                                    </span>
                                </button>

                                <div
                                    style={{
                                        marginTop:"7px",
                                        background:"#e9ecef",
                                        height:"10px",
                                        borderRadius:"5px",
                                        overflow:"hidden"
                                    }}
                                >
                                    <div
                                        style={{
                                            width:`${percentage}%`,
                                            height:"100%"
                                        }}
                                    />
                                </div>

                                <p
                                    style={{
                                        margin:"5px 0 0"
                                    }}
                                >
                                    {percentage}%
                                </p>
                            </div>
                        );
                    })}

                    {message&&(
                        <p>
                            {message}
                        </p>
                    )}

                    {!poll.isActive&&(
                        <p>
                            This poll is closed.
                            Voting is no longer available.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Poll;

