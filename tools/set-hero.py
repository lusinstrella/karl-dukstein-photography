#!/usr/bin/env python3
import sys
import os

def usage():
    print('Usage: python3 tools/set-hero.py <category> <base-id>')

if __name__ == '__main__':
    if len(sys.argv) != 3:
        usage(); sys.exit(2)
    cat = sys.argv[1]
    base = sys.argv[2]
    root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    target = os.path.join(root, 'images', cat)
    if not os.path.isdir(target):
        print('Category not found:', cat); sys.exit(1)
    hero_file = os.path.join(target, 'hero.txt')
    try:
        with open(hero_file, 'w') as f:
            f.write(base + '\n')
        print(f'Wrote {hero_file} with "{base}". Run: python3 tools/generate-manifest.py')
    except Exception as e:
        print('Failed to write hero file:', e); sys.exit(1)
