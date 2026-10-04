export interface SharedNotice {
  id: string;
  title: string;
  content: string;
  category: 'EXAM' | 'ACADEMIC' | 'EVENT' | 'GENERAL';
  priority: 'URGENT' | 'HIGH' | 'NORMAL';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  publishedAt: string | null;
  authorId: string;
  authorName?: string;
  sourceUrl?: string;
  rawFileHash?: string;
  summary?: {
    whatChanged: string;
    whoAffected: string;
    requiredAction: string | null;
    deadline: string | null;
  } | null;
  audiences?: Array<{
    departmentId?: string | null;
    year?: string | null;
    division?: string | null;
    batch?: string | null;
  }>;
}

export interface SharedEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  status: 'DRAFT' | 'PUBLISHED';
  registrationDeadline?: string | null;
}

class InMemStore {
  private notices: Map<string, SharedNotice> = new Map();
  private events: Map<string, SharedEvent> = new Map();
  private registrations: Set<string> = new Set();

  constructor() {
    // Seed initial demo notices
    this.notices.set('1', {
      id: '1',
      title: 'CIE-I Exam Timetable Released',
      content: 'The official timetable for Continuous Internal Evaluation I has been announced. All MCA students must verify seating layouts.',
      category: 'EXAM',
      priority: 'URGENT',
      status: 'PUBLISHED',
      publishedAt: '2026-10-02T09:00:00Z',
      authorId: 'admin-1',
      authorName: 'System Admin',
      sourceUrl: '/uploads/official_cie1_timetable.pdf',
      summary: {
        whatChanged: 'CIE-I timetable is now available.',
        whoAffected: 'FY and SY MCA students.',
        requiredAction: 'Attend exams as per schedule. Arrive 15 mins early.',
        deadline: '2026-10-29',
      },
      audiences: [{ departmentId: 'MCA', year: 'FY', division: null, batch: null }]
    });

    this.notices.set('2', {
      id: '2',
      title: 'Campus Wi-Fi Maintenance Notice',
      content: 'Scheduled network upgrades in the academic block between 2:00 AM and 5:00 AM on Sunday.',
      category: 'GENERAL',
      priority: 'NORMAL',
      status: 'PUBLISHED',
      publishedAt: '2026-10-01T14:30:00Z',
      authorId: 'admin-1',
      authorName: 'System Admin',
      summary: {
        whatChanged: 'Network maintenance on Sunday morning.',
        whoAffected: 'All campus occupants.',
        requiredAction: 'Save your work before maintenance window.',
        deadline: null
      },
      audiences: [{ departmentId: null, year: null, division: null, batch: null }]
    });

    // Seed initial demo events
    this.events.set('1', {
      id: '1',
      title: 'Campus Tech Symposium 2026',
      description: 'Annual technical symposium featuring keynote talks on Cloud Architecture, AI in Production, and a competitive project exhibition.',
      date: '2026-10-15T10:00:00Z',
      venue: 'Main Auditorium',
      capacity: 200,
      registeredCount: 150,
      status: 'PUBLISHED',
      registrationDeadline: '2026-10-10T18:00:00Z'
    });

    this.events.set('2', {
      id: '2',
      title: '36-Hour Hackathon Orientation',
      description: 'Orientation session for college-wide hackathon. Track briefing, mentor introductions, and team formation support.',
      date: '2026-10-20T14:00:00Z',
      venue: 'Lab 4 (Computer Center)',
      capacity: 60,
      registeredCount: 60,
      status: 'PUBLISHED',
      registrationDeadline: '2026-10-18T23:59:00Z'
    });
  }

  getNotice(id: string): SharedNotice | undefined {
    return this.notices.get(id);
  }

  saveNotice(notice: SharedNotice): void {
    this.notices.set(notice.id, notice);
  }

  getAllNotices(): SharedNotice[] {
    return Array.from(this.notices.values()).sort((a, b) => 
      new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime()
    );
  }

  deleteNotice(id: string): boolean {
    return this.notices.delete(id);
  }

  getPublishedNotices(): SharedNotice[] {
    return this.getAllNotices().filter(n => n.status === 'PUBLISHED');
  }

  getEvent(id: string): SharedEvent | undefined {
    return this.events.get(id);
  }

  saveEvent(event: SharedEvent): void {
    this.events.set(event.id, event);
  }

  deleteEvent(id: string): boolean {
    return this.events.delete(id);
  }

  getAllEvents(): SharedEvent[] {
    return Array.from(this.events.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  getPublishedEvents(): SharedEvent[] {
    return this.getAllEvents().filter(e => e.status === 'PUBLISHED');
  }

  registerEvent(eventId: string, userId: string): boolean {
    const key = `${eventId}:${userId}`;
    if (this.registrations.has(key)) return false;
    this.registrations.add(key);
    const ev = this.events.get(eventId);
    if (ev) {
      ev.registeredCount = (ev.registeredCount || 0) + 1;
    }
    return true;
  }

  cancelEventRegistration(eventId: string, userId: string): boolean {
    const key = `${eventId}:${userId}`;
    if (!this.registrations.has(key)) return false;
    this.registrations.delete(key);
    const ev = this.events.get(eventId);
    if (ev && ev.registeredCount > 0) {
      ev.registeredCount -= 1;
    }
    return true;
  }

  isUserRegistered(eventId: string, userId: string): boolean {
    return this.registrations.has(`${eventId}:${userId}`);
  }
}

export const sharedStore = new InMemStore();
