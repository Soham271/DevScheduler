package services

import (
	"encoding/json"
	"log"
	"sync"

	"devflow-scheduler/model"
)

// ═══════════════════════════════════════════════════════════════
//  SSE Hub — Thread-safe broadcast hub for Server-Sent Events.
//  Manages connected client channels and broadcasts new
//  activities to all listeners in real time.
// ═══════════════════════════════════════════════════════════════

// ActivityHub is the global SSE hub instance.
// Initialized in main.go before workers start.
var ActivityHub *SSEHub

// SSEHub manages a set of connected SSE client channels.
type SSEHub struct {
	mu      sync.RWMutex
	clients map[chan string]bool
}

// NewSSEHub creates a new SSE hub ready to accept clients.
func NewSSEHub() *SSEHub {
	return &SSEHub{
		clients: make(map[chan string]bool),
	}
}

// Register adds a new client channel to the hub.
// Returns the channel that the SSE handler should read from.
func (h *SSEHub) Register(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.clients[ch] = true
	log.Printf("📡 [SSE Hub] Client connected (%d total)", len(h.clients))
}

// Unregister removes a client channel from the hub and closes it.
func (h *SSEHub) Unregister(ch chan string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if _, ok := h.clients[ch]; ok {
		delete(h.clients, ch)
		close(ch)
		log.Printf("📡 [SSE Hub] Client disconnected (%d remaining)", len(h.clients))
	}
}

// Broadcast sends an activity as a JSON string to all connected clients.
// Non-blocking: if a client's channel is full, it is skipped.
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
		// Non-blocking send — skip slow clients instead of blocking the hub
		select {
		case ch <- msg:
		default:
			log.Println("⚠️ [SSE Hub] Skipped slow client")
		}
	}
}

// ClientCount returns the number of currently connected clients.
func (h *SSEHub) ClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
