package services

import (
	"encoding/json"
	"log"
	"sync"

	"devflow-scheduler/model"
)









var ActivityHub *SSEHub


type SSEHub struct {
	mu      sync.RWMutex
	clients map[chan string]bool
}


func NewSSEHub() *SSEHub {
	return &SSEHub{
		clients: make(map[chan string]bool),
	}
}



func (h *SSEHub) Register(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[ch] = true
	log.Printf("📡 [SSE Hub] Client connected (%d total)", len(h.clients))
}


func (h *SSEHub) Unregister(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clients[ch]; ok {
		delete(h.clients, ch)
		close(ch)
		log.Printf("📡 [SSE Hub] Client disconnected (%d remaining)", len(h.clients))
	}
}



func (h *SSEHub) Broadcast(activity *model.Activity) {
	data, err := json.Marshal(activity)
	if err != nil {
		log.Printf("❌ [SSE Hub] Failed to marshal activity: %v", err)
		return
	}

	msg := string(data)

	h.mu.RLock()
	defer h.mu.RUnlock()

	for ch := range h.clients {
		
		select {
		case ch <- msg:
		default:
			log.Println("⚠️ [SSE Hub] Skipped slow client")
		}
	}
}


func (h *SSEHub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
