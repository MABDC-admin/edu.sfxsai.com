import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { FinanceApiService } from '../../../core/services/finance-api.service';
import { RegistrarApiService } from '../../../core/services/registrar-api.service';
import { Payment, StudentAssessment } from '../../../core/models/finance.models';
import { FinancePdfExportButtonComponent } from '../../../shared/pdf-export/finance-pdf-export-button.component';

interface FinanceReportCard {
  title: string;
  description: string;
  icon: string;
  source: string;
  cadence: string;
  metric: string;
  accent: 'emerald' | 'blue' | 'amber' | 'rose' | 'slate' | 'cyan' | 'violet';
}

@Component({
  selector: 'app-finance-reports',
  standalone: true,
  imports: [CommonModule, DecimalPipe, FinancePdfExportButtonComponent],
  templateUrl: './finance-reports.component.html',
  styleUrl: './finance-reports.component.scss',
})
export class FinanceReportsComponent implements OnInit {
  private finance = inject(FinanceApiService);
  private registrar = inject(RegistrarApiService);
  private destroyRef = inject(DestroyRef);

  academicYear: any;
  assessments: StudentAssessment[] = [];
  payments: Payment[] = [];
  loading = false;
  error = '';

  ngOnInit() {
    this.registrar.activeAcademicYear$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ay) => {
        if (!ay?.id) return;
        this.academicYear = ay;
        this.loadReports();
      });
  }

  get totalCollected(): number {
    return this.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }

  get totalAssessed(): number {
    return this.assessments.reduce((sum, assessment) => sum + Number(assessment.netAmount || 0), 0);
  }

  get totalReceivable(): number {
    return this.assessments.reduce((sum, assessment) => sum + Number(assessment.balance || 0), 0);
  }

  get totalDiscounts(): number {
    return this.assessments.reduce((sum, assessment) => sum + Number(assessment.discountAmount || 0), 0);
  }

  get clearedCount(): number {
    return this.assessments.filter((assessment) => assessment.financeStatus === 'Cleared').length;
  }

  get collectionRate(): number {
    if (!this.totalAssessed) return 0;
    return Math.round((this.totalCollected / this.totalAssessed) * 100);
  }

  get billingStatusSummary() {
    return this.assessments.reduce<Record<string, number>>((summary, assessment) => {
      const status = assessment.financeStatus || 'Unassigned';
      summary[status] = (summary[status] || 0) + 1;
      return summary;
    }, {});
  }

  get collectionSummary() {
    return {
      collected: this.totalCollected,
      assessed: this.totalAssessed,
      rate: this.collectionRate,
      payments: this.payments.length,
    };
  }

  get statusRows() {
    return Object.entries(this.billingStatusSummary)
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => a.status.localeCompare(b.status));
  }

  get recentPayments() {
    return [...this.payments]
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 6);
  }

  get financeReportCards(): FinanceReportCard[] {
    return [
      {
        title: 'Collection Summary',
        description: 'Total collections, receipt volume, and collection rate for the selected academic year.',
        icon: 'payments',
        source: 'Payments',
        cadence: 'Daily',
        metric: `₱${this.totalCollected.toLocaleString()}`,
        accent: 'emerald',
      },
      {
        title: 'Billing & Assessment Status',
        description: 'Assessment completion and student finance status counts.',
        icon: 'receipt_long',
        source: 'Billing & Assessment',
        cadence: 'Daily',
        metric: `${this.assessments.length} accounts`,
        accent: 'blue',
      },
      {
        title: 'Accounts Receivable',
        description: 'Open balances and pending collection exposure by learner account.',
        icon: 'account_balance',
        source: 'Billing Summary',
        cadence: 'Weekly',
        metric: `₱${this.totalReceivable.toLocaleString()}`,
        accent: 'amber',
      },
      {
        title: 'Student Ledger Export',
        description: 'Learner-level statement and payment history export package.',
        icon: 'account_balance_wallet',
        source: 'Student Ledger',
        cadence: 'On demand',
        metric: `${this.assessments.length} ledgers`,
        accent: 'cyan',
      },
      {
        title: 'Payment History',
        description: 'Receipt register with method, payee remarks, and posting dates.',
        icon: 'receipt',
        source: 'Payments',
        cadence: 'Daily',
        metric: `${this.payments.length} receipts`,
        accent: 'slate',
      },
      {
        title: 'Discount & Scholarship Summary',
        description: 'Regular, sibling, and scholarship discount impact across assessments.',
        icon: 'volunteer_activism',
        source: 'Assessments',
        cadence: 'Monthly',
        metric: `₱${this.totalDiscounts.toLocaleString()}`,
        accent: 'rose',
      },
      {
        title: 'Finance Clearance List',
        description: 'Cleared and pending learner accounts for registrar coordination.',
        icon: 'verified',
        source: 'Billing Summary',
        cadence: 'Daily',
        metric: `${this.clearedCount} cleared`,
        accent: 'violet',
      },
    ];
  }

  loadReports() {
    this.loading = true;
    this.error = '';
    forkJoin({
      assessments: this.finance.getAssessments(this.academicYear.id),
      payments: this.finance.getPayments(this.academicYear.id),
    }).subscribe({
      next: ({ assessments, payments }) => {
        this.assessments = assessments;
        this.payments = payments;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Finance reports request failed.';
      },
    });
  }

  trackReport(_: number, report: FinanceReportCard) {
    return report.title;
  }
}
