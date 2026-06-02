package services

import (
	"errors"
	"os"
	"time"

	"devflow-scheduler/model"
	"devflow-scheduler/repository"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)







func CreateUser(email, password string) error {
	existingUser, err := repository.GetUserByEmail(email)
	if err != nil {
		return err
	}
	if existingUser != nil {
		return errors.New("user already exists")
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	newUser := model.User{
		Email:    email,
		Password: string(hashed),
	}
	
	return repository.CreateUser(newUser)
}


func AuthenticateUser(email, password string) (string, error) {
	user, err := repository.GetUserByEmail(email)
	if err != nil {
		return "", err
	}
	if user == nil {
		return "", errors.New("invalid email or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(password)); err != nil {
		return "", errors.New("invalid email or password")
	}

	return GenerateJWT(email)
}






func GenerateJWT(email string) (string, error) {
	secret := getJWTSecret()

	claims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(24 * time.Hour).Unix(),
		"iat":   time.Now().Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}


func ValidateJWT(tokenStr string) (jwt.MapClaims, error) {
	secret := getJWTSecret()

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("unexpected signing method")
		}
		return []byte(secret), nil
	})

	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}


func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "devflow-default-secret-change-me" 
	}
	return secret
}
