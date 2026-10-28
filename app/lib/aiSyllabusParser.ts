import JSZip from "jszip";

export interface ParsedCourseOutcome {
  code: string;
  description: string;
}

export interface ParsedSyllabusUnit {
  id: string;
  num: string;
  name: string;
  topicsCount: number;
  subtopics: string[];
  coMapping: string[];
}

export interface ParsedSyllabusResult {
  subjectName?: string;
  subjectCode?: string;
  department?: string;
  semester?: string;
  courseOutcomes: ParsedCourseOutcome[];
  units: ParsedSyllabusUnit[];
  rawTextPreview: string;
}

/**
 * Unzips and extracts plain text from a .docx file using JSZip and DOMParser.
 */
export async function extractDocxText(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = await JSZip.loadAsync(arrayBuffer);
    
    // Search for word/document.xml (or main document file)
    let docFile = zip.file("word/document.xml");
    if (!docFile) {
      const files = zip.file(/word\/document\d*\.xml/i);
      if (files && files.length > 0) {
        docFile = files[0];
      }
    }

    if (!docFile) {
      console.warn("No word/document.xml entry found in DOCX zip archive.");
      return "";
    }

    const xmlContent = await docFile.async("string");
    if (!xmlContent) return "";

    // 1. Use DOMParser if available in browser environment
    if (typeof DOMParser !== "undefined") {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlContent, "application/xml");
      
      // Extract paragraph by paragraph (<w:p>)
      const paragraphs = xmlDoc.getElementsByTagName("w:p");
      const lines: string[] = [];

      for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        const textNodes = p.getElementsByTagName("w:t");
        let pText = "";
        for (let j = 0; j < textNodes.length; j++) {
          pText += textNodes[j].textContent || "";
        }
        const trimmed = pText.trim();
        if (trimmed) {
          lines.push(trimmed);
        }
      }

      if (lines.length > 0) {
        return lines.join("\n");
      }
    }

    // 2. Fallback regex approach targeting <w:p> and <w:t> tags
    const paragraphMatches = xmlContent.match(/<w:p\b[^>]*>(.*?)<\/w:p>/gi);
    if (paragraphMatches && paragraphMatches.length > 0) {
      const lines: string[] = [];
      for (const pXml of paragraphMatches) {
        const wtMatches = pXml.match(/<w:t\b[^>]*>(.*?)<\/w:t>/gi);
        if (wtMatches) {
          const pText = wtMatches
            .map((t) => t.replace(/<[^>]+>/g, "").trim())
            .join("");
          if (pText.trim()) {
            lines.push(pText.trim());
          }
        }
      }
      if (lines.length > 0) {
        return lines.join("\n");
      }
    }

    // 3. Fallback targeting all <w:t> tags directly
    const wtMatches = xmlContent.match(/<w:t\b[^>]*>(.*?)<\/w:t>/gi);
    if (wtMatches) {
      return wtMatches
        .map((t) => t.replace(/<[^>]+>/g, "").trim())
        .filter(Boolean)
        .join("\n");
    }
  } catch (err) {
    console.error("extractDocxText via JSZip failed:", err);
  }

  return "";
}

/**
 * Main file text extractor handling DOCX, PDF, and plain text formats.
 */
export async function extractFileText(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();
  const arrayBuffer = await file.arrayBuffer();

  // 1. DOCX Handling
  if (fileName.endsWith(".docx") || fileName.endsWith(".doc")) {
    const docxText = await extractDocxText(arrayBuffer);
    if (docxText && docxText.trim().length > 0) {
      return docxText;
    }
  }

  // 2. PDF Handling
  if (fileName.endsWith(".pdf")) {
    const rawText = new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer);
    const pdfStrings = rawText.match(/\(([^()]{2,})\)/g);
    if (pdfStrings && pdfStrings.length > 0) {
      const pdfText = pdfStrings
        .map((s) => s.slice(1, -1).trim())
        .filter((s) => s.length > 2 && /[a-zA-Z0-9]/.test(s))
        .join("\n");
      if (pdfText.length > 20) {
        return pdfText;
      }
    }
  }

  // 3. Binary protection check: Never decode raw binary ZIP/PDF data as text
  const firstBytes = new Uint8Array(arrayBuffer.slice(0, 10));
  const isZip = firstBytes[0] === 0x50 && firstBytes[1] === 0x4b; // 'PK' signature
  const isPdf = firstBytes[0] === 0x25 && firstBytes[1] === 0x50; // '%P' signature

  if (isZip || isPdf) {
    console.warn("File is binary (ZIP/PDF) but no readable text could be decompressed.");
    return "";
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(arrayBuffer);
}

/**
 * Cleans raw document text, removing XML tags, binary artifacts, and garbled symbols.
 */
export function cleanRawSyllabusText(text: string): string {
  if (!text) return "";

  // 1. Strip XML/HTML tags
  let cleaned = text.replace(/<[^>]+>/g, "\n");

  // 2. Remove null bytes and non-printable control characters
  cleaned = cleaned.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, " ");

  // 3. Filter lines strictly
  const lines = cleaned.split(/\r?\n/);
  const validLines = lines
    .map((l) => l.trim())
    .filter((l) => {
      if (l.length < 2) return false;

      // Reject binary zip headers, xml noise, rels, fontTable, base64 strings, garbled symbols
      if (/^PK[\s\x00-\x20]*/i.test(l)) return false;
      if (/word\/(?:header|footer|theme|fontTable|styles|settings|numbering|rels|customXML|itemProps)/i.test(l)) return false;
      if (/xmlns:w=|schemas\.openxmlformats|xmlVersion|standalone=/i.test(l)) return false;
      if (l.includes("\uFFFD") || l.includes("9heKnHkiYMR") || l.includes("totcR2Iq") || l.includes("itemProps1")) return false;
      if (/^[a-zA-Z0-9+\/=]{30,}$/.test(l)) return false;

      // Filter out lines where readable characters (letters, numbers, basic punctuation) are less than 70%
      const cleanChars = l.replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\[\]\/\&]/g, "");
      if (cleanChars.length / l.length < 0.7) return false;

      // Must contain at least one English or language word (2+ letters)
      if (!/[a-zA-Z\u0B80-\u0BFF]{2,}/.test(l)) return false;

      return true;
    });

  return validLines.join("\n");
}

/**
 * Helper to clean individual title strings from garbled noise.
 */
function sanitizeCleanTitle(title: string, defaultFallback: string): string {
  if (!title) return defaultFallback;
  let clean = title.replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\/\&]/g, "").trim();

  // Reject if contains garbled indicators or has fewer than 3 letters
  if (
    clean.includes("PK") ||
    clean.includes("word/") ||
    clean.includes("9heKnHkiYMR") ||
    clean.includes("itemProps") ||
    clean.includes("fontTable") ||
    !/[a-zA-Z]{3,}/.test(clean)
  ) {
    return defaultFallback;
  }

  return clean;
}

/**
 * Strips metadata like Course Code, L-T-P, Credits, Hours, etc. from extracted subject names
 */
export function cleanSubjectName(name: string): string {
  if (!name) return "";
  let clean = name
    .replace(/(?:Course\s*Code|Course\s*ID|Subject\s*Code|Code|L\-?T\-?P|Credits?|Total\s*Hours?|Hours?|Semester|Regulation|Department|Dept)[\s:\-_].*$/i, "")
    .replace(/[\s\-_:=_]+$/, "")
    .trim();
  return clean || name;
}

/**
 * Main parser function to process syllabus text and extract curriculum elements
 */
export function parseSyllabusDocument(
  fileName: string,
  rawText: string
): ParsedSyllabusResult {
  const sanitizedText = cleanRawSyllabusText(rawText);

  const lines = sanitizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let detectedSubjectName = "";
  let detectedSubjectCode = "";
  let detectedDept = "";
  let detectedSemester = "";

  const courseOutcomes: ParsedCourseOutcome[] = [];
  const units: ParsedSyllabusUnit[] = [];

  // Helper regex patterns
  const coRegex = /^(?:CO\s*(\d+)|Course\s*Outcome\s*(\d+))[\s:\-\.]*(.*)/i;
  const unitRegex = /^(?:UNIT|MODULE|CHAPTER)[\s\-\.:]*([I|V|X|\d]+)[\s\-\.:]*(.*)/i;
  const codeRegex = /\b([0-9]{2}[A-Z]{2,6}[0-9]{3,4}|[A-Z]{2,4}[0-9]{3,4})\b/;

  let currentUnit: ParsedSyllabusUnit | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // 1. Detect Subject Code & Name from Header Lines
    if (!detectedSubjectCode) {
      const explicitCodeMatch = line.match(/(?:Course\s*Code|Subject\s*Code|Code)[\s:\-_]*([0-9]{2}[A-Z]{2,6}[0-9]{3,4}|[A-Z]{2,4}[0-9]{3,4})/i);
      if (explicitCodeMatch) {
        detectedSubjectCode = explicitCodeMatch[1].toUpperCase();
      } else {
        const codeMatch = line.match(codeRegex);
        if (codeMatch) {
          detectedSubjectCode = codeMatch[1];
        }
      }
    }

    if (!detectedSubjectName) {
      if (/subject\s*:\s*(.*)/i.test(line)) {
        detectedSubjectName = cleanSubjectName(line.replace(/subject\s*:\s*/i, "").trim());
      } else if (/course\s*title\s*:\s*(.*)/i.test(line)) {
        detectedSubjectName = cleanSubjectName(line.replace(/course\s*title\s*:\s*/i, "").trim());
      } else if (/syllabus\s*for\s*(.*)/i.test(line)) {
        detectedSubjectName = cleanSubjectName(line.replace(/syllabus\s*for\s*/i, "").trim());
      } else if (/^course(?:\s*name)?\s*:\s*(.*)/i.test(line)) {
        detectedSubjectName = cleanSubjectName(line.replace(/^course(?:\s*name)?\s*:\s*/i, "").trim());
      } else if (i === 0 && line.length < 100 && !/^unit/i.test(line) && !/^co\d/i.test(line)) {
        const possibleName = cleanSubjectName(line);
        if (possibleName && possibleName.length > 3 && /[a-zA-Z]{3,}/.test(possibleName)) {
          detectedSubjectName = possibleName;
        }
      }
    }

    if (!detectedDept && /department\s*:\s*(.*)/i.test(line)) {
      detectedDept = line.replace(/department\s*:\s*/i, "").trim();
    }

    if (!detectedSemester && /semester\s*:\s*(.*)/i.test(line)) {
      detectedSemester = line.replace(/semester\s*:\s*/i, "").trim();
    }

    // 2. Detect Course Outcomes (COs)
    const coMatch = line.match(coRegex);
    if (coMatch) {
      const coNum = coMatch[1] || coMatch[2];
      const coCode = `CO${coNum}`;
      const rawDesc = coMatch[3] ? coMatch[3].trim() : `Course Outcome ${coNum}`;
      const coDesc = sanitizeCleanTitle(rawDesc, `Course Outcome ${coNum}`);
      if (!courseOutcomes.some((c) => c.code === coCode)) {
        courseOutcomes.push({ code: coCode, description: coDesc });
      }
      continue;
    }

    // 3. Detect Units
    const unitMatch = line.match(unitRegex);
    if (unitMatch) {
      if (currentUnit) {
        currentUnit.topicsCount = Math.max(currentUnit.subtopics.length, 1);
        units.push(currentUnit);
      }

      const unitNumRaw = unitMatch[1];
      const unitTitleRaw = unitMatch[2] ? unitMatch[2].trim() : `Unit ${unitNumRaw}`;
      const cleanUnitTitle = sanitizeCleanTitle(unitTitleRaw, `Unit ${unitNumRaw} - Core Principles`);

      // Convert Roman numerals or digits to formatted unit num
      const formattedNum = /^0/i.test(unitNumRaw)
        ? unitNumRaw
        : /^[IVX]+$/i.test(unitNumRaw)
        ? `Unit ${unitNumRaw}`
        : `Unit 0${unitNumRaw}`;

      // Extract inline CO mappings like [CO1, CO2] or (CO1)
      const inlineCoMatches = line.match(/CO\d+/g) || [];

      currentUnit = {
        id: `parsed-unit-${Date.now()}-${units.length + 1}`,
        num: formattedNum,
        name: cleanUnitTitle,
        topicsCount: 0,
        subtopics: [],
        coMapping: Array.from(new Set(inlineCoMatches)),
      };
      continue;
    }

    // 4. If inside a Unit, capture subtopics & CO tags
    if (currentUnit) {
      // Check for CO tag on subtopic line
      const inlineCos = line.match(/CO\d+/g);
      if (inlineCos) {
        inlineCos.forEach((c) => {
          if (!currentUnit!.coMapping.includes(c)) {
            currentUnit!.coMapping.push(c);
          }
        });
      }

      // Clean topic line
      const cleanSubtopic = line
        .replace(/^[\s\-\*\•\d\.\)]+/, "")
        .replace(/\s*\[CO\d+.*\]/i, "")
        .replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\/\&]/g, "")
        .trim();

      if (
        cleanSubtopic.length > 2 &&
        /[a-zA-Z]{2,}/.test(cleanSubtopic) &&
        !/^unit/i.test(cleanSubtopic) &&
        !/^course/i.test(cleanSubtopic) &&
        !cleanSubtopic.includes("PK") &&
        !cleanSubtopic.includes("word/")
      ) {
        currentUnit.subtopics.push(cleanSubtopic);
      }
    }
  }

  // Push final active unit
  if (currentUnit) {
    currentUnit.topicsCount = Math.max(currentUnit.subtopics.length, 1);
    units.push(currentUnit);
  }

  // Fallback: If no explicit 'UNIT' headings were found, structure paragraphs into 3-5 units automatically
  if (units.length === 0 && lines.length > 0) {
    const totalLines = lines.length;
    const chunkSize = Math.max(Math.ceil(totalLines / 4), 1);

    for (let uIdx = 0; uIdx < 4 && uIdx * chunkSize < totalLines; uIdx++) {
      const chunkLines = lines.slice(uIdx * chunkSize, (uIdx + 1) * chunkSize);
      const rawTitle = chunkLines[0] || `Unit 0${uIdx + 1} - Key Principles`;
      const finalTitle = sanitizeCleanTitle(rawTitle, `Unit 0${uIdx + 1} - Core Topics`);

      const subtopics = chunkLines
        .slice(1)
        .map((l) => l.replace(/^[\s\-\*\•\d\.\)]+/, "").replace(/[^a-zA-Z0-9\s,\.\-\:\(\)\/\&]/g, "").trim())
        .filter((l) => l.length > 2 && /[a-zA-Z]{2,}/.test(l) && !l.includes("PK") && !l.includes("word/"));

      units.push({
        id: `auto-unit-${Date.now()}-${uIdx + 1}`,
        num: `Unit 0${uIdx + 1}`,
        name: finalTitle,
        topicsCount: Math.max(subtopics.length, 1),
        subtopics,
        coMapping: [`CO${uIdx + 1}`],
      });
    }
  }

  // Default Course Outcomes if none explicitly listed
  if (courseOutcomes.length === 0) {
    courseOutcomes.push(
      { code: "CO1", description: "Understand foundational principles and key concepts of the subject." },
      { code: "CO2", description: "Analyze core topics and evaluate practical application scenarios." },
      { code: "CO3", description: "Apply domain techniques and tools to solve domain problems." },
      { code: "CO4", description: "Synthesize advanced topics and construct comprehensive solutions." }
    );
  }

  // Fallback Subject Name from file name if not detected
  if (!detectedSubjectName) {
    detectedSubjectName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[_\-]/g, " ")
      .replace(/syllabus/i, "")
      .trim() || "Uploaded Subject Syllabus";
  }

  detectedSubjectName = cleanSubjectName(detectedSubjectName);

  return {
    subjectName: detectedSubjectName,
    subjectCode: detectedSubjectCode || `SUB-${Math.floor(100 + Math.random() * 900)}`,
    department: detectedDept || "General",
    semester: detectedSemester || "Semester 1",
    courseOutcomes,
    units,
    rawTextPreview: sanitizedText.slice(0, 400),
  };
}

