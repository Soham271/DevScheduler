package services

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
)

func SendEmail(to, subject, body string) error {

	sender := os.Getenv("EMAIL_SENDER")
	password := os.Getenv("EMAIL_PASSWORD")
	// read and password from enviorment variable
	if sender == "" || password == "" {
		return fmt.Errorf("EMAIL_SENDER and EMAIL_PASSWORD environment variables must be set")
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	smtpAddr := smtpHost + ":" + smtpPort
	// From :-=sender email
	// To :-=receiver email
	// Subject:=email Subject
	//MIME-Version + Content-Type → tells email client it's plain text UTF-8
	//\r\n\r\n → separates headers from body
	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=\"utf-8\"\r\n\r\n%s",
		sender, to, subject, body,
	)

	auth := smtp.PlainAuth("", sender, password, smtpHost)
	// user plain authentication , sender email, your email password
	err := smtp.SendMail(smtpAddr, auth, sender, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email to %s: %w", to, err)
	}

	log.Printf("✅ Email sent successfully to %s (subject: %q)", to, subject)
	return nil
}
