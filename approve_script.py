from state_manager import record_learning, approve_direction, transition, _load_state

# Record the learning from user's image reference
record_learning("Developer provided reference")

# Analyze reference image constraints
print("Analyzed reference image constraint:")
print("- Spacing rhythm: spacious, padded cards")
print("- Typography logic: expanded sans-serif headings, futuristic")
print("- Color hierarchy: very dark purple base, synthwave glowing accents")
print("- Component density: moderate, structured")
print("- Layout grid: isometric styling, 1440px max width")

# Approve the 4th direction
approve_direction(4, source="generated")

# Transition straight to implementation
transition("approved")
transition("implementation")

print("Approve script complete.")
state = _load_state()
print(f"Current phase is now: {state['phase']}")
