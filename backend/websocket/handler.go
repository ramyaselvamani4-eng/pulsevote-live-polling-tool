package websocket

import (
	"fmt"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader=websocket.Upgrader{
	CheckOrigin:func(r *http.Request) bool {
		return true
	},
}

var clients=make(map[string]map[*websocket.Conn]bool)

var mutex sync.Mutex

func HandleWebSocket(w http.ResponseWriter,r *http.Request,shareCode string) {
	conn,err:=upgrader.Upgrade(w,r,nil)

	if err!=nil {
		fmt.Println("WebSocket upgrade error:",err)
		return
	}

	mutex.Lock()

	if clients[shareCode]==nil {
		clients[shareCode]=make(map[*websocket.Conn]bool)
	}

	clients[shareCode][conn]=true

	fmt.Println("WebSocket client connected:",shareCode)
	fmt.Println("Clients for this poll:",len(clients[shareCode]))

	mutex.Unlock()

	defer func() {
		mutex.Lock()

		delete(clients[shareCode],conn)

		fmt.Println("WebSocket client disconnected:",shareCode)
		fmt.Println("Remaining clients:",len(clients[shareCode]))

		mutex.Unlock()

		conn.Close()
	}()

	for {
		_,_,err:=conn.ReadMessage()

		if err!=nil {
			break
		}
	}
}

func Broadcast(shareCode string,message []byte) {
	mutex.Lock()
	defer mutex.Unlock()

	fmt.Println("Broadcasting to clients:",len(clients[shareCode]))

	for conn:=range clients[shareCode] {
		err:=conn.WriteMessage(websocket.TextMessage,message)

		if err!=nil {
			fmt.Println("WebSocket write error:",err)
			conn.Close()
			delete(clients[shareCode],conn)
		}
	}
}