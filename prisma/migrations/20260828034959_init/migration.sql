-- CreateTable
CREATE TABLE "ProjectRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Salesperson" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "areas" TEXT NOT NULL DEFAULT '[]',
    "workingHoursStart" TEXT NOT NULL DEFAULT '10:00',
    "workingHoursEnd" TEXT NOT NULL DEFAULT '18:00',
    "maxAppointmentsPerDay" INTEGER NOT NULL DEFAULT 6,
    "lastAssignedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneNormalized" TEXT NOT NULL,
    "email" TEXT,
    "requirement" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "temperature" TEXT NOT NULL DEFAULT 'WARM',
    "score" INTEGER NOT NULL DEFAULT 0,
    "scoreReasons" TEXT NOT NULL DEFAULT '[]',
    "source" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "utmTerm" TEXT,
    "utmContent" TEXT,
    "referrer" TEXT,
    "preferredContact" TEXT,
    "buyingTimeline" TEXT,
    "budgetBand" TEXT,
    "purpose" TEXT,
    "locationPreference" TEXT,
    "propertyType" TEXT,
    "specialRequirements" TEXT,
    "wantsSiteVisit" TEXT,
    "lostReason" TEXT,
    "followUpAt" DATETIME,
    "assignedToId" TEXT,
    "duplicateOfId" TEXT,
    "consentAt" DATETIME,
    "consentWhatsapp" BOOLEAN NOT NULL DEFAULT false,
    "consentCall" BOOLEAN NOT NULL DEFAULT false,
    "consentEmail" BOOLEAN NOT NULL DEFAULT false,
    "communicationPref" TEXT,
    "firstRespondedAt" DATETIME,
    "abandonedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Salesperson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QualificationAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "QualificationAnswer_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "salespersonId" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "attendees" INTEGER NOT NULL DEFAULT 1,
    "pickupRequired" BOOLEAN NOT NULL DEFAULT false,
    "pickupLocation" TEXT,
    "accessibilityNotes" TEXT,
    "meetingPoint" TEXT,
    "calendarEventId" TEXT,
    "visitFeedback" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Appointment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Appointment_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "Salesperson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "bookedCount" INTEGER NOT NULL DEFAULT 0,
    "blocked" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AvailabilitySlot_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'WEB_CHAT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Conversation_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "appointmentId" TEXT,
    "salespersonId" TEXT,
    "channel" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "simulated" BOOLEAN NOT NULL DEFAULT true,
    "error" TEXT,
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Notification_salespersonId_fkey" FOREIGN KEY ("salespersonId") REFERENCES "Salesperson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appointmentId" TEXT,
    "leadId" TEXT,
    "kind" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notificationId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reminder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InternalNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InternalNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Activity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "leadId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,
    CONSTRAINT "Consent_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OutreachTouch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firmName" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "area" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,
    "touchedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'local',
    "externalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectRecord_slug_key" ON "ProjectRecord"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Salesperson_email_key" ON "Salesperson"("email");

-- CreateIndex
CREATE INDEX "Lead_phoneNormalized_idx" ON "Lead"("phoneNormalized");

-- CreateIndex
CREATE INDEX "Lead_stage_idx" ON "Lead"("stage");

-- CreateIndex
CREATE INDEX "Lead_temperature_idx" ON "Lead"("temperature");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "QualificationAnswer_leadId_step_key" ON "QualificationAnswer"("leadId", "step");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_reference_key" ON "Appointment"("reference");

-- CreateIndex
CREATE INDEX "Appointment_startAt_idx" ON "Appointment"("startAt");

-- CreateIndex
CREATE INDEX "Appointment_status_idx" ON "Appointment"("status");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_startAt_idx" ON "AvailabilitySlot"("startAt");

-- CreateIndex
CREATE INDEX "Reminder_dueAt_status_idx" ON "Reminder"("dueAt", "status");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MessageTemplate_key_key" ON "MessageTemplate"("key");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_externalId_key" ON "CalendarEvent"("externalId");
