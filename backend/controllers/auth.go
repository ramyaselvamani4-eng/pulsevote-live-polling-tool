package controllers

import (
    "context"
    "net/http"
    "strings"
    "time"

    "live-polling-tool/backend/config"
    "live-polling-tool/backend/models"
    "live-polling-tool/backend/utils"

    "github.com/gin-gonic/gin"
    "go.mongodb.org/mongo-driver/v2/bson"
    "go.mongodb.org/mongo-driver/v2/mongo"
    "golang.org/x/crypto/bcrypt"
)

func Signup(c *gin.Context) {
    var input struct {
        Name string `json:"name"`
        Email string `json:"email"`
        Password string `json:"password"`
    }

    if err:=c.ShouldBindJSON(&input);err!=nil {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid request"})
        return
    }

    input.Name=strings.TrimSpace(input.Name)
    input.Email=strings.ToLower(strings.TrimSpace(input.Email))

    if input.Name==""||input.Email==""||input.Password=="" {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Name, email and password are required"})
        return
    }

    if len(input.Password)<6 {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Password must be at least 6 characters"})
        return
    }

    collection:=config.DB.Collection("users")

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    var existingUser models.User

    err:=collection.FindOne(ctx,bson.M{"email":input.Email}).Decode(&existingUser)

    if err==nil {
        c.JSON(http.StatusConflict,gin.H{"error":"Email already registered"})
        return
    }

    if err!=mongo.ErrNoDocuments {
        c.JSON(http.StatusInternalServerError,gin.H{"error":"Database error"})
        return
    }

    hashedPassword,err:=bcrypt.GenerateFromPassword([]byte(input.Password),bcrypt.DefaultCost)

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{"error":"Password hashing failed"})
        return
    }

    user:=models.User{
        Name:input.Name,
        Email:input.Email,
        Password:string(hashedPassword),
        CreatedAt:time.Now(),
    }

    _,err=collection.InsertOne(ctx,user)

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to create user"})
        return
    }

    c.JSON(http.StatusCreated,gin.H{
        "message":"User registered successfully",
        "userId":user.ID.Hex(),
    })
}

func Login(c *gin.Context) {
    var input struct {
        Email string `json:"email"`
        Password string `json:"password"`
    }

    if err:=c.ShouldBindJSON(&input);err!=nil {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Invalid request"})
        return
    }

    input.Email=strings.ToLower(strings.TrimSpace(input.Email))

    if input.Email==""||input.Password=="" {
        c.JSON(http.StatusBadRequest,gin.H{"error":"Email and password are required"})
        return
    }

    collection:=config.DB.Collection("users")

    ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
    defer cancel()

    var user models.User

    err:=collection.FindOne(ctx,bson.M{"email":input.Email}).Decode(&user)

    if err==mongo.ErrNoDocuments {
        c.JSON(http.StatusUnauthorized,gin.H{"error":"Invalid email or password"})
        return
    }

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{"error":"Database error"})
        return
    }

    err=bcrypt.CompareHashAndPassword([]byte(user.Password),[]byte(input.Password))

    if err!=nil {
        c.JSON(http.StatusUnauthorized,gin.H{"error":"Invalid email or password"})
        return
    }

    token,err:=utils.GenerateToken(user.ID.Hex())

    if err!=nil {
        c.JSON(http.StatusInternalServerError,gin.H{"error":"Failed to generate token"})
        return
    }

    c.JSON(http.StatusOK,gin.H{
        "message":"Login successful",
        "token":token,
        "userId":user.ID,
        "name":user.Name,
        "email":user.Email,
    })
}