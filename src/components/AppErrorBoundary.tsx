import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

/**
 * Fängt Render-Fehler ab (z. B. DOM-Manipulationen durch Übersetzer oder
 * Browser-Erweiterungen), damit die App keinen leeren Bildschirm zeigt.
 */
export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Unerwarteter Fehler in der Oberfläche:", error, info);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-4 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Die Anzeige konnte nicht aktualisiert werden
          </h1>
          <p className="text-sm text-muted-foreground">
            Bitte lade die Seite neu. Aus Sicherheitsgründen wurde der Tresor
            dabei gesperrt und alle sensiblen Daten aus dem Speicher entfernt.
          </p>
          <Button onClick={this.handleReload} className="w-full">
            Seite neu laden
          </Button>
        </div>
      </div>
    );
  }
}
