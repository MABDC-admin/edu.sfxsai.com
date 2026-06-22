import { CalendarEventsService } from './calendar-events.service';
export declare class CalendarEventsController {
    private readonly service;
    constructor(service: CalendarEventsService);
    create(createDto: any): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        academicYearId: string | null;
        endDate: string | null;
        description: string | null;
        title: string;
        eventDate: string;
        eventType: string;
        color: string | null;
    }>;
    findAll(ayId?: string): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        academicYearId: string | null;
        endDate: string | null;
        description: string | null;
        title: string;
        eventDate: string;
        eventType: string;
        color: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        academicYearId: string | null;
        endDate: string | null;
        description: string | null;
        title: string;
        eventDate: string;
        eventType: string;
        color: string | null;
    } | undefined>;
    update(id: string, updateDto: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        eventDate: string;
        endDate: string | null;
        eventType: string;
        color: string | null;
        academicYearId: string | null;
        createdAt: string;
        updatedAt: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: string;
        updatedAt: string;
        academicYearId: string | null;
        endDate: string | null;
        description: string | null;
        title: string;
        eventDate: string;
        eventType: string;
        color: string | null;
    }>;
}
