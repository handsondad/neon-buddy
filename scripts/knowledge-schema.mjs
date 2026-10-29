import { DOMAINS, FAMILIARITY, SETTINGS, SIGNALS, SOURCE_KINDS, THEORIES } from "../src/lib/knowledgeFramework.ts";
import { SCIENCE_CARDS } from "../src/lib/scienceCards.ts";

const text = (maxLength = 8000, minLength = 1) => ({ type: "string", minLength, maxLength });
const identifier = { ...text(80), pattern: "^[a-zA-Z0-9][a-zA-Z0-9_-]*$" };
const choice = (values) => ({ type: "string", enum: Object.keys(values) });
const nullable = (schema) => ({ anyOf: [schema, { type: "null" }] });
const object = (properties, required = Object.keys(properties)) => ({ type: "object", properties, required, additionalProperties: false });
const list = (items, maxItems, minItems = 0, uniqueItems = false) => ({ type: "array", items, minItems, maxItems, ...(uniqueItems ? { uniqueItems } : {}) });
const ref = (name) => ({ $ref: `#/$defs/${name}` });
const date = { ...text(10), format: "date", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}$" };
const timestamp = { ...text(24), format: "date-time", pattern: "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\\.[0-9]{3}Z$" };
const revision = { type: "integer", minimum: 0, maximum: Number.MAX_SAFE_INTEGER };
const cardRefs = list({
  oneOf: SCIENCE_CARDS.map((card) => object({ id: { const: card.id }, version: { type: "integer", minimum: 1, maximum: card.version } }))
}, 20, 1);
const analysisProperties = {
  id: identifier, domain: choice(DOMAINS), title: text(200), question: text(), claim: text(), conditions: text(),
  alternatives: list(text(), 10, 1), limitations: list(text(), 10, 1), followUps: list(text(), 10, 1),
  supportingIds: list(identifier, 100, 1, true), counterIds: list(identifier, 100, 0, true),
  theoryIds: list(choice(THEORIES), 6, 1, true), generatedAt: timestamp, generatedBy: ref("writer"),
  supersedes: nullable(identifier)
};
const definitions = {
  writer: object({ name: text(100), tool: text(200) }),
  child: object({ id: identifier, alias: text(60, 0), birthMonth: nullable({ type: "string", pattern: "^[0-9]{4}-[0-9]{2}$" }) }),
  source: object({
    id: identifier, kind: choice(SOURCE_KINDS), reporter: text(100), capturedAt: timestamp, content: text(50000), recordedBy: ref("writer")
  }),
  observation: object({
    id: identifier, sourceId: identifier, sourceExcerpt: text(50000), occurredOn: nullable(date), recordedAt: timestamp,
    sourceLocator: object({ start: revision, end: revision }),
    domains: list(choice(DOMAINS), Object.keys(DOMAINS).length, 1, true),
    context: object({
      setting: choice(SETTINGS), familiarity: choice(FAMILIARITY),
      activity: nullable(text()), people: nullable(text()), antecedent: nullable(text()), response: nullable(text()), outcome: nullable(text())
    }),
    behavior: text(), signals: list(object({ code: choice(SIGNALS), excerpt: text() }), 16),
    childExpression: nullable(object({ text: text(), fidelity: { enum: ["verbatim", "recalled", "paraphrase"] } })),
    recordedBy: ref("writer"), supersedes: nullable(identifier)
  }, ["id", "sourceId", "sourceExcerpt", "occurredOn", "recordedAt", "domains", "context", "behavior", "signals", "childExpression", "recordedBy", "supersedes"]),
  analysis: object({ ...analysisProperties, basedOnRevision: { ...revision, minimum: 1 } }),
  batchAnalysis: object(analysisProperties),
  topic: object({
    id: identifier, title: text(200), question: text(), domain: choice(DOMAINS), scope: text(),
    status: { enum: ["open", "paused", "closed"] }, cardRefs,
    createdAt: timestamp, createdBy: ref("writer"), supersedes: nullable(identifier)
  }),
  run: object({
    id: identifier, topicId: identifier, inputRevision: revision, status: { enum: ["completed", "insufficient", "cancelled"] },
    readObservationIds: list(identifier, 20000, 0, true), outputAnalysisIds: list(identifier, 100, 0, true), cardRefs,
    comparison: text(), counterSearch: text(), limitations: list(text(), 10, 1), changeReason: text(),
    finishedAt: timestamp, performedBy: ref("writer")
  })
};

export function knowledgeSchema(batch = false) {
  const properties = batch ? {
    schemaVersion: { const: "1.0" }, expectedRevision: revision, writer: ref("writer"), child: ref("child"),
    sources: list(ref("source"), 1000), observations: list(ref("observation"), 2000), analyses: list(ref("batchAnalysis"), 100),
    deleteObservationIds: list(identifier, 2000, 0, true), deleteSourceIds: list(identifier, 1000, 0, true), deleteAnalysisIds: list(identifier, 2000, 0, true)
  } : {
    schemaVersion: { const: "1.0" }, revision, updatedAt: nullable(timestamp), child: ref("child"),
    sources: list(ref("source"), 10000), observations: list(ref("observation"), 20000), analyses: list(ref("analysis"), 2000)
  };
  properties.topics = list(ref("topic"), batch ? 100 : 2000);
  properties.runs = list(ref("run"), batch ? 100 : 2000);
  if (batch) {
    properties.deleteTopicIds = list(identifier, 2000, 0, true);
    properties.deleteRunIds = list(identifier, 2000, 0, true);
  }
  const optional = new Set(["topics", "runs", ...(batch ? ["child", "deleteTopicIds", "deleteRunIds"] : [])]);
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: batch ? "Neon Buddy Agent batch 1.0" : "Neon Buddy knowledge base 1.0",
    description: "Structural schema only. Run kb validate for dates, cross-entity references, verbatim excerpts, revision, authorship, lifecycle and byte limits. Neither check proves psychological validity.",
    ...object(properties, Object.keys(properties).filter((key) => !optional.has(key))),
    $defs: definitions
  };
}
