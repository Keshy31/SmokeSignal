import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  language: text("language").default("en").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User's tracked areas for notifications
export const trackedAreas = pgTable("tracked_areas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  radius: integer("radius").notNull(), // radius in kilometers
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fire data storage (for caching and historical records)
export const fireData = pgTable("fire_data", {
  id: serial("id").primaryKey(),
  externalId: text("external_id"), // ID from NASA FIRMS API
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  brightness: text("brightness"),
  scan: text("scan"),
  track: text("track"),
  acqDate: text("acq_date").notNull(),
  acqTime: text("acq_time"),
  satellite: text("satellite"),
  confidence: integer("confidence"),
  frp: text("frp"),
  daynight: text("daynight"),
  metadata: jsonb("metadata"), // Additional data from API
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification history
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  fireId: integer("fire_id").references(() => fireData.id),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Create insert schemas using drizzle-zod
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  language: true,
});

export const insertTrackedAreaSchema = createInsertSchema(trackedAreas).pick({
  userId: true,
  name: true,
  latitude: true,
  longitude: true,
  radius: true,
});

export const insertFireDataSchema = createInsertSchema(fireData).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  fireId: true,
  message: true,
});

// Define types for the schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertTrackedArea = z.infer<typeof insertTrackedAreaSchema>;
export type TrackedArea = typeof trackedAreas.$inferSelect;

export type InsertFireData = z.infer<typeof insertFireDataSchema>;
export type FireData = typeof fireData.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
