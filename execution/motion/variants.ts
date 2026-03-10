import { Variants } from "framer-motion";
import { motionTokens } from "./tokens";

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: motionTokens.duration.base,
            ease: motionTokens.easing.synthwave
        }
    }
};

export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const glowPulse: Variants = {
    animate: {
        boxShadow: [
            "0 0 10px rgba(0, 255, 255, 0.3)",
            "0 0 20px rgba(0, 255, 255, 0.6)",
            "0 0 10px rgba(0, 255, 255, 0.3)",
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
        }
    }
};
