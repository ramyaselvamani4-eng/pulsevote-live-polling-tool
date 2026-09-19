package main

import (
    "fmt"

    "live-polling-tool/backend/config"
    "live-polling-tool/backend/controllers"
    "live-polling-tool/backend/middleware"
    "live-polling-tool/backend/websocket"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    config.ConnectDatabase()
    config.ConnectRedis()

    router:=gin.Default()

   router.Use(cors.New(cors.Config{
    AllowOrigins:[]string{
        "http://localhost:5173",
    },
    AllowMethods:[]string{
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    },
    AllowHeaders:[]string{
        "Origin",
        "Content-Type",
        "Accept",
        "Authorization",
        "X-Voter-ID",
        "x-voter-id",
    },
    AllowCredentials:true,
}))

    router.GET("/api/health",func(c *gin.Context) {
        c.JSON(200,gin.H{
            "message":"PulseVote backend is running",
        })
    })

    router.POST(
        "/api/auth/signup",
        controllers.Signup,
    )

    router.POST(
        "/api/auth/login",
        controllers.Login,
    )

    router.POST(
        "/api/polls",
        middleware.AuthMiddleware(),
        controllers.CreatePoll,
    )

    router.GET(
        "/api/polls/:shareCode",
        controllers.GetPoll,
    )
	router.GET(
    "/api/polls/:shareCode/results",
    controllers.GetPollResults,
)

    router.GET(
        "/api/user-polls",
        middleware.AuthMiddleware(),
        controllers.GetUserPolls,
    )

    router.POST(
        "/api/polls/:shareCode/vote",
        controllers.VotePoll,
    )

    router.POST(
        "/api/polls/:shareCode/close",
        middleware.AuthMiddleware(),
        controllers.ClosePoll,
    )

    router.GET(
        "/ws/polls/:shareCode",
        func(c *gin.Context) {
            shareCode:=c.Param("shareCode")

            websocket.HandleWebSocket(
                c.Writer,
                c.Request,
                shareCode,
            )
        },
    )

    fmt.Println("PulseVote backend starting on port 8080...")

    err:=router.Run(":8080")

    if err!=nil {
        fmt.Println("Server error:",err)
    }
}