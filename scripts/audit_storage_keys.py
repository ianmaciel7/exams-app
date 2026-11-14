import re

text = open('prototypes/exam-app-0.1.1/index.html', encoding='utf-8').read()

ls_matches = set(re.findall(r'localStorage\.[a-zA-Z]+\([\'"]([^\'"]+)[\'"]', text))
st_matches = set(re.findall(r'store\.[a-zA-Z]+\([\'"]([^\'"]+)[\'"]', text))
store_obj = set(re.findall(r'store\s*=\s*\{([^}]+)\}', text))

print("=== LocalStorage direct keys ===")
for k in sorted(ls_matches):
    print(" -", k)

print("\n=== store helper keys ===")
for k in sorted(st_matches):
    print(" -", k)

# Also search for other keys or constants
var_keys = set(re.findall(r'const\s+([A-Za-z0-9_]*STORAGE[A-Za-z0-9_]*|[A-Za-z0-9_]*_KEY)\s*=\s*[\'"]([^\'"]+)[\'"]', text, re.IGNORECASE))
print("\n=== Storage Key Constants ===")
for var, val in sorted(var_keys):
    print(f" - {var} = '{val}'")
