"""Restore project-local Codex skills from the pinned upstream revision."""
import json
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / '.agents' / 'skills_UIUX'
DEST = ROOT / '.agents' / 'skills'
CONFIG = json.loads((ROOT / '.uiux-profile.json').read_text(encoding='utf-8'))
UPSTREAM = CONFIG['upstream']

if not SOURCE.exists():
    subprocess.run(['git', 'clone', UPSTREAM['repository'], str(SOURCE)], check=True)
revision = subprocess.check_output(['git', '-C', str(SOURCE), 'rev-parse', 'HEAD'], text=True).strip()
if revision != UPSTREAM['revision']:
    raise SystemExit('Upstream revision differs from .uiux-profile.json; review before installing.')

installer = Path.home() / '.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py'
if not installer.is_file():
    raise SystemExit(f'Missing Codex skill installer: {installer}')
skills = CONFIG['additional_skills']
missing = [name for name in skills if not (DEST / name).exists()]
if missing:
    subprocess.run([sys.executable, str(installer), '--repo', 'Ngh1aa/skills_UIUX',
                    '--ref', revision, '--method', 'git', '--dest', str(DEST), '--path', *missing], check=True)

# Keep relative references to governance, vendor data and runtime scripts usable.
for item in SOURCE.iterdir():
    if item.name.startswith('.') or item.name in skills:
        continue
    target = DEST / item.name
    if item.is_dir():
        shutil.copytree(item, target, dirs_exist_ok=True,
                        ignore=shutil.ignore_patterns('__pycache__', '*.pyc'))
    else:
        shutil.copy2(item, target)
for name in skills:
    if not (DEST / name / 'SKILL.md').is_file():
        raise SystemExit(f'Missing SKILL.md: {name}')
print(f'Verified {len(skills)} project skills at {DEST}; revision {revision}')
