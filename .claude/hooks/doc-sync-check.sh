#!/usr/bin/env bash
# Stop hook: avisa si el último commit tocó src/* pero no actualizó ningún .md.
# Ver regla #2 en CLAUDE.md — "Doc-sync obligatorio".
#
# Output: JSON con systemMessage (visible al usuario en la TUI) cuando detecta
# el gap. Silencio absoluto cuando está todo en orden. Nunca bloquea.

set -eu

changed=$(git log -1 --name-only --pretty=format: HEAD 2>/dev/null | grep -v '^$' || true)

# Si no hay commits, o el HEAD no cambió desde el anterior, no decimos nada.
if [ -z "$changed" ]; then
  exit 0
fi

touched_src=false
touched_md=false

while IFS= read -r file; do
  case "$file" in
    src/*) touched_src=true ;;
    *.md)  touched_md=true ;;
  esac
done <<< "$changed"

if [ "$touched_src" = true ] && [ "$touched_md" = false ]; then
  msg='⚠️  Doc-sync check: el último commit tocó src/* pero no actualizó ningún .md. Si los cambios afectan arquitectura, rutas, componentes, libs o decisiones, actualizá CLAUDE.md / FLUJOGRAMA.md / TASKS.md antes de cerrar la sesión.'
  # systemMessage: se muestra al usuario; additionalContext: queda disponible
  # para Claude si la sesión continúa.
  printf '{"systemMessage":"%s","hookSpecificOutput":{"hookEventName":"Stop","additionalContext":"%s"}}\n' "$msg" "$msg"
fi
