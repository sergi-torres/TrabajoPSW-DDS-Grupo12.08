import { Event, EventType } from '../types/event';

export class EventFactory {
  static createEvent(data: any): Event {
    const type = data.tipo_evento as EventType;
    
    // In the future, this can instantiate specific classes with methods
    // For now, it ensures the data structure matches the expected interface
    switch (type) {
      case 'Hackaton':
        return { ...data } as Event;
      case 'InnovationFair':
        return { ...data } as Event;
      case 'SmallEvent':
      case 'Competicion':
      default:
        return data as Event;
    }
  }

  static createEvents(data: any[]): Event[] {
    return data.map(item => this.createEvent(item));
  }
}
