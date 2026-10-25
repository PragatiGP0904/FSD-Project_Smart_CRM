const { z } = require('zod');
const {
  STAGES,
  SOURCES,
  PRIORITIES,
  FOLLOW_UP_STATUSES,
  ACTIVITY_TYPES,
  CUSTOMER_STATUSES,
  LEAD_SORTS,
} = require('../utils/constants');

const emptyToUndefined = (value) => {
  if (typeof value === 'string' && value.trim() === '') return undefined;
  return value;
};

const optionalText = (max, message) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, message).optional());

const emailField = z.preprocess(
  emptyToUndefined,
  z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase()).optional()
);

const phoneField = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .trim()
    .refine((value) => {
      const digits = value.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15 && /^[0-9+\-()\s]+$/.test(value);
    }, 'Enter a valid phone number')
    .optional()
);

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const pageQuery = {
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
  limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(10)),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(100).optional()),
};

const withEnvelope = (body, query = z.object({}).passthrough(), params = z.object({})) =>
  z.object({ body, query, params });

const registerSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
      email: z.string().trim().email('Enter a valid email address').transform((value) => value.toLowerCase()),
      password: z.string().min(6, 'Password must be at least 6 characters').max(72),
      role: z.any().optional(),
    })
    .superRefine((data, ctx) => {
      if (data.role !== undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Role cannot be set during registration',
          path: ['role'],
        });
      }
    })
);

const loginSchema = withEnvelope(
  z.object({
    email: z.string().trim().min(1, 'Please provide both email and password').transform((value) => value.toLowerCase()),
    password: z.string().min(1, 'Please provide both email and password'),
  })
);

const updateMeSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
      currentPassword: z.string().optional(),
      password: z.string().min(6, 'Password must be at least 6 characters').max(72).optional(),
    })
    .refine((data) => data.name || data.password, {
      message: 'Provide a name or a new password to update',
    })
    .refine((data) => !data.password || data.currentPassword, {
      message: 'Enter your current password to set a new one',
    })
);

const createLeadSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
      email: emailField,
      phone: phoneField,
      company: optionalText(120, 'Company name is too long'),
      source: z.enum(SOURCES).optional(),
      notes: optionalText(2000, 'Notes are too long'),
    })
    .refine((data) => data.email || data.phone, {
      message: 'Name and at least one contact detail are required',
    })
);

const updateLeadSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
      email: emailField,
      phone: phoneField,
      company: optionalText(120, 'Company name is too long'),
      source: z.enum(SOURCES).optional(),
      notes: optionalText(2000, 'Notes are too long'),
      stage: z.enum(STAGES).optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'Provide a field to update',
    }),
  z.object({}).passthrough(),
  z.object({ id: objectId })
);

const listLeadSchema = withEnvelope(
  z.object({}).passthrough(),
  z.object({
    ...pageQuery,
    stage: z.preprocess(emptyToUndefined, z.enum(STAGES).optional()),
    source: z.preprocess(emptyToUndefined, z.enum(SOURCES).optional()),
    sort: z.preprocess(emptyToUndefined, z.enum(LEAD_SORTS).default('-createdAt')),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(10)),
  })
);

const idParamSchema = withEnvelope(z.object({}).passthrough(), z.object({}).passthrough(), z.object({ id: objectId }));

const createCustomerSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
      email: emailField,
      phone: phoneField,
      company: optionalText(120, 'Company name is too long'),
      status: z.enum(CUSTOMER_STATUSES).optional(),
    })
    .refine((data) => data.email || data.phone, {
      message: 'Name and at least one contact detail are required',
    })
);

const updateCustomerSchema = withEnvelope(
  z
    .object({
      name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80).optional(),
      email: emailField,
      phone: phoneField,
      company: optionalText(120, 'Company name is too long'),
      status: z.enum(CUSTOMER_STATUSES).optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'Provide a field to update',
    }),
  z.object({}).passthrough(),
  z.object({ id: objectId })
);

const listCustomerSchema = withEnvelope(
  z.object({}).passthrough(),
  z.object({
    ...pageQuery,
    status: z.preprocess(emptyToUndefined, z.enum(CUSTOMER_STATUSES).optional()),
    sort: z.preprocess(emptyToUndefined, z.enum(LEAD_SORTS).default('-createdAt')),
  })
);

const linkRefine = (data, ctx) => {
  const hasLead = Boolean(data.leadId);
  const hasCustomer = Boolean(data.customerId);
  if (hasLead === hasCustomer) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Provide either a lead or a customer',
    });
  }
};

const createOpportunitySchema = withEnvelope(
  z
    .object({
      title: z.string().trim().min(2, 'Title must be at least 2 characters').max(140),
      value: z.coerce.number().min(0, 'Value cannot be negative'),
      stage: z.enum(STAGES).optional(),
      probability: z.coerce.number().min(0).max(100).optional(),
      expectedCloseDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
      leadId: z.preprocess(emptyToUndefined, objectId.optional()),
      customerId: z.preprocess(emptyToUndefined, objectId.optional()),
    })
    .superRefine(linkRefine)
);

const updateOpportunitySchema = withEnvelope(
  z
    .object({
      title: z.string().trim().min(2, 'Title must be at least 2 characters').max(140).optional(),
      value: z.coerce.number().min(0, 'Value cannot be negative').optional(),
      stage: z.enum(STAGES).optional(),
      probability: z.coerce.number().min(0).max(100).optional(),
      expectedCloseDate: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'Provide a field to update',
    }),
  z.object({}).passthrough(),
  z.object({ id: objectId })
);

const listOpportunitySchema = withEnvelope(
  z.object({}).passthrough(),
  z.object({
    ...pageQuery,
    stage: z.preprocess(emptyToUndefined, z.enum(STAGES).optional()),
    leadId: z.preprocess(emptyToUndefined, objectId.optional()),
    customerId: z.preprocess(emptyToUndefined, objectId.optional()),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(10)),
  })
);

const createActivitySchema = withEnvelope(
  z
    .object({
      type: z.enum(ACTIVITY_TYPES, { errorMap: () => ({ message: 'Choose a call, meeting, email, or note' }) }),
      description: z.string().trim().min(2, 'Describe the interaction').max(2000),
      date: z.preprocess(emptyToUndefined, z.coerce.date().optional()),
      leadId: z.preprocess(emptyToUndefined, objectId.optional()),
      customerId: z.preprocess(emptyToUndefined, objectId.optional()),
    })
    .superRefine(linkRefine)
);

const listActivitySchema = withEnvelope(
  z.object({}).passthrough(),
  z.object({
    ...pageQuery,
    type: z.preprocess(emptyToUndefined, z.enum(ACTIVITY_TYPES).optional()),
    leadId: z.preprocess(emptyToUndefined, objectId.optional()),
    customerId: z.preprocess(emptyToUndefined, objectId.optional()),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(20)),
  })
);

const createFollowUpSchema = withEnvelope(
  z
    .object({
      title: z.string().trim().min(2, 'Describe the next action').max(200),
      dueDate: z.coerce.date({ errorMap: () => ({ message: 'Enter a valid due date' }) }),
      priority: z.enum(PRIORITIES).optional(),
      leadId: z.preprocess(emptyToUndefined, objectId.optional()),
      customerId: z.preprocess(emptyToUndefined, objectId.optional()),
    })
    .superRefine(linkRefine)
);

const updateFollowUpSchema = withEnvelope(
  z
    .object({
      title: z.string().trim().min(2, 'Describe the next action').max(200).optional(),
      dueDate: z.coerce.date().optional(),
      priority: z.enum(PRIORITIES).optional(),
      status: z.enum(FOLLOW_UP_STATUSES).optional(),
    })
    .refine((data) => Object.values(data).some((value) => value !== undefined), {
      message: 'Provide a field to update',
    }),
  z.object({}).passthrough(),
  z.object({ id: objectId })
);

const listFollowUpSchema = withEnvelope(
  z.object({}).passthrough(),
  z.object({
    ...pageQuery,
    status: z.preprocess(emptyToUndefined, z.enum(FOLLOW_UP_STATUSES).optional()),
    priority: z.preprocess(emptyToUndefined, z.enum(PRIORITIES).optional()),
    limit: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).max(50).default(50)),
  })
);

module.exports = {
  registerSchema,
  loginSchema,
  updateMeSchema,
  createLeadSchema,
  updateLeadSchema,
  listLeadSchema,
  idParamSchema,
  createCustomerSchema,
  updateCustomerSchema,
  listCustomerSchema,
  createOpportunitySchema,
  updateOpportunitySchema,
  listOpportunitySchema,
  createActivitySchema,
  listActivitySchema,
  createFollowUpSchema,
  updateFollowUpSchema,
  listFollowUpSchema,
};
