// ── Export Utilities ─────────────────────────────────────────────────────────

/**
 * Convert array of objects to CSV string
 */
function toCSV(rows, columns) {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((row) =>
    columns.map((c) => {
      const val = c.get ? c.get(row) : (row[c.key] ?? "");
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    }).join(",")
  );
  return [header, ...body].join("\n");
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function timestamp() {
  return new Date().toISOString().slice(0, 10);
}

// ── Users export ─────────────────────────────────────────────────────────────

const USER_COLUMNS = [
  { key: "uid",               label: "UID" },
  { key: "displayName",       label: "Имя" },
  { key: "email",             label: "Email" },
  { key: "totalKm",           label: "Км (всего)", get: (r) => (r.totalKm || 0).toFixed(2) },
  { key: "finishedMarathons", label: "Марафонов завершено", get: (r) => r.finishedMarathons || 0 },
];

export function exportUsersCSV(users) {
  const csv = toCSV(users, USER_COLUMNS);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `users_${timestamp()}.csv`);
}

export function exportUsersExcel(users) {
  const rows = [
    USER_COLUMNS.map((c) => c.label),
    ...users.map((u) => USER_COLUMNS.map((c) => (c.get ? c.get(u) : (u[c.key] ?? "")))),
  ];
  downloadXLSX(rows, "Пользователи", `users_${timestamp()}.xlsx`);
}

// ── Marathons export ──────────────────────────────────────────────────────────

const MARATHON_COLUMNS = [
  { key: "id",           label: "ID" },
  { key: "title",        label: "Название" },
  { key: "type",         label: "Тип" },
  { key: "city",         label: "Город" },
  { key: "date",         label: "Дата" },
  { key: "distance",     label: "Дистанция" },
  { key: "participants", label: "Участников", get: (r) => r.participants || 0 },
  { key: "desc",         label: "Описание" },
];

export function exportMarathonsCSV(marathons) {
  const csv = toCSV(marathons, MARATHON_COLUMNS);
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, `marathons_${timestamp()}.csv`);
}

export function exportMarathonsExcel(marathons) {
  const rows = [
    MARATHON_COLUMNS.map((c) => c.label),
    ...marathons.map((m) => MARATHON_COLUMNS.map((c) => (c.get ? c.get(m) : (m[c.key] ?? "")))),
  ];
  downloadXLSX(rows, "Марафоны", `marathons_${timestamp()}.xlsx`);
}

// ── Combined export ───────────────────────────────────────────────────────────

export function exportAllCSV(users, marathons) {
  exportUsersCSV(users);
  setTimeout(() => exportMarathonsCSV(marathons), 300);
}

export function exportAllExcel(users, marathons) {
  const usersRows = [
    USER_COLUMNS.map((c) => c.label),
    ...users.map((u) => USER_COLUMNS.map((c) => (c.get ? c.get(u) : (u[c.key] ?? "")))),
  ];
  const marathonRows = [
    MARATHON_COLUMNS.map((c) => c.label),
    ...marathons.map((m) => MARATHON_COLUMNS.map((c) => (c.get ? c.get(m) : (m[c.key] ?? "")))),
  ];
  downloadMultiSheetXLSX(
    [
      { name: "Пользователи", rows: usersRows },
      { name: "Марафоны", rows: marathonRows },
    ],
    `marathon_data_${timestamp()}.xlsx`
  );
}

// ── XLSX generation (no external lib — pure XML) ─────────────────────────────

function escapeXML(val) {
  return String(val ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function buildSheet(rows) {
  const cells = rows.map((row, ri) =>
    row.map((cell, ci) => {
      const col = String.fromCharCode(65 + ci);
      const addr = `${col}${ri + 1}`;
      const isNum = typeof cell === "number" || (typeof cell === "string" && cell !== "" && !isNaN(Number(cell)) && !cell.includes("-"));
      if (isNum && cell !== "") {
        return `<c r="${addr}"><v>${escapeXML(cell)}</v></c>`;
      }
      return `<c r="${addr}" t="inlineStr"><is><t>${escapeXML(cell)}</t></is></c>`;
    }).join("")
  ).map((rowCells, ri) => `<row r="${ri + 1}">${rowCells}</row>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<sheetData>${cells}</sheetData>
</worksheet>`;
}

function buildXLSX(sheets) {
  // sheets = [{name, xml}, ...]
  const sharedStrings = `<?xml version="1.0" encoding="UTF-8"?><sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="0" uniqueCount="0"/>`;

  const workbook = `<?xml version="1.0" encoding="UTF-8"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"
          xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<sheets>
${sheets.map((s, i) => `<sheet name="${escapeXML(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("\n")}
</sheets>
</workbook>`;

  const wbRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("\n")}
</Relationships>`;

  const contentTypes = `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("\n")}
</Types>`;

  const rootRels = `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`;

  // Build zip manually using simple approach — create as data URL
  return { workbook, wbRels, contentTypes, rootRels, sheets };
}

async function downloadXLSX(rows, sheetName, filename) {
  await downloadMultiSheetXLSX([{ name: sheetName, rows }], filename);
}

async function downloadMultiSheetXLSX(sheets, filename) {
  // Dynamically load JSZip if available, else fall back to CSV
  try {
    // Try to use the browser's built-in or a CDN-loaded JSZip
    let JSZip = window.JSZip;
    if (!JSZip) {
      await new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        s.onload = resolve;
        s.onerror = reject;
        document.head.appendChild(s);
      });
      JSZip = window.JSZip;
    }

    const zip = new JSZip();
    const xl = zip.folder("xl");
    const ws = xl.folder("worksheets");
    const rels = zip.folder("_rels");
    const xlRels = xl.folder("_rels");

    const sheetXMLs = sheets.map((s) => buildSheet(s.rows));
    const meta = buildXLSX(sheets.map((s, i) => ({ name: s.name, xml: sheetXMLs[i] })));

    zip.file("[Content_Types].xml", meta.contentTypes);
    rels.file(".rels", meta.rootRels);
    xl.file("workbook.xml", meta.workbook);
    xlRels.file("workbook.xml.rels", meta.wbRels);
    sheetXMLs.forEach((xml, i) => ws.file(`sheet${i + 1}.xml`, xml));

    const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    downloadBlob(blob, filename);
  } catch {
    // Fallback: export as CSV if JSZip fails
    sheets.forEach((s) => {
      const csv = s.rows.map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      downloadBlob(blob, filename.replace(".xlsx", ".csv"));
    });
  }
}
