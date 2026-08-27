import { google } from 'googleapis';
import { Client } from '@microsoft/microsoft-graph-client';
// Polyfill fetch for Microsoft Graph Client if running in older Node versions
import 'isomorphic-fetch';

/**
 * Common Event Interface for 2-Way Synchronization
 */
export interface SyncEvent {
  id?: string;               // Local DB ID
  externalId?: string;       // ID from Google or Outlook
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay?: boolean;
}

/**
 * ==========================================
 * Google Calendar Service
 * ==========================================
 */
export class GoogleCalendarService {
  private oauth2Client;
  private calendar: any;

  constructor(clientId: string, clientSecret: string, redirectUri: string, refreshToken: string) {
    this.oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    this.oauth2Client.setCredentials({ refresh_token: refreshToken });
    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Fetch events from Google Calendar within a specific time range.
   */
  async getEvents(timeMin: Date, timeMax: Date): Promise<SyncEvent[]> {
    try {
      const res = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: timeMin.toISOString(),
        timeMax: timeMax.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const events = res.data.items || [];
      return events.map((event: any) => ({
        externalId: event.id || undefined,
        title: event.summary || 'Untitled Event',
        description: event.description || undefined,
        startTime: new Date(event.start?.dateTime || event.start?.date || Date.now()),
        endTime: new Date(event.end?.dateTime || event.end?.date || Date.now()),
        location: event.location || undefined,
        isAllDay: !!event.start?.date,
      }));
    } catch (error) {
      console.error('[Google Calendar] Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Create a new event in Google Calendar.
   * Returns the external Google Event ID.
   */
  async createEvent(event: SyncEvent): Promise<string> {
    try {
      const res = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: {
          summary: event.title,
          description: event.description,
          location: event.location,
          start: event.isAllDay 
            ? { date: event.startTime.toISOString().split('T')[0] } 
            : { dateTime: event.startTime.toISOString() },
          end: event.isAllDay 
            ? { date: event.endTime.toISOString().split('T')[0] } 
            : { dateTime: event.endTime.toISOString() },
        },
      });
      return res.data.id || '';
    } catch (error) {
      console.error('[Google Calendar] Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event in Google Calendar.
   */
  async updateEvent(externalId: string, event: SyncEvent): Promise<void> {
    try {
      await this.calendar.events.update({
        calendarId: 'primary',
        eventId: externalId,
        requestBody: {
          summary: event.title,
          description: event.description,
          location: event.location,
          start: event.isAllDay 
            ? { date: event.startTime.toISOString().split('T')[0] } 
            : { dateTime: event.startTime.toISOString() },
          end: event.isAllDay 
            ? { date: event.endTime.toISOString().split('T')[0] } 
            : { dateTime: event.endTime.toISOString() },
        },
      });
    } catch (error) {
      console.error('[Google Calendar] Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Google Calendar.
   */
  async deleteEvent(externalId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId: externalId,
      });
    } catch (error) {
      console.error('[Google Calendar] Error deleting event:', error);
      throw error;
    }
  }
}

/**
 * ==========================================
 * Outlook (Microsoft Graph) Calendar Service
 * ==========================================
 */
export class OutlookCalendarService {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  /**
   * Fetch events from Outlook Calendar within a specific time range.
   */
  async getEvents(timeMin: Date, timeMax: Date): Promise<SyncEvent[]> {
    try {
      const res = await this.client
        .api(`/me/calendarView?startDateTime=${timeMin.toISOString()}&endDateTime=${timeMax.toISOString()}`)
        .select('id,subject,bodyPreview,start,end,location,isAllDay')
        .get();

      return res.value.map((event: any) => ({
        externalId: event.id,
        title: event.subject || 'Untitled Event',
        description: event.bodyPreview,
        // MS Graph returns times in UTC for calendarView by default unless Prefer: outlook.timezone header is set.
        // We append 'Z' if missing to safely parse it as UTC in JS Date.
        startTime: new Date(event.start.dateTime.endsWith('Z') ? event.start.dateTime : event.start.dateTime + 'Z'), 
        endTime: new Date(event.end.dateTime.endsWith('Z') ? event.end.dateTime : event.end.dateTime + 'Z'),
        location: event.location?.displayName,
        isAllDay: event.isAllDay,
      }));
    } catch (error) {
      console.error('[Outlook Calendar] Error fetching events:', error);
      throw error;
    }
  }

  /**
   * Create a new event in Outlook Calendar.
   * Returns the external Outlook Event ID.
   */
  async createEvent(event: SyncEvent): Promise<string> {
    try {
      const outlookEvent = {
        subject: event.title,
        body: { contentType: 'HTML', content: event.description || '' },
        start: { dateTime: event.startTime.toISOString(), timeZone: 'UTC' },
        end: { dateTime: event.endTime.toISOString(), timeZone: 'UTC' },
        location: { displayName: event.location || '' },
        isAllDay: event.isAllDay || false,
      };

      const res = await this.client.api('/me/events').post(outlookEvent);
      return res.id;
    } catch (error) {
      console.error('[Outlook Calendar] Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event in Outlook Calendar.
   */
  async updateEvent(externalId: string, event: SyncEvent): Promise<void> {
    try {
      const outlookEvent = {
        subject: event.title,
        body: { contentType: 'HTML', content: event.description || '' },
        start: { dateTime: event.startTime.toISOString(), timeZone: 'UTC' },
        end: { dateTime: event.endTime.toISOString(), timeZone: 'UTC' },
        location: { displayName: event.location || '' },
        isAllDay: event.isAllDay || false,
      };

      await this.client.api(`/me/events/${externalId}`).patch(outlookEvent);
    } catch (error) {
      console.error('[Outlook Calendar] Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from Outlook Calendar.
   */
  async deleteEvent(externalId: string): Promise<void> {
    try {
      await this.client.api(`/me/events/${externalId}`).delete();
    } catch (error) {
      console.error('[Outlook Calendar] Error deleting event:', error);
      throw error;
    }
  }
}
