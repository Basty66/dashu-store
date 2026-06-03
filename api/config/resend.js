import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'cristian.retamal.work@gmail.com'
export const FROM_EMAIL = 'DASHU FOR MEN <onboarding@resend.dev>'
