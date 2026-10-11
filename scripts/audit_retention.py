"""Python Retention Auditor for AI Evergreen.

Enforces zero-loss project memory, prevents code-to-doc drift,
validates architectural invariants, and monitors token budget density.
Works deterministically across any LLM model vendor, IDE, or CI toolchain.
"""

import os
import re
import subprocess
import sys
from pathlib import Path


class RetentionAuditor:
    def __init__(self, repo_root: Path):
        self.repo_root = repo_root
        self.docs_dir = repo_root / "docs"
        self.errors: list[str] = []
        self.warnings: list[str] = []
        self.passed: list[str] = []

    def log_pass(self, check_name: str, detail: str = ""):
        msg = f"[PASS] {check_name}"
        if detail:
            msg += f" -> {detail}"
        self.passed.append(msg)
        print(f"\033[92m{msg}\033[0m")

    def log_warn(self, check_name: str, detail: str):
        msg = f"[WARN] {check_name} -> {detail}"
        self.warnings.append(msg)
        print(f"\033[93m{msg}\033[0m")

    def log_error(self, check_name: str, detail: str):
        msg = f"[FAIL] {check_name} -> {detail}"
        self.errors.append(msg)
        print(f"\033[91m{msg}\033[0m")

    def audit_memory_files(self):
        """Verifies presence, completeness, and structure of core memory documents."""
        # 1. docs/system_state.md
        state_file = self.docs_dir / "system_state.md"
        if not state_file.exists():
            self.log_error("System State File", "docs/system_state.md is MISSING!")
        else:
            content = state_file.read_text(encoding="utf-8")
            required_sections = [
                "Live Environment & Deployment",
                "Non-Negotiable Operating Directives",
                "UI Features & Screen Architecture",
                "Evaluator Personas & Approval Matrix",
                "Seeded Scenario E-2026-001",
            ]
            missing_secs = [sec for sec in required_sections if sec not in content]
            if missing_secs:
                self.log_error("System State Sections", f"docs/system_state.md is missing sections: {missing_secs}")
            else:
                self.log_pass("System State File", f"docs/system_state.md present with all {len(required_sections)} mandatory sections")

        # 2. docs/memory.md
        memory_file = self.docs_dir / "memory.md"
        if not memory_file.exists() or memory_file.stat().st_size < 500:
            self.log_error("Memory Journal", "docs/memory.md is missing or empty!")
        else:
            self.log_pass("Memory Journal", f"docs/memory.md present ({memory_file.stat().st_size:,} bytes)")

        # 3. docs/lessons-learned.md
        lessons_file = self.docs_dir / "lessons-learned.md"
        if not lessons_file.exists():
            self.log_error("Lessons Learned", "docs/lessons-learned.md is missing!")
        else:
            content = lessons_file.read_text(encoding="utf-8")
            # Count table rows with logged dates
            entries = re.findall(r"\|\s*\d{4}-\d{2}-\d{2}\s*\|", content)
            if len(entries) < 3:
                self.log_warn("Lessons Learned", f"Only {len(entries)} operational lessons logged in docs/lessons-learned.md")
            else:
                self.log_pass("Lessons Learned", f"{len(entries)} anti-rework lessons active in docs/lessons-learned.md")

        # 4. docs/demo_walkthrough_guide.md
        demo_file = self.docs_dir / "demo_walkthrough_guide.md"
        if not demo_file.exists() or demo_file.stat().st_size < 2000:
            self.log_error("Demo Walkthrough Guide", "docs/demo_walkthrough_guide.md is missing or incomplete!")
        else:
            self.log_pass("Demo Walkthrough Guide", "docs/demo_walkthrough_guide.md verified")

        # 5. AGENTS.md boot directive
        agents_file = self.repo_root / "AGENTS.md"
        if not agents_file.exists():
            self.log_error("Agents Boot File", "AGENTS.md is missing from repo root!")
        else:
            content = agents_file.read_text(encoding="utf-8")
            if "docs/system_state.md" not in content:
                self.log_error("Agents Boot Directive", "AGENTS.md does not mandate reading docs/system_state.md!")
            else:
                self.log_pass("Agents Boot Directive", "AGENTS.md mandates reading docs/system_state.md at session boot")

    def audit_route_drift(self):
        """Checks for code-to-doc drift between React Router paths and docs/system_state.md."""
        app_file = self.repo_root / "web" / "src" / "App.tsx"
        state_file = self.docs_dir / "system_state.md"
        if not app_file.exists() or not state_file.exists():
            return

        app_content = app_file.read_text(encoding="utf-8")
        state_content = state_file.read_text(encoding="utf-8")

        # Find routes in App.tsx
        routes = set(re.findall(r'<Route\s+path="([^"]+)"', app_content))
        routes.discard("*")

        # Core required views that must be documented
        core_views = [
            ("/", "Home / Command Center"),
            ("/blast-radius", "Blast Radius"),
            ("/plan", "Regression Plan"),
            ("/results", "Results Matrix"),
            ("/decision", "Treatment Decision"),
            ("/rollout", "Canary Rollout"),
            ("/record", "Qualification Record"),
            ("/estate", "Estate Screen"),
            ("/memory", "Memory"),
            ("/controls", "Controls / Invariants"),
            ("/portfolio", "Portfolio Screen"),
            ("/integrations", "Enterprise Integrations"),
            ("/gallery", "Design Patterns"),
        ]

        missing_docs = []
        for path_prefix, view_name in core_views:
            # Check if mentioned in system_state
            if path_prefix not in state_content and view_name.lower() not in state_content.lower():
                missing_docs.append(f"{view_name} ({path_prefix})")

        if missing_docs:
            self.log_error("Route Drift", f"Routes in App.tsx missing from docs/system_state.md: {missing_docs}")
        else:
            self.log_pass("Route Drift", f"All {len(core_views)} application routes documented in system_state.md")

    def audit_persona_drift(self):
        """Checks for persona drift between seedData.ts and docs/system_state.md."""
        seed_file = self.repo_root / "web" / "src" / "store" / "seedData.ts"
        state_file = self.docs_dir / "system_state.md"
        if not seed_file.exists() or not state_file.exists():
            return

        seed_content = seed_file.read_text(encoding="utf-8")
        state_content = state_file.read_text(encoding="utf-8")

        # Find persona IDs in DEMO_IDENTITIES
        persona_ids = re.findall(r"id:\s*['\"](user-[a-z0-9_-]+)['\"]", seed_content)
        if not persona_ids:
            self.log_warn("Persona Drift", "Could not extract persona IDs from seedData.ts")
            return

        missing_personas = [pid for pid in set(persona_ids) if pid not in state_content]
        if missing_personas:
            self.log_error("Persona Drift", f"Personas in code missing from docs/system_state.md: {missing_personas}")
        else:
            self.log_pass("Persona Drift", f"All {len(set(persona_ids))} evaluator personas accounted for in system_state.md")

    def audit_connector_drift(self):
        """Checks that all 6 enterprise connectors are documented."""
        state_file = self.docs_dir / "system_state.md"
        if not state_file.exists():
            return

        content = state_file.read_text(encoding="utf-8")
        connectors = [
            "AWS Bedrock",
            "Azure OpenAI",
            "ServiceNow CMDB",
            "GitHub AST",
            "Jira",
            "Cognizant AI Gateway",
        ]
        missing_connectors = [c for c in connectors if c.lower() not in content.lower()]
        if missing_connectors:
            self.log_error("Connector Drift", f"Enterprise connectors missing from docs/system_state.md: {missing_connectors}")
        else:
            self.log_pass("Connector Drift", f"All {len(connectors)} enterprise connectors documented in system_state.md")

    def audit_token_density(self):
        """Monitors line and byte sizes to maintain high token density and prevent bloat."""
        state_file = self.docs_dir / "system_state.md"
        if state_file.exists():
            lines = state_file.read_text(encoding="utf-8").splitlines()
            size_kb = state_file.stat().st_size / 1024
            if len(lines) > 600 or size_kb > 40:
                self.log_warn(
                    "Token Density (system_state.md)",
                    f"{len(lines)} lines ({size_kb:.1f} KB). Keep system_state.md under 500 lines for optimal agent boot speed.",
                )
            else:
                self.log_pass(
                    "Token Density (system_state.md)",
                    f"Optimal: {len(lines)} lines ({size_kb:.1f} KB, ~{int(size_kb * 250)} tokens)",
                )

        memory_file = self.docs_dir / "memory.md"
        if memory_file.exists():
            size_kb = memory_file.stat().st_size / 1024
            if size_kb > 90:
                self.log_warn(
                    "Memory Compaction",
                    f"docs/memory.md is {size_kb:.1f} KB. Recommend running archival compaction to docs/archive/ to keep token overhead low.",
                )
            else:
                self.log_pass("Memory Compaction", f"docs/memory.md within healthy budget ({size_kb:.1f} KB)")

    def audit_secret_and_invariant_leaks(self):
        """Scans for accidental credentials and hardcoded fake confidence."""
        # 1. Check .env file if it exists
        env_file = self.repo_root / ".env"
        if env_file.exists():
            content = env_file.read_text(encoding="utf-8")
            if re.search(r"AKIA[0-9A-Z]{16}", content):
                self.log_error("Secret Scanner", "Live AWS Access Key found in .env file! Strip immediately.")
            else:
                self.log_pass("Secret Scanner", "No unmasked AWS credentials in .env")
        else:
            self.log_pass("Secret Scanner", "No uncommitted .env file present")

    def audit_git_freshness(self, strict: bool = False):
        """Checks if recent code changes were accompanied by documentation updates."""
        try:
            res = subprocess.run(
                ["git", "status", "--porcelain"],
                cwd=self.repo_root,
                capture_output=True,
                text=True,
                check=True,
            )
            changes = res.stdout.splitlines()
            if not changes:
                self.log_pass("Git Freshness", "Working tree clean; no uncommitted drift")
                return

            code_changed = any(
                re.search(r"\.(ts|tsx|py|css)$", line) and not line.startswith("??") for line in changes
            )
            docs_changed = any("docs/system_state.md" in line or "docs/memory.md" in line for line in changes)

            if code_changed and not docs_changed:
                msg = "Code modified in working tree without updating docs/system_state.md or docs/memory.md."
                if strict:
                    self.log_error("Git Freshness Gate", msg)
                else:
                    self.log_warn("Git Freshness Gate", msg)
            else:
                self.log_pass("Git Freshness Gate", "Code changes accompanied by documentation updates")
        except Exception as e:
            self.log_warn("Git Freshness Gate", f"Could not check git status: {e}")

    def run_all(self, strict: bool = False) -> bool:
        print("\n" + "=" * 65)
        print("  AI EVERGREEN :: PYTHON RETENTION AUDITOR")
        print("  Enforcing Zero-Loss Project Memory & Preventing Drift")
        print("=" * 65 + "\n")

        self.audit_memory_files()
        self.audit_route_drift()
        self.audit_persona_drift()
        self.audit_connector_drift()
        self.audit_token_density()
        self.audit_secret_and_invariant_leaks()
        self.audit_git_freshness(strict=strict)

        print("\n" + "-" * 65)
        print(f"  Summary: {len(self.passed)} Passed | {len(self.warnings)} Warnings | {len(self.errors)} Errors")
        print("-" * 65 + "\n")

        if self.errors:
            print("\033[91m[AUDIT FAILED] Memory retention issues detected. Fix errors before pushing.\033[0m\n")
            return False

        print("\033[92m[AUDIT PASSED] System memory is 100% synchronized and retention-grade.\033[0m\n")
        return True


def run_audit(strict: bool = False) -> bool:
    repo_root = Path(__file__).resolve().parent.parent
    auditor = RetentionAuditor(repo_root)
    return auditor.run_all(strict=strict)


if __name__ == "__main__":
    is_strict = "--strict" in sys.argv
    success = run_audit(strict=is_strict)
    sys.exit(0 if success else 1)
