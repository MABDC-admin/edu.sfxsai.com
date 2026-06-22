"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancePdfService = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const finance_service_1 = require("./finance.service");
let FinancePdfService = class FinancePdfService {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    async generateStudentLedgerPdf(studentId, academicYearId) {
        const ledger = await this.financeService.getLedger(studentId, academicYearId);
        if (!ledger) {
            throw new Error('Ledger not found');
        }
        const PdfPrinter = require('pdfmake/js/Printer').default;
        const fs = require('fs');
        const path = require('path');
        const fontsDir = path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto');
        const fonts = {
            Roboto: {
                normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
                bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
                italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
                bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
            },
        };
        const urlResolver = { resolve: () => { }, resolved: async () => { } };
        const printer = new PdfPrinter(fonts, undefined, urlResolver);
        const logoData = this.loadAssetImageData(path.join(process.cwd(), 'src', 'assets', 'logo.png'), fs, path);
        const photoData = this.loadStudentPhotoData(ledger.student, fs, path);
        const docDefinition = this.buildStudentLedgerDocDefinition(ledger, academicYearId, logoData, photoData);
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        return new Promise((resolve, reject) => {
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
    async generateFinanceDashboardReportPdf(academicYearId) {
        const [assessments, payments] = await Promise.all([
            this.financeService.listAssessments(academicYearId),
            this.financeService.listPayments(academicYearId),
        ]);
        const PdfPrinter = require('pdfmake/js/Printer').default;
        const fs = require('fs');
        const path = require('path');
        const fontsDir = path.join(process.cwd(), 'node_modules', 'pdfmake', 'fonts', 'Roboto');
        const fonts = {
            Roboto: {
                normal: path.join(fontsDir, 'Roboto-Regular.ttf'),
                bold: path.join(fontsDir, 'Roboto-Medium.ttf'),
                italics: path.join(fontsDir, 'Roboto-Italic.ttf'),
                bolditalics: path.join(fontsDir, 'Roboto-MediumItalic.ttf'),
            },
        };
        const urlResolver = { resolve: () => { }, resolved: async () => { } };
        const printer = new PdfPrinter(fonts, undefined, urlResolver);
        const logoData = this.loadAssetImageData(path.join(process.cwd(), 'src', 'assets', 'logo.png'), fs, path);
        const docDefinition = this.buildFinanceDashboardReportDocDefinition(assessments, payments, academicYearId, logoData);
        const pdfDoc = await printer.createPdfKitDocument(docDefinition);
        return new Promise((resolve, reject) => {
            const chunks = [];
            pdfDoc.on('data', (chunk) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', reject);
            pdfDoc.end();
        });
    }
    buildStudentLedgerDocDefinition(ledger, academicYearId, logoData = null, studentPhotoData = null, generatedAt = new Date()) {
        const student = ledger.student ?? {};
        const lineItems = this.assessmentLineItems(ledger);
        const payments = Array.isArray(ledger.payments) ? ledger.payments : [];
        const totals = this.ledgerTotals(ledger, lineItems, payments);
        const asOf = this.formatDate(generatedAt, 'MMMM dd, yyyy');
        const syLabel = this.academicYearLabel(ledger, academicYearId);
        const referenceNo = this.referenceNumber(ledger, student, generatedAt);
        const balanceColor = totals.balance > 0 ? '#e51b23' : '#137333';
        const statusLabel = totals.balance > 0 ? 'WITH BALANCE' : 'CLEARED';
        const docDefinition = {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [36, 28, 36, 28],
            background: (_currentPage, pageSize) => [
                {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: pageSize.width,
                            h: 7,
                            color: '#243f91',
                        },
                    ],
                },
                {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 7,
                            w: pageSize.width,
                            h: pageSize.height - 7,
                            color: '#ffffff',
                        },
                    ],
                },
            ],
            defaultStyle: { font: 'Roboto', fontSize: 8.1, color: '#27364a' },
            content: [
                this.headerBlock(logoData, studentPhotoData, student, syLabel, asOf, statusLabel),
                this.titleBand(referenceNo),
                {
                    columns: [
                        this.studentDetailsCard(student),
                        { width: 14, text: '' },
                        this.feeOverviewCard(totals, balanceColor),
                    ],
                    margin: [0, 14, 0, 16],
                },
                this.quickStats(totals),
                {
                    text: 'TRANSACTION HISTORY',
                    style: 'sectionTitle',
                    margin: [0, 14, 0, 6],
                },
                this.transactionHistoryTable(lineItems, payments, totals),
                this.noticeBlock(),
                this.notesAndSignatureBlock(asOf),
            ],
            footer: () => ({
                text: 'Prepared for school accounting use. Keep this copy for your records.',
                alignment: 'center',
                color: '#7a8797',
                fontSize: 7,
                margin: [0, 0, 0, 12],
            }),
            styles: {
                schoolTitle: { bold: true, fontSize: 13.4, color: '#123569' },
                schoolSubtitle: {
                    fontSize: 8.2,
                    color: '#64748b',
                    margin: [0, 2, 0, 0],
                },
                ledgerTitle: { bold: true, fontSize: 23, color: '#123569' },
                sectionTitle: { bold: true, fontSize: 10.8, color: '#137332' },
                cardTitle: {
                    bold: true,
                    fontSize: 9.8,
                    color: '#137332',
                    margin: [0, 0, 0, 8],
                },
                label: { color: '#7a8797', bold: true },
                value: { bold: true, color: '#27364a' },
                tableHeader: {
                    bold: true,
                    color: '#ffffff',
                    fontSize: 6.3,
                    margin: [3, 4.5, 3, 4.5],
                },
                tableCell: { fontSize: 6.6, margin: [3, 4.5, 3, 4.5] },
                tableTotal: {
                    bold: true,
                    color: '#214e9f',
                    fontSize: 6.9,
                    margin: [3, 5.5, 3, 5.5],
                },
            },
        };
        return docDefinition;
    }
    headerBlock(logoData, studentPhotoData, student, syLabel, asOf, statusLabel) {
        const logo = logoData
            ? { image: logoData, width: 87, height: 87, margin: [0, 0, 16, 0] }
            : {
                canvas: [
                    {
                        type: 'ellipse',
                        x: 43.5,
                        y: 43.5,
                        r1: 43.5,
                        r2: 43.5,
                        color: '#f0f7f1',
                    },
                    {
                        type: 'ellipse',
                        x: 43.5,
                        y: 43.5,
                        r1: 33,
                        r2: 33,
                        color: '#ffffff',
                        lineColor: '#137332',
                        lineWidth: 1.2,
                    },
                ],
                width: 87,
                height: 87,
                margin: [0, 0, 16, 0],
            };
        return {
            columns: [
                logo,
                {
                    width: '*',
                    stack: [
                        {
                            text: 'ST. FRANCIS XAVIER SMART ACADEMY INC.',
                            style: 'schoolTitle',
                            margin: [0, 4, 0, 0],
                        },
                        { text: 'Conalum, Inopacan, Leyte', style: 'schoolSubtitle' },
                        {
                            text: 'Accounting Office | Official Student Account Record',
                            style: 'schoolSubtitle',
                        },
                        {
                            columns: [
                                this.smallPill(`SY ${syLabel}`, '#e8f3ff', '#243f91'),
                                { width: 8, text: '' },
                                this.smallPill(`As of ${asOf}`, '#eef9f1', '#137332', 118),
                                { width: 8, text: '' },
                                this.smallPill(statusLabel, statusLabel === 'CLEARED' ? '#e9f9ef' : '#fff3e8', statusLabel === 'CLEARED' ? '#137332' : '#c45705', 80),
                            ],
                            margin: [0, 8, 0, 0],
                        },
                    ],
                },
                { width: 16, text: '' },
                this.learnerPhotoCard(studentPhotoData, student),
            ],
            margin: [0, 0, 0, 16],
        };
    }
    titleBand(referenceNo) {
        return {
            table: {
                widths: ['*', 145],
                body: [
                    [
                        {
                            text: 'STUDENT LEDGER',
                            style: 'ledgerTitle',
                            margin: [0, 8, 0, 5],
                        },
                        {
                            stack: [
                                {
                                    text: 'REFERENCE NO.',
                                    bold: true,
                                    color: '#7a8797',
                                    fontSize: 6.5,
                                    alignment: 'right',
                                },
                                {
                                    text: referenceNo,
                                    bold: true,
                                    color: '#123569',
                                    fontSize: 8.2,
                                    alignment: 'right',
                                    margin: [0, 3, 0, 0],
                                },
                            ],
                            margin: [0, 11, 0, 0],
                        },
                    ],
                ],
            },
            layout: {
                hLineWidth: (i) => (i === 1 ? 1.2 : 0),
                vLineWidth: () => 0,
                hLineColor: () => '#dbe5ef',
                paddingLeft: () => 0,
                paddingRight: () => 0,
                paddingTop: () => 0,
                paddingBottom: () => 5,
            },
        };
    }
    learnerPhotoCard(studentPhotoData, student) {
        const initials = this.studentInitials(student);
        const photoContent = studentPhotoData
            ? {
                image: studentPhotoData,
                fit: [64, 64],
                alignment: 'center',
                margin: [0, 0, 0, 3],
            }
            : {
                stack: [
                    {
                        canvas: [
                            {
                                type: 'rect',
                                x: 0,
                                y: 0,
                                w: 64,
                                h: 64,
                                r: 9,
                                color: '#eef4ff',
                                lineColor: '#c8d8f2',
                                lineWidth: 0.8,
                            },
                        ],
                        margin: [0, 0, 0, -45],
                    },
                    {
                        text: initials,
                        alignment: 'center',
                        bold: true,
                        color: '#243f91',
                        fontSize: 17,
                        margin: [0, 14, 0, 11],
                    },
                ],
            };
        return {
            width: 88,
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                photoContent,
                                {
                                    text: 'Learner Photo',
                                    alignment: 'center',
                                    color: '#64748b',
                                    fontSize: 6.6,
                                    bold: true,
                                },
                            ],
                            margin: [6, 6, 6, 6],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#ffffff', '#dbe5ef'),
        };
    }
    smallPill(text, fillColor, color, width = 92) {
        return {
            width,
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            text,
                            alignment: 'center',
                            bold: true,
                            color,
                            fontSize: 7,
                            margin: [0, 3, 0, 3],
                        },
                    ],
                ],
            },
            layout: this.boxLayout(fillColor, fillColor),
        };
    }
    studentDetailsCard(student) {
        const gradeSection = [this.gradeLabel(student.gradeLevel), student.section]
            .filter(Boolean)
            .join(' - ') || 'Not provided';
        return {
            width: '*',
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'Student Details', style: 'cardTitle' },
                                this.infoRow('Student Name', this.studentName(student)),
                                this.infoRow('Grade & Section', gradeSection),
                                this.infoRow('Student ID', student.studentNo ?? student.id ?? 'Not provided'),
                                this.infoRow('LRN', student.lrn ?? 'Not provided'),
                                this.infoRow('Guardian', student.guardian ?? student.motherName ?? 'Not provided'),
                                this.infoRow('Contact No.', student.contactNo ??
                                    student.motherContact ??
                                    student.fatherContact ??
                                    'Not provided'),
                            ],
                            margin: [11, 10, 11, 10],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#ffffff', '#dbe5ef'),
        };
    }
    feeOverviewCard(totals, balanceColor) {
        return {
            width: 198,
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'Fee Overview', style: 'cardTitle' },
                                this.amountRow('Assessment', totals.gross),
                                this.amountRow('Discount', totals.discount),
                                this.amountRow('Scholarship', totals.scholarship),
                                this.amountRow('Payments', totals.paid),
                                this.amountRow('Adjustments', totals.adjustments),
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 0,
                                            y1: 5,
                                            x2: 174,
                                            y2: 5,
                                            lineWidth: 0.7,
                                            lineColor: '#dbe5ef',
                                        },
                                    ],
                                    margin: [0, 1, 0, 7],
                                },
                                {
                                    columns: [
                                        {
                                            width: '*',
                                            text: 'BALANCE DUE',
                                            bold: true,
                                            color: '#137332',
                                            fontSize: 9.7,
                                        },
                                        {
                                            width: 'auto',
                                            text: this.money(totals.balance),
                                            bold: true,
                                            color: balanceColor,
                                            fontSize: 12.1,
                                            alignment: 'right',
                                        },
                                    ],
                                },
                            ],
                            margin: [11, 10, 11, 10],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#ffffff', '#dbe5ef'),
        };
    }
    quickStats(totals) {
        const collectionRate = totals.net > 0
            ? Math.min(100, Math.round((totals.paid / totals.net) * 1000) / 10)
            : 0;
        return {
            columns: [
                this.statBox('Total Assessed', this.money(totals.gross), '#243f91'),
                { width: 12, text: '' },
                this.statBox('Total Paid', this.money(totals.paid), '#137332'),
                { width: 12, text: '' },
                this.statBox('Collection Status', `${collectionRate}%`, '#0f7f95'),
            ],
            margin: [0, 0, 0, 0],
        };
    }
    statBox(label, value, color) {
        return {
            width: '*',
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    text: label.toUpperCase(),
                                    bold: true,
                                    color: '#7a8797',
                                    fontSize: 6.4,
                                },
                                {
                                    text: value,
                                    bold: true,
                                    color,
                                    fontSize: 11,
                                    margin: [0, 3, 0, 0],
                                },
                            ],
                            margin: [10, 8, 10, 8],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#f8fbff', '#dbe5ef'),
        };
    }
    transactionHistoryTable(lineItems, payments, totals) {
        const body = [
            [
                { text: 'DATE', style: 'tableHeader' },
                { text: 'REF. NO.', style: 'tableHeader' },
                { text: 'DESCRIPTION', style: 'tableHeader' },
                { text: 'CHARGES', style: 'tableHeader', alignment: 'right' },
                { text: 'DISCOUNT', style: 'tableHeader', alignment: 'right' },
                { text: 'SCHOLARSHIP', style: 'tableHeader', alignment: 'right' },
                { text: 'PAYMENTS', style: 'tableHeader', alignment: 'right' },
                { text: 'ADJUST.', style: 'tableHeader', alignment: 'right' },
                { text: 'BALANCE', style: 'tableHeader', alignment: 'right' },
            ],
        ];
        this.transactionRows(lineItems, payments, totals)
            .slice(0, 8)
            .forEach((row) => {
            body.push([
                { text: row.date, style: 'tableCell' },
                { text: row.refNo, style: 'tableCell' },
                { text: row.description, style: 'tableCell' },
                {
                    text: this.money(row.charge),
                    style: 'tableCell',
                    alignment: 'right',
                },
                {
                    text: this.money(row.discount),
                    style: 'tableCell',
                    alignment: 'right',
                },
                {
                    text: this.money(row.scholarship),
                    style: 'tableCell',
                    alignment: 'right',
                },
                {
                    text: this.money(row.payment),
                    style: 'tableCell',
                    alignment: 'right',
                },
                {
                    text: this.money(row.adjustment),
                    style: 'tableCell',
                    alignment: 'right',
                },
                {
                    text: this.money(row.balance),
                    style: 'tableCell',
                    alignment: 'right',
                    color: row.balance > 0 ? '#e51b23' : '#137333',
                },
            ]);
        });
        body.push([
            { text: 'TOTAL', colSpan: 3, style: 'tableTotal', alignment: 'center' },
            {},
            {},
            {
                text: this.money(totals.gross),
                style: 'tableTotal',
                alignment: 'right',
            },
            {
                text: this.money(totals.discount),
                style: 'tableTotal',
                alignment: 'right',
            },
            {
                text: this.money(totals.scholarship),
                style: 'tableTotal',
                alignment: 'right',
            },
            {
                text: this.money(totals.paid),
                style: 'tableTotal',
                alignment: 'right',
            },
            {
                text: this.money(totals.adjustments),
                style: 'tableTotal',
                alignment: 'right',
            },
            {
                text: this.money(totals.balance),
                style: 'tableTotal',
                alignment: 'right',
                color: totals.balance > 0 ? '#e51b23' : '#137333',
            },
        ]);
        const tableNode = {
            table: {
                headerRows: 1,
                heights: (rowIndex) => (rowIndex === 0 ? 17 : undefined),
                widths: [40, 44, '*', 50, 45, 50, 48, 44, 52],
                body,
            },
            layout: {
                hLineWidth: (i, node) => i === 0 || i === node.table.body.length ? 0 : 0.5,
                vLineWidth: (i, node) => i === 0 || i === node.table.widths.length ? 0 : 0.5,
                hLineColor: () => '#d0dbe7',
                vLineColor: () => '#d0dbe7',
                fillColor: (rowIndex, node) => rowIndex === node.table.body.length - 1 ? '#f3f7ff' : null,
            },
        };
        return {
            stack: [
                {
                    canvas: [
                        {
                            type: 'rect',
                            x: 0,
                            y: 0,
                            w: 523,
                            h: 17,
                            r: 8,
                            color: '#137332',
                        },
                    ],
                    margin: [0, 0, 0, -17],
                },
                tableNode,
            ],
        };
    }
    noticeBlock() {
        return {
            table: {
                widths: ['*'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    text: 'Discount and Scholarship Notice',
                                    bold: true,
                                    color: '#137332',
                                    fontSize: 9.1,
                                    margin: [0, 0, 0, 4],
                                },
                                {
                                    text: 'Any approved discount or scholarship will appear as a deduction in the ledger after validation by the Accounting Office.',
                                    color: '#364152',
                                    fontSize: 7.6,
                                },
                            ],
                            margin: [10, 8, 10, 8],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#f2fbf4', '#cbead2'),
            margin: [0, 15, 0, 14],
        };
    }
    notesAndSignatureBlock(asOf) {
        return {
            table: {
                widths: ['49%', '51%'],
                body: [
                    [
                        {
                            stack: [
                                {
                                    text: 'NOTES',
                                    bold: true,
                                    color: '#137332',
                                    fontSize: 9.2,
                                    margin: [0, 0, 0, 5],
                                },
                                {
                                    ul: [
                                        'Please settle any remaining balance on or before the due date.',
                                        'Discounts and scholarship grants are reflected only after official approval.',
                                        'For questions, kindly contact the Accounting Office.',
                                    ],
                                    color: '#364152',
                                    fontSize: 7.4,
                                },
                            ],
                            margin: [10, 9, 10, 9],
                        },
                        {
                            stack: [
                                {
                                    text: 'LATEST FINANCIAL REPORT',
                                    bold: true,
                                    color: '#243f91',
                                    fontSize: 9.2,
                                    margin: [0, 0, 0, 4],
                                },
                                { text: `As of ${asOf}`, bold: true, margin: [0, 0, 0, 8] },
                                {
                                    columns: [
                                        { width: 70, text: 'Prepared by:', margin: [0, 9, 0, 0] },
                                        {
                                            width: '*',
                                            stack: [
                                                {
                                                    text: 'Ms. Ivyann P. Dargantes',
                                                    alignment: 'center',
                                                    bold: true,
                                                    margin: [0, 0, 0, 2],
                                                },
                                                {
                                                    canvas: [
                                                        {
                                                            type: 'line',
                                                            x1: 0,
                                                            y1: 0,
                                                            x2: 154,
                                                            y2: 0,
                                                            lineWidth: 0.7,
                                                            lineColor: '#536171',
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                    ],
                                    margin: [0, 0, 0, 2],
                                },
                                {
                                    text: 'Accounting Office',
                                    alignment: 'center',
                                    color: '#718096',
                                    bold: true,
                                    fontSize: 7,
                                    margin: [70, 0, 0, 8],
                                },
                                { text: 'Received by:', margin: [0, 0, 0, 5] },
                                {
                                    canvas: [
                                        {
                                            type: 'line',
                                            x1: 70,
                                            y1: 0,
                                            x2: 224,
                                            y2: 0,
                                            lineWidth: 0.7,
                                            lineColor: '#536171',
                                        },
                                    ],
                                    margin: [0, 0, 0, 2],
                                },
                                {
                                    text: 'Parent / Guardian',
                                    alignment: 'center',
                                    color: '#718096',
                                    bold: true,
                                    fontSize: 7,
                                    margin: [70, 0, 0, 0],
                                },
                            ],
                            margin: [11, 9, 10, 9],
                        },
                    ],
                ],
            },
            layout: this.boxLayout('#ffffff', '#dbe5ef'),
        };
    }
    infoRow(label, value) {
        return {
            columns: [
                { width: 72, text: label, style: 'label', margin: [0, 0, 0, 4.5] },
                { width: 8, text: ':', color: '#718096' },
                { width: '*', text: value || 'Not provided', style: 'value' },
            ],
        };
    }
    amountRow(label, value) {
        return {
            columns: [
                { width: '*', text: label, margin: [0, 0, 0, 4.5] },
                {
                    width: 'auto',
                    text: this.money(value),
                    bold: true,
                    alignment: 'right',
                },
            ],
        };
    }
    boxLayout(fillColor, lineColor, radius = 8) {
        return {
            hLineWidth: () => 0.7,
            vLineWidth: () => 0.7,
            hLineColor: () => lineColor,
            vLineColor: () => lineColor,
            fillColor: () => fillColor,
            borderRadius: radius,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0,
            paddingBottom: () => 0,
        };
    }
    assessmentLineItems(ledger) {
        if (Array.isArray(ledger.studentAssessmentLineItems))
            return ledger.studentAssessmentLineItems;
        if (Array.isArray(ledger.lineItems))
            return ledger.lineItems;
        return [];
    }
    ledgerTotals(ledger, lineItems, payments) {
        const gross = this.numberOr(ledger.grossAmount, lineItems.reduce((sum, item) => sum + this.numberOr(item.amount), 0));
        const discount = this.numberOr(ledger.discountAmount);
        const scholarship = this.numberOr(ledger.scholarshipAmount);
        const paid = this.numberOr(ledger.paidAmount, payments.reduce((sum, payment) => sum + this.numberOr(payment.amount), 0));
        const adjustments = this.numberOr(ledger.adjustmentAmount);
        const net = this.numberOr(ledger.netAmount, Math.max(0, gross - discount - scholarship - adjustments));
        const balance = this.numberOr(ledger.balance, Math.max(0, net - paid));
        return { gross, discount, scholarship, paid, adjustments, balance, net };
    }
    transactionRows(lineItems, payments, totals) {
        let balance = 0;
        const rows = [];
        lineItems.forEach((item) => {
            const amount = this.numberOr(item.amount);
            balance += amount;
            rows.push({
                date: this.formatDate(item.createdAt ?? item.updatedAt ?? new Date(), 'MM/dd/yyyy'),
                refNo: '-',
                description: item.description ?? item.feeType?.name ?? 'Assessment',
                charge: amount,
                discount: 0,
                scholarship: 0,
                payment: 0,
                adjustment: 0,
                balance,
            });
        });
        const deduction = totals.discount + totals.scholarship + totals.adjustments;
        if (deduction > 0) {
            balance -= deduction;
            rows.push({
                date: this.formatDate(new Date(), 'MM/dd/yyyy'),
                refNo: '-',
                description: 'Discount / Scholarship',
                charge: 0,
                discount: totals.discount,
                scholarship: totals.scholarship,
                payment: 0,
                adjustment: totals.adjustments,
                balance,
            });
        }
        payments
            .slice()
            .sort((a, b) => new Date(a.paymentDate ?? a.createdAt ?? 0).getTime() -
            new Date(b.paymentDate ?? b.createdAt ?? 0).getTime())
            .forEach((payment) => {
            const amount = this.numberOr(payment.amount);
            balance -= amount;
            rows.push({
                date: this.formatDate(payment.paymentDate ?? payment.createdAt ?? new Date(), 'MM/dd/yyyy'),
                refNo: payment.receiptNumber ?? '-',
                description: this.paymentDescription(payment),
                charge: 0,
                discount: 0,
                scholarship: 0,
                payment: amount,
                adjustment: 0,
                balance: Math.max(0, balance),
            });
        });
        if (rows.length === 0)
            rows.push({
                date: '-',
                refNo: '-',
                description: 'No ledger transactions recorded',
                charge: 0,
                discount: 0,
                scholarship: 0,
                payment: 0,
                adjustment: 0,
                balance: 0,
            });
        return rows;
    }
    paymentDescription(payment) {
        const method = payment.method ?? 'Cash';
        const payee = String(payment.remarks ?? '').trim();
        return payee
            ? `Payment - ${method} | Payee: ${payee}`
            : `Payment - ${method} | Payee: Not recorded`;
    }
    buildFinanceDashboardReportDocDefinition(assessments, payments, academicYearId, logoData = null, generatedAt = new Date()) {
        const totals = this.financeReportTotals(assessments, payments);
        const syLabel = this.financeAcademicYearLabel(assessments, payments, academicYearId);
        const asOf = this.formatDate(generatedAt, 'MMMM dd, yyyy');
        const trendPoints = this.financePaymentTrend(payments);
        const alerts = this.financeReportAlerts(totals);
        return {
            pageSize: 'A4',
            pageOrientation: 'portrait',
            pageMargins: [34, 24, 34, 30],
            background: (_currentPage, pageSize) => [
                {
                    canvas: [
                        { type: 'rect', x: 0, y: 0, w: pageSize.width, h: pageSize.height, color: '#f3f8f1' },
                        { type: 'rect', x: 0, y: 0, w: pageSize.width, h: 7, color: '#137332' },
                    ],
                },
            ],
            defaultStyle: { font: 'Roboto', fontSize: 8, color: '#243329' },
            content: [
                this.financeReportHeader(logoData, asOf),
                {
                    text: 'Finance Overview Report',
                    bold: true,
                    color: '#0c321b',
                    fontSize: 26,
                    margin: [0, 18, 0, 0],
                },
                {
                    text: `SY ${syLabel} | Assessment, Payment, Collection, and Finance-Control Metrics`,
                    color: '#647064',
                    fontSize: 10.5,
                    margin: [0, 2, 0, 16],
                },
                this.financeMetricGrid(totals),
                this.financeExecutiveAnalysis(totals),
                {
                    columns: [
                        this.financeTrendPanel(trendPoints),
                        { width: 16, text: '' },
                        this.financeAlertsPanel(alerts),
                    ],
                    columnGap: 0,
                    margin: [0, 14, 0, 0],
                },
            ],
            styles: {
                reportPanelTitle: { bold: true, color: '#0c321b', fontSize: 12.2 },
                reportLabel: { bold: true, color: '#657264', fontSize: 7.8 },
                reportSmall: { color: '#657264', fontSize: 7.5 },
            },
        };
    }
    financeReportHeader(logoData, asOf) {
        const logo = logoData
            ? { image: logoData, width: 68, height: 68, margin: [0, 0, 14, 0] }
            : {
                canvas: [
                    { type: 'ellipse', x: 34, y: 34, r1: 34, r2: 34, color: '#f0f7f1' },
                    { type: 'ellipse', x: 34, y: 34, r1: 26, r2: 26, color: '#ffffff', lineColor: '#137332', lineWidth: 1.2 },
                ],
                width: 68,
                height: 68,
                margin: [0, 0, 14, 0],
            };
        return {
            table: {
                widths: ['*'],
                body: [[{
                            stack: [
                                { canvas: [{ type: 'rect', x: 0, y: 0, w: 526, h: 5, r: 3, color: '#137332' }], margin: [0, 0, 0, 8] },
                                {
                                    columns: [
                                        logo,
                                        {
                                            width: '*',
                                            stack: [
                                                { text: 'ST. FRANCIS XAVIER SMART ACADEMY INC.', bold: true, color: '#0c321b', fontSize: 20, margin: [0, 7, 0, 0] },
                                                { text: 'Conalum, Inopacan, Leyte', bold: true, color: '#137332', fontSize: 11.5, margin: [0, 1, 0, 0] },
                                                { text: 'Official Finance Monitoring Summary', color: '#69766b', fontSize: 10, margin: [0, 3, 0, 0] },
                                                { text: 'LATEST FINANCIAL REPORT - Prepared by: Ms. Ivyann P. Dargantes', color: '#137332', bold: true, fontSize: 6.8, margin: [0, 3, 0, 0] },
                                            ],
                                        },
                                        {
                                            width: 96,
                                            stack: [
                                                { text: 'LIVE OVERVIEW', alignment: 'center', bold: true, color: '#137332', fontSize: 10, margin: [0, 10, 0, 0] },
                                                { text: `As of ${asOf}`, alignment: 'center', color: '#657264', fontSize: 6.8, margin: [0, 5, 0, 0] },
                                            ],
                                        },
                                    ],
                                },
                                { canvas: [{ type: 'rect', x: 0, y: 0, w: 526, h: 5, r: 3, color: '#f5ca2e' }], margin: [0, 8, 0, 0] },
                            ],
                            margin: [10, 8, 10, 8],
                        }]],
            },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
        };
    }
    financeMetricGrid(totals) {
        return {
            stack: [
                {
                    columns: [
                        this.financeMetricCard('TOTAL REVENUE', this.money(totals.totalRevenue), `${totals.paymentCount} collection${totals.paymentCount === 1 ? '' : 's'} posted`, '#137332'),
                        { width: 14, text: '' },
                        this.financeMetricCard('TOTAL ASSESSED', this.money(totals.totalAssessed), `${totals.assessmentCount} assessment${totals.assessmentCount === 1 ? '' : 's'} recorded`, '#e0aa05'),
                    ],
                },
                {
                    columns: [
                        this.financeMetricCard('OPEN BALANCE', this.money(totals.openBalance), `${totals.openAccounts} open learner account${totals.openAccounts === 1 ? '' : 's'}`, '#ba5305'),
                        { width: 14, text: '' },
                        this.financeMetricCard('COLLECTION STATUS', `${totals.collectionRate}%`, `${totals.clearedAccounts} cleared / ${totals.openAccounts} pending`, '#0f7f95'),
                    ],
                    margin: [0, 12, 0, 0],
                },
            ],
        };
    }
    financeMetricCard(label, value, helper, accent) {
        return {
            width: '*',
            table: {
                widths: [42, '*'],
                body: [[
                        { canvas: [{ type: 'rect', x: 0, y: 0, w: 25, h: 25, r: 7, color: accent }], margin: [0, 5, 0, 0] },
                        { stack: [
                                { text: label, style: 'reportLabel', margin: [0, 0, 0, 4] },
                                { text: value, bold: true, color: '#0c321b', fontSize: 18, margin: [0, 0, 0, 1] },
                                { text: helper, color: '#69766b', fontSize: 8 },
                            ], margin: [0, 2, 0, 2] },
                    ]],
            },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
            margin: [0, 0, 0, 0],
        };
    }
    financeExecutiveAnalysis(totals) {
        const collected = Math.min(100, totals.collectionRate);
        const pending = Math.max(0, 100 - collected);
        return {
            table: { widths: ['*'], body: [[{
                            stack: [
                                { text: 'Executive Analysis', style: 'reportPanelTitle', margin: [0, 0, 0, 5] },
                                { text: `The school has collected ${totals.collectionRate}% of the assessed amount. The remaining ${pending}% is still in accounts receivable, with ${totals.openAccounts} learner account${totals.openAccounts === 1 ? '' : 's'} needing follow-up.`, color: '#657264', fontSize: 9.1, lineHeight: 1.22, margin: [0, 0, 0, 10] },
                                this.financeProgressRow('Collected Total', this.money(totals.totalRevenue), collected, '#137332'),
                                this.financeProgressRow('Pending Receivables', this.money(totals.openBalance), pending, '#ba5305'),
                                {
                                    columns: [
                                        this.financeMiniPill('FOLLOW UP', `${totals.openAccounts} accounts`),
                                        { width: 10, text: '' },
                                        this.financeMiniPill('AVERAGE ASSESSMENT', this.money(totals.averageAssessment)),
                                        { width: 10, text: '' },
                                        this.financeMiniPill('PROJECTED COLLECTIONS', this.money(totals.openBalance)),
                                    ],
                                    margin: [0, 8, 0, 0],
                                },
                            ],
                            margin: [13, 12, 13, 11],
                        }]] },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
            margin: [0, 14, 0, 0],
        };
    }
    financeProgressRow(label, value, percent, color) {
        const width = Math.max(2, Math.min(360, Math.round(360 * (percent / 100))));
        return {
            stack: [
                { columns: [{ width: '*', text: label, bold: true, color: '#415842', fontSize: 8.5 }, { width: 100, text: value, alignment: 'right', bold: true, color, fontSize: 10 }] },
                { canvas: [
                        { type: 'rect', x: 0, y: 0, w: 420, h: 10, r: 5, color: '#e5efe5' },
                        { type: 'rect', x: 0, y: 0, w: width, h: 10, r: 5, color },
                        { type: 'line', x1: 430, y1: 5, x2: 430, y2: 5, lineColor: '#ffffff' },
                    ], margin: [0, 4, 0, 7] },
            ],
        };
    }
    financeMiniPill(label, value) {
        return {
            width: '*',
            table: { widths: ['*'], body: [[{ stack: [
                                { text: label, color: '#69766b', bold: true, fontSize: 6.8 },
                                { text: value, color: '#0c321b', bold: true, fontSize: 9.3, margin: [0, 2, 0, 0] },
                            ], margin: [8, 5, 8, 5] }]] },
            layout: this.boxLayout('#f7fbf7', '#cfe5cf'),
        };
    }
    financeTrendPanel(points) {
        const bars = points.length ? points : [{ label: 'No data', amount: 0, percent: 0 }];
        return {
            width: '*',
            table: { widths: ['*'], body: [[{
                            stack: [
                                { text: 'Collection Trend', style: 'reportPanelTitle', margin: [0, 0, 0, 10] },
                                {
                                    columns: bars.map((point) => ({
                                        width: '*',
                                        stack: [
                                            { text: this.money(point.amount), alignment: 'center', color: '#415842', fontSize: 7.2, bold: true, margin: [0, 0, 0, 3] },
                                            { canvas: [{ type: 'rect', x: 9, y: 0, w: 28, h: Math.max(4, Math.round(68 * (point.percent / 100))), r: 8, color: '#137332' }], alignment: 'center', margin: [0, 68 - Math.max(4, Math.round(68 * (point.percent / 100))), 0, 5] },
                                            { text: point.label, alignment: 'center', color: '#657264', bold: true, fontSize: 7.5 },
                                        ],
                                    })),
                                },
                            ],
                            margin: [13, 12, 13, 12],
                        }]] },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
        };
    }
    financeAlertsPanel(alerts) {
        return {
            width: '*',
            table: { widths: ['*'], body: [[{
                            stack: [
                                { text: 'Financial Alerts', style: 'reportPanelTitle', margin: [0, 0, 0, 8] },
                                ...alerts.map((alert) => ({
                                    table: { widths: [18, '*'], body: [[
                                                { text: '!', alignment: 'center', bold: true, color: '#c45b05', margin: [0, 4, 0, 0] },
                                                { stack: [
                                                        { text: alert.title, bold: true, color: '#4a361f', fontSize: 8.6 },
                                                        { text: alert.description, color: '#6f5c43', fontSize: 7.5, margin: [0, 2, 0, 0] },
                                                    ] },
                                            ]] },
                                    layout: this.boxLayout('#fff8e8', '#f3d083'),
                                    margin: [0, 0, 0, 7],
                                })),
                            ],
                            margin: [13, 12, 13, 9],
                        }]] },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
        };
    }
    financeReceivablesPanel(rows) {
        const body = [
            [{ text: 'Learner', bold: true }, { text: 'Grade', bold: true }, { text: 'Balance', bold: true, alignment: 'right' }],
            ...(rows.length ? rows : [{ learner: 'No open receivables', grade: '-', balance: 0 }]).map((row) => [
                { text: row.learner, margin: [0, 3, 0, 3] },
                { text: row.grade, margin: [0, 3, 0, 3] },
                { text: this.money(row.balance), alignment: 'right', bold: true, color: row.balance > 0 ? '#ba5305' : '#137332', margin: [0, 3, 0, 3] },
            ]),
        ];
        return this.financeCompactTablePanel('Top Receivables', body);
    }
    financePaymentsPanel(rows) {
        const body = [
            [{ text: 'Date', bold: true }, { text: 'Payee', bold: true }, { text: 'Amount', bold: true, alignment: 'right' }],
            ...(rows.length ? rows : [{ date: '-', payee: 'No posted collections', amount: 0 }]).map((row) => [
                { text: row.date, margin: [0, 3, 0, 3] },
                { text: row.payee, margin: [0, 3, 0, 3] },
                { text: this.money(row.amount), alignment: 'right', bold: true, color: '#137332', margin: [0, 3, 0, 3] },
            ]),
        ];
        return this.financeCompactTablePanel('Recent Collections', body);
    }
    financeCompactTablePanel(title, body) {
        return {
            width: '*',
            table: { widths: ['*'], body: [[{
                            stack: [
                                { text: title, style: 'reportPanelTitle', margin: [0, 0, 0, 7] },
                                {
                                    table: { headerRows: 1, widths: ['*', 45, 65], body },
                                    layout: {
                                        hLineWidth: (i) => (i === 1 ? 0.7 : 0.35),
                                        vLineWidth: () => 0,
                                        hLineColor: () => '#dce8dc',
                                        fillColor: (rowIndex) => rowIndex === 0 ? '#f1f8f1' : null,
                                        paddingLeft: () => 4,
                                        paddingRight: () => 4,
                                        paddingTop: () => 2,
                                        paddingBottom: () => 2,
                                    },
                                },
                            ],
                            margin: [13, 12, 13, 12],
                        }]] },
            layout: this.boxLayout('#ffffff', '#dce8dc'),
        };
    }
    financeReportSignature(asOf) {
        return {
            columns: [
                { width: '*', text: 'LATEST FINANCIAL REPORT', bold: true, color: '#137332', fontSize: 8.2, margin: [0, 14, 0, 0] },
                {
                    width: 220,
                    stack: [
                        { text: `As of ${asOf}`, alignment: 'center', bold: true, color: '#243329', fontSize: 8.2, margin: [0, 11, 0, 5] },
                        { text: 'Prepared by:', color: '#657264', fontSize: 7.4, margin: [0, 0, 0, 2] },
                        { text: 'Ms. Ivyann P. Dargantes', alignment: 'center', bold: true, color: '#0c321b', fontSize: 8.5, margin: [68, 0, 0, 1] },
                        { canvas: [{ type: 'line', x1: 70, y1: 0, x2: 210, y2: 0, lineColor: '#657264', lineWidth: 0.7 }] },
                        { text: 'Accounting Office', alignment: 'center', color: '#657264', bold: true, fontSize: 6.8, margin: [70, 1, 0, 0] },
                    ],
                },
            ],
        };
    }
    financeReportTotals(assessments, payments) {
        const totalRevenue = this.sumFinanceNumbers(payments.map((payment) => payment.amount));
        const totalAssessed = this.sumFinanceNumbers(assessments.map((assessment) => assessment.netAmount));
        const grossAssessed = this.sumFinanceNumbers(assessments.map((assessment) => assessment.grossAmount));
        const discountTotal = this.sumFinanceNumbers(assessments.map((assessment) => assessment.discountAmount));
        const openBalance = this.sumFinanceNumbers(assessments.map((assessment) => assessment.balance));
        const openAccounts = assessments.filter((assessment) => this.numberOr(assessment.balance) > 0).length;
        const clearedAccounts = assessments.filter((assessment) => this.numberOr(assessment.netAmount) > 0 && this.numberOr(assessment.balance) <= 0).length;
        const collectionRate = totalAssessed > 0 ? Math.round((totalRevenue / totalAssessed) * 1000) / 10 : 0;
        return {
            totalRevenue,
            totalAssessed,
            grossAssessed,
            discountTotal,
            openBalance,
            openAccounts,
            clearedAccounts,
            paymentCount: payments.length,
            assessmentCount: assessments.length,
            collectionRate,
            averageAssessment: assessments.length ? totalAssessed / assessments.length : 0,
        };
    }
    sumFinanceNumbers(values) {
        return values.reduce((total, value) => total + this.numberOr(value), 0);
    }
    financePaymentTrend(payments) {
        const byDate = new Map();
        for (const payment of payments) {
            const date = this.formatDate(payment.paymentDate ?? payment.createdAt, 'yyyy-MM-dd');
            if (date === '-')
                continue;
            byDate.set(date, (byDate.get(date) ?? 0) + this.numberOr(payment.amount));
        }
        const rows = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b)).slice(-6);
        const max = Math.max(...rows.map(([, amount]) => amount), 0);
        return rows.map(([date, amount]) => ({
            label: this.formatDate(date, 'MMM dd'),
            amount,
            percent: max > 0 ? Math.round((amount / max) * 100) : 0,
        }));
    }
    financeTopReceivables(assessments) {
        return assessments
            .filter((assessment) => this.numberOr(assessment.balance) > 0)
            .sort((a, b) => this.numberOr(b.balance) - this.numberOr(a.balance))
            .slice(0, 2)
            .map((assessment) => ({
            learner: this.studentName(assessment.student ?? {}),
            grade: this.gradeLabel(assessment.student?.gradeLevel) || '-',
            balance: this.numberOr(assessment.balance),
        }));
    }
    financeRecentPayments(payments) {
        return payments
            .slice()
            .sort((a, b) => new Date(b.paymentDate ?? b.createdAt ?? 0).getTime() - new Date(a.paymentDate ?? a.createdAt ?? 0).getTime())
            .slice(0, 1)
            .map((payment) => ({
            date: this.formatDate(payment.paymentDate ?? payment.createdAt, 'MMM dd'),
            payee: this.studentName(payment.student ?? {}),
            amount: this.numberOr(payment.amount),
        }));
    }
    financeReportAlerts(totals) {
        const alerts = [];
        if (totals.openAccounts > 0) {
            alerts.push({ title: 'Open learner accounts', description: `${totals.openAccounts} accounts need follow-up.` });
        }
        if (totals.openBalance > 0) {
            alerts.push({ title: 'Pending receivables', description: `${this.money(totals.openBalance)} remains uncollected.` });
        }
        if (totals.collectionRate < 60 && totals.totalAssessed > 0) {
            alerts.push({ title: 'Recommended action', description: 'Review accounts and confirm payment schedules.' });
        }
        return alerts.length ? alerts.slice(0, 3) : [{ title: 'Finance records up to date', description: 'No active finance alerts for this school year.' }];
    }
    financeAcademicYearLabel(assessments, payments, academicYearId) {
        const source = assessments.find((item) => item.academicYear)?.academicYear ?? payments.find((item) => item.academicYear)?.academicYear;
        const label = source?.schoolYear ?? source?.code ?? source?.name ?? source?.label;
        if (label)
            return label;
        return /^[0-9a-f-]{24,}$/i.test(academicYearId) ? '2026-2027' : academicYearId;
    }
    studentName(student) {
        const parts = [
            student.firstName,
            student.middleName,
            student.lastName,
            student.suffix,
        ].filter(Boolean);
        return parts.length ? parts.join(' ') : (student.name ?? 'Not provided');
    }
    studentInitials(student) {
        const name = this.studentName(student);
        const initials = name
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase())
            .join('');
        return initials || 'LR';
    }
    gradeLabel(grade) {
        const map = {
            NURSERY: 'Nursery',
            K1: 'Kindergarten',
            K2: 'Kindergarten',
            G1: 'Grade 1',
            G2: 'Grade 2',
            G3: 'Grade 3',
            G4: 'Grade 4',
            G5: 'Grade 5',
            G6: 'Grade 6',
            G7: 'Grade 7',
            G8: 'Grade 8',
            G9: 'Grade 9',
            G10: 'Grade 10',
        };
        return grade ? (map[grade] ?? grade) : '';
    }
    referenceNumber(ledger, student, generatedAt) {
        const dateCode = this.formatDate(generatedAt, 'yyyyMMdd');
        const studentCode = (student.studentNo ??
            student.id ??
            ledger.studentId ??
            'LEDGER')
            .toString()
            .slice(-6)
            .toUpperCase();
        return `SL-${dateCode}-${studentCode}`;
    }
    academicYearLabel(ledger, academicYearId) {
        const ay = ledger.academicYear;
        const label = ay?.schoolYear ?? ay?.name ?? ay?.label ?? ledger.schoolYear;
        if (label)
            return label;
        return /^[0-9a-f-]{24,}$/i.test(academicYearId)
            ? '2026-2027'
            : academicYearId;
    }
    money(value) {
        return `₱ ${this.numberOr(value).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    numberOr(value, fallback = 0) {
        const numeric = Number(value);
        return Number.isFinite(numeric) ? numeric : fallback;
    }
    formatDate(value, pattern) {
        const date = value instanceof Date ? value : new Date(value);
        return Number.isNaN(date.getTime()) ? '-' : (0, date_fns_1.format)(date, pattern);
    }
    loadAssetImageData(filePath, fs, path) {
        if (!fs.existsSync(filePath))
            return null;
        const ext = path.extname(filePath).toLowerCase();
        const mime = ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' : 'image/png';
        return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
    }
    loadStudentPhotoData(student, fs, path) {
        const publicUrl = student?.photoUrl;
        if (!publicUrl || typeof publicUrl !== 'string')
            return null;
        const storageRoot = process.env.STORAGE_DIR || path.join(process.cwd(), 'storage');
        let relativePath = publicUrl;
        try {
            if (/^https?:\/\//i.test(publicUrl))
                relativePath = new URL(publicUrl).pathname;
        }
        catch {
            return null;
        }
        relativePath = relativePath
            .replace(/^\/storage\//, '')
            .replace(/^storage\//, '')
            .replace(/^\/+/, '');
        const normalized = path.normalize(relativePath);
        if (!normalized ||
            normalized.startsWith('..') ||
            path.isAbsolute(normalized))
            return null;
        const filePath = path.join(storageRoot, normalized);
        const ext = path.extname(filePath).toLowerCase();
        if (!['.png', '.jpg', '.jpeg'].includes(ext))
            return null;
        return this.loadAssetImageData(filePath, fs, path);
    }
};
exports.FinancePdfService = FinancePdfService;
exports.FinancePdfService = FinancePdfService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinancePdfService);
//# sourceMappingURL=finance-pdf.service.js.map