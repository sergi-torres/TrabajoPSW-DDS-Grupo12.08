import { describe, it, expect } from 'vitest';
import { EventFactory } from './EventFactory';
import { EventType } from '../types/event';

describe('EventFactory', () => {
  it('should create a Hackaton event correctly', () => {
    const data = {
      id: 1,
      nombre: 'Test Hackaton',
      tipo_evento: 'Hackaton' as EventType,
      descripcion: 'A test hackaton'
    };

    const event = EventFactory.createEvent(data);

    expect(event.tipo_evento).toBe('Hackaton');
    expect(event.nombre).toBe('Test Hackaton');
  });

  it('should create an InnovationFair event correctly', () => {
    const data = {
      id: 2,
      nombre: 'Test Fair',
      tipo_evento: 'InnovationFair' as EventType,
      descripcion: 'A test fair'
    };

    const event = EventFactory.createEvent(data);

    expect(event.tipo_evento).toBe('InnovationFair');
    expect(event.id).toBe(2);
  });

  it('should create an array of events', () => {
    const data = [
      { id: 1, tipo_evento: 'Hackaton' },
      { id: 2, tipo_evento: 'InnovationFair' }
    ];

    const events = EventFactory.createEvents(data);

    expect(events).toHaveLength(2);
    expect(events[0].tipo_evento).toBe('Hackaton');
    expect(events[1].tipo_evento).toBe('InnovationFair');
  });

  it('should fallback to default for unknown event types', () => {
    const data = {
      id: 3,
      nombre: 'Unknown',
      tipo_evento: 'UnknownType'
    };

    const event = EventFactory.createEvent(data);

    expect(event.id).toBe(3);
  });
});
