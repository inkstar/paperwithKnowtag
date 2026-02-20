
import React, { useMemo, useState } from 'react';
import { QuestionItem } from '../types';
import { Edit3, Tag, Hash, ChevronDown, Calendar, CheckCheck, ListOrdered } from 'lucide-react';
import { COMMON_KNOWLEDGE_POINTS } from '../constants';

interface Props {
  questions: QuestionItem[];
  selectedQuestionIds: string[];
  onUpdate: (id: string, field: keyof QuestionItem, value: string) => void;
  onBatchUpdateByIds: (ids: string[], field: keyof QuestionItem, value: string) => void;
  onToggleSelectQuestion: (id: string) => void;
  onSetVisibleSelection: (checked: boolean) => void;
}

export const QuestionTable: React.FC<Props> = ({
  questions,
  selectedQuestionIds,
  onUpdate,
  onBatchUpdateByIds,
  onToggleSelectQuestion,
  onSetVisibleSelection
}) => {
  const [batchStart, setBatchStart] = useState<string>('1');
  const [batchEnd, setBatchEnd] = useState<string>(questions.length.toString());
  const [batchSource, setBatchSource] = useState<string>(new Date().toISOString().split('T')[0]);

  const suggestions = useMemo(() => {
    const sessionPoints = questions.map(q => q.knowledgePoint);
    const combined = [...new Set([...COMMON_KNOWLEDGE_POINTS, ...sessionPoints])];
    return combined.sort();
  }, [questions]);

  const datalistId = "knowledge-points-list";
  const selectedSet = useMemo(() => new Set(selectedQuestionIds), [selectedQuestionIds]);
  const selectedVisibleCount = questions.filter(q => selectedSet.has(q.id)).length;
  const allVisibleSelected = questions.length > 0 && selectedVisibleCount === questions.length;

  const handleApplyBatch = () => {
    if (questions.length === 0) return;
    const start = Math.max(1, parseInt(batchStart) || 1);
    const end = Math.min(questions.length, parseInt(batchEnd) || questions.length);
    const [safeStart, safeEnd] = start <= end ? [start, end] : [end, start];
    const targetIds = questions.slice(safeStart - 1, safeEnd).map(q => q.id);
    if (targetIds.length > 0) onBatchUpdateByIds(targetIds, 'source', batchSource);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      {/* Header with Title */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Edit3 size={18} className="text-blue-600" />
            题目内容与知识点编辑
          </h3>
          <span className="text-xs text-gray-400 italic">双击内容可进入编辑状态</span>
        </div>

        {/* Batch Update Section */}
        <div className="flex flex-wrap items-center gap-3 p-2 bg-blue-50/50 rounded-lg border border-blue-100">
          <label className="flex items-center gap-2 text-xs text-blue-700 font-semibold">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              onChange={(e) => onSetVisibleSelection(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-blue-300"
            />
            全选当前列表
          </label>
          <span className="text-xs text-blue-600">已选 {selectedVisibleCount}/{questions.length}</span>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
            <CheckCheck size={14} /> 批量修改来源:
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-blue-600">序号从</span>
            <input
              type="number"
              min="1"
              max={questions.length}
              value={batchStart}
              onChange={(e) => setBatchStart(e.target.value)}
              className="w-14 px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400"
            />
            <span className="text-xs text-blue-600">至</span>
            <input
              type="number"
              min="1"
              max={questions.length}
              value={batchEnd}
              onChange={(e) => setBatchEnd(e.target.value)}
              className="w-14 px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400"
            />
          </div>
          <input
            type="text"
            placeholder="新来源名称"
            value={batchSource}
            onChange={(e) => setBatchSource(e.target.value)}
            className="flex-1 min-w-[120px] px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-400"
          />
          <button
            onClick={handleApplyBatch}
            className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors shadow-sm"
          >
            确认应用
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-auto">
        <datalist id={datalistId}>
          {suggestions.map((point, idx) => (
            <option key={idx} value={point} />
          ))}
        </datalist>

        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
            <tr>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b w-14 text-center bg-gray-100/50">
                组卷
              </th>
              <th className="px-3 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider border-b w-12 text-center bg-gray-100/50">
                <div className="flex items-center justify-center gap-1"><ListOrdered size={12}/>#</div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b w-16">
                <div className="flex items-center gap-1"><Hash size={12}/>题号</div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b w-1/4">
                <div className="flex items-center gap-1"><Tag size={12}/>考察知识点</div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b w-1/5">
                <div className="flex items-center gap-1"><Calendar size={12}/>题目来源</div>
              </th>
              <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider border-b">
                题目详情 (LaTeX)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {questions.map((q, idx) => (
              <tr key={q.id} className="hover:bg-blue-50/20 transition-colors group">
                <td className="px-3 py-3 align-top text-center bg-gray-50/30">
                  <input
                    type="checkbox"
                    checked={selectedSet.has(q.id)}
                    onChange={() => onToggleSelectQuestion(q.id)}
                    className="w-4 h-4 rounded text-blue-600 border-gray-300"
                    title="选择该题用于组卷"
                  />
                </td>
                <td className="px-3 py-3 align-top text-center text-xs font-mono text-gray-400 bg-gray-50/30">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 align-top">
                  <input
                    type="text"
                    value={q.number}
                    onChange={(e) => onUpdate(q.id, 'number', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-1 text-sm font-mono text-gray-700"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <div className="relative group/input">
                    <input
                      list={datalistId}
                      type="text"
                      value={q.knowledgePoint}
                      onChange={(e) => onUpdate(q.id, 'knowledgePoint', e.target.value)}
                      placeholder="知识点"
                      className="w-full bg-blue-50/40 border border-blue-100 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-lg px-3 py-2 text-sm text-blue-900 font-medium transition-all pr-8"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-300 pointer-events-none group-focus-within/input:text-blue-500">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top">
                  <input
                    type="text"
                    value={q.source}
                    onChange={(e) => onUpdate(q.id, 'source', e.target.value)}
                    placeholder="来源"
                    className="w-full bg-gray-50 border border-gray-100 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 rounded-lg px-3 py-2 text-sm text-gray-600 font-medium transition-all"
                  />
                </td>
                <td className="px-4 py-3 align-top">
                  <textarea
                    rows={2}
                    value={q.content}
                    onChange={(e) => onUpdate(q.id, 'content', e.target.value)}
                    className="w-full bg-transparent border-none focus:ring-1 focus:ring-blue-400 rounded px-2 py-1 text-sm font-mono text-gray-600 resize-none leading-relaxed transition-all"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
