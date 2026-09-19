package controllers

import (
    "context"
    "encoding/json"
    "fmt"
    "net/http"
    "time"

    "live-polling-tool/backend/config"
    "live-polling-tool/backend/models"
    "live-polling-tool/backend/websocket"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/v2/bson"
    "go.mongodb.org/mongo-driver/v2/mongo"
)

func VotePoll(c *gin.Context) {
    shareCode:=c.Param("shareCode")

    var input struct {
        OptionID string `json:"optionId"`
        VoterID string `json:"voterId"`
    }

    if err:=c.ShouldBindJSON(&input);err!=nil {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Invalid request",
        })
        return
    }

    if input.OptionID=="" {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Option ID is required",
        })
        return
    }

    voterID:=c.GetHeader("X-Voter-ID")

    if voterID=="" {
        voterID=input.VoterID
    }

    if voterID=="" {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Voter ID is required",
        })
        return
    }

    ctx,cancel:=context.WithTimeout(
        context.Background(),
        10*time.Second,
    )
    defer cancel()

    pollCollection:=config.DB.Collection("polls")

    var poll models.Poll

    err:=pollCollection.FindOne(
        ctx,
        bson.M{
            "shareCode":shareCode,
        },
    ).Decode(&poll)

    if err!=nil {
        c.JSON(http.StatusNotFound,gin.H{
            "error":"Poll not found",
        })
        return
    }

    if !poll.IsActive {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Poll is closed",
        })
        return
    }

    optionExists:=false

    for _,option:=range poll.Options {
        if option.ID==input.OptionID {
            optionExists=true
            break
        }
    }

    if !optionExists {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Invalid option",
        })
        return
    }

    votesCollection:=pollCollection.Database().Collection("votes")

    var existingVote bson.M

    err=votesCollection.FindOne(
        ctx,
        bson.M{
            "pollId":poll.ID,
            "voterId":voterID,
        },
    ).Decode(&existingVote)

    if err==nil {
        c.JSON(http.StatusConflict,gin.H{
            "error":"You have already voted in this poll",
        })
        return
    }

    if err!=mongo.ErrNoDocuments {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to check previous vote",
        })
        return
    }

    vote:=bson.M{
        "pollId":poll.ID,
        "optionId":input.OptionID,
        "voterId":voterID,
        "createdAt":time.Now(),
    }

    _,err=votesCollection.InsertOne(
        ctx,
        vote,
    )

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to save vote",
        })
        return
    }

    redisKey:="poll:"+shareCode+":results"

    err=config.RedisClient.HIncrBy(
        ctx,
        redisKey,
        input.OptionID,
        1,
    ).Err()

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to update live results",
        })
        return
    }

    message:=map[string]interface{}{
        "optionId":input.OptionID,
        "increment":1,
    }

    messageBytes,err:=json.Marshal(message)

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to create live update",
        })
        return
    }

    fmt.Println(
        "Sending WebSocket broadcast for:",
        shareCode,
    )

    websocket.Broadcast(
        shareCode,
        messageBytes,
    )

    c.JSON(http.StatusCreated,gin.H{
        "message":"Vote submitted successfully",
    })
}

func GetPollResults(c *gin.Context) {
    shareCode:=c.Param("shareCode")

    if shareCode=="" {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Share code is required",
        })
        return
    }

    ctx,cancel:=context.WithTimeout(
        context.Background(),
        10*time.Second,
    )
    defer cancel()

    redisKey:="poll:"+shareCode+":results"

    results,err:=config.RedisClient.HGetAll(
        ctx,
        redisKey,
    ).Result()

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to get poll results",
        })
        return
    }

    c.JSON(http.StatusOK,gin.H{
        "results":results,
    })
}
