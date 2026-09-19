package config

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

var DB *mongo.Database

func ConnectDatabase() {
	err:=godotenv.Load(".env")

	if err!=nil {
		fmt.Println("Warning: .env file not found")
	}

	mongoURI:=os.Getenv("MONGO_URI")

	if mongoURI=="" {
		fmt.Println("MONGO_URI is missing")
		return
	}

	client,err:=mongo.Connect(options.Client().ApplyURI(mongoURI))

	if err!=nil {
		fmt.Println("MongoDB connection error:",err)
		return
	}

	ctx,cancel:=context.WithTimeout(context.Background(),10*time.Second)
	defer cancel()

	err=client.Ping(ctx,nil)

	if err!=nil {
		fmt.Println("MongoDB ping error:",err)
		return
	}

	DB=client.Database("pulsevote")

	fmt.Println("MongoDB connected successfully!")
}