package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
)

func SendEmail(to, subject, body string) error {
	sender := os.Getenv("EMAIL_SENDER")

	// 1. Try sending via Resend API (bypasses Render SMTP blocking)
	resendKey := os.Getenv("RESEND_API_KEY")
	if resendKey != "" {
		// If no custom domain sender is set, use Resend's default testing domain
		if sender == "" {
			sender = "DevFlow Scheduler <onboarding@resend.dev>"
		}

		payload := map[string]interface{}{
			"from":    sender,
			"to":      []string{to},
			"subject": subject,
			"text":    body,
		}

		payloadBytes, _ := json.Marshal(payload)
		req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewBuffer(payloadBytes))
		if err != nil {
			return fmt.Errorf("failed to create Resend request: %w", err)
		}

		req.Header.Set("Authorization", "Bearer "+resendKey)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{}
		resp, err := client.Do(req)
		if err != nil {
			return fmt.Errorf("failed to send email via Resend API: %w", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode >= 300 {
			return fmt.Errorf("Resend API rejected email. Status %d", resp.StatusCode)
		}

		log.Printf("✅ Email sent successfully via Resend API to %s (subject: %q)", to, subject)
		return nil
	}

	// 2. Fallback to standard Gmail SMTP (works locally, but blocked on Render)
	password := os.Getenv("EMAIL_PASSWORD")
	if sender == "" || password == "" {
		return fmt.Errorf("either RESEND_API_KEY or (EMAIL_SENDER + EMAIL_PASSWORD) must be set in environment")
	}

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"
	smtpAddr := smtpHost + ":" + smtpPort

	message := fmt.Sprintf(
		"From: %s\r\nTo: %s\r\nSubject: %s\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=\"utf-8\"\r\n\r\n%s",
		sender, to, subject, body,
	)

	auth := smtp.PlainAuth("", sender, password, smtpHost)
	err := smtp.SendMail(smtpAddr, auth, sender, []string{to}, []byte(message))
	if err != nil {
		return fmt.Errorf("failed to send email via SMTP to %s: %w", to, err)
	}

	log.Printf("✅ Email sent successfully via SMTP to %s (subject: %q)", to, subject)
	return nil
}
