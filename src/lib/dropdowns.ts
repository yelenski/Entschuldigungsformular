// This file handles the dropdown data for select elements

interface DropdownOptions {
  classes: string[];
  professions: string[];
  teachers: string[];
  absenceTypes: string[];
}

// Default options in case API fails
const defaultOptions: DropdownOptions = {
  classes: ["1A", "1B", "2A", "2B", "3A", "3B"],
  professions: ["Informatiker", "Kaufmann", "Elektriker", "Mechaniker"],
  teachers: ["Herr Schmidt", "Frau Müller", "Herr Weber", "Frau Fischer"],
  absenceTypes: ["Krankheit", "Arzttermin", "Familiäre Gründe", "Sonstiges"]
};

// Gets options from API response or uses defaults
export function getDropdownOptions(apiResponse: any): DropdownOptions {
  if (!apiResponse) {
    return defaultOptions;
  }

  return {
    classes: apiResponse.classes || defaultOptions.classes,
    professions: apiResponse.professions || defaultOptions.professions,
    teachers: apiResponse.teachers || defaultOptions.teachers,
    absenceTypes: apiResponse.absenceTypes || defaultOptions.absenceTypes
  };
}
