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


def compare_states(
    attribute_name: str,
    expected_value: str,
    observed_value: str,
    confidence: float,
) -> ConflictResult:
    """
    THE core function.
    Deterministic string comparison — Gemini never overrides this.
    
    Returns a ConflictResult with conflict=True/False and severity.
    """
    # Normalize for comparison (case, whitespace)
    exp_norm = _normalize(expected_value)
    obs_norm = _normalize(observed_value)

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

    logger.info(
        "Conflict detected",
        extra={
            "attribute": attribute_name,
            "expected": expected_value,
            "observed": observed_value,
            "severity": severity,
            "confidence": confidence,
        },
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
    
    Architecture:
    Gemini extracts observations → this function compares deterministically
    → conflicts returned → Gemini explains (separately)
    """
    conflicts = []

    for obs in observations:
        attr = obs.attribute_name.lower().replace(" ", "_")
        historical = known_state.get(attr) or known_state.get(obs.attribute_name)

        if historical is None:
            # No prior state — this observation ESTABLISHES state, not a conflict
            logger.debug(f"New state established: {attr}={obs.value}")
            continue

        if obs.confidence < confidence_threshold:
            # Confidence too low → flag for human review, not auto-conflict
            logger.info(
                f"Low-confidence observation for {attr}: "
                f"conf={obs.confidence:.2f} < threshold={confidence_threshold:.2f}"
            )
            conflicts.append(ConflictResult(
                conflict=True,
                attribute_name=attr,
                expected_value=historical["value"],
                observed_value=obs.value,
                confidence=obs.confidence,
                severity=Severity.LOW,
                reason=(
                    f"LOW CONFIDENCE ({obs.confidence:.0%}) — human review required. "
                    f"Cannot auto-confirm conflict."
                ),
            ))
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
    return value.lower().strip().replace("-", "_").replace(" ", "_")
