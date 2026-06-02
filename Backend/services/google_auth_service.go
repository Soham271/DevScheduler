package services

import (
	"context"
	"errors"
	"os"

	"devflow-scheduler/model"
	"devflow-scheduler/repository"
	"google.golang.org/api/idtoken"
)


type GoogleUserInfo struct {
	Email string `json:"email"`
	Name  string `json:"name"`
}



func VerifyGoogleIDToken(idToken string) (*GoogleUserInfo, error) {
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		return nil, errors.New("GOOGLE_CLIENT_ID environment variable is not set")
	}

	
	payload, err := idtoken.Validate(context.Background(), idToken, clientID)
	if err != nil {
		return nil, errors.New("invalid Google ID token: " + err.Error())
	}

	
	email, ok := payload.Claims["email"].(string)
	if !ok || email == "" {
		return nil, errors.New("email not found in Google token")
	}

	
	name, _ := payload.Claims["name"].(string)

	return &GoogleUserInfo{
		Email: email,
		Name:  name,
	}, nil
}


func GoogleLogin(idToken string) (string, *GoogleUserInfo, error) {
	
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



func FindOrCreateGoogleUser(email, name string) error {
	user, err := repository.GetUserByEmail(email)
	if err != nil {
		return err
	}

	if user == nil {
		newUser := model.User{
			Email: email,
			Name:  name,
			
		}
		return repository.CreateUser(newUser)
	}
	return nil
}
