import {
  CalendarService,
  CommonModule,
  Component,
  DatePipe,
  DefaultValueAccessor,
  FormBuilder,
  FormControlName,
  FormGroupDirective,
  FormsModule,
  NgClass,
  NgControlStatus,
  NgControlStatusGroup,
  NgForOf,
  NgIf,
  NgSelectOption,
  ReactiveFormsModule,
  RegistrarApiService,
  SelectControlValueAccessor,
  Validators,
  inject,
  setClassMetadata,
  ɵNgNoValidate,
  ɵNgSelectMultipleOption,
  ɵsetClassDebugInfo,
  ɵɵProvidersFeature,
  ɵɵadvance,
  ɵɵdefineComponent,
  ɵɵelement,
  ɵɵelementEnd,
  ɵɵelementStart,
  ɵɵgetCurrentView,
  ɵɵlistener,
  ɵɵnextContext,
  ɵɵpipe,
  ɵɵpipeBind2,
  ɵɵproperty,
  ɵɵpureFunction0,
  ɵɵpureFunction2,
  ɵɵresetView,
  ɵɵrestoreView,
  ɵɵstyleProp,
  ɵɵtemplate,
  ɵɵtext,
  ɵɵtextInterpolate,
  ɵɵtextInterpolate1
} from "./chunk-P3H2YMA5.js";
import {
  __spreadProps,
  __spreadValues
} from "./chunk-KFN7JZX4.js";

// src/app/pages/calendar/calendar.component.ts
var _c0 = () => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var _c1 = (a0, a1) => ({ "opacity-50": a0, "bg-indigo-50/30": a1 });
var _c2 = (a0, a1) => ({ "bg-indigo-600 text-white": a0, "text-slate-700": a1 });
function CalendarPageComponent_div_24_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 19);
    \u0275\u0275element(1, "div", 20);
    \u0275\u0275elementStart(2, "span", 21);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const type_r1 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275styleProp("background", type_r1.color);
    \u0275\u0275advance(2);
    \u0275\u0275textInterpolate(type_r1.type);
  }
}
function CalendarPageComponent_div_26_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "div", 22);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const day_r2 = ctx.$implicit;
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(day_r2);
  }
}
function CalendarPageComponent_div_28_div_7_Template(rf, ctx) {
  if (rf & 1) {
    const _r6 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 29);
    \u0275\u0275listener("click", function CalendarPageComponent_div_28_div_7_Template_div_click_0_listener($event) {
      const event_r7 = \u0275\u0275restoreView(_r6).$implicit;
      const day_r4 = \u0275\u0275nextContext().$implicit;
      const ctx_r4 = \u0275\u0275nextContext();
      $event.stopPropagation();
      return \u0275\u0275resetView(ctx_r4.openModal(day_r4, event_r7));
    });
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const event_r7 = ctx.$implicit;
    \u0275\u0275styleProp("background", event_r7.color);
    \u0275\u0275property("title", event_r7.title);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", event_r7.title, " ");
  }
}
function CalendarPageComponent_div_28_Template(rf, ctx) {
  if (rf & 1) {
    const _r3 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 23);
    \u0275\u0275listener("click", function CalendarPageComponent_div_28_Template_div_click_0_listener() {
      const day_r4 = \u0275\u0275restoreView(_r3).$implicit;
      const ctx_r4 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r4.openModal(day_r4));
    });
    \u0275\u0275elementStart(1, "div", 24)(2, "span", 25);
    \u0275\u0275text(3);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(4, "button", 26);
    \u0275\u0275text(5, "add");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(6, "div", 27);
    \u0275\u0275template(7, CalendarPageComponent_div_28_div_7_Template, 2, 4, "div", 28);
    \u0275\u0275elementEnd()();
  }
  if (rf & 2) {
    const day_r4 = ctx.$implicit;
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction2(4, _c1, !ctx_r4.isCurrentMonth(day_r4), ctx_r4.isToday(day_r4)));
    \u0275\u0275advance(2);
    \u0275\u0275property("ngClass", \u0275\u0275pureFunction2(7, _c2, ctx_r4.isToday(day_r4), !ctx_r4.isToday(day_r4)));
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", day_r4.getDate(), " ");
    \u0275\u0275advance(4);
    \u0275\u0275property("ngForOf", ctx_r4.getEventsForDate(day_r4));
  }
}
function CalendarPageComponent_div_29_option_34_Template(rf, ctx) {
  if (rf & 1) {
    \u0275\u0275elementStart(0, "option", 50);
    \u0275\u0275text(1);
    \u0275\u0275elementEnd();
  }
  if (rf & 2) {
    const type_r9 = ctx.$implicit;
    \u0275\u0275property("value", type_r9.type);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate(type_r9.type);
  }
}
function CalendarPageComponent_div_29_button_40_Template(rf, ctx) {
  if (rf & 1) {
    const _r10 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "button", 51);
    \u0275\u0275listener("click", function CalendarPageComponent_div_29_button_40_Template_button_click_0_listener() {
      \u0275\u0275restoreView(_r10);
      const ctx_r4 = \u0275\u0275nextContext(2);
      return \u0275\u0275resetView(ctx_r4.deleteEvent());
    });
    \u0275\u0275text(1, " Delete ");
    \u0275\u0275elementEnd();
  }
}
function CalendarPageComponent_div_29_Template(rf, ctx) {
  if (rf & 1) {
    const _r8 = \u0275\u0275getCurrentView();
    \u0275\u0275elementStart(0, "div", 30)(1, "div", 31)(2, "div", 32)(3, "h3", 33);
    \u0275\u0275text(4);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(5, "button", 34);
    \u0275\u0275listener("click", function CalendarPageComponent_div_29_Template_button_click_5_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r4 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r4.closeModal());
    });
    \u0275\u0275elementStart(6, "span", 10);
    \u0275\u0275text(7, "close");
    \u0275\u0275elementEnd()()();
    \u0275\u0275elementStart(8, "form", 35);
    \u0275\u0275listener("ngSubmit", function CalendarPageComponent_div_29_Template_form_ngSubmit_8_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r4 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r4.saveEvent());
    });
    \u0275\u0275elementStart(9, "div")(10, "label", 36);
    \u0275\u0275text(11, "Event Title ");
    \u0275\u0275elementStart(12, "span", 37);
    \u0275\u0275text(13, "*");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(14, "input", 38);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(15, "div", 39)(16, "div")(17, "label", 36);
    \u0275\u0275text(18, "Start Date ");
    \u0275\u0275elementStart(19, "span", 37);
    \u0275\u0275text(20, "*");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(21, "input", 40);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(22, "div")(23, "label", 36);
    \u0275\u0275text(24, "End Date ");
    \u0275\u0275elementStart(25, "span", 41);
    \u0275\u0275text(26, "(Optional)");
    \u0275\u0275elementEnd()();
    \u0275\u0275element(27, "input", 42);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(28, "div")(29, "label", 36);
    \u0275\u0275text(30, "Event Type ");
    \u0275\u0275elementStart(31, "span", 37);
    \u0275\u0275text(32, "*");
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(33, "select", 43);
    \u0275\u0275template(34, CalendarPageComponent_div_29_option_34_Template, 2, 2, "option", 44);
    \u0275\u0275elementEnd()();
    \u0275\u0275elementStart(35, "div")(36, "label", 36);
    \u0275\u0275text(37, "Description");
    \u0275\u0275elementEnd();
    \u0275\u0275element(38, "textarea", 45);
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(39, "div", 46);
    \u0275\u0275template(40, CalendarPageComponent_div_29_button_40_Template, 2, 0, "button", 47);
    \u0275\u0275elementStart(41, "button", 48);
    \u0275\u0275listener("click", function CalendarPageComponent_div_29_Template_button_click_41_listener() {
      \u0275\u0275restoreView(_r8);
      const ctx_r4 = \u0275\u0275nextContext();
      return \u0275\u0275resetView(ctx_r4.closeModal());
    });
    \u0275\u0275text(42, "Cancel");
    \u0275\u0275elementEnd();
    \u0275\u0275elementStart(43, "button", 49);
    \u0275\u0275text(44);
    \u0275\u0275elementEnd()()()()();
  }
  if (rf & 2) {
    const ctx_r4 = \u0275\u0275nextContext();
    \u0275\u0275advance(4);
    \u0275\u0275textInterpolate(ctx_r4.editingEventId ? "Edit Event" : "Add New Event");
    \u0275\u0275advance(4);
    \u0275\u0275property("formGroup", ctx_r4.eventForm);
    \u0275\u0275advance(26);
    \u0275\u0275property("ngForOf", ctx_r4.eventTypes);
    \u0275\u0275advance(6);
    \u0275\u0275property("ngIf", ctx_r4.editingEventId);
    \u0275\u0275advance(3);
    \u0275\u0275property("disabled", ctx_r4.eventForm.invalid);
    \u0275\u0275advance();
    \u0275\u0275textInterpolate1(" ", ctx_r4.editingEventId ? "Update Event" : "Save Event", " ");
  }
}
var CalendarPageComponent = class _CalendarPageComponent {
  calendarService = inject(CalendarService);
  api = inject(RegistrarApiService);
  fb = inject(FormBuilder);
  currentDate = /* @__PURE__ */ new Date();
  daysInMonth = [];
  events = [];
  showModal = false;
  eventForm;
  editingEventId = null;
  selectedDate = null;
  eventTypes = [
    { type: "Holiday", color: "#ef4444" },
    // red
    { type: "Exam", color: "#f59e0b" },
    // amber
    { type: "Meeting", color: "#3b82f6" },
    // blue
    { type: "Other", color: "#8b5cf6" }
    // violet
  ];
  ngOnInit() {
    this.initForm();
    this.generateCalendar();
    this.loadEvents();
  }
  initForm() {
    this.eventForm = this.fb.group({
      title: ["", Validators.required],
      description: [""],
      eventDate: ["", Validators.required],
      endDate: [""],
      eventType: ["Other", Validators.required]
    });
  }
  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    const endDate = new Date(lastDay);
    if (endDate.getDay() !== 6) {
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
    }
    this.daysInMonth = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      this.daysInMonth.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
  }
  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    this.generateCalendar();
  }
  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    this.generateCalendar();
  }
  isCurrentMonth(date) {
    return date.getMonth() === this.currentDate.getMonth();
  }
  isToday(date) {
    const today = /* @__PURE__ */ new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
  }
  loadEvents() {
    this.calendarService.getEvents().subscribe((res) => {
      this.events = res;
    });
  }
  getEventsForDate(date) {
    return this.events.filter((e) => {
      const eDate = new Date(e.eventDate);
      return eDate.getDate() === date.getDate() && eDate.getMonth() === date.getMonth() && eDate.getFullYear() === date.getFullYear();
    });
  }
  openModal(date, event) {
    this.showModal = true;
    if (event) {
      this.editingEventId = event.id || null;
      this.eventForm.patchValue({
        title: event.title,
        description: event.description,
        eventDate: new Date(event.eventDate).toISOString().split("T")[0],
        endDate: event.endDate ? new Date(event.endDate).toISOString().split("T")[0] : "",
        eventType: event.eventType
      });
    } else {
      this.editingEventId = null;
      this.eventForm.reset({
        eventType: "Other",
        eventDate: date ? date.toISOString().split("T")[0] : ""
      });
    }
  }
  closeModal() {
    this.showModal = false;
  }
  saveEvent() {
    if (this.eventForm.invalid)
      return;
    const val = this.eventForm.value;
    const typeObj = this.eventTypes.find((t) => t.type === val.eventType);
    const formattedEventDate = new Date(val.eventDate).toISOString();
    const formattedEndDate = val.endDate ? new Date(val.endDate).toISOString() : null;
    const eventData = __spreadProps(__spreadValues({}, val), {
      eventDate: formattedEventDate,
      endDate: formattedEndDate,
      academicYearId: this.api.getActiveAcademicYearId(),
      color: typeObj?.color || "#8b5cf6"
    });
    if (this.editingEventId) {
      this.calendarService.updateEvent(this.editingEventId, eventData).subscribe(() => {
        this.loadEvents();
        this.closeModal();
      });
    } else {
      this.calendarService.createEvent(eventData).subscribe(() => {
        this.loadEvents();
        this.closeModal();
      });
    }
  }
  deleteEvent() {
    if (this.editingEventId) {
      this.calendarService.deleteEvent(this.editingEventId).subscribe(() => {
        this.loadEvents();
        this.closeModal();
      });
    }
  }
  static \u0275fac = function CalendarPageComponent_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _CalendarPageComponent)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _CalendarPageComponent, selectors: [["app-calendar-page"]], features: [\u0275\u0275ProvidersFeature([DatePipe])], decls: 30, vars: 9, consts: [[1, "p-6", "h-full", "flex", "flex-col", "bg-slate-50/50"], [1, "flex", "items-center", "justify-between", "mb-6"], [1, "text-2xl", "font-bold", "text-slate-800"], [1, "text-sm", "text-slate-500"], [1, "flex", "items-center", "gap-2", "px-4", "py-2", "bg-indigo-600", "text-white", "text-sm", "font-semibold", "rounded-lg", "hover:bg-indigo-700", "transition", 3, "click"], [1, "material-icons", "text-[18px]"], [1, "flex-1", "bg-white", "rounded-xl", "shadow-sm", "border", "border-slate-200", "overflow-hidden", "flex", "flex-col"], [1, "flex", "items-center", "justify-between", "p-4", "border-b", "border-slate-100"], [1, "flex", "items-center", "gap-4"], [1, "p-2", "hover:bg-slate-100", "rounded-lg", "text-slate-500", "transition", 3, "click"], [1, "material-icons"], [1, "text-lg", "font-bold", "text-slate-700", "min-w-[150px]", "text-center"], [1, "flex", "gap-4", "items-center"], ["class", "flex items-center gap-1.5", 4, "ngFor", "ngForOf"], [1, "grid", "grid-cols-7", "border-b", "border-slate-100", "bg-slate-50"], ["class", "py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider", 4, "ngFor", "ngForOf"], [1, "flex-1", "grid", "grid-cols-7", "grid-rows-5", "bg-slate-200", "gap-px"], ["class", "bg-white min-h-[100px] p-2 transition hover:bg-slate-50 cursor-pointer flex flex-col group relative", 3, "ngClass", "click", 4, "ngFor", "ngForOf"], ["class", "fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4", 4, "ngIf"], [1, "flex", "items-center", "gap-1.5"], [1, "w-3", "h-3", "rounded-full"], [1, "text-xs", "font-medium", "text-slate-600"], [1, "py-2", "text-center", "text-xs", "font-bold", "text-slate-500", "uppercase", "tracking-wider"], [1, "bg-white", "min-h-[100px]", "p-2", "transition", "hover:bg-slate-50", "cursor-pointer", "flex", "flex-col", "group", "relative", 3, "click", "ngClass"], [1, "flex", "justify-between", "items-start"], [1, "text-sm", "font-semibold", "w-7", "h-7", "flex", "items-center", "justify-center", "rounded-full", 3, "ngClass"], [1, "material-icons", "text-[16px]", "text-slate-300", "opacity-0", "group-hover:opacity-100", "hover:text-indigo-600", "transition"], [1, "mt-2", "flex", "flex-col", "gap-1", "overflow-y-auto", "flex-1", "custom-scrollbar"], ["class", "px-2 py-1 rounded text-[10px] font-bold text-white truncate shadow-sm transition hover:brightness-110", 3, "background", "title", "click", 4, "ngFor", "ngForOf"], [1, "px-2", "py-1", "rounded", "text-[10px]", "font-bold", "text-white", "truncate", "shadow-sm", "transition", "hover:brightness-110", 3, "click", "title"], [1, "fixed", "inset-0", "z-50", "flex", "items-center", "justify-center", "bg-slate-900/50", "backdrop-blur-sm", "p-4"], [1, "bg-white", "rounded-xl", "shadow-xl", "w-full", "max-w-md", "overflow-hidden", "animate-in", "fade-in", "zoom-in-95", "duration-200"], [1, "px-6", "py-4", "border-b", "border-slate-100", "flex", "justify-between", "items-center", "bg-slate-50"], [1, "text-lg", "font-bold", "text-slate-800"], [1, "text-slate-400", "hover:text-slate-600", "transition", "p-1", 3, "click"], [1, "p-6", "flex", "flex-col", "gap-4", 3, "ngSubmit", "formGroup"], [1, "block", "text-xs", "font-semibold", "text-slate-700", "mb-1"], [1, "text-red-500"], ["type", "text", "formControlName", "title", "placeholder", "E.g., Midterm Exams", 1, "w-full", "text-sm", "border-slate-200", "rounded-lg", "focus:ring-indigo-500", "focus:border-indigo-500", "placeholder-slate-400"], [1, "grid", "grid-cols-2", "gap-4"], ["type", "date", "formControlName", "eventDate", 1, "w-full", "text-sm", "border-slate-200", "rounded-lg", "focus:ring-indigo-500", "focus:border-indigo-500"], [1, "text-slate-400", "font-normal"], ["type", "date", "formControlName", "endDate", 1, "w-full", "text-sm", "border-slate-200", "rounded-lg", "focus:ring-indigo-500", "focus:border-indigo-500"], ["formControlName", "eventType", 1, "w-full", "text-sm", "border-slate-200", "rounded-lg", "focus:ring-indigo-500", "focus:border-indigo-500"], [3, "value", 4, "ngFor", "ngForOf"], ["formControlName", "description", "rows", "3", "placeholder", "Any additional details...", 1, "w-full", "text-sm", "border-slate-200", "rounded-lg", "focus:ring-indigo-500", "focus:border-indigo-500", "placeholder-slate-400"], [1, "mt-4", "flex", "justify-end", "gap-3", "pt-4", "border-t", "border-slate-100"], ["type", "button", "class", "mr-auto text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition", 3, "click", 4, "ngIf"], ["type", "button", 1, "px-4", "py-2", "text-sm", "font-semibold", "text-slate-600", "hover:bg-slate-100", "rounded-lg", "transition", 3, "click"], ["type", "submit", 1, "px-4", "py-2", "text-sm", "font-semibold", "text-white", "bg-indigo-600", "hover:bg-indigo-700", "rounded-lg", "transition", "disabled:opacity-50", "disabled:cursor-not-allowed", 3, "disabled"], [3, "value"], ["type", "button", 1, "mr-auto", "text-sm", "font-semibold", "text-red-600", "hover:text-red-700", "px-3", "py-2", "rounded-lg", "hover:bg-red-50", "transition", 3, "click"]], template: function CalendarPageComponent_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275elementStart(0, "div", 0)(1, "div", 1)(2, "div")(3, "h1", 2);
      \u0275\u0275text(4, "School Calendar");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(5, "p", 3);
      \u0275\u0275text(6, "Manage holidays, exams, and other school events.");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(7, "button", 4);
      \u0275\u0275listener("click", function CalendarPageComponent_Template_button_click_7_listener() {
        return ctx.openModal();
      });
      \u0275\u0275elementStart(8, "span", 5);
      \u0275\u0275text(9, "add");
      \u0275\u0275elementEnd();
      \u0275\u0275text(10, " Add Event ");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(11, "div", 6)(12, "div", 7)(13, "div", 8)(14, "button", 9);
      \u0275\u0275listener("click", function CalendarPageComponent_Template_button_click_14_listener() {
        return ctx.previousMonth();
      });
      \u0275\u0275elementStart(15, "span", 10);
      \u0275\u0275text(16, "chevron_left");
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(17, "h2", 11);
      \u0275\u0275text(18);
      \u0275\u0275pipe(19, "date");
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(20, "button", 9);
      \u0275\u0275listener("click", function CalendarPageComponent_Template_button_click_20_listener() {
        return ctx.nextMonth();
      });
      \u0275\u0275elementStart(21, "span", 10);
      \u0275\u0275text(22, "chevron_right");
      \u0275\u0275elementEnd()()();
      \u0275\u0275elementStart(23, "div", 12);
      \u0275\u0275template(24, CalendarPageComponent_div_24_Template, 4, 3, "div", 13);
      \u0275\u0275elementEnd()();
      \u0275\u0275elementStart(25, "div", 14);
      \u0275\u0275template(26, CalendarPageComponent_div_26_Template, 2, 1, "div", 15);
      \u0275\u0275elementEnd();
      \u0275\u0275elementStart(27, "div", 16);
      \u0275\u0275template(28, CalendarPageComponent_div_28_Template, 8, 10, "div", 17);
      \u0275\u0275elementEnd()()();
      \u0275\u0275template(29, CalendarPageComponent_div_29_Template, 45, 6, "div", 18);
    }
    if (rf & 2) {
      \u0275\u0275advance(18);
      \u0275\u0275textInterpolate1(" ", \u0275\u0275pipeBind2(19, 5, ctx.currentDate, "MMMM yyyy"), " ");
      \u0275\u0275advance(6);
      \u0275\u0275property("ngForOf", ctx.eventTypes);
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", \u0275\u0275pureFunction0(8, _c0));
      \u0275\u0275advance(2);
      \u0275\u0275property("ngForOf", ctx.daysInMonth);
      \u0275\u0275advance();
      \u0275\u0275property("ngIf", ctx.showModal);
    }
  }, dependencies: [CommonModule, NgClass, NgForOf, NgIf, FormsModule, \u0275NgNoValidate, NgSelectOption, \u0275NgSelectMultipleOption, DefaultValueAccessor, SelectControlValueAccessor, NgControlStatus, NgControlStatusGroup, ReactiveFormsModule, FormGroupDirective, FormControlName, DatePipe], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(CalendarPageComponent, [{
    type: Component,
    args: [{ selector: "app-calendar-page", standalone: true, imports: [CommonModule, FormsModule, ReactiveFormsModule], providers: [DatePipe], template: `<div class="p-6 h-full flex flex-col bg-slate-50/50">\r
  <div class="flex items-center justify-between mb-6">\r
    <div>\r
      <h1 class="text-2xl font-bold text-slate-800">School Calendar</h1>\r
      <p class="text-sm text-slate-500">Manage holidays, exams, and other school events.</p>\r
    </div>\r
    <button (click)="openModal()" class="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition">\r
      <span class="material-icons text-[18px]">add</span>\r
      Add Event\r
    </button>\r
  </div>\r
\r
  <div class="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">\r
    <!-- Header Controls -->\r
    <div class="flex items-center justify-between p-4 border-b border-slate-100">\r
      <div class="flex items-center gap-4">\r
        <button (click)="previousMonth()" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">\r
          <span class="material-icons">chevron_left</span>\r
        </button>\r
        <h2 class="text-lg font-bold text-slate-700 min-w-[150px] text-center">\r
          {{ currentDate | date:'MMMM yyyy' }}\r
        </h2>\r
        <button (click)="nextMonth()" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">\r
          <span class="material-icons">chevron_right</span>\r
        </button>\r
      </div>\r
      <div class="flex gap-4 items-center">\r
        <div *ngFor="let type of eventTypes" class="flex items-center gap-1.5">\r
          <div class="w-3 h-3 rounded-full" [style.background]="type.color"></div>\r
          <span class="text-xs font-medium text-slate-600">{{ type.type }}</span>\r
        </div>\r
      </div>\r
    </div>\r
\r
    <!-- Calendar Grid -->\r
    <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50">\r
      <div class="py-2 text-center text-xs font-bold text-slate-500 uppercase tracking-wider" *ngFor="let day of ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']">{{ day }}</div>\r
    </div>\r
    \r
    <div class="flex-1 grid grid-cols-7 grid-rows-5 bg-slate-200 gap-px">\r
      <div *ngFor="let day of daysInMonth" \r
           class="bg-white min-h-[100px] p-2 transition hover:bg-slate-50 cursor-pointer flex flex-col group relative"\r
           [ngClass]="{'opacity-50': !isCurrentMonth(day), 'bg-indigo-50/30': isToday(day)}"\r
           (click)="openModal(day)">\r
        \r
        <div class="flex justify-between items-start">\r
          <span class="text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full"\r
                [ngClass]="{'bg-indigo-600 text-white': isToday(day), 'text-slate-700': !isToday(day)}">\r
            {{ day.getDate() }}\r
          </span>\r
          <button class="material-icons text-[16px] text-slate-300 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition">add</button>\r
        </div>\r
\r
        <div class="mt-2 flex flex-col gap-1 overflow-y-auto flex-1 custom-scrollbar">\r
          <div *ngFor="let event of getEventsForDate(day)"\r
               (click)="$event.stopPropagation(); openModal(day, event)"\r
               class="px-2 py-1 rounded text-[10px] font-bold text-white truncate shadow-sm transition hover:brightness-110"\r
               [style.background]="event.color"\r
               [title]="event.title">\r
            {{ event.title }}\r
          </div>\r
        </div>\r
      </div>\r
    </div>\r
  </div>\r
</div>\r
\r
<!-- Event Modal -->\r
<div *ngIf="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">\r
  <div class="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">\r
    <div class="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">\r
      <h3 class="text-lg font-bold text-slate-800">{{ editingEventId ? 'Edit Event' : 'Add New Event' }}</h3>\r
      <button (click)="closeModal()" class="text-slate-400 hover:text-slate-600 transition p-1"><span class="material-icons">close</span></button>\r
    </div>\r
    <form [formGroup]="eventForm" (ngSubmit)="saveEvent()" class="p-6 flex flex-col gap-4">\r
      <div>\r
        <label class="block text-xs font-semibold text-slate-700 mb-1">Event Title <span class="text-red-500">*</span></label>\r
        <input type="text" formControlName="title" class="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400" placeholder="E.g., Midterm Exams">\r
      </div>\r
      \r
      <div class="grid grid-cols-2 gap-4">\r
        <div>\r
          <label class="block text-xs font-semibold text-slate-700 mb-1">Start Date <span class="text-red-500">*</span></label>\r
          <input type="date" formControlName="eventDate" class="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">\r
        </div>\r
        <div>\r
          <label class="block text-xs font-semibold text-slate-700 mb-1">End Date <span class="text-slate-400 font-normal">(Optional)</span></label>\r
          <input type="date" formControlName="endDate" class="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">\r
        </div>\r
      </div>\r
\r
      <div>\r
        <label class="block text-xs font-semibold text-slate-700 mb-1">Event Type <span class="text-red-500">*</span></label>\r
        <select formControlName="eventType" class="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500">\r
          <option *ngFor="let type of eventTypes" [value]="type.type">{{ type.type }}</option>\r
        </select>\r
      </div>\r
\r
      <div>\r
        <label class="block text-xs font-semibold text-slate-700 mb-1">Description</label>\r
        <textarea formControlName="description" rows="3" class="w-full text-sm border-slate-200 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400" placeholder="Any additional details..."></textarea>\r
      </div>\r
\r
      <div class="mt-4 flex justify-end gap-3 pt-4 border-t border-slate-100">\r
        <button *ngIf="editingEventId" type="button" (click)="deleteEvent()" class="mr-auto text-sm font-semibold text-red-600 hover:text-red-700 px-3 py-2 rounded-lg hover:bg-red-50 transition">\r
          Delete\r
        </button>\r
        <button type="button" (click)="closeModal()" class="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>\r
        <button type="submit" [disabled]="eventForm.invalid" class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">\r
          {{ editingEventId ? 'Update Event' : 'Save Event' }}\r
        </button>\r
      </div>\r
    </form>\r
  </div>\r
</div>\r
` }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(CalendarPageComponent, { className: "CalendarPageComponent", filePath: "src/app/pages/calendar/calendar.component.ts", lineNumber: 15 });
})();
export {
  CalendarPageComponent
};
//# sourceMappingURL=chunk-PPSBXMZF.js.map
