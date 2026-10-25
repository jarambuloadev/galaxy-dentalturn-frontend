import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import {
  BusinessHours,
  DAY_LABELS,
  DayHoursItemRequest,
  DayOfWeek,
  DISPLAY_ORDER,
} from '../../core/models/business-hours.model';
import { BusinessHoursService } from '../../core/services/business-hours.service';
import { NotificationService } from '../../core/services/notification.service';
import { SharedMaterialModule } from '../../shared/shared-material.module';

function dayTimeRangeValidator(control: AbstractControl): ValidationErrors | null {
  const raw = control.getRawValue();
  const isOpen = raw?.isOpen as boolean;
  const openTime = raw?.openTime as string;
  const closeTime = raw?.closeTime as string;

  if (isOpen && openTime && closeTime && openTime >= closeTime) {
    return { invalidTimeRange: true };
  }
  return null;
}

@Component({
  selector: 'app-availability-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedMaterialModule],
  templateUrl: './availability.page.html',
  styleUrl: './availability.page.scss',
})
export class AvailabilityPage implements OnInit {
  private readonly businessHoursService = inject(BusinessHoursService);
  private readonly notification = inject(NotificationService);
  private readonly fb = inject(FormBuilder);

  readonly dayLabels = DAY_LABELS;
  loading = signal(false);
  loadingData = signal(false);

  form = this.fb.group({
    days: this.fb.array<FormGroup>([]),
  });

  get daysArray(): FormArray<FormGroup> {
    return this.form.get('days') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    this.initDefaultForm();
    this.loadBusinessHours();
  }

  private initDefaultForm(initialDays: BusinessHours[] = []): void {
    const byDay = new Map(initialDays.map((d) => [d.dayOfWeek, d]));
    this.daysArray.clear();

    for (const dayOfWeek of DISPLAY_ORDER) {
      const existing = byDay.get(dayOfWeek);
      const isOpen = existing?.isOpen ?? (dayOfWeek >= 1 && dayOfWeek <= 5);
      const openTime = existing?.openTime ?? '09:00';
      const closeTime = existing?.closeTime ?? '18:00';

      const group = this.fb.group(
        {
          dayOfWeek: [dayOfWeek, [Validators.required]],
          isOpen: [isOpen],
          openTime: [{ value: openTime, disabled: !isOpen }, [Validators.required]],
          closeTime: [{ value: closeTime, disabled: !isOpen }, [Validators.required]],
        },
        { validators: dayTimeRangeValidator }
      );

      this.daysArray.push(group);
    }
  }

  loadBusinessHours(): void {
    this.loadingData.set(true);
    this.businessHoursService.list().subscribe({
      next: (rows) => {
        if (rows && rows.length > 0) {
          this.initDefaultForm(rows);
        }
        this.loadingData.set(false);
      },
      error: () => {
        this.notification.error('Error al cargar el horario de atención');
        this.loadingData.set(false);
      },
    });
  }

  getDayLabel(index: number): string {
    const dayOfWeek = this.daysArray.at(index).get('dayOfWeek')?.value as DayOfWeek;
    return this.dayLabels[dayOfWeek] ?? '';
  }

  isDayOpen(index: number): boolean {
    return !!this.daysArray.at(index).get('isOpen')?.value;
  }

  toggleDay(index: number): void {
    const group = this.daysArray.at(index);
    const nextOpen = !group.get('isOpen')?.value;
    group.patchValue({ isOpen: nextOpen });

    if (nextOpen) {
      group.get('openTime')?.enable({ emitEvent: false });
      group.get('closeTime')?.enable({ emitEvent: false });
    } else {
      group.get('openTime')?.disable({ emitEvent: false });
      group.get('closeTime')?.disable({ emitEvent: false });
    }

    group.updateValueAndValidity();
  }

  hasTimeRangeError(index: number): boolean {
    const group = this.daysArray.at(index);
    return group.hasError('invalidTimeRange');
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    const days: DayHoursItemRequest[] = this.daysArray.controls.map((group) => {
      const raw = group.getRawValue();
      return {
        dayOfWeek: raw.dayOfWeek as DayOfWeek,
        isOpen: !!raw.isOpen,
        openTime: (raw.openTime as string) || '09:00',
        closeTime: (raw.closeTime as string) || '18:00',
      };
    });

    this.loading.set(true);
    this.businessHoursService.updateAll({ days }).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.isFailure) {
          this.notification.error(res.message || res.errors?.[0] || 'Error al actualizar el horario');
          return;
        }
        this.notification.success('Horario de atención actualizado');
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg =
          err.error?.error?.message ??
          err.error?.message ??
          'Error al guardar el horario de atención';
        this.notification.error(msg);
      },
    });
  }
}
