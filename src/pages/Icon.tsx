import type { QaRecord } from "../qa/types.ts";
import { categoryById } from "../qa/vocab.ts";

/** 一件事的大图标，底色是它的分类色 */
export function Icon({ record, className }: { record: QaRecord; className: string }) {
  return (
    <span className={`${className} icon-tile`} style={{ ["--cat" as string]: categoryById(record.category).color }} aria-hidden="true">
      {record.icon}
    </span>
  );
}
