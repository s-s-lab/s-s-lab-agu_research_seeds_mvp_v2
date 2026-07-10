import type { ResearchSeed, SeedStatus } from "../types/researchSeed";

export type DataValidationIssue = {
  fileName: string;
  field: string;
  message: string;
};

export type SeedFileInput = {
  fileName: string;
  data: unknown;
};

export type SeedValidationOptions = {
  knownImagePaths?: Set<string>;
};

export type SeedValidationResult = {
  validSeeds: ResearchSeed[];
  issues: DataValidationIssue[];
};

const allowedStatuses: SeedStatus[] = ["published", "draft"];

const requiredStringFields: Array<keyof ResearchSeed> = [
  "id",
  "title",
  "catchphrase",
  "summary",
  "researcherName",
  "affiliation",
  "mainField",
  "thumbnail",
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === "number");

const isBoolean = (value: unknown): value is boolean =>
  typeof value === "boolean";

const isValidDateString = (value: unknown): boolean =>
  value === undefined ||
  (typeof value === "string" && !Number.isNaN(Date.parse(value)));

const isValidUrl = (value: string): boolean => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
};

const isSafeImagePath = (value: string): boolean => {
  if (/^https?:\/\//i.test(value)) {
    return isValidUrl(value);
  }

  const normalized = value.replace(/\\/g, "/");
  return (
    normalized.startsWith("media/seeds/") &&
    !normalized.includes("../") &&
    !normalized.startsWith("/") &&
    /\.(avif|gif|jpe?g|png|svg|webp)$/i.test(normalized)
  );
};

const pushIssue = (
  issues: DataValidationIssue[],
  fileName: string,
  field: string,
  message: string,
) => {
  issues.push({ fileName, field, message });
};

export const validateResearchSeed = (
  fileName: string,
  data: unknown,
  options: SeedValidationOptions = {},
): DataValidationIssue[] => {
  const issues: DataValidationIssue[] = [];

  if (!isRecord(data)) {
    pushIssue(issues, fileName, "(root)", "JSONのルートはオブジェクトにしてください。");
    return issues;
  }

  for (const field of requiredStringFields) {
    if (!isNonEmptyString(data[field])) {
      pushIssue(issues, fileName, field, "必須項目が未入力です。");
    }
  }

  if (!allowedStatuses.includes(data.status as SeedStatus)) {
    pushIssue(
      issues,
      fileName,
      "status",
      'statusは"published"または"draft"にしてください。',
    );
  }

  if (!isBoolean(data.featured)) {
    pushIssue(issues, fileName, "featured", "featuredはtrue/falseで指定してください。");
  }

  if (!isStringArray(data.keywords) || data.keywords.length === 0) {
    pushIssue(issues, fileName, "keywords", "keywordsは1件以上の文字列配列にしてください。");
  }

  const stringArrayFields: Array<keyof ResearchSeed> = [
    "strengths",
    "expectedApplications",
    "collaborationNeeds",
    "subFields",
    "freeKeywords",
    "collaborationTypes",
  ];

  for (const field of stringArrayFields) {
    const value = data[field];
    if (value !== undefined && !isStringArray(value)) {
      pushIssue(issues, fileName, field, "文字列配列で指定してください。");
    }
  }

  if (data.sdgs !== undefined) {
    if (!isNumberArray(data.sdgs)) {
      pushIssue(issues, fileName, "sdgs", "SDGs番号は数値配列で指定してください。");
    } else {
      for (const sdg of data.sdgs) {
        if (!Number.isInteger(sdg) || sdg < 1 || sdg > 17) {
          pushIssue(issues, fileName, "sdgs", "SDGs番号は1から17の整数にしてください。");
          break;
        }
      }
    }
  }

  const optionalUrlFields: Array<keyof ResearchSeed> = ["profileUrl"];
  for (const field of optionalUrlFields) {
    const value = data[field];
    if (value !== undefined && (!isNonEmptyString(value) || !isValidUrl(value))) {
      pushIssue(issues, fileName, field, "URLはhttpまたはhttpsで始まる正しい形式にしてください。");
    }
  }

  if (isNonEmptyString(data.thumbnail)) {
    if (!isSafeImagePath(data.thumbnail)) {
      pushIssue(
        issues,
        fileName,
        "thumbnail",
        "画像パスはmedia/seeds/配下の画像ファイルを指定してください。",
      );
    } else if (
      options.knownImagePaths &&
      !/^https?:\/\//i.test(data.thumbnail) &&
      !options.knownImagePaths.has(data.thumbnail)
    ) {
      pushIssue(issues, fileName, "thumbnail", "指定された画像ファイルがpublic配下に見つかりません。");
    }
  }

  if (data.images !== undefined) {
    if (!Array.isArray(data.images)) {
      pushIssue(issues, fileName, "images", "imagesは配列で指定してください。");
    } else {
      data.images.forEach((image, index) => {
        if (!isRecord(image)) {
          pushIssue(issues, fileName, `images[${index}]`, "画像情報はオブジェクトにしてください。");
          return;
        }
        if (!isNonEmptyString(image.src) || !isSafeImagePath(image.src)) {
          pushIssue(issues, fileName, `images[${index}].src`, "画像パスが不正です。");
        } else if (
          options.knownImagePaths &&
          !/^https?:\/\//i.test(image.src) &&
          !options.knownImagePaths.has(image.src)
        ) {
          pushIssue(
            issues,
            fileName,
            `images[${index}].src`,
            "指定された画像ファイルがpublic配下に見つかりません。",
          );
        }
        if (!isNonEmptyString(image.alt)) {
          pushIssue(issues, fileName, `images[${index}].alt`, "画像のaltを指定してください。");
        }
      });
    }
  }

  if (data.videos !== undefined) {
    if (!Array.isArray(data.videos)) {
      pushIssue(issues, fileName, "videos", "videosは配列で指定してください。");
    } else {
      data.videos.forEach((video, index) => {
        if (!isRecord(video)) {
          pushIssue(issues, fileName, `videos[${index}]`, "動画情報はオブジェクトにしてください。");
          return;
        }
        if (!isNonEmptyString(video.title)) {
          pushIssue(issues, fileName, `videos[${index}].title`, "動画タイトルを指定してください。");
        }
        if (!isNonEmptyString(video.url) || !isValidUrl(video.url)) {
          pushIssue(issues, fileName, `videos[${index}].url`, "動画URLが不正です。");
        }
      });
    }
  }

  if (data.relatedLinks !== undefined) {
    if (!Array.isArray(data.relatedLinks)) {
      pushIssue(issues, fileName, "relatedLinks", "relatedLinksは配列で指定してください。");
    } else {
      data.relatedLinks.forEach((link, index) => {
        if (!isRecord(link)) {
          pushIssue(issues, fileName, `relatedLinks[${index}]`, "リンク情報はオブジェクトにしてください。");
          return;
        }
        if (!isNonEmptyString(link.label)) {
          pushIssue(issues, fileName, `relatedLinks[${index}].label`, "リンク名を指定してください。");
        }
        if (!isNonEmptyString(link.url) || !isValidUrl(link.url)) {
          pushIssue(issues, fileName, `relatedLinks[${index}].url`, "関連リンクURLが不正です。");
        }
      });
    }
  }

  for (const field of ["publishedAt", "updatedAt"] as const) {
    if (!isValidDateString(data[field])) {
      pushIssue(issues, fileName, field, "日付はYYYY-MM-DDなどDate.parse可能な形式にしてください。");
    }
  }

  return issues;
};

export const validateSeedFiles = (
  files: SeedFileInput[],
  options: SeedValidationOptions = {},
): SeedValidationResult => {
  const issues: DataValidationIssue[] = [];
  const validSeeds: ResearchSeed[] = [];
  const idToFile = new Map<string, string>();

  for (const file of files) {
    const fileIssues = validateResearchSeed(file.fileName, file.data, options);
    issues.push(...fileIssues);

    if (isRecord(file.data) && isNonEmptyString(file.data.id)) {
      const existingFile = idToFile.get(file.data.id);
      if (existingFile) {
        pushIssue(
          issues,
          file.fileName,
          "id",
          `IDが重複しています。同じIDは${existingFile}でも使用されています。`,
        );
      } else {
        idToFile.set(file.data.id, file.fileName);
      }
    }

    if (fileIssues.length === 0 && isRecord(file.data)) {
      validSeeds.push(file.data as ResearchSeed);
    }
  }

  return {
    validSeeds,
    issues,
  };
};
