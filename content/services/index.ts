/** Service registry — the ordered list every /services route reads from.
 *
 * Adding a service = write the file, import it, and put it in this array. The route,
 * the metadata, the JSON-LD, the sitemap entry, and the index card all follow.
 * Order here is the order it appears on /services within its tier. */

import { aiChatAssistant } from "./ai-chat-assistant";
import { aiVoiceAgents } from "./ai-voice-agents";
import { skipTracingLeadGeneration } from "./skip-tracing-lead-generation";
import { aiAgentWorkforce } from "./ai-agent-workforce";
import { aiClone } from "./ai-clone";
import { marketingAutomation } from "./marketing-automation";
import { databaseReactivation } from "./database-reactivation";
import { workflowAutomation } from "./workflow-automation";
import { aiAudit } from "./ai-audit";
import { customAutomation } from "./custom-automation";
import { aiAppointmentBooking } from "./ai-appointment-booking";
import { invoicingAndPayments } from "./invoicing-and-payments";
import { reviewAutomation } from "./review-automation";
import { crmSync } from "./crm-sync";
import { aiScheduling } from "./ai-scheduling";
import { documentProcessing } from "./document-processing";
import { leadQualification } from "./lead-qualification";
import { dataEnrichment } from "./data-enrichment";
import { localSeo } from "./local-seo";
import { geoLandingPages } from "./geo-landing-pages";
import type { Service } from "./types";

export type { Figure, FaqItem, Service, ServiceTier, ServiceVideo } from "./types";

export const SERVICES: Service[] = [
  // flagship — the three built to full depth
  aiChatAssistant,
  aiVoiceAgents,
  skipTracingLeadGeneration,
  // core — the rest of the /ai hub
  aiAgentWorkforce,
  aiClone,
  marketingAutomation,
  databaseReactivation,
  workflowAutomation,
  aiAudit,
  customAutomation,
  aiAppointmentBooking,
  invoicingAndPayments,
  reviewAutomation,
  // more — staged behind "+ more" on the hub
  crmSync,
  aiScheduling,
  documentProcessing,
  leadQualification,
  dataEnrichment,
  localSeo,
  geoLandingPages,
];
