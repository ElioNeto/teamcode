package updater

// Updater maintains per-session message state and processes incoming events
// to build a consolidated conversation view.
//
// Parity with: packages/core/src/session-message-updater.ts
type Updater struct {
	messages []Message
}

// New creates an empty Updater.
func New() *Updater {
	return &Updater{
		messages: make([]Message, 0),
	}
}

// Messages returns the current list of consolidated messages.
func (u *Updater) Messages() []Message {
	return u.messages
}

// ProcessEvent processes a raw session event and updates the internal state.
// It returns the updated messages after processing.
//
// Parity with: update() in session-message-updater.ts
func (u *Updater) ProcessEvent(ev SessionEvent) []Message {
	switch ev.Type {
	case "session.next.agent.switched":
		u.handleAgentSwitched(ev)
	case "session.next.model.switched":
		u.handleModelSwitched(ev)
	case "session.next.prompted":
		u.handlePrompted(ev)
	case "session.next.synthetic":
		u.handleSynthetic(ev)
	case "session.next.shell.started":
		u.handleShellStarted(ev)
	case "session.next.shell.ended":
		u.handleShellEnded(ev)
	case "session.next.step.started":
		u.handleStepStarted(ev)
	case "session.next.step.ended":
		u.handleStepEnded(ev)
	case "session.next.step.failed":
		u.handleStepFailed(ev)
	case "session.next.text.started":
		u.handleTextStarted(ev)
	case "session.next.text.delta":
		u.handleTextDelta(ev)
	case "session.next.text.ended":
		u.handleTextEnded(ev)
	case "session.next.tool.input.started":
		u.handleToolInputStarted(ev)
	case "session.next.tool.input.delta":
		u.handleToolInputDelta(ev)
	case "session.next.tool.called":
		u.handleToolCalled(ev)
	case "session.next.tool.progress":
		u.handleToolProgress(ev)
	case "session.next.tool.success":
		u.handleToolSuccess(ev)
	case "session.next.tool.failed":
		u.handleToolFailed(ev)
	case "session.next.reasoning.started":
		u.handleReasoningStarted(ev)
	case "session.next.reasoning.delta":
		u.handleReasoningDelta(ev)
	case "session.next.reasoning.ended":
		u.handleReasoningEnded(ev)
	case "session.next.compaction.started":
		u.handleCompactionStarted(ev)
	case "session.next.compaction.delta":
		u.handleCompactionDelta(ev)
	case "session.next.compaction.ended":
		u.handleCompactionEnded(ev)
	// session.next.tool.input.ended and session.next.retried are no-ops
	}
	return u.messages
}

// --- helpers ---

func (u *Updater) activeAssistantIndex() int {
	for i := len(u.messages) - 1; i >= 0; i-- {
		m := u.messages[i]
		if m.Type == "assistant" && m.Time.Completed == nil {
			return i
		}
	}
	return -1
}

func (u *Updater) activeCompactionIndex() int {
	for i := len(u.messages) - 1; i >= 0; i-- {
		if u.messages[i].Type == "compaction" {
			return i
		}
	}
	return -1
}

func (u *Updater) activeShellIndex(callID string) int {
	for i := len(u.messages) - 1; i >= 0; i-- {
		m := u.messages[i]
		if m.Type == "shell" && m.CallID == callID {
			return i
		}
	}
	return -1
}

func (u *Updater) latestTool(callID string) *ContentBlock {
	idx := u.activeAssistantIndex()
	if idx < 0 {
		return nil
	}
	content := u.messages[idx].Content
	for i := len(content) - 1; i >= 0; i-- {
		if content[i].Type == "tool" && (callID == "" || content[i].ID == callID) {
			return &content[i]
		}
	}
	return nil
}

func (u *Updater) latestText() *ContentBlock {
	idx := u.activeAssistantIndex()
	if idx < 0 {
		return nil
	}
	content := u.messages[idx].Content
	for i := len(content) - 1; i >= 0; i-- {
		if content[i].Type == "text" {
			return &content[i]
		}
	}
	return nil
}

func (u *Updater) latestReasoning(reasoningID string) *ContentBlock {
	idx := u.activeAssistantIndex()
	if idx < 0 {
		return nil
	}
	content := u.messages[idx].Content
	for i := len(content) - 1; i >= 0; i-- {
		if content[i].Type == "reasoning" && content[i].ID == reasoningID {
			return &content[i]
		}
	}
	return nil
}

func (u *Updater) updateAssistant(fn func(m *Message)) {
	idx := u.activeAssistantIndex()
	if idx < 0 {
		return
	}
	if u.messages[idx].Type != "assistant" {
		return
	}
	fn(&u.messages[idx])
}

// --- event handlers ---

func (u *Updater) handleAgentSwitched(ev SessionEvent) {
	u.messages = append(u.messages, Message{
		Type:     "agent-switched",
		ID:       ev.ID,
		Metadata: ev.Metadata,
		Agent:    ev.Data.Agent,
		Time:     MessageTime{Created: ev.Data.Timestamp},
	})
}

func (u *Updater) handleModelSwitched(ev SessionEvent) {
	u.messages = append(u.messages, Message{
		Type:     "model-switched",
		ID:       ev.ID,
		Metadata: ev.Metadata,
		Model:    ev.Data.Model,
		Time:     MessageTime{Created: ev.Data.Timestamp},
	})
}

func (u *Updater) handlePrompted(ev SessionEvent) {
	msg := Message{
		Type: "user",
		ID:   ev.ID,
		Time: MessageTime{Created: ev.Data.Timestamp},
	}
	if ev.Data.Prompt != nil {
		msg.Text = ev.Data.Prompt.Text
		msg.Files = ev.Data.Prompt.Files
		msg.Agents = ev.Data.Prompt.Agents
		msg.References = ev.Data.Prompt.References
	}
	u.messages = append(u.messages, msg)
}

func (u *Updater) handleSynthetic(ev SessionEvent) {
	u.messages = append(u.messages, Message{
		Type:      "synthetic",
		ID:        ev.ID,
		SessionID: ev.Data.SessionID,
		Text:      ev.Data.Text,
		Time:      MessageTime{Created: ev.Data.Timestamp},
	})
}

func (u *Updater) handleShellStarted(ev SessionEvent) {
	u.messages = append(u.messages, Message{
		Type:    "shell",
		ID:      ev.ID,
		CallID:  ev.Data.CallID,
		Command: ev.Data.Command,
		Output:  "",
		Time:    MessageTime{Created: ev.Data.Timestamp},
	})
}

func (u *Updater) handleShellEnded(ev SessionEvent) {
	idx := u.activeShellIndex(ev.Data.CallID)
	if idx < 0 {
		return
	}
	u.messages[idx].Output = ev.Data.Output
	completed := ev.Data.Timestamp
	u.messages[idx].Time.Completed = &completed
}

func (u *Updater) handleStepStarted(ev SessionEvent) {
	// Close the previous assistant if it was incomplete
	u.updateAssistant(func(m *Message) {
		completed := ev.Data.Timestamp
		m.Time.Completed = &completed
	})

	msg := Message{
		Type:  "assistant",
		ID:    ev.ID,
		Agent: ev.Data.Agent,
		Model: ev.Data.Model,
		Time:  MessageTime{Created: ev.Data.Timestamp},
	}
	if ev.Data.Snapshot != "" {
		msg.Snapshot = &Snapshot{Start: ev.Data.Snapshot}
	}
	u.messages = append(u.messages, msg)
}

func (u *Updater) handleStepEnded(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		completed := ev.Data.Timestamp
		m.Time.Completed = &completed
		m.Finish = ev.Data.Finish
		m.Cost = ev.Data.Cost
		m.Tokens = ev.Data.Tokens
		if ev.Data.Snapshot != "" {
			if m.Snapshot == nil {
				m.Snapshot = &Snapshot{}
			}
			m.Snapshot.End = ev.Data.Snapshot
		}
	})
}

func (u *Updater) handleStepFailed(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		completed := ev.Data.Timestamp
		m.Time.Completed = &completed
		m.Finish = "error"
		m.Error = ev.Data.Error
	})
}

func (u *Updater) handleTextStarted(_ SessionEvent) {
	u.updateAssistant(func(m *Message) {
		m.Content = append(m.Content, ContentBlock{Type: "text", Text: ""})
	})
}

func (u *Updater) handleTextDelta(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestText()
		if block != nil {
			block.Text += ev.Data.Delta
		}
	})
}

func (u *Updater) handleTextEnded(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestText()
		if block != nil {
			block.Text = ev.Data.Text
		}
	})
}

func (u *Updater) handleToolInputStarted(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		m.Content = append(m.Content, ContentBlock{
			Type:   "tool",
			ID:     ev.Data.CallID,
			Name:   ev.Data.Name,
			ToolTime: &ToolTime{Created: ev.Data.Timestamp},
			State: &ToolState{
				Status: "pending",
				Input:  "",
			},
		})
	})
}

func (u *Updater) handleToolInputDelta(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestTool(ev.Data.CallID)
		if block != nil && block.State != nil && block.State.Status == "pending" {
			input, ok := block.State.Input.(string)
			if !ok {
				input = ""
			}
			block.State.Input = input + ev.Data.Delta
		}
	})
}

func (u *Updater) handleToolCalled(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestTool(ev.Data.CallID)
		if block != nil {
			block.Provider = ev.Data.Provider
			ran := ev.Data.Timestamp
			block.ToolTime.Ran = &ran
			block.State = &ToolState{
				Status:     "running",
				Input:      ev.Data.Input,
				Structured: make(map[string]any),
				Content:    make([]any, 0),
			}
		}
	})
}

func (u *Updater) handleToolProgress(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestTool(ev.Data.CallID)
		if block != nil && block.State != nil && block.State.Status == "running" {
			block.State.Structured = ev.Data.Structured
			block.State.Content = ev.Data.Content
		}
	})
}

func (u *Updater) handleToolSuccess(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestTool(ev.Data.CallID)
		if block != nil && block.State != nil && block.State.Status == "running" {
			block.Provider = ev.Data.Provider
			completed := ev.Data.Timestamp
			block.ToolTime.Completed = &completed
			block.State = &ToolState{
				Status:     "completed",
				Input:      block.State.Input,
				Structured: ev.Data.Structured,
				Content:    ev.Data.Content,
			}
		}
	})
}

func (u *Updater) handleToolFailed(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestTool(ev.Data.CallID)
		if block != nil && block.State != nil && block.State.Status == "running" {
			block.Provider = ev.Data.Provider
			completed := ev.Data.Timestamp
			block.ToolTime.Completed = &completed
			block.State = &ToolState{
				Status:     "error",
				Input:      block.State.Input,
				Structured: block.State.Structured,
				Content:    block.State.Content,
				Error:      ev.Data.Error,
			}
		}
	})
}

func (u *Updater) handleReasoningStarted(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		m.Content = append(m.Content, ContentBlock{
			Type: "reasoning",
			ID:   ev.Data.ReasoningID,
			Text: "",
		})
	})
}

func (u *Updater) handleReasoningDelta(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestReasoning(ev.Data.ReasoningID)
		if block != nil {
			block.Text += ev.Data.Delta
		}
	})
}

func (u *Updater) handleReasoningEnded(ev SessionEvent) {
	u.updateAssistant(func(m *Message) {
		block := u.latestReasoning(ev.Data.ReasoningID)
		if block != nil {
			block.Text = ev.Data.Text
		}
	})
}

func (u *Updater) handleCompactionStarted(ev SessionEvent) {
	u.messages = append(u.messages, Message{
		Type:    "compaction",
		ID:      ev.ID,
		Reason:  ev.Data.Reason,
		Summary: "",
		Time:    MessageTime{Created: ev.Data.Timestamp},
	})
}

func (u *Updater) handleCompactionDelta(ev SessionEvent) {
	idx := u.activeCompactionIndex()
	if idx < 0 {
		return
	}
	u.messages[idx].Summary += ev.Data.Text
}

func (u *Updater) handleCompactionEnded(ev SessionEvent) {
	idx := u.activeCompactionIndex()
	if idx < 0 {
		return
	}
	u.messages[idx].Summary = ev.Data.Text
	u.messages[idx].Include = ev.Data.Include
}
