/**
 * The pipelines: every voices-de pipeline with what it does, when it runs
 * here and when it would run remotely, and its last run — when, on which
 * host, and every count it reported, drawn.
 */

import { Numeral, Pane } from "design_system/theme";

import { paths } from "../api/client";
import type { Pipeline, PipelineRun } from "../api/types";
import { useRead } from "../api/useRead";
import { clockFor, dayFor } from "../format";
import { BODY, SMALL, TABULAR } from "../text";

function LastRun({ run }: { run: PipelineRun }) {
  const counts = Object.entries(run.counts).filter(([, value]) => typeof value === "number") as [
    string,
    number,
  ][];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <div style={SMALL}>
        {dayFor(run.started_at)} {clockFor(run.started_at)} · {run.host}
      </div>
      {counts.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 22px" }}>
          {counts.map(([key, value]) => (
            <Numeral key={key} value={value} size="sm" caption={key.replace(/_/g, " ")} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PipelinesSection() {
  const pipelines = useRead<{ pipelines: Pipeline[] }>(paths.pipelines);
  if (!pipelines.data) return null;
  return (
    <div className="sv-side">
      {pipelines.data.pipelines.map((pipeline) => (
        <Pane key={pipeline.key} bar={{ title: pipeline.label }}>
          <div style={{ display: "grid", gap: 10 }}>
            <p style={BODY}>{pipeline.description}</p>
            <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
              <span style={TABULAR}>{pipeline.local_schedule}</span>
              <span style={TABULAR}>{pipeline.remote_schedule}</span>
            </div>
            {pipeline.last_run ? <LastRun run={pipeline.last_run} /> : null}
          </div>
        </Pane>
      ))}
    </div>
  );
}
