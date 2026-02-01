"use client";

/**
 * Audit log view modal: shows full log entry with parsed metadata (JSON) for readable display.
 * Used when user clicks an audit row in the audit table.
 */

import { EditModal } from "../../components/EditModal";

/** Serialized audit log row (dates become strings when passed to client). */
export type AuditLogRow = {
  id: string;
  userId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata: unknown;
  createdAt: string;
  user: { name: string | null; email: string | null } | null;
};

const ACTION_STYLES: Record<string, string> = {
  create: "bg-green-100 text-green-700",
  update: "bg-blue-100 text-blue-700",
  delete: "bg-red-100 text-red-700",
  decrypt: "bg-yellow-100 text-yellow-700",
  login: "bg-purple-100 text-purple-700",
  logout: "bg-gray-100 text-gray-600",
  failed_login: "bg-red-100 text-red-700",
  read: "bg-gray-100 text-gray-600",
};

/**
 * Badge for audit action type (shared with table).
 */
export function ActionBadge({ action }: { action: string }) {
  const style = ACTION_STYLES[action] ?? ACTION_STYLES.read;
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${style}`}>
      {action}
    </span>
  );
}

/** Converts snake_case / UPPER to Title Case for display. */
function formatKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Renders a single JSON value (string, number, boolean, null) for display.
 * Long strings wrap in a styled block; no inner scroll (modal body scrolls once).
 */
function JsonPrimitive({
  value,
  isLongString = false,
}: {
  value: string | number | boolean | null;
  isLongString?: boolean;
}) {
  if (value === null) return <span className="text-gray-400 italic">null</span>;
  if (typeof value === "boolean") return <span className="text-[#1C6ED5] font-medium">{String(value)}</span>;
  if (typeof value === "number") return <span className="text-[#1C6ED5] font-medium tabular-nums">{value}</span>;
  const s = String(value);
  if (isLongString || s.length > 60) {
    return (
      <div className="rounded-md bg-[#0B132B]/[0.04] border border-[#0B132B]/[0.06] px-3 py-2">
        <code className="text-xs text-gray-700 break-all font-mono block">{s}</code>
      </div>
    );
  }
  return <span className="text-gray-800 break-words">{s}</span>;
}

/**
 * Single metadata row: formatted key + value cell.
 */
function MetadataRow({
  label,
  valueNode,
  depth = 0,
  isFirst = false,
}: {
  label: string;
  valueNode: React.ReactNode;
  depth?: number;
  isFirst?: boolean;
}) {
  return (
    <tr className={depth > 0 || !isFirst ? "border-t border-gray-100" : ""}>
      <td className="py-2.5 pr-4 align-top w-40 flex-shrink-0 text-xs font-medium text-[#8A8F98] whitespace-nowrap">
        {formatKey(label)}
      </td>
      <td className="py-2.5 text-sm text-gray-800 align-top min-w-0">{valueNode}</td>
    </tr>
  );
}

/**
 * Recursively renders JSON metadata as a compact table for readable viewing.
 */
function MetadataView({ data, depth = 0 }: { data: unknown; depth?: number }): React.ReactNode {
  if (data === null || data === undefined) {
    return <span className="text-gray-400 italic">—</span>;
  }
  if (typeof data !== "object") {
    const v = data as string | number | boolean | null;
    return <JsonPrimitive value={v} isLongString={typeof v === "string" && v.length > 80} />;
  }
  if (Array.isArray(data)) {
    return (
      <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
        {data.map((item, i) => (
          <li key={i}>
            <MetadataView data={item} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }
  const obj = data as Record<string, unknown>;
  const entries = Object.entries(obj);
  if (entries.length === 0) return <span className="text-gray-400 italic">—</span>;
  return (
    <table className="w-full border-collapse text-sm">
      <tbody>
        {entries.map(([key, value], idx) => (
          <MetadataRow
            key={key}
            label={key}
            depth={depth}
            isFirst={idx === 0}
            valueNode={
              typeof value === "object" && value !== null && !Array.isArray(value) ? (
                <div className={depth > 0 ? "pl-3 border-l-2 border-[#0B132B]/[0.06]" : ""}>
                  <MetadataView data={value} depth={depth + 1} />
                </div>
              ) : Array.isArray(value) ? (
                <MetadataView data={value} depth={depth + 1} />
              ) : (
                <JsonPrimitive
                  value={value as string | number | boolean | null}
                  isLongString={typeof value === "string" && value.length > 80}
                />
              )
            }
          />
        ))}
      </tbody>
    </table>
  );
}

type Props = {
  log: AuditLogRow | null;
  open: boolean;
  onClose: () => void;
};

/**
 * Renders a read-only modal with audit log details and parsed metadata.
 */
/** Extracts ipAddress and userAgent from metadata when present. */
function getRequestInfo(metadata: unknown): { ipAddress?: string; userAgent?: string } {
  if (metadata == null || typeof metadata !== "object" || Array.isArray(metadata)) return {};
  const m = metadata as Record<string, unknown>;
  return {
    ipAddress: typeof m.ipAddress === "string" ? m.ipAddress : undefined,
    userAgent: typeof m.userAgent === "string" ? m.userAgent : undefined,
  };
}

export function AuditLogViewModal({ log, open, onClose }: Props) {
  if (!log) return null;

  const timestamp = (() => {
    try {
      return new Date(log.createdAt).toLocaleString();
    } catch {
      return log.createdAt;
    }
  })();
  const userDisplay = log.user?.name || log.user?.email || "System";
  const requestInfo = getRequestInfo(log.metadata);

  return (
    <EditModal
      open={open}
      onClose={onClose}
      title="Audit log entry"
      titleId="audit-log-modal-title"
      maxWidth="max-w-xl"
      scrollContent={true}
    >
      <div className="space-y-4">
        <p className="text-xs font-mono text-[#8A8F98]">Log ID: {log.id}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">Timestamp</p>
            <p className="mt-1 text-sm text-gray-900">{timestamp}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">User</p>
            <p className="mt-1 text-sm text-gray-900">
              {userDisplay}
              {log.userId && (
                <span className="ml-1 font-mono text-gray-500 text-xs">({log.userId})</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">Action</p>
            <div className="mt-1">
              <ActionBadge action={log.action} />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">Entity</p>
            <p className="mt-1 text-sm font-mono text-gray-900">
              {log.entityType} : {log.entityId}
            </p>
          </div>
          {requestInfo.ipAddress != null && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">IP address</p>
              <p className="mt-1 text-sm font-mono text-gray-900">{requestInfo.ipAddress}</p>
            </div>
          )}
          {requestInfo.userAgent != null && (
            <div className="sm:col-span-2">
              <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide">User agent</p>
              <div className="mt-1 rounded-md bg-[#0B132B]/[0.04] border border-[#0B132B]/[0.06] px-3 py-2">
                <code className="text-xs text-gray-700 break-all font-mono block">{requestInfo.userAgent}</code>
              </div>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-medium text-[#8A8F98] uppercase tracking-wide mb-2">Details (before/after, context)</p>
          <div className="rounded-lg border border-[#0B132B]/[0.08] bg-[#0B132B]/[0.02] p-4 min-h-[80px]">
            {log.metadata != null ? (
              typeof log.metadata === "string" ? (
                (() => {
                  try {
                    const parsed = JSON.parse(log.metadata) as unknown;
                    return <MetadataView data={parsed} />;
                  } catch {
                    return <pre className="text-sm text-gray-700 whitespace-pre-wrap break-words">{log.metadata}</pre>;
                  }
                })()
              ) : (
                <MetadataView data={log.metadata} />
              )
            ) : (
              <span className="text-gray-400 italic">No details</span>
            )}
          </div>
        </div>
      </div>
    </EditModal>
  );
}
