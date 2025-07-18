import PlanilhaCard from "./PlanilhaCard";

export default function SheetsCanvas({
  sheets,
  onEditField,
  onDeleteField,
  onEditSheetName,
  onDeleteSheet,
}) {
  return (
    <div className="canvas-bg bg-white rounded-lg p-6 w-full min-h-[300px] flex flex-wrap gap-6 border-2 border-dotted border-gray-400">
      {sheets.map((sheet, idx) => (
        <PlanilhaCard
          key={idx}
          sheet={sheet}
          sheetIdx={idx}
          onEditField={onEditField}
          onDeleteField={onDeleteField}
          onEditSheetName={onEditSheetName}
          onDeleteSheet={onDeleteSheet}
        />
      ))}
    </div>
  );
}