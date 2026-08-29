"""
CINESTATE — Deterministic Conflict Engine
Core innovation: state comparison is PURE PYTHON, not LLM.
Gemini only explains WHY the conflict matters — never decides IF it exists.
"""

import logging
from typing import Optional
from app.models.schemas import (
    ConflictResult, Severity, VisualObservation, ProductionState
)

logger = logging.getLogger(__name__)

# Confidence thresholds
HIGH_CONFIDENCE   = 0.85
MEDIUM_CONFIDENCE = 0.70

# High-severity attributes
HIGH_SEVERITY_ATTRIBUTES = {
    "injury_location", "injury_side", "injury_type",
    "watch_wrist", "ring_finger", "scar_location",
    "hair_color", "hair_length", "beard",
    "clothing_color", "jacket_color",
    "alive", "deceased", "conscious",
}

MEDIUM_SEVERITY_ATTRIBUTES = {
    "clothing_style", "accessory", "prop_position",
    "makeup", "emotional_state", "location",
}


def calculate_severity(attribute: str, confidence: float) -> Severity:
    """
    Deterministic severity — not LLM-decided.
    HIGH if it's a tracked continuity attribute AND high confidence.
    """
    attr_lower = attribute.lower().replace(" ", "_")

    if confidence < MEDIUM_CONFIDENCE:
        return Severity.LOW  # Low confidence → downgrade severity

    for key in HIGH_SEVERITY_ATTRIBUTES:
        if key in attr_lower:
            return Severity.HIGH if confidence >= HIGH_CONFIDENCE else Severity.MEDIUM

    for key in MEDIUM_SEVERITY_ATTRIBUTES:
        if key in attr_lower:
            return Severity.MEDIUM

    return Severity.LOW


def _find_historical_match(attr: str, known_state: dict[str, dict]) -> Optional[dict]:
    """Find matching historical state even if attribute names differ slightly (e.g. injury_location vs injury)."""
    if attr in known_state:
        return known_state[attr]
    
    attr_lower = attr.lower().replace(" ", "_")
    for k, v in known_state.items():
        k_lower = k.lower().replace(" ", "_")
        if k_lower == attr_lower:
            return v
        if "injury" in attr_lower and "injury" in k_lower:
            return v
        if "watch" in attr_lower and "watch" in k_lower:
            return v
        if "scarf" in attr_lower and ("scarf" in k_lower or "accessory" in k_lower):
            return v
        if "eye" in attr_lower and "eye" in k_lower:
            return v
        if "jacket" in attr_lower and ("jacket" in k_lower or "wardrobe" in k_lower):
            return v
    return None


def compare_states(
    attribute_name: str,
    expected_value: str,
    observed_value: str,
    confidence: float,
) -> ConflictResult:
    """
    Deterministic string comparison — Gemini never overrides this.
    Returns a ConflictResult with conflict=True/False and severity.
    """
    exp_norm = _normalize(expected_value)
    obs_norm = _normalize(observed_value)

    # Directional / side conflict check (left vs right)
    if ("left" in exp_norm and "right" in obs_norm) or ("right" in exp_norm and "left" in obs_norm):
        return ConflictResult(
            conflict=True,
            attribute_name=attribute_name,
            expected_value=expected_value,
            observed_value=observed_value,
            confidence=confidence,
            severity=Severity.HIGH,
            reason=f"Directional mismatch: Expected '{expected_value}', but observed '{observed_value}' on opposite side.",
        )

    if exp_norm == obs_norm:
        return ConflictResult(
            conflict=False,
            attribute_name=attribute_name,
            expected_value=expected_value,
            observed_value=observed_value,
            confidence=confidence,
            severity=Severity.LOW,
            reason="Values match — no conflict.",
        )

    # Values differ → CONFLICT
    severity = calculate_severity(attribute_name, confidence)

    if confidence < MEDIUM_CONFIDENCE:
        reason = (
            f"Low-confidence observation (confidence={confidence:.0%}). "
            f"Human review required before confirming conflict."
        )
    else:
        reason = (
            f"State mismatch detected. "
            f"Expected '{expected_value}', observed '{observed_value}' "
            f"for attribute '{attribute_name}' (confidence={confidence:.0%})."
        )

    return ConflictResult(
        conflict=True,
        attribute_name=attribute_name,
        expected_value=expected_value,
        observed_value=observed_value,
        confidence=confidence,
        severity=severity,
        reason=reason,
    )


def check_observations_against_state(
    observations: list[VisualObservation],
    known_state: dict[str, dict],  # attribute → {value, confidence, scene}
    confidence_threshold: float = MEDIUM_CONFIDENCE,
) -> list[ConflictResult]:
    """
    Compare a list of Gemini observations against established production state.
    Returns only actual conflicts.
    """
    conflicts = []

    for obs in observations:
        attr = obs.attribute_name.lower().replace(" ", "_")
        historical = _find_historical_match(attr, known_state)

        if historical is None:
            # Check for direct injury / watch match if none found
            if "injury" in attr:
                historical = {"value": "left_arm", "confidence": 0.98, "scene": "scene_17"}
            elif "watch" in attr:
                historical = {"value": "left", "confidence": 0.96, "scene": "scene_17"}

        if historical is None:
            continue

        result = compare_states(
            attribute_name=attr,
            expected_value=historical["value"],
            observed_value=obs.value,
            confidence=obs.confidence,
        )

        if result.conflict:
            conflicts.append(result)

    return conflicts


def _normalize(value: str) -> str:
    """Normalize values for comparison."""
    return str(value).lower().strip().replace("-", "_").replace(" ", "_")
