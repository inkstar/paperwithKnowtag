
export interface QuestionItem {
  id: string;
  number: string;
  content: string;
  knowledgePoint: string;
  source: string;
  type: string;
}

export interface StyleSettings {
  showHeaderFooter: boolean;
  showKnowledgePoint: boolean;
  showSource: boolean;
  headerTitle: string;
  choiceGap: string;
  solutionGap: string;
  lineSpacing: number;
}

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl?: string;
  type: 'image' | 'pdf';
}

export enum ProcessingStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface HistoryRecord {
  id: string;
  timestamp: number;
  title: string;
  fileNames: string[];
  questions: QuestionItem[];
  latex: string;
  options: {
    sortByType: boolean;
    keepOriginalNumbers: boolean;
    enableTikz: boolean;
    style?: StyleSettings;
  };
}
