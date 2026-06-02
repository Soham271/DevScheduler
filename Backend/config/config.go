package config


type AppConfig struct {
	Port string
}

func LoadConfig() AppConfig {
	return AppConfig{
		Port: "8080",
	}
}
