"""Change Signal Monitor for AI Evergreen Control Plane.

Normalizes raw model provider change signals, verifies mandatory schemas,
and performs deterministic deduplication per docs/Architecture.md.
"""

import uuid
from datetime import datetime, timezone
from typing import Any, Optional

from ai_evergreen.common.exceptions import ContractValidationError
from ai_evergreen.common.schemas import ChangeEvent, ChangeType


class ChangeSignalMonitor:
    """Ingests and normalizes external change feeds with deduplication."""

    def __init__(self) -> None:
        self._processed_hashes: set[str] = set()

    def ingest_raw_signal(
        self,
        source: str,
        payload: dict[str, Any],
        correlation_id: Optional[str] = None,
    ) -> Optional[ChangeEvent]:
        """Normalize raw incoming payload into a validated ChangeEvent.

        Fails-closed on missing required fields. Drops duplicate events.
        """
        required_fields = [
            "model_or_component_id",
            "current_version",
            "candidate_version",
            "change_type",
        ]
        missing = [f for f in required_fields if f not in payload]
        if missing:
            raise ContractValidationError(
                f"Change event rejected: missing mandatory fields: {missing}",
                details={"source": source, "payload": payload},
            )

        try:
            change_type = ChangeType(payload["change_type"])
        except ValueError as err:
            raise ContractValidationError(
                f"Invalid change_type: '{payload.get('change_type')}'",
                details={"allowed_values": [ct.value for ct in ChangeType]},
            ) from err

        corr_id = correlation_id or f"corr-{uuid.uuid4().hex[:8]}"

        event = ChangeEvent(
            event_id=payload.get("event_id", f"evt-{uuid.uuid4().hex[:8]}"),
            source=source,
            model_or_component_id=payload["model_or_component_id"],
            current_version=payload["current_version"],
            candidate_version=payload["candidate_version"],
            change_type=change_type,
            detected_at=datetime.now(timezone.utc),
            raw_payload_ref=payload.get("raw_payload_ref"),
            confidence=float(payload.get("confidence", 1.0)),
            correlation_id=corr_id,
        )

        dedup_hash = event.compute_dedup_hash()
        if dedup_hash in self._processed_hashes:
            # Duplicate signal detected — drop deterministically
            return None

        self._processed_hashes.add(dedup_hash)
        return event
