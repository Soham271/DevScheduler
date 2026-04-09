package services

import (
	"context"
	"errors"
	"os"

	"devflow-scheduler/model"
	"devflow-scheduler/repository"
	"google.golang.org/api/idtoken"
)

// GoogleUserInfo holds the user info extracted from a verified Google ID token.
type GoogleUserInfo struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}

// VerifyGoogleIDToken validates the Google ID token against the configured
// GOOGLE_CLIENT_ID audience and extracts the user's email and name.
func VerifyGoogleIDToken(idToken string) (*GoogleUserInfo, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		return nil, errors.New("GOOGLE_CLIENT_ID environment variable is not set")
	}

	// Validate the token with Google's servers
	payload, err := idtoken.Validate(context.Background(), idToken, clientID)
	if err != nil {
		return nil, errors.New("invalid Google ID token: " + err.Error())
	}

	// Extract email (required)
	email, ok := payload.Claims["email"].(string)
	if !ok || email == "" {
		return nil, errors.New("email not found in Google token")
	}

	// Extract name (optional)
	name, _ := payload.Claims["name"].(string)

	return &GoogleUserInfo{
		Email: email,
		Name:  name,
	}, nil
}

// GoogleLogin verifies the ID token, creates the user if new, and returns a JWT.
func GoogleLogin(idToken string) (string, *GoogleUserInfo, error) {
	// 1. Verify the Google ID token
	userInfo, err := VerifyGoogleIDToken(idToken)
	if err != nil {
		return "", nil, err
	}

	// 2. Create user if they don't exist (no password for OAuth users)
	err = FindOrCreateGoogleUser(userInfo.Email, userInfo.Name)
	if err != nil {
		return "", nil, err
	}

	// 3. Generate a JWT using the shared JWT system
	token, err := GenerateJWT(userInfo.Email)
	if err != nil {
		return "", nil, err
	}

	return token, userInfo, nil
}

// FindOrCreateGoogleUser adds the Google user to MongoDB if not
// already present. OAuth users have no password set.
func FindOrCreateGoogleUser(email, name string) error {
	user, err := repository.GetUserByEmail(email)
	if err != nil {
		return err
	}

	if user == nil {
		newUser := model.User{
			Email: email,
			Name:  name,
			// no password for Google OAuth users
		}
		return repository.CreateUser(newUser)
	}
	return nil
}
