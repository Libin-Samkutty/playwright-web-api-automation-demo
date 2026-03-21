import { z } from 'zod';

export const NoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  description: z.string(),
  category: z.enum(['Home', 'Work', 'Personal']),
  completed: z.boolean(),
  created_at: z.string().datetime({ offset: true }).or(z.string()),
  updated_at: z.string().datetime({ offset: true }).or(z.string()),
  user_id: z.string().optional(),
});

export const NoteListSchema = z.array(NoteSchema);

export const CreateNoteResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: NoteSchema,
});

export const GetNoteResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: NoteSchema,
});

export const GetNotesResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
  data: NoteListSchema,
});

export const DeleteNoteResponseSchema = z.object({
  success: z.boolean(),
  status: z.number(),
  message: z.string(),
});

export const ErrorResponseSchema = z.object({
  success: z.literal(false),
  status: z.number(),
  message: z.string(),
});

export type Note = z.infer<typeof NoteSchema>;
export type NoteList = z.infer<typeof NoteListSchema>;