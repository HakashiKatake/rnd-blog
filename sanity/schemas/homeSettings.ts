import { defineField, defineType } from "sanity";

export const homeSettingsSchema = defineType({
  name: "homeSettings",
  title: "Home Settings",
  type: "document",
  fields: [
    defineField({
      name: "announcementStripEnabled",
      title: "Enable announcement strip",
      type: "boolean",
      initialValue: false,
      description: "Turn the full home-page announcement strip on or off.",
    }),
    defineField({
      name: "announcements",
      title: "Announcements",
      type: "array",
      hidden: ({ document }) => !document?.announcementStripEnabled,
      description:
        "Add, reorder, disable, schedule, or remove announcements for the moving strip.",
      of: [
        defineField({
          name: "announcementItem",
          title: "Announcement",
          type: "object",
          options: {
            collapsible: true,
            collapsed: false,
          },
          fields: [
            defineField({
              name: "enabled",
              title: "Enabled",
              type: "boolean",
              initialValue: true,
            }),
            defineField({
              name: "eyebrow",
              title: "Badge text",
              type: "string",
              initialValue: "New",
              validation: (rule) => rule.max(20),
              description: "Small leading badge, like New, Event, Launch, or Workshop.",
            }),
            defineField({
              name: "text",
              title: "Announcement text",
              type: "string",
              validation: (rule) => rule.required().max(140),
            }),
            defineField({
              name: "ctaLabel",
              title: "CTA label",
              type: "string",
              validation: (rule) => rule.max(32),
              initialValue: "Learn more",
            }),
            defineField({
              name: "href",
              title: "CTA link",
              type: "string",
              validation: (rule) =>
                rule.custom((value) => {
                  if (!value) {
                    return true;
                  }

                  if (
                    value.startsWith("/") ||
                    value.startsWith("http://") ||
                    value.startsWith("https://")
                  ) {
                    return true;
                  }

                  return "Use an internal path like /events or a full https:// URL.";
                }),
            }),
            defineField({
              name: "startAt",
              title: "Start showing at",
              type: "datetime",
              description: "Optional. Leave empty to show immediately.",
            }),
            defineField({
              name: "endAt",
              title: "Stop showing at",
              type: "datetime",
              description: "Optional. Leave empty to keep it visible indefinitely.",
              validation: (rule) =>
                rule.custom((value, context) => {
                  const parent = context.parent as { startAt?: string } | undefined;
                  if (!value || !parent?.startAt) {
                    return true;
                  }
                  return value >= parent.startAt
                    ? true
                    : "End time must be after the start time.";
                }),
            }),
          ],
          preview: {
            select: {
              title: "text",
              subtitle: "ctaLabel",
              enabled: "enabled",
              startAt: "startAt",
              endAt: "endAt",
            },
            prepare({ title, subtitle, enabled, startAt, endAt }) {
              const status = enabled ? "On" : "Off";
              const windowLabel =
                startAt || endAt
                  ? ` • ${startAt ? `from ${new Date(startAt).toLocaleDateString()}` : "active now"}${endAt ? ` until ${new Date(endAt).toLocaleDateString()}` : ""}`
                  : "";

              return {
                title: title || "Untitled announcement",
                subtitle: `${status}${subtitle ? ` • ${subtitle}` : ""}${windowLabel}`,
              };
            },
          },
        }),
      ],
      options: {
        sortable: true,
      },
      validation: (rule) =>
        rule.custom((value, context) => {
          if (!context.document?.announcementStripEnabled) {
            return true;
          }

          if (Array.isArray(value) && value.length > 0) {
            return true;
          }

          return "Add at least one announcement when the strip is enabled.";
        }),
    }),
  ],
  preview: {
    select: {
      enabled: "announcementStripEnabled",
      announcements: "announcements",
    },
    prepare({ enabled, announcements }) {
      const count = Array.isArray(announcements) ? announcements.length : 0;
      return {
        title: "Home Settings",
        subtitle: enabled
          ? `${count} announcement${count === 1 ? "" : "s"} configured`
          : "Announcement strip disabled",
      };
    },
  },
});
