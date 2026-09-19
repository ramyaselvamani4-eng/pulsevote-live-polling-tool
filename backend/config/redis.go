package config

import (
	"context"
	"fmt"
	"os"

	"github.com/redis/go-redis/v9"
)

var RedisClient *redis.Client

func ConnectRedis() {
	redisURL:=os.Getenv("REDIS_URL")

	if redisURL=="" {
		redisURL="redis://localhost:6379"
	}

	opt,err:=redis.ParseURL(redisURL)

	if err!=nil {
		fmt.Println("Redis URL error:",err)
		return
	}

	RedisClient=redis.NewClient(opt)

	err=RedisClient.Ping(context.Background()).Err()

	if err!=nil {
		fmt.Println("Redis connection error:",err)
		return
	}

	fmt.Println("Redis connected successfully!")
}