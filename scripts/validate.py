#!/usr/bin/env python3
"""Validate the source registry and bundled declarative extension; no network or code execution."""
import json
from pathlib import Path
import sys
try:
    from jsonschema import Draft202012Validator, FormatChecker
except ImportError:
    sys.exit('Install validation dependency: python3 -m pip install -r requirements.txt')
ROOT = Path(__file__).resolve().parents[1]

def validate():
    registry = json.loads((ROOT / 'registry.json').read_text())
    for data, schema in [(registry, 'registry.schema.json'), (json.loads((ROOT / 'otion.json').read_text()), 'otion.schema.json')]:
        validator = Draft202012Validator(json.loads((ROOT / 'schemas' / schema).read_text()), format_checker=FormatChecker())
        for error in validator.iter_errors(data):
            raise ValueError(f'{schema}: {list(error.path)}: {error.message}')
    names = set()
    for entry in registry['extensions']:
        if entry['name'] in names:
            raise ValueError('Duplicate extension name')
        names.add(entry['name'])
        versions = [version['version'] for version in entry['versions']]
        if len(versions) != len(set(versions)) or entry['latest_version'] not in versions:
            raise ValueError('Duplicate versions or missing latest version')
        if any(version['commit_sha'] == '0' * 40 for version in entry['versions']):
            raise ValueError('Placeholder SHA cannot be approved')
    print(f'Validated {len(names)} approved extensions and example package')
if __name__ == '__main__':
    try:
        validate()
    except (ValueError, OSError) as error:
        sys.exit(str(error))
