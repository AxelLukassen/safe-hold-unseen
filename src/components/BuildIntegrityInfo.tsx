import { useEffect, useState } from "react";
import { Check, Copy, GitBranch } from "lucide-react";
import { fetchBuildInfo, type BuildInfo } from "@/services/buildInfoService";
import { SOURCE_REPOSITORY_URL } from "@/constants/security";

const BUILD_ID_PREVIEW_LENGTH = 16;

/**
 * Info-Punkt im Sicherheitsbereich: zeigt die Build-ID an und erklärt,
 * wie Nutzer die ausgelieferten Dateien gegen die im Repo veröffentlichten
 * Hashes prüfen können.
 */
export function BuildIntegrityInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchBuildInfo().then((info) => {
      if (isMounted) setBuildInfo(info);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopy = async () => {
    if (!buildInfo) return;
    await navigator.clipboard.writeText(buildInfo.buildId);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <li className="flex gap-3 text-left">
      <div className="mt-0.5 shrink-0 text-primary">
        <GitBranch className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-foreground">Build-Integrität</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Der Quellcode ist offen im{" "}
          <a
            href={SOURCE_REPOSITORY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            GitHub-Repo
          </a>{" "}
          einsehbar. Dort liegen auch die SHA-256-Referenz-Hashes (SHA256SUMS),
          mit denen du die ausgelieferten Dateien vergleichen kannst.
        </p>
        {buildInfo ? (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span>
              Build-ID: <code className="font-mono">{buildInfo.buildId.slice(0, BUILD_ID_PREVIEW_LENGTH)}…</code>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Build-ID kopieren"
            >
              {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </button>
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Build-ID ist nur in der produktiven Version verfügbar.
          </p>
        )}
      </div>
    </li>
  );
}
