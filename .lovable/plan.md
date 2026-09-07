# Lovable-Badge ausblenden

## Ziel
Das "Edit with Lovable"-Badge auf der veröffentlichten Seite ausblenden.

## Schritte
1. Aktuellen Badge-Status über `publish_settings--get_badge_visibility` prüfen.
2. Falls noch sichtbar, über `publish_settings--set_badge_visibility` auf `hidden` setzen.
3. Nutzer über das Ergebnis informieren.

## Hinweis
Das Ausblenden des Badges erfordert einen Pro-Plan oder höher. Falls der Plan das nicht abdeckt, wird der Nutzer darüber informiert.
