import { AssessmentResult, StudentAnswer } from "@/types/assessment";

const STORAGE_KEYS = {
  ANSWERS: "shikshaiq_assessment_answers",
  RESULT: "shikshaiq_assessment_result",
  PERSONA: "shikshaiq_active_persona",
};

export function getStoredAnswers(): StudentAnswer[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.ANSWERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredAnswers(answers: StudentAnswer[]): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  } catch {
    // Ignore session storage write errors
  }
}

export function getStoredResult(): AssessmentResult | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.RESULT);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredResult(result: AssessmentResult): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(result));
  } catch {
    // Ignore storage write errors
  }
}

export function clearStoredAssessment(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEYS.ANSWERS);
    sessionStorage.removeItem(STORAGE_KEYS.RESULT);
  } catch {
    // Ignore storage errors
  }
}

export function getStoredPersonaId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEYS.PERSONA);
  } catch {
    return null;
  }
}

export function saveStoredPersonaId(personaId: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (personaId) {
      sessionStorage.setItem(STORAGE_KEYS.PERSONA, personaId);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.PERSONA);
    }
  } catch {
    // Ignore storage errors
  }
}
