# Track Specification: Inscripción y Gestión de Eventos para Participantes

## 1. Introduction and Goal
This track focuses on developing a central "Hub" for participants within the Votify platform. The primary objective is to provide an authenticated user with a clear overview of their event engagements and a straightforward mechanism to join new public events.

## 2. User Stories
- **US1: Event Overview**
    - As an authenticated user, I want to see a list of all events I am currently involved in (as a participant, juror, or organizer) so that I can quickly access their respective dashboards.
- **US2: Join Event**
    - As an authenticated user, I want to see a list of active and public events that I can join so that I can easily discover and participate in new events.
    - As an authenticated user, I want to be able to click a "Join" button next to an active/public event so that I can register my participation in that event.

## 3. Functional Requirements

### 3.1 Participant Dashboard View
-   **FR1.1:** The authenticated user's main page MUST display a section titled "Mis Eventos".
-   **FR1.2:** The "Mis Eventos" section MUST list all events where the user is registered (as participant, juror, or organizer).
-   **FR1.3:** Each listed event in "Mis Eventos" MUST provide a direct link or button to its corresponding event dashboard. Existing card components should be leveraged for this display.

### 3.2 Event Discovery and Joining
-   **FR2.1:** The authenticated user's main page MUST display a section titled "Unirse a un Evento".
-   **FR2.2:** The "Unirse a un Evento" section MUST display a list of all active and public events not yet joined by the user.
-   **FR2.3:** Each event in the "Unirse a un Evento" list MUST feature a prominent "Unirse" (Join) button.
-   **FR2.4:** Clicking the "Unirse" button MUST initiate the process for the user to register as a participant for that specific event.
-   **FR2.5:** Upon successful registration, the event SHOULD move from the "Unirse a un Evento" list to the "Mis Eventos" list.

## 4. Non-Functional Requirements
-   **Performance:** Both sections ("Mis Eventos" and "Unirse a un Evento") must load quickly, even with a large number of events. API calls should be optimized.
-   **Security:** Event joining and participant registration processes must be secure, preventing unauthorized access or manipulation.
-   **Usability:** The interface for both sections must be intuitive and easy to use, consistent with the overall platform's UI/UX guidelines (e.g., card design, fonts).
-   **Responsiveness:** The layout for the participant hub must be fully responsive and function across various device sizes.

## 5. Acceptance Criteria
-   The "Mis Eventos" section correctly displays all events the user is associated with.
-   Clicking on an event in "Mis Eventos" navigates the user to the correct event dashboard.
-   The "Unirse a un Evento" section lists only active and public events not yet joined by the user.
-   The "Unirse" button successfully registers the user for the selected event.
-   After joining, the event appears in "Mis Eventos" and is removed from "Unirse a un Evento".
-   All UI elements conform to the specified design guidelines (card styling, fonts).
-   The page loads within acceptable performance thresholds.
-   The page is fully responsive.
