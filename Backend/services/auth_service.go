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

// ──────────────────────────────────────────────
// Signup / Login
// ──────────────────────────────────────────────

// CreateUser hashes the password and stores the user.
// Returns an error if the email is already registered.
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

// AuthenticateUser checks credentials and returns a JWT on success.
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

// ──────────────────────────────────────────────
// JWT helpers
// ──────────────────────────────────────────────

// GenerateJWT creates a signed token valid for 24 hours.
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

// ValidateJWT parses and validates the token, returning the claims.
func ValidateJWT(tokenStr string) (jwt.MapClaims, error) {
	secret := getJWTSecret()

	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		// Ensure signing method is HMAC
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

// getJWTSecret reads the secret from the environment variable.
func getJWTSecret() string {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "devflow-default-secret-change-me" // fallback for dev
	}
	return secret
}
