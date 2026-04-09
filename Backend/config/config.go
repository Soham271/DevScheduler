package config

// AppConfig holds the configuration settings for the scheduler
type AppConfig struct {
	Port string
}

func LoadConfig() AppConfig {
	return AppConfig{
		Port: "8080",
	}
}
