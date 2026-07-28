import { useState, type ChangeEvent } from "react";
import type { AppState, MemoryItem } from "../types";
import { buildHandoffSummary, getHighlights } from "../lib/summary";

interface ReportsProps {
  state: AppState;
  weekMemories: MemoryItem[];
  onGenerateGrowthReport: () => void;
  onGenerateHandoffReport: () => void;
  onCopyReport: () => void;
  onDownloadReport: () => void;
  onPrintReport: () => void;
}

type ReportRange = "last7" | "last14" | "last30" | "month" | "all" | "custom";
type ReportTemplateMode = "compact" | "detailed";

interface ReportPreview {
  kind: "growth" | "handoff";
  title: string;
  content: string;
  rangeLabel: string;
  rangeToken: string;
}

export function Reports({
  state,
  weekMemories,
  onGenerateGrowthReport,
  onGenerateHandoffReport,
  onCopyReport,
  onDownloadReport,
  onPrintReport
}: ReportsProps) {
  const [reportRange, setReportRange] = useState<ReportRange>("last7");
  const [customRangeStart, setCustomRangeStart] = useState<string>("1");
  const [customRangeEnd, setCustomRangeEnd] = useState<string>("7");
  const [reportTemplateMode, setReportTemplateMode] = useState<ReportTemplateMode>("detailed");
  const [reportPreview, setReportPreview] = useState<ReportPreview | null>(null);

  const handleGenerateGrowthReport = () => {
    onGenerateGrowthReport();
  };

  const handleGenerateHandoffReport = () => {
    onGenerateHandoffReport();
  };

  const handoffSummary = buildHandoffSummary(weekMemories);
  const highlights = getHighlights(weekMemories);

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>报告中心</h2>
        <p className="reports-desc">生成成长报告和家校交接报告，支持多种格式导出</p>
      </div>

      <div className="report-controls">
        <div className="control-section">
          <label className="control-label">时间范围</label>
          <div className="range-controls">
            <select
              value={reportRange}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setReportRange(e.target.value as ReportRange)}
              className="form-select"
            >
              <option value="last7">最近 7 天</option>
              <option value="last14">最近 14 天</option>
              <option value="last30">最近 30 天</option>
              <option value="month">本月（30天窗口）</option>
              <option value="all">全部记录</option>
              <option value="custom">手动起止天数</option>
            </select>
            {reportRange === "custom" && (
              <div className="custom-range">
                <input
                  type="number"
                  min={1}
                  value={customRangeStart}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomRangeStart(e.target.value)}
                  placeholder="起始天"
                  className="form-input"
                />
                <span>至</span>
                <input
                  type="number"
                  min={1}
                  max={state.day}
                  value={customRangeEnd}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomRangeEnd(e.target.value)}
                  placeholder="结束天"
                  className="form-input"
                />
              </div>
            )}
          </div>
          <div className="range-presets">
            <button className="btn btn-sm" onClick={() => setReportRange("last7")}>本周</button>
            <button className="btn btn-sm" onClick={() => setReportRange("last30")}>最近30天</button>
            <button className="btn btn-sm" onClick={() => setReportRange("month")}>本月</button>
            <button className="btn btn-sm" onClick={() => setReportRange("all")}>全部</button>
          </div>
        </div>

        <div className="control-section">
          <label className="control-label">报告模板</label>
          <div className="template-buttons">
            <button
              className={`btn ${reportTemplateMode === "compact" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setReportTemplateMode("compact")}
            >
              简版模板
            </button>
            <button
              className={`btn ${reportTemplateMode === "detailed" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setReportTemplateMode("detailed")}
            >
              详细模板
            </button>
          </div>
        </div>

        <div className="control-section">
          <label className="control-label">生成报告</label>
          <div className="report-buttons">
            <button className="btn btn-primary" onClick={handleGenerateGrowthReport}>生成成长报告</button>
            <button className="btn btn-secondary" onClick={handleGenerateHandoffReport}>生成交接报告</button>
          </div>
        </div>

        <div className="control-section">
          <label className="control-label">导出操作</label>
          <div className="export-buttons">
            <button className="btn btn-secondary" onClick={onCopyReport}>复制报告</button>
            <button className="btn btn-secondary" onClick={onDownloadReport}>下载 .md</button>
            <button className="btn btn-secondary" onClick={onPrintReport}>打印预览</button>
          </div>
        </div>
      </div>

      <div className="report-preview-section">
        <h3>报告预览</h3>
        {!reportPreview ? (
          <div className="empty-preview">
            <p>先生成一份成长报告或家校交接报告，这里会显示 Markdown 预览。</p>
          </div>
        ) : (
          <div className="preview-box">
            <h4 className="preview-title">{reportPreview.title}</h4>
            <pre className="preview-content">{reportPreview.content}</pre>
          </div>
        )}
      </div>

      <div className="quick-summary-section">
        <h3>快速摘要</h3>
        <div className="summary-grid">
          <div className="summary-card">
            <h4>本周记录</h4>
            <span className="summary-value">{weekMemories.length} 条</span>
          </div>
          <div className="summary-card">
            <h4>关键记忆</h4>
            <span className="summary-value">{highlights.length} 条</span>
          </div>
        </div>
        <div className="handoff-summary-card">
          <h4>家校协同摘要</h4>
          <div className="handoff-grid">
            <div className="handoff-item">
              <span className="handoff-label">高频触发点</span>
              <p>{handoffSummary.triggerCue}</p>
            </div>
            <div className="handoff-item">
              <span className="handoff-label">有效做法</span>
              <p>{handoffSummary.effectiveAction}</p>
            </div>
            <div className="handoff-item">
              <span className="handoff-label">需避免</span>
              <p>{handoffSummary.avoidAction}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
