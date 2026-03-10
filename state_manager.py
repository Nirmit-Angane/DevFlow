import json
import os
import sys

STATE_FILE = "state.json"

def _load_state():
    if not os.path.exists(STATE_FILE):
        return {"phase": "idle", "product": {}, "design_directions": [], "approved_direction": None, "errors": [], "learnings": []}
    with open(STATE_FILE, "r") as f:
        return json.load(f)

def _save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=4)

def status():
    state = _load_state()
    print(f"Current phase: {state['phase']}")
    return state['phase']

def set_product(name, product_type, core_problem, target_audience, emotional_words):
    state = _load_state()
    state["product"] = {
        "name": name,
        "product_type": product_type,
        "core_problem": core_problem,
        "target_audience": target_audience,
        "emotional_words": emotional_words
    }
    _save_state(state)

def transition(new_phase):
    state = _load_state()
    state["phase"] = new_phase
    _save_state(state)

def add_design_direction(direction):
    state = _load_state()
    state["design_directions"].append(direction)
    _save_state(state)

def approve_direction(n, source="generated"):
    state = _load_state()
    state["approved_direction"] = {"index": n, "source": source}
    _save_state(state)

def record_error(error, layer, fix_applied):
    state = _load_state()
    state["errors"].append({"error": error, "layer": layer, "fix_applied": fix_applied})
    _save_state(state)

def record_learning(learning):
    state = _load_state()
    state["learnings"].append(learning)
    _save_state(state)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "status":
        status()
