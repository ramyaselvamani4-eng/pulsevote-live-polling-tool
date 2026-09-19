export function connectToPoll(shareCode,onMessage) {
    const socket=new WebSocket(
        `ws://localhost:8080/ws/polls/${shareCode}`
    );

    socket.onopen=()=>{
        console.log("WebSocket connected");
    };

    socket.onmessage=(event)=>{
        const data=JSON.parse(event.data);
        onMessage(data);
    };

    socket.onerror=(error)=>{
        console.error("WebSocket error:",error);
    };

    socket.onclose=()=>{
        console.log("WebSocket disconnected");
    };

    return socket;
}