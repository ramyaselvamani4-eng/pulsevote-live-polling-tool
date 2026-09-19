package controllers

import (
    "context"
    "net/http"
    "strings"
    "time"

    "live-polling-tool/backend/config"
    "live-polling-tool/backend/models"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/v2/bson"
)

func CreatePoll(c *gin.Context) {
    var input struct {
        Question string `json:"question"`
        Options []string `json:"options"`
    }

    if err:=c.ShouldBindJSON(&input);err!=nil {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid request"})
        return
    }

    input.Question=strings.TrimSpace(input.Question)

    if input.Question=="" {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Question is required"})
        return
    }

    if len(input.Options)<2 {
        c.JSON(http.StatusBadRequest,gin.H{"error":"At least 2 options are required"})
        return
    }

    userIDString,exists:=c.Get("userId")

    if !exists {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"User not authenticated",
        })
        return
    }

    userID,err:=bson.ObjectIDFromHex(userIDString.(string))

    if err!=nil {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"Invalid user ID",
        })
        return
    }

    options:=make([]models.PollOption,0,len(input.Options))

    for _,text:=range input.Options {
        text=strings.TrimSpace(text)

        if text=="" {
            c.JSON(http.StatusBadRequest,gin.H{
                "error":"Option cannot be empty",
            })
            return
        }

        options=append(options,models.PollOption{
            ID:bson.NewObjectID().Hex(),
            Text:text,
        })
    }

    now:=time.Now()

    poll:=models.Poll{
        ID:bson.NewObjectID(),
        Question:input.Question,
        Options:options,
        CreatedBy:userID,
        ShareCode:bson.NewObjectID().Hex(),
        IsActive:true,
        CreatedAt:now,
        UpdatedAt:now,
    }

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    collection:=config.DB.Collection("polls")

    result,err:=collection.InsertOne(ctx,poll)

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to create poll",
        })
        return
    }

    c.JSON(http.StatusCreated,gin.H{
        "message":"Poll created successfully",
        "pollId":result.InsertedID,
        "shareCode":poll.ShareCode,
        "poll":poll,
    })
}

func GetPoll(c *gin.Context) {
    shareCode:=c.Param("shareCode")

    if shareCode=="" {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Share code is required",
        })
        return
    }

    collection:=config.DB.Collection("polls")

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    var poll models.Poll

    err:=collection.FindOne(
        ctx,
        bson.M{"shareCode":shareCode},
    ).Decode(&poll)

    if err!=nil {
        c.JSON(http.StatusNotFound,gin.H{
            "error":"Poll not found",
        })
        return
    }

    c.JSON(http.StatusOK,gin.H{
        "poll":poll,
    })
}

func GetUserPolls(c *gin.Context) {
    userIDString,exists:=c.Get("userId")

    if !exists {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"User not authenticated",
        })
        return
    }

    userID,err:=bson.ObjectIDFromHex(userIDString.(string))

    if err!=nil {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"Invalid user ID",
        })
        return
    }

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    collection:=config.DB.Collection("polls")

    cursor,err:=collection.Find(
        ctx,
        bson.M{"createdBy":userID},
    )

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to get polls",
        })
        return
    }

    defer cursor.Close(ctx)

    var polls []models.Poll

    if err=cursor.All(ctx,&polls);err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to read polls",
        })
        return
    }

    if polls==nil {
        polls=[]models.Poll{}
    }

    c.JSON(http.StatusOK,gin.H{
        "polls":polls,
    })
}

func ClosePoll(c *gin.Context) {
    shareCode:=c.Param("shareCode")

    userIDString,exists:=c.Get("userId")

    if !exists {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"User not authenticated",
        })
        return
    }

    userID,err:=bson.ObjectIDFromHex(userIDString.(string))

    if err!=nil {
        c.JSON(http.StatusUnauthorized,gin.H{
            "error":"Invalid user ID",
        })
        return
    }

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    collection:=config.DB.Collection("polls")

    var poll models.Poll

    err=collection.FindOne(
        ctx,
        bson.M{"shareCode":shareCode},
    ).Decode(&poll)

    if err!=nil {
        c.JSON(http.StatusNotFound,gin.H{
            "error":"Poll not found",
        })
        return
    }

    if poll.CreatedBy!=userID {
        c.JSON(http.StatusForbidden,gin.H{
            "error":"You are not allowed to close this poll",
        })
        return
    }

    if !poll.IsActive {
        c.JSON(http.StatusBadRequest,gin.H{
            "error":"Poll is already closed",
        })
        return
    }

    result,err:=collection.UpdateOne(
        ctx,
        bson.M{
            "shareCode":shareCode,
            "createdBy":userID,
        },
        bson.M{
            "$set":bson.M{
                "isActive":false,
                "updatedAt":time.Now(),
            },
        },
    )

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{
            "error":"Failed to close poll",
        })
        return
    }

    if result.MatchedCount==0 {
        c.JSON(http.StatusNotFound,gin.H{
            "error":"Poll not found",
        })
        return
    }

    c.JSON(http.StatusOK,gin.H{
        "message":"Poll closed successfully",
    })
}