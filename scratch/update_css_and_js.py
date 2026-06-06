import os

def update_file(filepath, replacements):
    print(f"Updating {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original_len = len(content)
    for target, replacement in replacements:
        # Normalize line endings in target and replacement to match file's style if needed,
        # but standard string replace is usually fine.
        if target in content:
            content = content.replace(target, replacement)
            print(f"  Successfully replaced: {repr(target)[:60]}...")
        else:
            # Try with other line endings just in case
            target_lf = target.replace('\r\n', '\n')
            target_crlf = target.replace('\n', '\r\n')
            if target_lf in content:
                content = content.replace(target_lf, replacement.replace('\r\n', '\n'))
                print(f"  Successfully replaced (LF): {repr(target_lf)[:60]}...")
            elif target_crlf in content:
                content = content.replace(target_crlf, replacement.replace('\n', '\r\n'))
                print(f"  Successfully replaced (CRLF): {repr(target_crlf)[:60]}...")
            else:
                print(f"  Warning: Target not found! {repr(target)[:100]}")
                
    if len(content) != original_len or True:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"  Saved changes. New length: {len(content)}")

# Replacements for style.css
css_replacements = [
    (
        "  /* FAB/Nando Chat positioning inside the bezel */\n  .nando-fab {\n    position: absolute !important;\n    bottom: 84px !important;\n    right: 16px !important;\n  }",
        "  /* FAB/Nando Chat positioning inside the bezel */\n  .nando-fab {\n    position: absolute !important;\n    bottom: 160px !important;\n    right: 16px !important;\n  }"
    ),
    (
        ".nando-fab {\n  position: fixed;\n  bottom: 24px;",
        ".nando-fab {\n  position: fixed;\n  bottom: 160px;"
    ),
    (
        ".nando-chat-window {\n  position: fixed;\n  bottom: 24px;",
        ".nando-chat-window {\n  position: fixed;\n  bottom: 92px;"
    )
]

# Replacements for js/app.js
js_app_replacements = [
    (
        "wizardBtn.style.display = (tabId === 'painel') ? 'flex' : 'none';",
        "wizardBtn.style.display = 'none';"
    ),
    (
        "checklistBtn.style.display = (tabId === 'painel' && hasFinishedSetup) ? 'flex' : 'none';",
        "checklistBtn.style.display = 'none';"
    )
]

# Replacements for js/paywall.js
js_paywall_replacements = [
    (
        "      const adminBtn = document.getElementById('admin-floating-btn');\n      if (adminBtn) adminBtn.style.display = 'flex';",
        "      const adminBtn = document.getElementById('admin-floating-btn');\n      if (adminBtn) adminBtn.style.display = 'none';"
      )
]

# Execute
update_file("style.css", css_replacements)
update_file("js/app.js", js_app_replacements)
update_file("js/paywall.js", js_paywall_replacements)

# Also append the override display style at the end of style.css
print("Appending display overrides to style.css...")
with open("style.css", "a", encoding="utf-8") as f:
    f.write("\n\n/* OVERRIDES: Ocultar botoes flutuantes e admin */\n.floating-wizard-btn,\n.premium-floating-btn,\n#admin-floating-btn {\n  display: none !important;\n}\n")
print("Done!")
