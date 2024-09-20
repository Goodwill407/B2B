// src/app/shared/validators/custom-validators.ts

import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

/**
 * Validator to check if the PAN in GSTIN matches the PAN field.
 * @param gstinControlName - The name of the GSTIN form control.
 * @param panControlName - The name of the PAN form control.
 * @returns ValidatorFn
 */
export function panMatchValidator(gstinControlName: string, panControlName: string): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    if (!(formGroup instanceof FormGroup)) {
      return null;
    }

    const gstinControl = formGroup.get(gstinControlName);
    const panControl = formGroup.get(panControlName);

    if (!gstinControl || !panControl) {
      return null;
    }

    const gstin = gstinControl.value;
    const pan = panControl.value;

    if (!gstin || !pan) {
      // If either field is empty, don't validate yet
      return null;
    }

    // Ensure GSTIN is at least 12 characters to extract PAN
    if (gstin.length < 12) {
      return { gstinInvalid: true };
    }

    // Extract PAN from GSTIN (GSTIN format: 15 characters, PAN is characters 3-12)
    const gstinPan = gstin.substring(2, 12).toUpperCase();

    if (gstinPan !== pan.toUpperCase()) {
      return { panMismatch: true };
    }

    return null; // No error
  };
}

export function maxWordCountValidator(maxWords: number): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value || '';
    const wordCount = value.split(/\s+/).filter((word:any) => word.length > 0).length;
    return wordCount > maxWords ? { maxWords: { actualCount: wordCount, maxWords: maxWords } } : null;
  };
}