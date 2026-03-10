from state_manager import set_product, transition

print("Setting product context...")
set_product(
    name="DevFlow",
    product_type="Visual Software Architecture Planner",
    core_problem="Developers struggle to clearly plan application architecture, workflows, and feature logic before coding, leading to messy projects and inefficient AI-assisted development.",
    target_audience="Developers, indie hackers, startup founders, and hackathon builders using AI IDEs.",
    emotional_words=["Structured", "Retro", "Playful"]
)

transition("exploration")
print("Transitioned to exploration phase.")
